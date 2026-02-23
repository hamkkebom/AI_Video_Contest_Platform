'use client';

import Link from 'next/link';
import { Film, Scale, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * 내 활동 허브 페이지
 * 다중 역할 사용자가 참가 / 심사 / 주최 활동을 한눈에 확인하는 페이지
 * 모든 데이터는 목업 (데모용)
 */

interface ActivityCard {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  stats: string;
  description: string;
  href: string;
  linkLabel: string;
}

const activityCards: ActivityCard[] = [
  {
    icon: <Film className="h-6 w-6 text-blue-600" />,
    iconBg: 'bg-blue-100',
    title: '참가 활동',
    stats: '출품작 3건 · 수상 1건',
    description: '최근 출품: AI 영상 공모전 2025',
    href: '/my/submissions',
    linkLabel: '출품작 관리',
  },
  {
    icon: <Scale className="h-6 w-6 text-amber-600" />,
    iconBg: 'bg-amber-100',
    title: '심사 활동',
    stats: '배정 2건 · 완료 1건',
    description: '진행중: AI 영상 공모전 2026 (12/30건)',
    href: '/judging',
    linkLabel: '심사 대시보드',
  },
  {
    icon: <Building2 className="h-6 w-6 text-violet-600" />,
    iconBg: 'bg-violet-100',
    title: '주최 활동',
    stats: '공모전 1건 · 접수 45건',
    description: '진행중: AI 영상 공모전 2026',
    href: '/host/dashboard',
    linkLabel: '주최 관리',
  },
];

export default function MyActivityPage() {
  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">내 활동</h1>
        <p className="text-muted-foreground mt-1">참여 중인 활동을 한눈에 확인하세요</p>
      </div>

      {/* 활동 카드 그리드 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activityCards.map((card) => (
          <Card
            key={card.title}
            className="group relative overflow-hidden border border-border hover:shadow-lg transition-all duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  {card.icon}
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{card.title}</h2>
                  <p className="text-sm text-muted-foreground">{card.stats}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <Link href={card.href as any}>
                <Button variant="outline" size="sm" className="w-full justify-center gap-1.5 cursor-pointer group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {card.linkLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 최근 활동 요약 */}
      <Card className="border border-border">
        <CardHeader>
          <h2 className="font-semibold text-lg">최근 활동</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2시간 전', action: 'AI 영상 공모전 2026 심사 — 출품작 3건 채점 완료', role: '심사위원' },
              { time: '1일 전', action: 'AI 영상 공모전 2026 — 신규 접수 5건 검수 승인', role: '주최자' },
              { time: '3일 전', action: 'AI 영상 공모전 2025 — 작품 "도시의 하루" 출품', role: '참가자' },
              { time: '1주 전', action: 'AI 영상 공모전 2026 심사위원 초대 수락', role: '심사위원' },
              { time: '2주 전', action: 'AI 영상 공모전 2026 공모전 생성 및 공개', role: '주최자' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5 min-w-[5rem]">{item.time}</span>
                <span className="text-sm flex-1">{item.action}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">{item.role}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
