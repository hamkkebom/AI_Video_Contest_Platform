import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/** agency_requests.status CHECK 제약과 같은 값 (마이그레이션 000) */
const ALLOWED_STATUS = ['new', 'reviewing', 'quoted', 'closed'] as const;

/**
 * 대행 의뢰 상태 변경 (PATCH /api/admin/agency-requests/[id])
 *
 * 접수는 D-011 로 동작하고 있었지만 관리자 화면의 "상태 변경" 버튼은 아무 동작이 없었다.
 * 실제로 들어온 의뢰를 처리할 수단이 없던 셈이라 이 경로를 만든다.
 * 쓰기는 RLS("agency_requests: 관리자 처리")가 최종 관문이고, 여기서도 명시 확인한다
 * — /api/admin/* 는 미들웨어 보호 대상이 아니다(/admin 으로 시작하지 않음).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.roles?.includes('admin')) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status : '';
  if (!ALLOWED_STATUS.includes(status as (typeof ALLOWED_STATUS)[number])) {
    return NextResponse.json({ error: '허용되지 않는 상태입니다.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('agency_requests')
    .update({ status })
    .eq('id', Number(id));

  if (error) {
    console.error('[admin/agency-requests] 상태 변경 실패:', error);
    return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
  }

  revalidateTag('agency-requests');
  return NextResponse.json({ ok: true });
}
