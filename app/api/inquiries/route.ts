import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { extractClientIp, hashForAntiAbuse } from '@/lib/utils';

/**
 * 1:1 문의 접수 API
 * POST /api/inquiries
 *
 * 비회원 접수 허용 — 로그인 상태면 user_id로, 비로그인이면 guest_* 컬럼으로 저장한다.
 * 045 마이그레이션의 RLS 정책이 anon INSERT를 허용하므로 service_role 키가 필요 없다.
 * 스팸 방지를 위해 IP 해시 기준 시간당 5회로 제한한다.
 */

/** inquiries.type CHECK 제약과 동일한 허용값 */
const ALLOWED_TYPES: readonly string[] = ['general', 'support', 'agency'];

const TITLE_MAX = 200;
const CONTENT_MAX = 5000;
const NAME_MAX = 100;
const EMAIL_MAX = 254;
const PHONE_MAX = 30;

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
    const type = toTrimmedString(body.type);
    const title = toTrimmedString(body.title);
    const content = toTrimmedString(body.content);
    const name = toTrimmedString(body.name);
    const email = toTrimmedString(body.email);
    const phone = toTrimmedString(body.phone);

    /* 2) 로그인 여부 확인 — 회원이면 세션의 user_id로 저장한다 */
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    /* 3) 검증 */
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: '문의 유형을 선택해주세요.' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
    }
    if (title.length > TITLE_MAX) {
      return NextResponse.json({ error: `제목은 ${TITLE_MAX}자 이내로 입력해주세요.` }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: '문의 내용을 입력해주세요.' }, { status: 400 });
    }
    if (content.length > CONTENT_MAX) {
      return NextResponse.json({ error: `내용은 ${CONTENT_MAX}자 이내로 입력해주세요.` }, { status: 400 });
    }

    /* 비회원은 답변을 보낼 이메일이 반드시 필요하다 (DB inquiries_contact_required 제약과 동일) */
    if (!user) {
      if (!email) {
        return NextResponse.json({ error: '답변받을 이메일을 입력해주세요.' }, { status: 400 });
      }
      if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
        return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
      }
      if (name.length > NAME_MAX) {
        return NextResponse.json({ error: `이름은 ${NAME_MAX}자 이내로 입력해주세요.` }, { status: 400 });
      }
      if (phone.length > PHONE_MAX) {
        return NextResponse.json({ error: `연락처는 ${PHONE_MAX}자 이내로 입력해주세요.` }, { status: 400 });
      }
    }

    /* 4) 레이트리밋 — IP 해시 기준 시간당 5회 */
    const clientIp = extractClientIp(request.headers) ?? 'unknown';
    const ipHash = await hashForAntiAbuse(clientIp);

    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_intake_rate_limit', {
      p_key: ipHash,
      p_action: 'inquiry',
      p_limit: 5,
      p_window_minutes: 60,
    });

    if (rateLimitError) {
      console.error('[POST /api/inquiries] 레이트리밋 확인 실패:', rateLimitError.code, rateLimitError.message);
      return NextResponse.json({ error: '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
    if (allowed === false) {
      return NextResponse.json(
        { error: '문의 접수 한도를 초과했습니다. 1시간 후 다시 시도해주세요.', code: 'RATE_LIMITED' },
        { status: 429 },
      );
    }

    /* 5) 저장 — 회원 문의는 guest_* 를 비우고, 비회원 문의는 user_id 를 비운다 */
    const { error: insertError } = await supabase.from('inquiries').insert({
      user_id: user?.id ?? null,
      type,
      title,
      content,
      guest_name: user ? null : (name || null),
      guest_email: user ? null : email,
      guest_phone: user ? null : (phone || null),
    });

    if (insertError) {
      console.error('[POST /api/inquiries] 저장 실패:', insertError.code, insertError.message, insertError.details);
      /* PostgREST 42703 = undefined column, 42501 = RLS 차단 → 045 미적용 가능성 */
      if (insertError.code === '42703' || insertError.code === '42501') {
        return NextResponse.json(
          { error: '문의 접수 설정이 완료되지 않았습니다. 마이그레이션 045를 적용해주세요.', code: 'MIGRATION_NOT_APPLIED' },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }

    /* 6) 관리자 대시보드의 문의 건수 캐시 무효화 */
    revalidateTag('inquiries');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/inquiries] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '문의 접수 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
