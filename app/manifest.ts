import type { MetadataRoute } from 'next';

/**
 * Web App Manifest — PWA 기본 설정
 * iOS/Android 홈 화면 추가 시 앱 정보 제공
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI꿈 — AI 영상 공모전 플랫폼',
    short_name: 'AI꿈',
    description: 'AI와 함께 꿈을 설계하고 완성하다. AI 영상 공모전 전문 플랫폼.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#16a34a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
