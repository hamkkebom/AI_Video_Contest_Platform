import { PricingContent } from './pricing-content';
import { getPricingPlans } from '@/lib/data';

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
