import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 심사위원으로 배정할 회원 찾기 (POST /api/judges/lookup)
 *
 * 이메일 **정확 일치**만 통과시킨다. 주최자에게 회원 명부를 열어 주면 안 되므로
 * 부분 검색이나 목록 조회는 제공하지 않는다 (D-014 의 PII 원칙).
 * 실제 조회는 마이그레이션 054 의 find_member_for_judge RPC 가 수행한다.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email) {
    return NextResponse.json({ error: '이메일을 입력하세요.' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('find_member_for_judge', { p_email: email });

  if (error) {
    console.error('[POST /api/judges/lookup] 조회 실패:', error.code, error.message);
    if (error.code === 'PGRST202' || error.code === '42883') {
      return NextResponse.json(
        { error: '심사위원 배정 설정이 완료되지 않았습니다. 마이그레이션 054를 적용해주세요.', code: 'MIGRATION_NOT_APPLIED' },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: '회원 조회에 실패했습니다.' }, { status: 500 });
  }

  const member = Array.isArray(data) ? data[0] : data;
  if (!member) {
    /* 가입하지 않은 사람은 배정할 수 없다 — 이메일 발송이 없는 설계의 실제 한계다 */
    return NextResponse.json(
      { error: '해당 이메일로 가입한 회원이 없습니다. 먼저 회원가입을 안내해주세요.', code: 'NOT_A_MEMBER' },
      { status: 404 },
    );
  }

  return NextResponse.json({ member: { id: member.id, name: member.name } });
}
