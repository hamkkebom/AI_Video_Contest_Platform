/**
 * Sentry 서버(Node.js 런타임) 초기화
 * `instrumentation.ts`의 register()에서 동적 import 된다.
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
