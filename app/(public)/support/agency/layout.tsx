import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * 영상 제작 의뢰 페이지 레이아웃
 * 'use client' 페이지의 메타데이터를 위한 서버 컴포넌트 래퍼
 */

export const metadata: Metadata = {
  title: '영상 제작 의뢰 — AI꿈',
  description: 'AI 영상 제작 대행 서비스를 의뢰하세요. AI꿈의 전문 크리에이터가 고품질 AI 영상을 제작해 드립니다.',
  keywords: ['AI 영상 제작 의뢰', '영상 대행', 'AI 영상 제작'],
  alternates: { canonical: '/support/agency' },
  openGraph: {
    title: '영상 제작 의뢰 — AI꿈',
    description: 'AI 영상 제작 대행 서비스를 의뢰하세요. AI꿈의 전문 크리에이터가 고품질 AI 영상을 제작해 드립니다.',
    url: '/support/agency',
    type: 'website',
  },
};

export default function AgencyLayout({ children }: { children: ReactNode }) {
  return children;
}
