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
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('[PATCH /api/submissions/[id]] 실패:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
