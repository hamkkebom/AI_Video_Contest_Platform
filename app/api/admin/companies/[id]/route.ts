import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getCompanies, getCompanyMembers, getUsersByIds } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

/** 관리자 확인 — 통과 시 null, 실패 시 에러 응답 */
async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
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
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* 이 라우트는 /api/admin/* 이라 미들웨어 보호 대상이 아니다(/admin 으로 시작하지 않음).
       companies 는 사업자등록번호·사업자등록증 URL 을 담으므로 RLS 에만 기대지 않고
       여기서도 관리자를 명시적으로 확인한다. */
    const supabase = await createClient();
    const denied = await requireAdmin(supabase);
    if (denied) return denied;

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

/**
 * 기업 승인/반려 (PATCH) — RPC(admin_set_company_status)가 상태 변경과
 * 승인 시 owner 의 host 역할 부여를 원자 처리한다. (마이그레이션 049, D-015)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const denied = await requireAdmin(supabase);
  if (denied) return denied;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status : '';
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ error: '허용되지 않는 상태입니다.' }, { status: 400 });
  }

  const { error } = await supabase.rpc('admin_set_company_status', {
    target_company_id: Number(id),
    new_status: status,
  });

  if (error) {
    if (error.message.includes('COMPANY_NOT_FOUND')) {
      return NextResponse.json({ error: '기업을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (error.code === 'PGRST202' || error.message.includes('admin_set_company_status')) {
      console.error('[admin/companies] RPC 미배포:', error.message);
      return NextResponse.json({ error: '마이그레이션 049가 아직 적용되지 않았습니다.' }, { status: 503 });
    }
    console.error('[admin/companies] 상태 변경 실패:', error);
    return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
  }

  /* 승인 여부가 공개 뷰(public_companies)와 사용자 역할에 반영된다 */
  revalidateTag('companies');
  revalidateTag('users');
  return NextResponse.json({ ok: true });
}
