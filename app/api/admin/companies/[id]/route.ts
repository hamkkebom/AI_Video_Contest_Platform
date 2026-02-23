import { NextResponse } from 'next/server';
import { getCompanies, getCompanyMembers, getUsers } from '@/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [companies, members, users] = await Promise.all([
      getCompanies(),
      getCompanyMembers(),
      getUsers(),
    ]);

    const company = companies.find((c) => c.id === id) ?? null;
    const companyMembers = members
      .filter((m) => m.companyId === id)
      .map((m) => ({
        ...m,
        user: users.find((u) => u.id === m.userId) ?? null,
      }));

    return NextResponse.json({ company, members: companyMembers });
  } catch (error) {
    console.error('Failed to load company detail:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
