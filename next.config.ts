import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * CSP — 우선 Report-Only 로 운영한다.
 *
 * 이 사이트는 출품작 제목·설명 등 사용자 입력을 그대로 렌더링하므로 XSS 방어가 필요하지만,
 * CSP 를 처음부터 강제하면 누락된 출처 하나 때문에 영상 재생이나 결제 위젯이 조용히 깨진다.
 * Report-Only 는 브라우저가 위반을 /api/csp-report 로 보고만 하고 차단하지는 않는다.
 * 실제 위반 로그를 며칠 모아 정책을 확정한 뒤 Content-Security-Policy 로 승격할 것.
 *
 * 허용 출처 근거:
 *  - videodelivery.net / cloudflarestream.com : Cloudflare Stream 영상 재생 iframe·SDK
 *  - *.supabase.co : DB·인증 API 와 Storage 이미지
 *  - googletagmanager.com / google-analytics.com : GTM·GA
 *  - connect.facebook.net / facebook.com : 페이스북 픽셀
 *  - lh3.googleusercontent.com : 구글 로그인 사용자 아바타
 *  - *.ingest.sentry.io : Sentry 에러 전송 (DSN 설정 시)
 *  - 'unsafe-inline' : Next.js 가 하이드레이션용 인라인 스크립트를 넣기 때문에 현 단계에서는 불가피하다.
 *                      승격 시 nonce 방식으로 바꿔 제거하는 것이 목표다.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://embed.videodelivery.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://*.cloudflarestream.com https://videodelivery.net https://lh3.googleusercontent.com https://www.google-analytics.com https://www.facebook.com",
  "media-src 'self' blob: https://*.cloudflarestream.com https://videodelivery.net",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.cloudflarestream.com https://videodelivery.net https://www.google-analytics.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  "frame-src 'self' https://iframe.videodelivery.net https://*.cloudflarestream.com https://www.facebook.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "report-uri /api/csp-report",
].join('; ');

const nextConfig: NextConfig = {
  typedRoutes: true,
  // recharts, lucide-react는 Next.js 15 기본 최적화 대상 — 중복 등록 시 dev HMR chunk 충돌 발생

  /** 외부 이미지 최적화 — next/image에서 사용할 도메인 */
  images: {
    remotePatterns: [
      // 로컬 개발용 Supabase (supabase start)
      { protocol: 'http', hostname: '127.0.0.1', port: '54321', pathname: '/storage/**' },
      { protocol: 'http', hostname: 'localhost', port: '54321', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'ulnrfzlpfffapkvpkegv.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'ulnrfzlpfffapkvpkegv.storage.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'kanganxnalihuejfvbaq.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'kanganxnalihuejfvbaq.storage.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: '*.cloudflarestream.com', pathname: '/**' },
      { protocol: 'https', hostname: 'customer-*.cloudflarestream.com', pathname: '/**' },
      { protocol: 'https', hostname: 'videodelivery.net', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일 캐시
  },

  /** SEO 보안 헤더 */
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
      ],
    },
  ],
};

/**
 * 소스맵 업로드는 SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT가 모두 있을 때만 활성화한다.
 * 셋 중 하나라도 없으면 업로드 단계를 통째로 비활성화하므로 빌드가 실패하지 않는다.
 * (토큰만 있고 org/project가 없으면 업로드 대상이 없어 플러그인이 실패하므로 세 값을 함께 요구한다)
 */
const canUploadSourcemaps = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

export default withSentryConfig(nextConfig, {
  // org/project/authToken은 Vercel 환경변수로 주입 — 없으면 소스맵 업로드만 생략된다
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // 업로드 조건을 만족하지 못하면 소스맵 관련 기능 전체를 비활성화
  sourcemaps: { disable: !canUploadSourcemaps },
  widenClientFileUpload: canUploadSourcemaps,

  // 빌드 로그는 CI에서만 출력, Sentry 자체 텔레메트리는 비활성화
  silent: !process.env.CI,
  telemetry: false,

  webpack: {
    // 번들 크기 절감 — Sentry SDK 디버그 로깅 제거
    treeshake: { removeDebugLogging: true },
  },
});
