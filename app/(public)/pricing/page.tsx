'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * 공개 요금제 페이지
 * 참가자, 주최자, 심사위원 역할별 요금제를 표시합니다
 * 관리자는 모든 탭을 볼 수 있습니다
 */
export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'participant' | 'host' | 'judge'>('participant');
  const [userRole] = useState<'participant' | 'host' | 'judge' | 'admin'>('admin');

  const pricingPlans = {
    participant: {
      name: '참가자 플랜',
      description: '공모전 출품 및 갤러리 활동',
      price: 9900,
      period: '월',
      features: [
        { name: '작품 성과 분석', included: true },
        { name: '카테고리 경쟁률', included: false },
        { name: 'AI 도구 트렌드', included: false },
        { name: '상세 분석 리포트', included: false },
        { name: '무제한 출품', included: true },
        { name: '갤러리 접근', included: true },
      ],
      icon: '🎬',
      color: 'border-[#EA580C]',
      accentBg: 'bg-[#EA580C]/5',
      buttonColor: 'bg-[#EA580C] hover:bg-[#C2540A]',
    },
    host: {
      name: '주최자 플랜',
      description: '공모전 개최 및 관리',
      price: 29900,
      period: '월',
      features: [
        { name: '접수 현황 분석', included: true },
        { name: '참가자 분포 분석', included: false },
        { name: '채널별 성과 분석', included: false },
        { name: '상세 분석 리포트', included: false },
        { name: '무제한 공모전 개최', included: true },
        { name: '심사위원 관리', included: true },
        { name: '자동 검수 설정', included: true },
      ],
      icon: '🏢',
      color: 'border-[#F59E0B]',
      accentBg: 'bg-[#F59E0B]/5',
      buttonColor: 'bg-[#F59E0B] hover:bg-[#D97706]',
    },
    judge: {
      name: '심사위원 플랜',
      description: '공모전 심사 및 채점',
      price: 0,
      period: '무료',
      features: [
        { name: '심사 진행률 확인', included: true },
        { name: '채점 분포 분석', included: false },
        { name: '심사 템플릿 관리', included: true },
        { name: '채점 기록 저장', included: true },
        { name: '심사 코멘트 작성', included: true },
      ],
      icon: '⚖️',
      color: 'border-[#8B5CF6]',
      accentBg: 'bg-[#8B5CF6]/5',
      buttonColor: 'bg-[#8B5CF6] hover:bg-[#7C4DCC]',
    },
  };

  const visibleTabs = userRole === 'admin' 
    ? (['participant', 'host', 'judge'] as const)
    : ([userRole] as const);

  const currentPlan = pricingPlans[activeTab];

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">요금제</h1>
          <p className="text-muted-foreground">
            당신의 역할에 맞는 요금제를 선택하세요
          </p>
        </div>
      </section>

      {/* 요금제 탭 */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          {/* 탭 버튼 */}
          <div className="flex gap-3 mb-8 border-b border-border pb-4">
            {visibleTabs.includes('participant') && (
              <button
                onClick={() => setActiveTab('participant')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'participant'
                    ? 'text-[#EA580C] border-b-2 border-[#EA580C]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🎬 참가자
              </button>
            )}
            {visibleTabs.includes('host') && (
              <button
                onClick={() => setActiveTab('host')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'host'
                    ? 'text-[#F59E0B] border-b-2 border-[#F59E0B]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🏢 주최자
              </button>
            )}
            {visibleTabs.includes('judge') && (
              <button
                onClick={() => setActiveTab('judge')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'judge'
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ⚖️ 심사위원
              </button>
            )}
          </div>

          {/* 요금제 카드 */}
          <Card className={`p-8 border-2 ${currentPlan.color} ${currentPlan.accentBg}`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{currentPlan.icon}</span>
                  <h2 className="text-3xl font-bold">{currentPlan.name}</h2>
                </div>
                <p className="text-muted-foreground">{currentPlan.description}</p>
              </div>
              {activeTab === 'judge' && (
                <Badge className="bg-green-100 text-green-800 border-0">무료</Badge>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">
                  {activeTab === 'judge' ? '무료' : currentPlan.price.toLocaleString()}
                </span>
                {activeTab !== 'judge' && (
                  <span className="text-muted-foreground">원 / {currentPlan.period}</span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {currentPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={feature.included ? 'text-green-600 font-bold' : 'text-gray-400'}>
                    {feature.included ? '✓' : '✗'}
                  </span>
                  <span className={feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}>
                    {feature.name}
                  </span>
                  {!feature.included && <Badge variant="outline" className="ml-auto text-xs">프리미엄</Badge>}
                </div>
              ))}
            </div>

            <Button disabled className={`w-full text-white font-semibold py-6 text-lg ${currentPlan.buttonColor}`}>
              {activeTab === 'judge' ? '시작하기 (데모)' : '결제 (데모)'}
            </Button>
          </Card>

          {/* FAQ 섹션 */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">자주 묻는 질문</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border border-border">
                <h3 className="font-bold mb-2">언제든 취소할 수 있나요?</h3>
                <p className="text-sm text-muted-foreground">
                  네, 언제든지 구독을 취소할 수 있습니다. 취소 후 남은 기간은 이용할 수 있습니다.
                </p>
              </Card>
              <Card className="p-6 border border-border">
                <h3 className="font-bold mb-2">환불이 가능한가요?</h3>
                <p className="text-sm text-muted-foreground">
                  구독 후 7일 이내에는 전액 환불이 가능합니다. 자세한 내용은 고객 지원팀에 문의하세요.
                </p>
              </Card>
              <Card className="p-6 border border-border">
                <h3 className="font-bold mb-2">여러 역할을 가질 수 있나요?</h3>
                <p className="text-sm text-muted-foreground">
                  네, 한 계정으로 여러 역할을 가질 수 있습니다. 각 역할별로 요금제를 선택할 수 있습니다.
                </p>
              </Card>
              <Card className="p-6 border border-border">
                <h3 className="font-bold mb-2">기업 요금제가 있나요?</h3>
                <p className="text-sm text-muted-foreground">
                  네, 대량 구독이나 커스텀 요금제는 영업팀에 문의하세요.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
