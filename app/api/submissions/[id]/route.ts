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
      revalidateTag('contests');
      return NextResponse.json({ success: true, status: 'needs_resubmission' });
    }

    /* 상태 업데이트 */
    const updateData: Record<string, unknown> = {
      status: newStatus,
      rejection_reason: newStatus === 'rejected' || newStatus === 'needs_resubmission' ? rejectionReason || null : null,
    };
    /* 드롭다운에서 직접 needs_resubmission 선택 시에도 재제출 허용 데이터 자동 설정 */
    if (newStatus === 'needs_resubmission') {
      updateData.resubmission_count = (submission.resubmission_count ?? 0) + 1;
      updateData.resubmission_allowed_at = new Date().toISOString();
    }
    const { error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
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
    revalidateTag('contests');

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

  /* 가산점 전용 수정 가능 여부 (제출 마감 후 + 가산점 마감 전) */
  let bonusOnlyMode = false;

  if (!callerIsAdmin && !isResubmissionAllowed) {
    const { data: contest } = await supabase
      .from('contests')
      .select('status, submission_end_at, bonus_deadline_at')
      .eq('id', submission.contest_id)
      .single();

    const now = new Date();
    const isContestOpen = contest?.status === 'open';
    const isBeforeSubmissionDeadline = contest?.submission_end_at && new Date(contest.submission_end_at as string) >= now;
    const isBeforeBonusDeadline = contest?.bonus_deadline_at && new Date(contest.bonus_deadline_at as string) >= now;

    if (isContestOpen && isBeforeSubmissionDeadline) {
      /* 접수 기간 중 — 전체 수정 가능 */
    } else if (isBeforeBonusDeadline) {
      /* 제출 마감 후 + 가산점 마감 전 — 가산점만 수정 가능 */
      bonusOnlyMode = true;
    } else {
      /* 모든 마감 지남 */
      return NextResponse.json(
        { error: '수정 가능한 기간이 아닙니다.', code: 'DEADLINE_PASSED' },
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
      bonusOnly?: boolean;
    };

    /* 클라이언트가 bonusOnly 플래그를 보낸 경우 서버 검증과 일치 확인 */
    if (body.bonusOnly && !bonusOnlyMode && !callerIsAdmin) {
      return NextResponse.json({ error: '가산점만 수정할 수 있는 기간이 아닙니다.' }, { status: 403 });
    }
    if (body.bonusOnly) bonusOnlyMode = true;

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
      revalidateTag('contests');
      return NextResponse.json({ success: true });
    }

    /* ====== 가산점 전용 수정 모드 ======
     * 안전한 upsert 처리:
     * - 승인/거절된 기존 항목은 보호 (수정/삭제 불가)
     * - pending 항목만 sns_url/proof_image_url 수정 가능
     * - 신규 항목은 INSERT
     * - body에서 제거된 pending 항목만 DELETE
     * - 원본 submitted_at, status, reviewed_* 모두 보존
     */
    if (bonusOnlyMode) {
      if (!Array.isArray(body.bonusEntries)) {
        return NextResponse.json({ error: '가산점 데이터가 필요합니다.' }, { status: 400 });
      }

      const { data: existingEntries, error: fetchExistingError } = await supabase
        .from('bonus_entries')
        .select('id, bonus_config_id, status, sns_url, proof_image_url')
        .eq('submission_id', submissionId);

      if (fetchExistingError) {
        console.error('기존 가산점 조회 실패:', fetchExistingError);
        return NextResponse.json({ error: '가산점 인증 업데이트에 실패했습니다.' }, { status: 500 });
      }

      const existingByConfigId = new Map(
        (existingEntries ?? []).map((e) => [String(e.bonus_config_id), e]),
      );
      const incomingConfigIds = new Set<string>();

      /* 1) body에 있는 항목: 신규 INSERT 또는 pending UPDATE */
      for (const entry of body.bonusEntries) {
        if (!entry.bonusConfigId) continue;
        const configIdStr = String(entry.bonusConfigId);
        incomingConfigIds.add(configIdStr);
        const existing = existingByConfigId.get(configIdStr);

        if (!existing) {
          const { error: insertError } = await supabase.from('bonus_entries').insert({
            submission_id: submissionId,
            bonus_config_id: entry.bonusConfigId,
            sns_url: entry.snsUrl || null,
            proof_image_url: entry.proofImageUrl || null,
            submitted_at: new Date().toISOString(),
          });
          if (insertError) {
            console.error('가산점 신규 등록 실패:', insertError);
            return NextResponse.json({ error: '가산점 인증 저장에 실패했습니다.' }, { status: 500 });
          }
        } else if (!existing.status || existing.status === 'pending') {
          /* pending이면서 실제 변경이 있는 경우만 UPDATE (submitted_at, status 불변) */
          const newSns = entry.snsUrl || null;
          const newProof = entry.proofImageUrl || null;
          if (newSns !== existing.sns_url || newProof !== existing.proof_image_url) {
            const { error: updateError } = await supabase
              .from('bonus_entries')
              .update({ sns_url: newSns, proof_image_url: newProof })
              .eq('id', existing.id);
            if (updateError) {
              console.error('가산점 pending 수정 실패:', updateError);
              return NextResponse.json({ error: '가산점 인증 저장에 실패했습니다.' }, { status: 500 });
            }
          }
        }
        /* approved/rejected: 보호 — skip */
      }

      /* 2) 기존에 있었으나 body에서 빠진 pending 항목만 DELETE (승인/거절 보호) */
      for (const existing of existingEntries ?? []) {
        const configIdStr = String(existing.bonus_config_id);
        if (incomingConfigIds.has(configIdStr)) continue;
        if (existing.status && existing.status !== 'pending') continue;
        const { error: deleteError } = await supabase
          .from('bonus_entries')
          .delete()
          .eq('id', existing.id);
        if (deleteError) {
          console.error('가산점 pending 삭제 실패:', deleteError);
          return NextResponse.json({ error: '가산점 인증 업데이트에 실패했습니다.' }, { status: 500 });
        }
      }

      revalidateTag('submissions');
      revalidateTag('gallery');
      return NextResponse.json({ success: true });
    }

    /* ====== 일반 수정 모드 ====== */
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
      return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json({ error: '수정 권한이 없거나 출품작을 찾을 수 없습니다.' }, { status: 403 });
    }

    /* 가산점 인증 업데이트 — 안전한 upsert (일반 수정 모드에서도 허용)
     * 승인/거절된 항목은 보호: body에 있어도 덮어쓰지 않음
     * pending 항목만 sns_url/proof_image_url 수정 가능
     * 신규 항목은 INSERT, body에서 빠진 pending은 DELETE
     * 승인 상태(status, reviewed_*)와 원본 submitted_at은 모두 보존 */
    if (Array.isArray(body.bonusEntries)) {
      const { data: existingEntries, error: fetchExistingError } = await supabase
        .from('bonus_entries')
        .select('id, bonus_config_id, status, sns_url, proof_image_url')
        .eq('submission_id', submissionId);

      if (!fetchExistingError) {
        const existingByConfigId = new Map(
          (existingEntries ?? []).map((e) => [String(e.bonus_config_id), e]),
        );
        const incomingConfigIds = new Set<string>();

        /* 1) body 항목: 신규 INSERT 또는 pending UPDATE (승인/거절은 스킵) */
        for (const entry of body.bonusEntries) {
          if (!entry.bonusConfigId) continue;
          const configIdStr = String(entry.bonusConfigId);
          incomingConfigIds.add(configIdStr);
          const existing = existingByConfigId.get(configIdStr);

          const newSns = entry.snsUrl || null;
          const newProof = entry.proofImageUrl || null;

          if (!existing) {
            const { error: insertError } = await supabase.from('bonus_entries').insert({
              submission_id: submissionId,
              bonus_config_id: entry.bonusConfigId,
              sns_url: newSns,
              proof_image_url: newProof,
              submitted_at: new Date().toISOString(),
            });
            if (insertError) {
              console.error('가산점 신규 등록 실패:', insertError);
            }
          } else if (!existing.status || existing.status === 'pending') {
            /* pending이면 sns_url/proof_image_url만 UPDATE (다른 필드 보존) */
            if (newSns !== existing.sns_url || newProof !== existing.proof_image_url) {
              const { error: updateError } = await supabase
                .from('bonus_entries')
                .update({ sns_url: newSns, proof_image_url: newProof })
                .eq('id', existing.id);
              if (updateError) {
                console.error('가산점 pending 수정 실패:', updateError);
              }
            }
          }
          /* approved/rejected: 보호 — skip (관리자가 관리자 승인 API로만 변경 가능) */
        }

        /* 2) 기존 pending 중 body에 없는 것: DELETE (승인/거절은 보존) */
        for (const existing of existingEntries ?? []) {
          const configIdStr = String(existing.bonus_config_id);
          if (incomingConfigIds.has(configIdStr)) continue;
          if (existing.status && existing.status !== 'pending') continue;
          await supabase.from('bonus_entries').delete().eq('id', existing.id);
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
    revalidateTag('contests');

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
  revalidateTag('contests');

  return NextResponse.json({ success: true });
}
