import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

/**
 * robots.txt 동적 생성
 * 관리자/호스트/인증/심사 경로는 크롤링 차단
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/host/',
          '/my/',
          '/judging/',
          '/api/',
          '/auth/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/find-email',
          '/invite/',
          '/search',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
