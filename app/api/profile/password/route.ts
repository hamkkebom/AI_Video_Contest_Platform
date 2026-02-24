import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/** 비밀번호 변경 검증 패턴: 8~20자, 영문+숫자+특수문자 */
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

/** 비밀번호 변경 API (PUT) */
export async function PUT(request: Request) {
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
    const { newPassword, confirmPassword } = body;

    if (!newPassword || !confirmPassword) {
      return NextResponse.json({ error: '새 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 400 });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return NextResponse.json(
        { error: '비밀번호는 8~20자, 영문·숫자·특수문자를 포함해야 합니다.' },
        { status: 400 },
      );
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('비밀번호 변경 실패:', error);
      /* Supabase는 동일 비밀번호로 변경 시 에러 반환 */
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('same') || msg.includes('different') || msg.includes('identical')) {
        return NextResponse.json(
          { error: '현재 비밀번호와 동일한 비밀번호로는 변경할 수 없습니다.' },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: '비밀번호 변경에 실패했습니다.' }, { status: 500 });
    }

    // 활동 로그 기록
    await createActivityLog({
      userId: user.id,
      action: 'change_password',
      targetType: 'profile',
      targetId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('비밀번호 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
