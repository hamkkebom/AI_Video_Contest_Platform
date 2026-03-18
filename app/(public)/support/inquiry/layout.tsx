import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * 1:1 문의 페이지 레이아웃
 * 'use client' 페이지의 메타데이터를 위한 서버 컴포넌트 래퍼
 */

export const metadata: Metadata = {
  title: '1:1 문의 — AI꿈 고객센터',
  description: 'AI꿈 서비스 이용 중 문제가 있으신가요? 1:1 문의를 통해 빠르게 답변 받으세요.',
  keywords: ['1:1 문의', 'AI꿈 문의', '고객센터'],
  alternates: { canonical: '/support/inquiry' },
  openGraph: {
    title: '1:1 문의 — AI꿈 고객센터',
    description: 'AI꿈 서비스 이용 중 문제가 있으신가요? 1:1 문의를 통해 빠르게 답변 받으세요.',
    url: '/support/inquiry',
    type: 'website',
  },
};

export default function InquiryLayout({ children }: { children: ReactNode }) {
  return children;
}
