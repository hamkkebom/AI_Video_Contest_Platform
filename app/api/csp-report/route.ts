import { NextResponse } from 'next/server';

/**
 * CSP 위반 리포트 수집 API
 * POST /api/csp-report
 *
 * next.config.ts 의 Content-Security-Policy-Report-Only 가 이 경로로 위반을 보고한다.
 * 지금은 Report-Only 라 실제 차단은 없고, 여기 쌓인 로그로 허용 출처를 확정한 뒤
 * 정책을 Content-Security-Policy 로 승격하는 것이 목표다.
 *
 * 로그는 Vercel 런타임 로그에 남고, Sentry DSN 이 설정돼 있으면 Sentry 에도 잡힌다.
 * 브라우저가 보내는 요청이므로 인증을 요구하지 않는다 — 대신 아래를 지킨다.
 *  - 저장하지 않는다 (DB 를 오염시키지 않음)
 *  - 로그에 남기는 필드를 화이트리스트로 제한해 URL 쿼리스트링 등 개인정보 유입을 막는다
 *  - 항상 204 를 반환해 브라우저가 재시도하지 않게 한다
 */
export const dynamic = 'force-dynamic';

/** 리포트 본문에서 로그로 남길 필드만 추린다 */
type CspReportBody = {
  'csp-report'?: Record<string, unknown>;
  /** Reporting API(신규 형식)로 오는 경우 */
  body?: Record<string, unknown>;
};

/** URL 에서 쿼리스트링·해시를 떼어 개인정보가 로그로 새지 않게 한다 */
function stripQuery(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  return value.split(/[?#]/)[0].slice(0, 300);
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as CspReportBody | CspReportBody[];
    const reports = Array.isArray(raw) ? raw : [raw];

    for (const entry of reports) {
      /* 브라우저마다 본문 형식이 달라 세 가지를 모두 받아낸다 */
      const report: Record<string, unknown> =
        entry['csp-report'] ?? entry.body ?? (entry as Record<string, unknown>);
      const summary = {
        directive: report['effective-directive'] ?? report['effectiveDirective'] ?? report['violated-directive'],
        blocked: stripQuery(report['blocked-uri'] ?? report['blockedURL']),
        document: stripQuery(report['document-uri'] ?? report['documentURL']),
        disposition: report.disposition,
      };
      /* 차단이 아니라 관찰 단계이므로 warn 수준으로 남긴다 */
      console.warn('[csp-report]', JSON.stringify(summary));
    }
  } catch {
    /* 형식이 어긋난 리포트는 조용히 버린다 — 브라우저마다 본문 형식이 조금씩 다르다 */
  }

  return new NextResponse(null, { status: 204 });
}
