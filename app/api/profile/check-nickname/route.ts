import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** 닉네임 중복 확인 API (GET) */
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname')?.trim();

  if (!nickname) {
    return NextResponse.json({ error: '닉네임을 입력해주세요.' }, { status: 400 });
  }

  if (nickname.length < 2 || nickname.length > 20) {
    return NextResponse.json({ error: '닉네임은 2~20자여야 합니다.' }, { status: 400 });
  }

  // 본인 제외하고 동일 닉네임 존재 여부 확인
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('nickname', nickname)
    .neq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('닉네임 확인 실패:', error);
    return NextResponse.json({ error: '확인 중 오류가 발생했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ available: !data });
}
