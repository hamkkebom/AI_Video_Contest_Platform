import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractClientIp, hashForAntiAbuse } from '@/lib/utils';

/**
 * 영상 제작 대행 의뢰 접수 API
 * POST /api/agency-requests
 *
 * 비회원 접수 허용 — 045 마이그레이션의 RLS 정책이 anon INSERT를 허용하므로
 * service_role 키가 필요 없다. 스팸 방지를 위해 IP 해시 기준 시간당 3회로 제한한다.
 */

const COMPANY_MAX = 100;
const CONTACT_NAME_MAX = 100;
const EMAIL_MAX = 254;
const PHONE_MAX = 30;
const BUDGET_MAX = 100;
const MESSAGE_MAX = 5000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** body 값을 문자열로 정규화 (문자열이 아니면 빈 문자열) */
function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    /* 1) body 파싱 */
    const body = (await request.json()) as Record<string, unknown>;
    const companyName = toTrimmedString(body.companyName);
    const contactName = toTrimmedString(body.contactName);
    const contactEmail = toTrimmedString(body.contactEmail);
    const phoneNumber = toTrimmedString(body.phoneNumber);
    const budgetRange = toTrimmedString(body.budgetRange);
    const message = toTrimmedString(body.message);

    /* 2) 검증 */
    if (!companyName) {
      return NextResponse.json({ error: '회사명 또는 이름을 입력해주세요.' }, { status: 400 });
    }
    if (companyName.length > COMPANY_MAX) {
      return NextResponse.json({ error: `회사명은 ${COMPANY_MAX}자 이내로 입력해주세요.` }, { status: 400 });
    }
    if (!contactName) {
      return NextResponse.json({ error: '담당자명을 입력해주세요.' }, { status: 400 });
    }
    if (contactName.length > CONTACT_NAME_MAX) {
      return NextResponse.json({ error: `담당자명은 ${CONTACT_NAME_MAX}자 이내로 입력해주세요.` }, { status: 400 });
    }
    if (!contactEmail) {
      return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
    }
    if (contactEmail.length > EMAIL_MAX || !EMAIL_PATTERN.test(contactEmail)) {
      return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
    }
    if (phoneNumber.length > PHONE_MAX) {
      return NextResponse.json({ error: `연락처는 ${PHONE_MAX}자 이내로 입력해주세요.` }, { status: 400 });
    }
    if (budgetRange.length > BUDGET_MAX) {
      return NextResponse.json({ error: `예산 범위는 ${BUDGET_MAX}자 이내로 입력해주세요.` }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: '상세 요청사항을 입력해주세요.' }, { status: 400 });
    }
    if (message.length > MESSAGE_MAX) {
      return NextResponse.json({ error: `상세 요청사항은 ${MESSAGE_MAX}자 이내로 입력해주세요.` }, { status: 400 });
    }

    /* 3) 레이트리밋 — IP 해시 기준 시간당 3회 */
    const clientIp = extractClientIp(request.headers) ?? 'unknown';
    const ipHash = await hashForAntiAbuse(clientIp);

    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_intake_rate_limit', {
      p_key: ipHash,
      p_action: 'agency_request',
      p_limit: 3,
      p_window_minutes: 60,
    });

    if (rateLimitError) {
      console.error('[POST /api/agency-requests] 레이트리밋 확인 실패:', rateLimitError.code, rateLimitError.message);
      return NextResponse.json({ error: '의뢰 접수에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
    if (allowed === false) {
      return NextResponse.json(
        { error: '의뢰 접수 한도를 초과했습니다. 1시간 후 다시 시도해주세요.', code: 'RATE_LIMITED' },
        { status: 429 },
      );
    }

    /* 4) 저장 */
    const { error: insertError } = await supabase.from('agency_requests').insert({
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      phone_number: phoneNumber || null,
      budget_range: budgetRange || null,
      message,
    });

    if (insertError) {
      console.error('[POST /api/agency-requests] 저장 실패:', insertError.code, insertError.message, insertError.details);
      /* PostgREST 42501 = RLS 차단 → 045 미적용 가능성 */
      if (insertError.code === '42501') {
        return NextResponse.json(
          { error: '의뢰 접수 설정이 완료되지 않았습니다. 마이그레이션 045를 적용해주세요.', code: 'MIGRATION_NOT_APPLIED' },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: '의뢰 접수에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/agency-requests] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '의뢰 접수 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
