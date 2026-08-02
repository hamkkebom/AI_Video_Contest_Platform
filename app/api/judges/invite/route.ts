import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import { SITE_URL } from '@/lib/seo';

/**
 * 심사위원 초대 (POST /api/judges/invite)
 *
 * 가입한 회원은 `/api/judges` 로 **바로 배정**한다(D-018). 이 경로는 아직 계정이 없는
 * 외부 인사 전용이다 — 메일 발송이 실제로 되기 전까지 열 수 없었던 흐름이다(로드맵 2-1).
 *
 * 메일이 안 나가면 초대를 만들지 않는다. 링크를 전달할 방법이 없는 초대는
 * 주최자에게 "보냈다"는 착각만 남기기 때문이다.
 */

function rpcStatus(code?: string): number {
  if (code === '42501') return 403;
  if (code === 'P0002') return 404;
  if (code === '23505') return 409;
  if (code === '22023') return 400;
  return 500;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const contestId = Number(body.contestId);
  if (!email || !Number.isFinite(contestId)) {
    return NextResponse.json({ error: '이메일과 공모전을 지정해주세요.' }, { status: 400 });
  }

  /* 메일을 못 보내는 상태면 초대 자체를 만들지 않는다 */
  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: '메일 발송이 설정되지 않아 초대를 보낼 수 없습니다. 관리자에게 문의하세요.', code: 'EMAIL_NOT_CONFIGURED' },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc('create_judge_invite', {
    p_contest_id: contestId,
    p_email: email,
    p_is_external: Boolean(body.isExternal ?? true),
  });

  if (error) {
    console.error('[POST /api/judges/invite] 초대 생성 실패:', error.code, error.message);
    if (error.code === 'PGRST202' || error.code === '42883') {
      return NextResponse.json(
        { error: '심사위원 초대 설정이 완료되지 않았습니다. 마이그레이션 055를 적용해주세요.', code: 'MIGRATION_NOT_APPLIED' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: error.message || '초대 생성에 실패했습니다.' },
      { status: rpcStatus(error.code) },
    );
  }

  const invite = Array.isArray(data) ? data[0] : data;
  if (!invite?.token) {
    return NextResponse.json({ error: '초대 생성에 실패했습니다.' }, { status: 500 });
  }

  /* 공모전 제목은 메일 본문에 필요하다 — 초대받는 사람은 무엇에 대한 초대인지 알아야 한다 */
  const { data: contest } = await supabase
    .from('contests')
    .select('title')
    .eq('id', contestId)
    .maybeSingle();
  const contestTitle = (contest?.title as string | undefined) ?? '공모전';

  const link = `${SITE_URL}/judge-invite/${invite.token}`;
  const result = await sendEmail({
    to: email,
    subject: `[AI꿈] "${contestTitle}" 심사위원으로 초대합니다`,
    text: `안녕하세요.\n\n"${contestTitle}" 의 심사위원으로 초대드립니다.\n\n아래 링크에서 초대를 수락해 주세요. 계정이 없으시면 회원가입 후 자동으로 수락 화면으로 돌아옵니다.\n\n${link}\n\n※ 이 링크는 14일 후 만료되며, 초대받으신 이메일(${email})로 가입·로그인해야 수락할 수 있습니다.\n\n감사합니다.\nAI꿈 운영팀\n${SITE_URL}`,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
  });

  if (!result.ok) {
    /* 초대는 DB 에 남지만 메일이 안 갔다는 사실을 숨기지 않는다 */
    return NextResponse.json(
      { error: `초대는 등록됐지만 메일 발송에 실패했습니다. (${result.message})`, code: 'EMAIL_FAILED' },
      { status: 502 },
    );
  }

  revalidateTag('judges');
  return NextResponse.json({ ok: true, expiresAt: invite.expires_at }, { status: 201 });
}
