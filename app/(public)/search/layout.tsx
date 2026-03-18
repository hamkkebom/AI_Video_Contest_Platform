import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * 검색 페이지 레이아웃
 * 'use client' 페이지의 메타데이터를 위한 서버 컴포넌트 래퍼
 */

export const metadata: Metadata = {
  title: '검색 — AI꿈',
  description: 'AI꿈에서 공모전, 영상 작품, 크리에이터를 검색하세요.',
  keywords: ['AI꿈 검색', '공모전 검색', '영상 검색'],
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
  openGraph: {
    title: '검색 — AI꿈',
    description: 'AI꿈에서 공모전, 영상 작품, 크리에이터를 검색하세요.',
    url: '/search',
    type: 'website',
  },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
