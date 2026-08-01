import { NextResponse } from 'next/server';
import { getCompanies, getCompanyMembers, getUsersByIds } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* 이 라우트는 /api/admin/* 이라 미들웨어 보호 대상이 아니다(/admin 으로 시작하지 않음).
       companies 는 사업자등록번호·사업자등록증 URL 을 담으므로 RLS 에만 기대지 않고
       여기서도 관리자를 명시적으로 확인한다. */
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
    const [companies, members] = await Promise.all([
      getCompanies(),
      getCompanyMembers(),
    ]);

    const company = companies.find((c) => c.id === id) ?? null;
    const memberRows = members.filter((m) => m.companyId === id);

    /* 해당 회사 멤버만 조회한다 (전체 회원 조회 방지) */
    const memberUserIds = [...new Set(memberRows.map((m) => m.userId))];
    const users = memberUserIds.length > 0 ? await getUsersByIds(memberUserIds) : [];

    const companyMembers = memberRows.map((m) => ({
      ...m,
      user: users.find((u) => u.id === m.userId) ?? null,
    }));

    return NextResponse.json({ company, members: companyMembers });
  } catch (error) {
    console.error('Failed to load company detail:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
