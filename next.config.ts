import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
