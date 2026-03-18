import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // recharts, lucide-react는 Next.js 15 기본 최적화 대상 — 중복 등록 시 dev HMR chunk 충돌 발생

  /** /favicon.ico → /icon 리다이렉트 (icon.tsx가 동적 생성) */
  redirects: async () => [
    {
      source: '/favicon.ico',
      destination: '/icon',
      permanent: true,
    },
  ],

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

export default nextConfig;
