import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { SITE_URL } from '@/lib/seo';

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

    /* answered_at 은 처음 답변할 때만 찍는다 — 수정할 때마다 바뀌면 안 된다.
       guest_email 은 비회원 여부 판정용 — 회원은 /my/inquiries 에서 읽으므로 메일이 필요 없다 */
    const { data: existing } = await supabase
      .from('inquiries')
      .select('answered_at, title, user_id, guest_email')
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

    /* 비회원에게는 보여 줄 화면이 없다 — 메일로 내보낸다 (D-017 이 남긴 구멍, 로드맵 1-1).
       발송 실패가 답변 저장을 되돌리지는 않는다. 대신 결과를 그대로 돌려주어
       관리자가 "나갔는지 아닌지"를 화면에서 알 수 있게 한다. */
    const guestEmail = existing?.user_id ? null : (existing?.guest_email as string | null);
    if (!guestEmail) {
      return NextResponse.json({ ok: true, delivery: 'in_app' });
    }

    const title = (existing?.title as string | undefined) ?? '문의';
    const result = await sendEmail({
      to: guestEmail,
      subject: `[AI꿈] 문의하신 "${title}" 에 답변드립니다`,
      text: `안녕하세요, AI꿈 운영팀입니다.\n\n남겨주신 문의에 아래와 같이 답변드립니다.\n\n──────────\n${answer}\n──────────\n\n추가로 궁금한 점이 있으시면 이 메일에 그대로 회신해 주세요.\n\n감사합니다.\nAI꿈 운영팀\n${SITE_URL}`,
      replyTo: process.env.EMAIL_REPLY_TO || undefined,
    });

    if (!result.ok) {
      return NextResponse.json({
        ok: true,
        delivery: 'failed',
        deliveryReason: result.reason,
        deliveryMessage: result.message,
      });
    }
    return NextResponse.json({ ok: true, delivery: 'email' });
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
