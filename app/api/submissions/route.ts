import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

interface BonusEntryBody {
  bonusConfigId: string;
  snsUrl?: string;
  proofImageUrl?: string;
}

interface CreateSubmissionBody {
  contestId?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  aiTools?: string;
  productionProcess?: string;
  submitterName?: string;
  submitterPhone?: string;
  bonusEntries?: BonusEntryBody[];
  termsAgreed?: boolean;
}

/** 출품작 생성 API */
export async function POST(request: Request) {
  console.log('[submissions API] POST 요청 수신');
  const supabase = await createClient();
  if (!supabase) {
    console.error('[submissions API] Supabase 미설정');
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  /* #8: getSession() 우선 + getUser() 폴백 (JWT 서명 검증) */
  let user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  user = session?.user ?? null;

  /* getSession()이 실패하거나 토큰이 없으면 getUser()로 서버 검증 시도 */
  if (!user) {
    try {
      const userResult = await Promise.race([
        supabase.auth.getUser(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      if (userResult && 'data' in userResult && userResult.data.user) {
        user = userResult.data.user;
      }
    } catch { /* getUser 타임아웃 — 무시 */ }
  }

  if (authError || !user) {
    console.error('[submissions API] 인증 실패:', authError?.message);
    return NextResponse.json({ error: '인증이 필요합니다.', code: 'AUTH_REQUIRED' }, { status: 401 });
  }
  console.log('[submissions API] 인증 성공:', user.id, user.email);

  /* ====== 프로필 존재 확인 (외래키 제약 보호) ====== */
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    /* 프로필이 없으면 자동 생성 (트리거 미작동 대비 백업) */
    console.warn('[submissions API] 프로필 없음 — 자동 생성 시도:', user.id);
    const meta = user.user_metadata ?? {};
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email ?? 'unknown@unknown.com',
        name: meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? '사용자',
        avatar_url: meta.avatar_url ?? meta.picture ?? null,
        phone: meta.phone ?? null,
      });

    if (profileError && profileError.code !== '23505') {
      console.error('[submissions API] 프로필 자동 생성 실패:', profileError.message);
      return NextResponse.json({ error: '사용자 프로필 생성에 실패했습니다.' }, { status: 500 });
    }
    console.log('[submissions API] 프로필 자동 생성 완료:', user.id);
  }

  try {
    const body = (await request.json()) as CreateSubmissionBody;

    const contestId = body.contestId?.trim();
    const title = body.title?.trim();
    const description = body.description?.trim();
    const videoUrl = body.videoUrl?.trim();
    const thumbnailUrl = body.thumbnailUrl?.trim();
    const aiTools = body.aiTools?.trim();
    const productionProcess = body.productionProcess?.trim();
    const submitterName = body.submitterName?.trim();
    const submitterPhone = body.submitterPhone?.trim();
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag) => tag.trim()).filter(Boolean)
      : [];

    console.log('[submissions API] 입력값:', { contestId, title: title?.substring(0, 20), videoUrl: videoUrl?.substring(0, 20), thumbnailUrl: thumbnailUrl?.substring(0, 30), hasProductionProcess: !!productionProcess, submitterName, submitterPhone: submitterPhone ? '있음' : '없음' });
    if (!contestId || !title || !description || !videoUrl || !thumbnailUrl || !productionProcess || !submitterName || !submitterPhone) {
      console.error('[submissions API] 필수값 누락:', { contestId: !!contestId, title: !!title, description: !!description, videoUrl: !!videoUrl, thumbnailUrl: !!thumbnailUrl, productionProcess: !!productionProcess, submitterName: !!submitterName, submitterPhone: !!submitterPhone });
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    /* ====== 출품 수 제한 검증 ====== */
    const { data: contestData, error: contestError } = await supabase
      .from('contests')
      .select('max_submissions_per_user, status, submission_end_at')
      .eq('id', contestId)
      .single();

    if (contestError || !contestData) {
      return NextResponse.json({ error: '공모전 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    /* 공모전 상태 검증 */
    if (contestData.status !== 'open') {
      return NextResponse.json(
        { error: '이 공모전은 현재 접수 기간이 아닙니다.', code: 'CONTEST_NOT_OPEN' },
        { status: 410 },
      );
    }

    /* 마감일 검증 */
    if (contestData.submission_end_at && new Date(contestData.submission_end_at) < new Date()) {
      return NextResponse.json(
        { error: '공모전 접수 마감일이 지났습니다.', code: 'DEADLINE_PASSED' },
        { status: 403 },
      );
    }

    const maxSubmissions = contestData.max_submissions_per_user ?? 1;

    const { count: existingCount, error: countError } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('contest_id', contestId)
      .eq('user_id', user.id);

    if (countError) {
      console.error('기존 출품작 수 조회 실패:', countError);
      return NextResponse.json({ error: '출품작 확인에 실패했습니다.' }, { status: 500 });
    }

    if ((existingCount ?? 0) >= maxSubmissions) {
      return NextResponse.json(
        { error: `이 공모전의 최대 출품 가능 수(${maxSubmissions}개)를 초과했습니다.`, code: 'QUOTA_EXCEEDED' },
        { status: 409 },
      );
    }

    /* #4: INSERT 후 중복 재검증 (레이스 컨디션 방지) */
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        contest_id: contestId,
        user_id: user.id,
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
        views: 0,
        like_count: 0,
        video_duration: 0,
        avg_watch_duration: 0,
        tags,
        ai_tools: aiTools || null,
        production_process: productionProcess,
        terms_agreed: body.termsAgreed ?? false,
        submitter_name: submitterName,
        submitter_phone: submitterPhone,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('[submissions API] 출품작 INSERT 실패:', error?.message, error?.details, error?.hint);
      return NextResponse.json({ error: '출품작 등록에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
    console.log('[submissions API] 출품작 생성 성공! ID:', data.id);

    /* #4: INSERT 후 중복 재검증 (레이스 컨디션 방지 — 동시 요청으로 쿼터 초과 시 롤백) */
    const { count: postCount } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('contest_id', contestId)
      .eq('user_id', user.id);
    if ((postCount ?? 0) > maxSubmissions) {
      console.warn('[submissions API] 레이스 컨디션 감지 — 초과 출품작 삭제:', data.id);
      await supabase.from('submissions').delete().eq('id', data.id);
      return NextResponse.json(
        { error: `이 공모전의 최대 출품 가능 수(${maxSubmissions}개)를 초과했습니다.`, code: 'QUOTA_EXCEEDED' },
        { status: 409 },
      );
    }

    /* 가산점 인증 저장 */
    if (Array.isArray(body.bonusEntries) && body.bonusEntries.length > 0) {
      const bonusInserts = body.bonusEntries
        .filter((e) => e.bonusConfigId && (e.snsUrl || e.proofImageUrl))
        .map((e) => ({
          submission_id: data.id,
          bonus_config_id: e.bonusConfigId,
          sns_url: e.snsUrl || null,
          proof_image_url: e.proofImageUrl || null,
          submitted_at: new Date().toISOString(),
        }));

      if (bonusInserts.length > 0) {
        const { error: bonusError } = await supabase
          .from('bonus_entries')
          .insert(bonusInserts);

        if (bonusError) {
          console.error('가산점 인증 저장 실패 (출품작은 생성됨):', bonusError);
          /* 출품작은 이미 생성되었으므로 warning으로 응답 */
          return NextResponse.json(
            { submission: { id: data.id }, warning: '출품작은 제출되었으나 가산점 인증 저장에 실패했습니다. 수정 화면에서 다시 등록해 주세요.' },
            { status: 201 },
          );
        }
      }
    }

    // 활동 로그 기록
    createActivityLog({
      userId: user.id,
      action: 'create_submission',
      targetType: 'submission',
      targetId: data.id,
      metadata: { contestId, title: title ?? '', role: 'participant' },
    }).catch(console.error);

    // 캐시 무효화
    revalidateTag('submissions');
    revalidateTag('gallery');
    revalidateTag('users');

    console.log('[submissions API] 전체 완료, ID:', data.id);
    return NextResponse.json({ submission: { id: data.id } }, { status: 201 });
  } catch (error) {
    console.error('[submissions API] 예외 발생:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '출품작 등록에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
