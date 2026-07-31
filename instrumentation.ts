/**
 * Next.js Instrumentation — 서버 시작 시 한 번 실행
 * 1) Sentry 초기화 (DSN이 없으면 조용히 건너뜀)
 * 2) 필수 환경변수가 누락되면 즉시 에러를 던져 빠른 실패를 보장한다.
 *
 * Sentry를 환경변수 검증보다 먼저 초기화해야 fail-fast 에러 자체도 리포팅된다.
 */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  // 서버(Node.js) 런타임
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');

    const { getSupabaseEnv } = await import('@/lib/env');
    getSupabaseEnv();
  }

  // Edge 런타임 (middleware 등) — 환경변수 검증은 Node 런타임에서만 수행
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * 서버 컴포넌트·미들웨어에서 발생한 에러를 Sentry로 전달한다.
 * Sentry가 초기화되지 않았으면 내부적으로 아무 일도 하지 않는다.
 */
export const onRequestError = Sentry.captureRequestError;
