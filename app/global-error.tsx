'use client';

/**
 * 전역 에러 바운더리 — 루트 레이아웃까지 실패한 렌더 에러를 처리한다.
 *
 * - 루트 레이아웃을 대체하므로 <html>/<body>를 직접 렌더해야 한다.
 * - 전역 CSS 적용을 보장할 수 없어 인라인 스타일을 사용한다.
 * - 에러는 Sentry로 전송하되, Sentry 미설정(DSN 없음) 시에는 no-op이다.
 */

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#f7f7f8',
          color: '#18181b',
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
        }}
      >
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }} aria-hidden="true">
            ⚠️
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px' }}>
            일시적인 오류가 발생했습니다
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#52525b', margin: '0 0 24px' }}>
            페이지를 표시하는 중 문제가 생겼습니다.
            <br />
            잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.
          </p>

          {error.digest && (
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '0 0 24px' }}>
              오류 코드: {error.digest}
            </p>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '11px 22px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#5b53e8',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
            <a
              href="/"
              style={{
                padding: '11px 22px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#18181b',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              홈으로 가기
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
