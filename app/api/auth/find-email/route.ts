import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 이메일 찾기 API (POST)
 * 이름 + 전화번호로 프로필 조회 → 마스킹된 이메일 반환
 * 인증 불필요 (비로그인 상태에서 호출)
 *
 * 보안: 이메일 일부만 노출 (예: k***@gmail.com)
 */

/** 이메일 마스킹: 앞 1~2자만 보여주고 나머지 * 처리 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';

  let maskedLocal: string;
  if (local.length <= 2) {
    maskedLocal = local[0] + '*'.repeat(local.length - 1);
  } else if (local.length <= 5) {
    maskedLocal = local.slice(0, 2) + '*'.repeat(local.length - 2);
  } else {
    maskedLocal = local.slice(0, 2) + '*'.repeat(local.length - 2);
  }

  return `${maskedLocal}@${domain}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: '이름과 전화번호를 입력해주세요.' }, { status: 400 });
    }

    /* 전화번호 정규화: 숫자만 추출 */
    const normalizedPhone = phone.replace(/[^0-9]/g, '');
    if (normalizedPhone.length < 10) {
      return NextResponse.json({ error: '올바른 전화번호를 입력해주세요.' }, { status: 400 });
    }

    /* 이름 + 전화번호로 프로필 조회 */
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('name', name.trim())
      .eq('phone', normalizedPhone)
      .limit(5);

    if (error) {
      console.error('이메일 찾기 조회 실패:', error);
      return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        error: '일치하는 계정을 찾을 수 없습니다. 이름과 전화번호를 확인해주세요.',
      }, { status: 404 });
    }

    /* 마스킹된 이메일 목록 반환 */
    const maskedEmails = profiles.map((p) => maskEmail(p.email));

    return NextResponse.json({ emails: maskedEmails });
  } catch (error) {
    console.error('이메일 찾기 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
