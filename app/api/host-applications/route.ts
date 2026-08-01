import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/** 사업자등록번호 형식 — 숫자 10자리 (하이픈 허용 후 제거) */
function normalizeBusinessNumber(raw: string): string | null {
  const digits = raw.replace(/-/g, '').trim();
  return /^\d{10}$/.test(digits) ? digits : null;
}

/**
 * 주최자 온보딩 신청 (POST /api/host-applications)
 * 로그인 사용자가 기업을 등록 신청한다 — RPC(apply_host_company)가
 * 회사(pending)와 owner 멤버십을 원자 생성한다. (마이그레이션 049, D-015)
 * 승인은 관리자가 /admin/companies 에서 처리하며, 승인 시 host 역할이 부여된다.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const businessNumberRaw = typeof body.businessNumber === 'string' ? body.businessNumber : '';
  const representativeName = typeof body.representativeName === 'string' ? body.representativeName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const website = typeof body.website === 'string' ? body.website.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  if (!name || !representativeName) {
    return NextResponse.json({ error: '기업명과 대표자명은 필수입니다.' }, { status: 400 });
  }
  const businessNumber = normalizeBusinessNumber(businessNumberRaw);
  if (!businessNumber) {
    return NextResponse.json({ error: '사업자등록번호는 숫자 10자리여야 합니다.' }, { status: 400 });
  }
  if (website && !/^https?:\/\//.test(website)) {
    return NextResponse.json({ error: '웹사이트 주소는 http(s)://로 시작해야 합니다.' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('apply_host_company', {
    p_name: name,
    p_business_number: businessNumber,
    p_representative_name: representativeName,
    p_phone: phone || null,
    p_website: website || null,
    p_description: description || null,
  });

  if (error) {
    if (error.message.includes('ALREADY_APPLIED')) {
      return NextResponse.json({ error: '이미 신청한 기업이 있습니다. 승인 결과를 기다려주세요.' }, { status: 409 });
    }
    if (error.message.includes('duplicate key') || error.code === '23505') {
      return NextResponse.json({ error: '이미 등록된 사업자등록번호입니다.' }, { status: 409 });
    }
    /* RPC 미배포(마이그레이션 049 미적용) 환경 */
    if (error.code === 'PGRST202' || error.message.includes('apply_host_company')) {
      console.error('[host-applications] RPC 미배포:', error.message);
      return NextResponse.json({ error: '지금은 신청을 받을 수 없습니다. 잠시 후 다시 시도해주세요.' }, { status: 503 });
    }
    console.error('[host-applications] 신청 실패:', error);
    return NextResponse.json({ error: '신청 처리에 실패했습니다.' }, { status: 500 });
  }

  revalidateTag('companies');
  return NextResponse.json({ companyId: String(data) }, { status: 201 });
}
