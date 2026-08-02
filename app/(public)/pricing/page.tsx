import type { Metadata } from 'next';
import { PricingContent } from './pricing-content';
import { getPricingPlans } from '@/lib/data';

export const metadata: Metadata = {
  title: '요금제 — AI꿈 서비스 요금 안내',
  description: 'AI꿈의 참가자, 주최자 요금제를 확인하세요. 공모전 참가부터 개최까지 다양한 플랜을 제공합니다.',
  keywords: ['AI꿈 요금제', '공모전 플랫폼 요금', '영상 공모전 요금'],
  alternates: { canonical: '/pricing' },
  /* 수익화 동결(D-005) — sitemap 제외와 함께 색인도 차단 (docs/IA.md §5) */
  robots: { index: false, follow: false },
  openGraph: {
    title: '요금제 — AI꿈 서비스 요금 안내',
    description: 'AI꿈의 참가자, 주최자 요금제를 확인하세요. 공모전 참가부터 개최까지 다양한 플랜을 제공합니다.',
    url: '/pricing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '요금제 — AI꿈 서비스 요금 안내',
    description: 'AI꿈의 참가자, 주최자 요금제를 확인하세요. 공모전 참가부터 개최까지 다양한 플랜을 제공합니다.',
  },
};

/**
 * 서버 컴포넌트: DB에서 요금제 데이터 조회
 */
/**
 * 요금제 페이지.
 *
 * 예전에는 DB 가 비면 9,900원·29,900원 같은 **지어낸 가격**을 폴백으로 렌더했다.
 * 수익화는 동결 상태이고(D-005) 파는 상품이 없는데 가격이 떠 있으면 그건 거짓말이다.
 * 이제 플랜이 없으면 없다고 말한다 — 화면은 PricingContent 가 처리한다.
 */
export default async function PricingPage() {
  const plans = await getPricingPlans();
  return <PricingContent plans={plans ?? []} />;
}
