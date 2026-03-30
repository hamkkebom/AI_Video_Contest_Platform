import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/** 허용되는 상태 값 */
const ALLOWED_STATUSES = ['approved', 'rejected', 'allow_resubmission', 'needs_resubmission'] as const;
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

function isAdmin(roles: unknown): boolean {
  if (Array.isArray(roles)) return roles.includes('admin');
  if (typeof roles === 'string') return roles.split(',').map((r) => r.trim()).includes('admin');
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
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

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
    const body = (await request.json()) as { status?: string; rejectionReason?: string };
    const newStatus = body.status?.trim() as AllowedStatus | undefined;
    const rejectionReason = body.rejectionReason?.trim();

    if (!newStatus || !ALLOWED_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `유효하지 않은 상태입니다. 허용: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    /* 제출물 존재 확인 */
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('id, status, contest_id, resubmission_count')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: '제출물을 찾을 수 없습니다.' }, { status: 404 });
    }

    /* 재제출 허용 처리 */
    if (newStatus === 'allow_resubmission') {
      const { error: resubError } = await supabase
        .from('submissions')
        .update({
          status: 'needs_resubmission',
          resubmission_count: (submission.resubmission_count ?? 0) + 1,
          resubmission_allowed_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
        })
        .eq('id', submissionId);

      if (resubError) {
        console.error('[PATCH /api/submissions/[id]] 재제출 허용 실패:', resubError.message);
        return NextResponse.json({ error: '재제출 허용에 실패했습니다.' }, { status: 500 });
      }

      createActivityLog({
        userId: user.id,
        action: 'allow_resubmission',
        targetType: 'submission',
        targetId: submissionId,
        metadata: { contestId: submission.contest_id, previousStatus: submission.status },
      }).catch(console.error);

      revalidateTag('submissions');
      revalidateTag('gallery');
      return NextResponse.json({ success: true, status: 'needs_resubmission' });
    }

    /* 상태 업데이트 */
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: newStatus,
        rejection_reason: newStatus === 'rejected' ? rejectionReason || null : null,
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('[PATCH /api/submissions/[id]] 상태 업데이트 실패:', updateError.message);
      return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
    }

    /* 활동 로그 기록 */
    createActivityLog({
      userId: user.id,
      action: newStatus === 'approved' ? 'approve_submission' : 'reject_submission',
      targetType: 'submission',
      targetId: submissionId,
      metadata: {
        contestId: submission.contest_id,
        previousStatus: submission.status,
        newStatus,
      },
    }).catch(console.error);

    /* 캐시 무효화 */
    revalidateTag('submissions');
    revalidateTag('gallery');

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
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

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

  /* 본인 것인지 확인 — 관리자는 모든 출품작 조회 가능 */
  if (submission.user_id !== user.id) {
    const { data: adminProfile } = await supabase.from('profiles').select('roles').eq('id', user.id).single();
    if (!adminProfile || !isAdmin(adminProfile.roles)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }
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
      resubmissionCount: submission.resubmission_count ?? 0,
      resubmissionAllowedAt: submission.resubmission_allowed_at ?? null,
      bonusEntries: (bonusEntries ?? []).map((e: Record<string, unknown>) => ({
        bonusConfigId: e.bonus_config_id,
        snsUrl: e.sns_url,
        proofImageUrl: e.proof_image_url,
      })),
    },
  });
}

/** 본인 출품작 내용 수정 API (영상/썸네일 제외, 관리자는 전체 수정 가능) */
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
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.', code: 'AUTH_REQUIRED' }, { status: 401 });
  }

  /* 출품작 존재 + 소유권 확인 */
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('id, user_id, contest_id, status, resubmission_count, resubmission_allowed_at')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
  }

  const { data: callerProfile } = await supabase.from('profiles').select('roles').eq('id', user.id).single();
  const callerIsAdmin = callerProfile && isAdmin(callerProfile.roles);

  if (submission.user_id !== user.id && !callerIsAdmin) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  /* 재제출 허용된 출품작은 공모전 마감과 무관하게 수정 가능 */
  const isResubmissionAllowed = ((submission.resubmission_count ?? 0) > 0 && !!submission.resubmission_allowed_at) || submission.status === 'needs_resubmission';

  if (!callerIsAdmin && !isResubmissionAllowed) {
    /* 공모전 상태 확인 (open일 때만 수정 가능) — 참가자만 */
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
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      aiTools?: string;
      productionProcess?: string;
      submitterName?: string;
      submitterPhone?: string;
      videoUrl?: string;
      thumbnailUrl?: string;
      status?: string;
      submittedAt?: string;
      bonusEntries?: Array<{ bonusConfigId: string; snsUrl?: string; proofImageUrl?: string }>;
      isResubmission?: boolean;
    };

    /* 재제출 모드: 영상+썸네일만 업데이트 */
    if (body.isResubmission && isResubmissionAllowed) {
      if (!body.videoUrl) {
        return NextResponse.json({ error: '영상 URL이 필요합니다.' }, { status: 400 });
      }
      const resubUpdateData: Record<string, unknown> = {
        video_url: body.videoUrl,
        status: 'pending_review', // 재제출 완료 → 검수대기로 변경
        resubmission_allowed_at: null, // 재제출 완료 → 버튼 비활성화
      };
      if (body.thumbnailUrl) resubUpdateData.thumbnail_url = body.thumbnailUrl;

      const { error: resubUpdateError } = await supabase
        .from('submissions')
        .update(resubUpdateData)
        .eq('id', submissionId);

      if (resubUpdateError) {
        return NextResponse.json({ error: '재제출에 실패했습니다.' }, { status: 500 });
      }

      createActivityLog({
        userId: user.id,
        action: 'resubmit_submission',
        targetType: 'submission',
        targetId: submissionId,
        metadata: { contestId: submission.contest_id },
      }).catch(console.error);

      revalidateTag('submissions');
      revalidateTag('gallery');
      return NextResponse.json({ success: true });
    }

    const title = body.title?.trim();
    const description = body.description?.trim();
    const aiTools = body.aiTools?.trim();
    const productionProcess = body.productionProcess?.trim();
    const submitterName = body.submitterName?.trim();
    const submitterPhone = body.submitterPhone?.trim();

    if (!title || !description || !productionProcess) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      title,
      description,
      ai_tools: aiTools || null,
      production_process: productionProcess,
      submitter_name: submitterName || null,
      submitter_phone: submitterPhone || null,
    };
    if (callerIsAdmin) {
      if (body.videoUrl !== undefined) updateData.video_url = body.videoUrl;
      if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.submittedAt !== undefined) updateData.submitted_at = body.submittedAt;
    }

    /* 출품작 정보 업데이트 */
    const { data: updatedRows, error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
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
    createActivityLog({
      userId: user.id,
      action: 'update_submission',
      targetType: 'submission',
      targetId: submissionId,
      metadata: { contestId: submission.contest_id as string, title: title ?? '' },
    }).catch(console.error);

    /* 캐시 무효화 */
    revalidateTag('submissions');
    revalidateTag('gallery');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT /api/submissions/[id]] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '출품작 수정에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
  }
}

/** 관리자 출품작 삭제 API */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  /* 관리자 권한 확인 */
  const { data: profile } = await supabase.from('profiles').select('roles').eq('id', user.id).single();
  if (!profile || !isAdmin(profile.roles)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  /* 출품작 존재 확인 */
  const { data: submission } = await supabase
    .from('submissions')
    .select('id, title, contest_id, user_id')
    .eq('id', submissionId)
    .single();
  if (!submission) {
    return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
  }

  /* 삭제 (bonus_entries는 FK CASCADE로 자동 삭제) */
  const { error: deleteError } = await supabase.from('submissions').delete().eq('id', submissionId);
  if (deleteError) {
    console.error('[DELETE /api/submissions/[id]] 삭제 실패:', deleteError.message);
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  }

  /* 활동 로그 */
  createActivityLog({
    userId: user.id,
    action: 'delete_submission',
    targetType: 'submission',
    targetId: submissionId,
    metadata: {
      contestId: submission.contest_id as string,
      title: submission.title as string,
      deletedUserId: submission.user_id as string,
    },
  }).catch(console.error);

  /* 캐시 무효화 */
  revalidateTag('submissions');
  revalidateTag('gallery');

  return NextResponse.json({ success: true });
}
