import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/** 회원 탈퇴 API (POST) */
export async function POST(request: Request) {
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

  try {
    const body = await request.json();
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    if (!reason) {
      return NextResponse.json({ error: '탈퇴 사유를 입력해주세요.' }, { status: 400 });
    }

    // 탈퇴 사유 기록
    const { error: insertError } = await supabase
      .from('account_withdrawals')
      .insert({ user_id: user.id, reason });

    if (insertError) {
      console.error('탈퇴 사유 기록 실패:', insertError);
      return NextResponse.json({ error: '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // profiles 상태를 suspended로 변경
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('프로필 상태 변경 실패:', updateError);
      return NextResponse.json({ error: '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // 활동 로그 기록 (로그아웃 전에 기록)
    await createActivityLog({
      userId: user.id,
      action: 'withdraw_account',
      targetType: 'profile',
      targetId: user.id,
      metadata: { reason },
    });

    // 로그아웃 처리
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('회원탈퇴 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
