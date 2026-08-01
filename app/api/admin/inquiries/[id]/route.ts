import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/** inquiries.status CHECK 제약과 같은 값 (마이그레이션 000) */
const ALLOWED_STATUS = ['pending', 'in_progress', 'resolved'] as const;

/**
 * 문의 상태 변경 (PATCH /api/admin/inquiries/[id])
 * 대행 의뢰와 같은 이유 — 접수는 되는데 처리할 경로가 없었다. (D-011)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.roles?.includes('admin')) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status : '';
  if (!ALLOWED_STATUS.includes(status as (typeof ALLOWED_STATUS)[number])) {
    return NextResponse.json({ error: '허용되지 않는 상태입니다.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', Number(id));

  if (error) {
    console.error('[admin/inquiries] 상태 변경 실패:', error);
    return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
  }

  revalidateTag('inquiries');
  return NextResponse.json({ ok: true });
}
