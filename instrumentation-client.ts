/**
 * Sentry 클라이언트 초기화 (브라우저 런타임)
 *
 * Next.js 15 App Router 규약: 프로젝트 루트의 `instrumentation-client.ts`가
 * 클라이언트 번들 진입 시점에 실행된다. (구 `sentry.client.config.ts` 대체)
 *
 * DSN이 없으면 `Sentry.init()`을 호출하지 않아 완전한 no-op가 된다.
 */
import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN, sharedSentryOptions } from '@/lib/sentry';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    ...sharedSentryOptions,
  });
}

/**
 * App Router 라우터 전환 계측.
 * Sentry가 초기화되지 않은 경우 내부적으로 아무 일도 하지 않는다.
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
