import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createActivityLog, deletePopup, getPopupById, updatePopup } from '@/lib/data';
import type { PopupMutationInput } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

async function getAuthUser() {
  const supabase = await createClient();
  if (!supabase) {
    return { user: null, error: NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 }) };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, error: NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 }) };
  }

  return { user, error: null };
}

/** 관리자 팝업 상세 조회 API */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    const { id } = await params;
    const popup = await getPopupById(id);

    if (!popup) {
      return NextResponse.json({ error: '팝업을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ popup });
  } catch (err) {
    console.error('Failed to load popup detail:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자 팝업 수정 API */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as PopupMutationInput;
    const popup = await updatePopup(id, body);

    if (!popup) {
      return NextResponse.json({ error: '팝업 수정에 실패했습니다.' }, { status: 500 });
    }

    await createActivityLog({
      userId: user.id,
      action: 'update_popup',
      targetType: 'popup',
      targetId: id,
      metadata: { title: popup.title, role: 'admin' },
    });

    revalidateTag('popups');
    return NextResponse.json({ popup });
  } catch (err) {
    console.error('Failed to update popup:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자 팝업 삭제 API */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const { id } = await params;
    const deleted = await deletePopup(id);

    if (!deleted) {
      return NextResponse.json({ error: '팝업 삭제에 실패했습니다.' }, { status: 500 });
    }

    await createActivityLog({
      userId: user.id,
      action: 'delete_popup',
      targetType: 'popup',
      targetId: id,
      metadata: { role: 'admin' },
    });

    revalidateTag('popups');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete popup:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
