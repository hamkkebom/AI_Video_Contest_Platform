import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/** 관리자 확인 — 통과 시 null, 실패 시 에러 응답 */
async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.roles?.includes('admin')) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }
  return null;
}

/**
 * 아티클 발행 상태 변경 (PATCH /api/admin/articles/[id])
 * 목록의 발행/비공개 토글이 여기로 온다. 쓰기 허용은 마이그레이션 050 이 연다.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const denied = await requireAdmin(supabase);
  if (denied) return denied;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  if (typeof body.isPublished !== 'boolean') {
    return NextResponse.json({ error: 'isPublished 는 boolean 이어야 합니다.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('articles')
    .update({ is_published: body.isPublished })
    .eq('id', Number(id))
    .select('id');

  if (error) {
    console.error('[admin/articles] 발행 상태 변경 실패:', error);
    return NextResponse.json({ error: '변경에 실패했습니다.' }, { status: 500 });
  }
  /* RLS 가 막으면 에러 없이 0행이 돌아온다 — 조용한 실패를 그대로 통과시키지 않는다 */
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: '변경 권한이 없거나 아티클을 찾을 수 없습니다. (마이그레이션 050 적용 여부 확인)' },
      { status: 403 },
    );
  }

  revalidateTag('articles');
  return NextResponse.json({ ok: true });
}

/** 아티클 삭제 (DELETE /api/admin/articles/[id]) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const denied = await requireAdmin(supabase);
  if (denied) return denied;

  const { id } = await params;
  const { data, error } = await supabase
    .from('articles')
    .delete()
    .eq('id', Number(id))
    .select('id');

  if (error) {
    console.error('[admin/articles] 삭제 실패:', error);
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: '삭제 권한이 없거나 아티클을 찾을 수 없습니다. (마이그레이션 050 적용 여부 확인)' },
      { status: 403 },
    );
  }

  revalidateTag('articles');
  return NextResponse.json({ ok: true });
}
