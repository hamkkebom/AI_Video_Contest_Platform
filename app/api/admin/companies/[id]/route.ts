import { NextResponse } from 'next/server';
import { getCompanies, getCompanyMembers, getUsersByIds } from '@/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
