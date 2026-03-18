import type { Metadata } from 'next';
import { PricingContent } from './pricing-content';
import { getPricingPlans } from '@/lib/data';

export const metadata: Metadata = {
  title: '요금제 — AI꿈 서비스 요금 안내',
  description: 'AI꿈의 참가자, 주최자 요금제를 확인하세요. 공모전 참가부터 개최까지 다양한 플랜을 제공합니다.',
  keywords: ['AI꿈 요금제', '공모전 플랫폼 요금', '영상 공모전 요금'],
  alternates: { canonical: '/pricing' },
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
export default async function PricingPage() {
  // DB에서 요금제 조회
  let plans = await getPricingPlans();

  // Fallback: DB 조회 실패 시 기본 데이터 사용
  if (!plans || plans.length === 0) {
    plans = [
      {
        id: 'participant-free',
        role: 'participant',
        name: '참가자 플랜',
        monthlyPrice: 9900,
        yearlyPrice: 118800,
        active: true,
        featureKeys: [],
      },
      {
        id: 'host-free',
        role: 'host',
        name: '주최자 플랜',
        monthlyPrice: 29900,
        yearlyPrice: 358800,
        active: true,
        featureKeys: [],
      },
      {
        id: 'judge-free',
        role: 'judge',
        name: '심사위원 플랜',
        monthlyPrice: 0,
        yearlyPrice: 0,
        active: true,
        featureKeys: [],
      },
    ];
  }

  return <PricingContent plans={plans} />;
}
