import type { Metadata } from 'next';
import { getFaqs } from '@/lib/data';
import { FaqContent } from './faq-content';

/**
 * FAQ 페이지 — 서버 컴포넌트
 * getFaqs()로 서버에서 데이터를 가져와 클라이언트 컴포넌트에 전달
 */

export const metadata: Metadata = {
  title: '자주 묻는 질문(FAQ) — AI꿈 고객센터',
  description: 'AI꿈 이용 중 궁금한 점을 확인하세요. 공모전 참가, 영상 제출, 심사, 수상 등 자주 묻는 질문과 답변을 모았습니다.',
  keywords: ['FAQ', '자주 묻는 질문', 'AI꿈 고객센터', '공모전 FAQ'],
  alternates: { canonical: '/support/faq' },
  openGraph: {
    title: '자주 묻는 질문(FAQ) — AI꿈 고객센터',
    description: 'AI꿈 이용 중 궁금한 점을 확인하세요. 공모전 참가, 영상 제출, 심사, 수상 등 자주 묻는 질문과 답변을 모았습니다.',
    url: '/support/faq',
    type: 'website',
  },
};
export default async function FaqPage() {
  const faqs = await getFaqs();

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqContent faqs={faqs} />
    </>
  );
}
