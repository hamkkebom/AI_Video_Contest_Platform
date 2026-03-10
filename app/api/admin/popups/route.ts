import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createActivityLog, createPopup } from '@/lib/data';
import type { PopupMutationInput } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

/** 관리자 팝업 생성 API */
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
    const body = (await request.json()) as PopupMutationInput;
    const popup = await createPopup(body);

    if (!popup) {
      return NextResponse.json({ error: '팝업 생성에 실패했습니다.' }, { status: 500 });
    }

    await createActivityLog({
      userId: user.id,
      action: 'create_popup',
      targetType: 'popup',
      targetId: popup.id,
      metadata: { title: popup.title, role: 'admin' },
    });

    revalidateTag('popups');
    return NextResponse.json({ popup }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('[POST /api/admin/popups] 실패:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
