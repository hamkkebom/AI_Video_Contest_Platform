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

  /* 답변 등록·수정 — 답변이 오면 상태도 처리중으로 올린다 (마이그레이션 053) */
  if (typeof body.answer === 'string') {
    const answer = body.answer.trim();
    if (!answer) {
      return NextResponse.json({ error: '답변 내용을 입력하세요.' }, { status: 400 });
    }

    /* answered_at 은 처음 답변할 때만 찍는다 — 수정할 때마다 바뀌면 안 된다 */
    const { data: existing } = await supabase
      .from('inquiries')
      .select('answered_at')
      .eq('id', Number(id))
      .maybeSingle();

    const patch: Record<string, unknown> = {
      answer,
      answered_by: user.id,
      status: 'in_progress',
    };
    if (!existing?.answered_at) patch.answered_at = new Date().toISOString();

    const { data, error: answerError } = await supabase
      .from('inquiries')
      .update(patch)
      .eq('id', Number(id))
      .select('id');

    if (answerError) {
      console.error('[admin/inquiries] 답변 등록 실패:', answerError);
      return NextResponse.json({ error: '답변 등록에 실패했습니다.' }, { status: 500 });
    }
    /* RLS 거부는 에러 없이 0행으로 온다 — 성공으로 오인하지 않는다 */
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '답변 권한이 없거나 문의를 찾을 수 없습니다. (마이그레이션 053 적용 여부 확인)' },
        { status: 403 },
      );
    }

    revalidateTag('inquiries');
    return NextResponse.json({ ok: true });
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
