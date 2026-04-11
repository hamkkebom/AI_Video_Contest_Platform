import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/**
 * 가산점 인증 승인/반려 API (관리자 전용)
 * PATCH /api/admin/bonus-entries/[id]
 */

function isAdmin(roles: unknown): boolean {
  if (Array.isArray(roles)) return roles.includes('admin');
  if (typeof roles === 'string') return roles.split(',').map((r) => r.trim()).includes('admin');
  return false;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bonusEntryId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (!profile || !isAdmin(profile.roles)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      status?: 'approved' | 'rejected' | 'pending';
      rejectionReason?: string;
    };

    if (!body.status || !['approved', 'rejected', 'pending'].includes(body.status)) {
      return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status: body.status,
      reviewed_by: body.status === 'pending' ? null : user.id,
      reviewed_at: body.status === 'pending' ? null : new Date().toISOString(),
      rejection_reason: body.status === 'rejected' ? (body.rejectionReason?.trim() || null) : null,
    };

    const { data: updated, error } = await supabase
      .from('bonus_entries')
      .update(updateData)
      .eq('id', bonusEntryId)
      .select('id, submission_id')
      .single();

    if (error || !updated) {
      console.error('[PATCH /api/admin/bonus-entries/[id]] 실패:', error);
      return NextResponse.json({ error: '가산점 인증 처리에 실패했습니다.' }, { status: 500 });
    }

    createActivityLog({
      userId: user.id,
      action: body.status === 'approved' ? 'approve_bonus' : body.status === 'rejected' ? 'reject_bonus' : 'reset_bonus',
      targetType: 'submission',
      targetId: String(updated.submission_id),
      metadata: { bonusEntryId, status: body.status },
    }).catch(console.error);

    revalidateTag('submissions');

    return NextResponse.json({ success: true, bonusEntry: { id: updated.id, status: body.status } });
  } catch (error) {
    console.error('[PATCH /api/admin/bonus-entries/[id]] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '가산점 인증 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
