import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * 심사위원 초대 수락 (POST /api/judges/invite/accept)
 *
 * 권한은 주최자가 아니라 **토큰 + 계정 이메일 일치**가 대신한다(마이그레이션 055).
 * 링크가 전달돼도 초대받은 주소로 로그인한 사람만 수락할 수 있다.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token) {
    return NextResponse.json({ error: '초대 토큰이 없습니다.' }, { status: 400 });
  }

  const { error } = await supabase.rpc('accept_judge_invite', { p_token: token });

  if (error) {
    console.error('[POST /api/judges/invite/accept] 수락 실패:', error.code, error.message);
    if (error.code === 'PGRST202' || error.code === '42883') {
      return NextResponse.json(
        { error: '심사위원 초대 설정이 완료되지 않았습니다. 마이그레이션 055를 적용해주세요.', code: 'MIGRATION_NOT_APPLIED' },
        { status: 503 },
      );
    }
    const status =
      error.code === '42501' ? 403 :
      error.code === 'P0002' ? 404 :
      error.code === '23505' ? 409 :
      error.code === '22023' ? 410 : 500;
    return NextResponse.json({ error: error.message || '수락에 실패했습니다.' }, { status });
  }

  revalidateTag('judges');
  revalidateTag('users');
  return NextResponse.json({ ok: true });
}
