import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function hasAdminRole(roles: unknown): boolean {
  if (Array.isArray(roles)) {
    return roles.includes('admin');
  }

  if (typeof roles === 'string') {
    return roles.split(',').map((role) => role.trim()).includes('admin');
  }

  return false;
}

/** 관리자 공모전 제출 상태별 카운트 조회 API */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !hasAdminRole(profile.roles)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('submissions')
      .select('status')
      .eq('contest_id', id);

    if (error || !data) {
      return NextResponse.json({ error: '출품 카운트 조회에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      total: data.length,
      pendingReview: data.filter((submission) => submission.status === 'pending_review').length,
      approved: data.filter((submission) => submission.status === 'approved').length,
      rejected: data.filter(
        (submission) => submission.status === 'rejected' || submission.status === 'auto_rejected',
      ).length,
      judging: data.filter((submission) => submission.status === 'judging').length,
      judged: data.filter((submission) => submission.status === 'judged').length,
    });
  } catch (error) {
    console.error('[GET /api/admin/contests/[id]/submissions-count] 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
