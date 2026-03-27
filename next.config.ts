import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // recharts, lucide-react는 Next.js 15 기본 최적화 대상 — 중복 등록 시 dev HMR chunk 충돌 발생

  /** 외부 이미지 최적화 — next/image에서 사용할 도메인 */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ulnrfzlpfffapkvpkegv.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'ulnrfzlpfffapkvpkegv.storage.supabase.co', pathname: '/storage/**' },
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

export default nextConfig;
