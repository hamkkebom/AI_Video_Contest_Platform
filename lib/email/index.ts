/**
 * 이메일 발송 (Resend).
 *
 * 서버 전용이다 — RESEND_API_KEY 는 NEXT_PUBLIC_ 접두사가 없어 클라이언트 번들에
 * 들어가지 않는다. (server-only 패키지는 이 저장소에 없어 도입하지 않았다)
 *
 * 왜 이제야 붙이나: 회원에게 가는 통지는 내부 문의함으로 닫았지만(D-017), **계정이 없는
 * 상대**에게는 여전히 보낼 길이 없었다. 비회원 문의 답변이 그 구멍이고, 로드맵 1-1이다.
 *
 * 왜 SDK 를 안 쓰나: Resend 는 단순 REST 라 fetch 한 번이면 된다. 의존성을 늘리지 않는다.
 *
 * **키가 없으면 조용히 건너뛴다.** 던지지 않는다 — 메일 실패가 문의 답변 저장을 되돌리면
 * 관리자는 답변을 잃는다. 호출부가 결과를 보고 사용자에게 알리도록 { ok, reason } 을 준다.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/** 보내는 사람 — DNS(DKIM/SPF)가 aikkumhub.com 에 붙어 있으므로 이 도메인만 쓸 수 있다 */
const DEFAULT_FROM = 'AI꿈 <noreply@aikkumhub.com>';

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: 'not_configured' | 'rejected' | 'network'; message: string };

/** 발송 설정이 끝났는지 — 화면에서 "메일이 나갔는지"를 정직하게 말하기 위해 필요하다 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

interface SendEmailParams {
  to: string;
  subject: string;
  /** 본문(평문). HTML 은 이 값으로부터 만든다 — 관리자가 쓴 글을 그대로 보낸다 */
  text: string;
  /** 회신 주소 — 문의 답변은 운영 담당자가 받아야 한다 */
  replyTo?: string;
}

/**
 * 메일 한 통 발송. 예외를 던지지 않는다.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: 'not_configured', message: 'RESEND_API_KEY 가 설정되지 않았습니다.' };
  }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        html: toHtml(params.text),
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
      /* 메일 발송이 느리다고 API 응답을 붙잡아 두지 않는다 */
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[email] 발송 거부:', res.status, body.slice(0, 300));
      return { ok: false, reason: 'rejected', message: `발송이 거부되었습니다. (${res.status})` };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id ?? null };
  } catch (error) {
    console.error('[email] 발송 실패:', error);
    return { ok: false, reason: 'network', message: '메일 서버에 연결하지 못했습니다.' };
  }
}

/** HTML 특수문자 이스케이프 — 관리자가 쓴 글이 태그로 해석되면 안 된다 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 평문을 최소한의 HTML 로 — 줄바꿈만 살린다. 템플릿을 늘리지 않는다 */
function toHtml(text: string): string {
  const body = escapeHtml(text).replace(/\n/g, '<br />');
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.7;color:#1a1a1a">${body}</div>`;
}
