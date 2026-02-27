import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** 관리자 회원 검색 전용 API — name, nickname, email로 검색 */
export async function GET(request: Request) {
  const supabase = await createClient();

  /* 인증 확인 */
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  /* 관리자 권한 확인 */
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const roles = profile?.roles;
  const isAdmin =
    Array.isArray(roles)
      ? roles.includes('admin')
      : typeof roles === 'string' && roles.split(',').map((r) => r.trim()).includes('admin');

  if (!isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  /* 검색 */
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ users: [] });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${query}%,nickname.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[GET /api/admin/users/search] 검색 실패:', error.message);
    return NextResponse.json({ error: '회원 검색에 실패했습니다.' }, { status: 500 });
  }

  /* profiles 행 → 클라이언트용 간략 응답 */
  const users = (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    nickname: row.nickname ?? null,
    roles: row.roles ?? ['participant'],
    status: row.status ?? 'active',
  }));

  return NextResponse.json({ users });
}
