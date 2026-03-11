import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/** 허용되는 상태 값 */
const ALLOWED_STATUSES = ['approved', 'rejected'] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function hasPermission(roles: unknown): boolean {
  if (Array.isArray(roles)) {
    return roles.includes('admin') || roles.includes('host');
  }
  if (typeof roles === 'string') {
    const list = roles.split(',').map((r) => r.trim());
    return list.includes('admin') || list.includes('host');
  }
  return false;
}

/** 제출물 상태 변경 API (승인/거절) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  /* 인증 확인 */
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  /* 권한 확인 (admin 또는 host) */
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !hasPermission(profile.roles)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { status?: string };
    const newStatus = body.status?.trim() as AllowedStatus | undefined;

    if (!newStatus || !ALLOWED_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `유효하지 않은 상태입니다. 허용: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    /* 제출물 존재 확인 */
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('id, status, contest_id')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: '제출물을 찾을 수 없습니다.' }, { status: 404 });
    }

    /* 상태 업데이트 */
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: newStatus })
      .eq('id', submissionId);

    if (updateError) {
      console.error('[PATCH /api/submissions/[id]] 상태 업데이트 실패:', updateError.message);
      return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
    }

    /* 활동 로그 기록 */
    await createActivityLog({
      userId: user.id,
      action: newStatus === 'approved' ? 'approve_submission' : 'reject_submission',
      targetType: 'submission',
      targetId: submissionId,
      metadata: {
        contestId: submission.contest_id,
        previousStatus: submission.status,
        newStatus,
      },
    });

    /* 캐시 무효화 */
    revalidateTag('submissions');

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('[PATCH /api/submissions/[id]] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '출품작 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}

/** 본인 출품작 단건 조회 API (수정 모드용) */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  /* 출품작 조회 */
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
  }

  /* 본인 것인지 확인 */
  if (submission.user_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  /* 가산점 인증 내역 조회 */
  const { data: bonusEntries } = await supabase
    .from('bonus_entries')
    .select('*')
    .eq('submission_id', submissionId);

  return NextResponse.json({
    submission: {
      id: submission.id,
      contestId: submission.contest_id,
      submitterName: submission.submitter_name,
      submitterPhone: submission.submitter_phone,
      title: submission.title,
      description: submission.description,
      videoUrl: submission.video_url,
      thumbnailUrl: submission.thumbnail_url,
      aiTools: submission.ai_tools,
      productionProcess: submission.production_process,
      bonusEntries: (bonusEntries ?? []).map((e: Record<string, unknown>) => ({
        bonusConfigId: e.bonus_config_id,
        snsUrl: e.sns_url,
        proofImageUrl: e.proof_image_url,
      })),
    },
  });
}

/** 본인 출품작 내용 수정 API (영상/썸네일 제외) */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.', code: 'AUTH_REQUIRED' }, { status: 401 });
  }

  /* 출품작 존재 + 소유권 확인 */
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('id, user_id, contest_id')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (submission.user_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  /* 공모전 상태 확인 (open일 때만 수정 가능) */
  const { data: contest } = await supabase
    .from('contests')
    .select('status, submission_end_at')
    .eq('id', submission.contest_id)
    .single();

  if (!contest || contest.status !== 'open') {
    return NextResponse.json(
      { error: '접수 기간이 아니라 수정할 수 없습니다.', code: 'CONTEST_NOT_OPEN' },
      { status: 410 },
    );
  }

  if (contest.submission_end_at && new Date(contest.submission_end_at as string) < new Date()) {
    return NextResponse.json(
      { error: '접수 마감일이 지나 수정할 수 없습니다.', code: 'DEADLINE_PASSED' },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      aiTools?: string;
      productionProcess?: string;
      submitterName?: string;
      submitterPhone?: string;
      bonusEntries?: Array<{ bonusConfigId: string; snsUrl?: string; proofImageUrl?: string }>;
    };

    const title = body.title?.trim();
    const description = body.description?.trim();
    const aiTools = body.aiTools?.trim();
    const productionProcess = body.productionProcess?.trim();
    const submitterName = body.submitterName?.trim();
    const submitterPhone = body.submitterPhone?.trim();

    if (!title || !description || !productionProcess) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    /* 출품작 정보 업데이트 */
    const { data: updatedRows, error: updateError } = await supabase
      .from('submissions')
      .update({
        title,
        description,
        ai_tools: aiTools || null,
        production_process: productionProcess,
        submitter_name: submitterName || null,
        submitter_phone: submitterPhone || null,
      })
      .eq('id', submissionId)
      .select('id');

    if (updateError) {
      console.error('[PUT /api/submissions/[id]] 업데이트 실패:', updateError.message);
      return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error('[PUT /api/submissions/[id]] RLS 또는 조건 불일치로 업데이트된 행 없음. submissionId:', submissionId);
      return NextResponse.json({ error: '수정 권한이 없거나 출품작을 찾을 수 없습니다.' }, { status: 403 });
    }

    console.log('[PUT /api/submissions/[id]] 업데이트 성공. submissionId:', submissionId, 'title:', title);

    /* 가산점 인증 업데이트 (기존 삭제 → 재삽입) */
    if (Array.isArray(body.bonusEntries)) {
      const { error: deleteError } = await supabase.from('bonus_entries').delete().eq('submission_id', submissionId);
      if (deleteError) {
        console.error('가산점 인증 삭제 실패:', deleteError);
        return NextResponse.json(
          { success: true, warning: '출품작은 수정되었으나 가산점 인증 업데이트에 실패했습니다.' },
          { status: 200 },
        );
      }

      const bonusInserts = body.bonusEntries
        .filter((e) => e.bonusConfigId && (e.snsUrl || e.proofImageUrl))
        .map((e) => ({
          submission_id: submissionId,
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
          console.error('가산점 인증 저장 실패:', bonusError);
          return NextResponse.json(
            { success: true, warning: '출품작은 수정되었으나 가산점 인증 저장에 실패했습니다.' },
            { status: 200 },
          );
        }
      }
    }

    /* 활동 로그 기록 */
    await createActivityLog({
      userId: user.id,
      action: 'update_submission',
      targetType: 'submission',
      targetId: submissionId,
      metadata: { contestId: submission.contest_id as string, title: title ?? '' },
    });

    /* 캐시 무효화 */
    revalidateTag('submissions');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT /api/submissions/[id]] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '출품작 수정에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}
