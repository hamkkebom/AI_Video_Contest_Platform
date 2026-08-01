import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/** profiles.status CHECK 제약과 같은 값 */
const ALLOWED_STATUS = ['active', 'pending', 'suspended'] as const;

/**
 * 회원 상태 변경 (PATCH /api/admin/users/[id])
 *
 * profiles 는 "본인만 수정" 정책뿐이라 관리자가 남의 계정을 직접 UPDATE 할 수 없다.
 * 테이블에 관리자 UPDATE 를 열면 roles 배열까지 쓸 수 있어 권한 상승 경로가 되므로,
 * status 한 컬럼만 바꾸는 RPC(admin_set_user_status)를 통한다. (마이그레이션 050)
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

  const { error } = await supabase.rpc('admin_set_user_status', {
    target_user_id: id,
    new_status: status,
  });

  if (error) {
    if (error.message.includes('CANNOT_SUSPEND_SELF')) {
      return NextResponse.json({ error: '본인 계정은 정지할 수 없습니다.' }, { status: 400 });
    }
    if (error.message.includes('USER_NOT_FOUND')) {
      return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (error.code === 'PGRST202' || error.message.includes('admin_set_user_status')) {
      console.error('[admin/users] RPC 미배포:', error.message);
      return NextResponse.json({ error: '마이그레이션 050이 아직 적용되지 않았습니다.' }, { status: 503 });
    }
    console.error('[admin/users] 상태 변경 실패:', error);
    return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
  }

  revalidateTag('users');
  return NextResponse.json({ ok: true });
}
