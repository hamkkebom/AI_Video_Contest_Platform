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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[submissions API] 인증 실패:', authError?.message);
    return NextResponse.json({ error: '인증이 필요합니다.', code: 'AUTH_REQUIRED' }, { status: 401 });
  }
  console.log('[submissions API] 인증 성공:', user.id, user.email);

  try {
    const body = (await request.json()) as CreateSubmissionBody;

    const contestId = body.contestId?.trim();
    const title = body.title?.trim();
    const description = body.description?.trim();
    const videoUrl = body.videoUrl?.trim();
    const thumbnailUrl = body.thumbnailUrl?.trim();
    const aiTools = body.aiTools?.trim();
    const productionProcess = body.productionProcess?.trim();
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag) => tag.trim()).filter(Boolean)
      : [];

    console.log('[submissions API] 입력값:', { contestId, title: title?.substring(0, 20), videoUrl: videoUrl?.substring(0, 20), thumbnailUrl: thumbnailUrl?.substring(0, 30), hasProductionProcess: !!productionProcess });
    if (!contestId || !title || !description || !videoUrl || !thumbnailUrl || !productionProcess) {
      console.error('[submissions API] 필수값 누락:', { contestId: !!contestId, title: !!title, description: !!description, videoUrl: !!videoUrl, thumbnailUrl: !!thumbnailUrl, productionProcess: !!productionProcess });
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
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('[submissions API] 출품작 INSERT 실패:', error?.message, error?.details, error?.hint);
      return NextResponse.json({ error: `출품작 생성에 실패했습니다: ${error?.message ?? '알 수 없는 오류'}` }, { status: 500 });
    }
    console.log('[submissions API] 출품작 생성 성공! ID:', data.id);

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
        }
      }
    }

    // 활동 로그 기록
    await createActivityLog({
      userId: user.id,
      action: 'create_submission',
      targetType: 'submission',
      targetId: data.id,
      metadata: { contestId, title: title ?? '', role: 'participant' },
    });

    // 캐시 무효화
    revalidateTag('submissions');
    revalidateTag('users');

    console.log('[submissions API] 전체 완료, ID:', data.id);
    return NextResponse.json({ submission: { id: data.id } }, { status: 201 });
  } catch (error) {
    console.error('[submissions API] 예외 발생:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
