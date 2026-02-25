'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, Building2, Scale, Check, X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { PricingPlan } from '@/lib/types';

/**
 * 클라이언트 컴포넌트: 요금제 탭 전환 및 UI 렌더링
 */
interface PricingContentProps {
  plans: PricingPlan[];
}

export function PricingContent({ plans }: PricingContentProps) {
  const [activeTab, setActiveTab] = useState<'participant' | 'host' | 'judge'>('participant');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const tabs = [
    { id: 'participant' as const, label: '참가자', icon: Film },
    { id: 'host' as const, label: '주최자', icon: Building2 },
    { id: 'judge' as const, label: '심사위원', icon: Scale },
  ];

  // 기본 기능 목록 (DB의 featureKeys가 비어있을 경우 사용)
  const defaultFeatures: Record<'participant' | 'host' | 'judge', { name: string; included: boolean }[]> = {
    participant: [
      { name: '작품 성과 분석', included: true },
      { name: '카테고리 경쟁률', included: false },
      { name: 'AI 도구 트렌드', included: false },
      { name: '상세 분석 리포트', included: false },
      { name: '무제한 출품', included: true },
      { name: '갤러리 접근', included: true },
    ],
    host: [
      { name: '접수 현황 분석', included: true },
      { name: '참가자 분포 분석', included: false },
      { name: '채널별 성과 분석', included: false },
      { name: '상세 분석 리포트', included: false },
      { name: '무제한 공모전 개최', included: true },
      { name: '심사위원 관리', included: true },
      { name: '자동 검수 설정', included: true },
    ],
    judge: [
      { name: '심사 진행률 확인', included: true },
      { name: '채점 분포 분석', included: false },
      { name: '심사 템플릿 관리', included: true },
      { name: '채점 기록 저장', included: true },
      { name: '심사 코멘트 작성', included: true },
    ],
  };

  const faqs = [
    { q: '언제든 취소할 수 있나요?', a: '네, 언제든지 구독을 취소할 수 있습니다. 취소 후 남은 기간은 이용할 수 있습니다.' },
    { q: '환불이 가능한가요?', a: '구독 후 7일 이내에는 전액 환불이 가능합니다. 자세한 내용은 고객 지원팀에 문의하세요.' },
    { q: '여러 역할을 가질 수 있나요?', a: '네, 한 계정으로 여러 역할을 가질 수 있습니다. 각 역할별로 요금제를 선택할 수 있습니다.' },
    { q: '기업 요금제가 있나요?', a: '네, 대량 구독이나 커스텀 요금제는 영업팀에 문의하세요.' },
  ];

  // 현재 탭의 요금제 찾기
  const currentPlanData = plans.find((p) => p.role === activeTab);
  if (!currentPlanData) return null;

  const PlanIcon = tabs.find((t) => t.id === activeTab)?.icon || Film;

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="bg-accent text-accent-foreground border-0 mb-4">Pricing</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">역할에 맞는 요금제를 선택하세요</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            참가자, 주최자, 심사위원 — 각 역할에 최적화된 기능을 제공합니다
          </p>
        </div>
      </section>

      {/* 요금제 콘텐츠 */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          {/* 탭 버튼 */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex gap-1 p-1 rounded-xl bg-muted">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${activeTab === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 요금제 카드 */}
          <Card className="border-2 border-accent-foreground/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
                    <PlanIcon className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentPlanData.name}</h2>
                    <p className="text-muted-foreground text-sm">
                      {activeTab === 'participant' && '공모전 출품 및 갤러리 활동을 위한 플랜'}
                      {activeTab === 'host' && '공모전 개최 및 관리를 위한 전문 플랜'}
                      {activeTab === 'judge' && '공모전 심사 및 채점을 위한 플랜'}
                    </p>
                  </div>
                </div>
                {activeTab === 'judge' && (
                  <Badge className="bg-green-500/10 text-green-600 border-0">무료</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* 가격 */}
              <div className="mb-8 pb-6 border-b border-border">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold">
                    {activeTab === 'judge' ? '무료' : currentPlanData.monthlyPrice.toLocaleString()}
                  </span>
                  {activeTab !== 'judge' && (
                    <span className="text-muted-foreground text-lg">원 / 월</span>
                  )}
                </div>
              </div>

              {/* 기능 목록 */}
              <div className="space-y-3 mb-8">
                {defaultFeatures[activeTab].map((feature) => (
                  <div key={feature.name} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <X className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                      {feature.name}
                    </span>
                    {!feature.included && (
                      <Badge variant="outline" className="ml-auto text-xs">프리미엄</Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA 버튼 */}
              <Button disabled className="w-full font-semibold py-6 text-lg cursor-not-allowed bg-muted text-muted-foreground">
                서비스 준비 중
              </Button>
            </CardContent>
          </Card>

          {/* FAQ 섹션 */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">자주 묻는 질문</h2>
              </div>
              <p className="text-muted-foreground">요금제에 대해 궁금한 점을 확인하세요</p>
            </div>
            <div className="space-y-3 max-w-2xl mx-auto">
              {faqs.map((faq) => (
                <Card
                  key={faq.q}
                  className="cursor-pointer hover:border-primary/20 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === faqs.indexOf(faq) ? null : faqs.indexOf(faq))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{faq.q}</h3>
                      {expandedFaq === faqs.indexOf(faq)
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      }
                    </div>
                    {expandedFaq === faqs.indexOf(faq) && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
