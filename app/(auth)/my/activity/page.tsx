'use client';

import Link from 'next/link';
import { Film, Scale, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/supabase/auth-context';

interface ActivityCard {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  stats: string;
  description: string;
  href: string;
  linkLabel: string;
}

export default function MyActivityPage() {
  const { user, loading } = useAuth();

  const activityCards: ActivityCard[] = [
    {
      icon: <Film className="h-6 w-6 text-blue-600" />,
      iconBg: 'bg-blue-100',
      title: '참가 활동',
      stats: loading ? '데이터를 불러오는 중...' : '출품작 관리',
      description: '내 출품작 목록을 확인하세요',
      href: '/my/submissions',
      linkLabel: '출품작 관리',
    },
    {
      icon: <Scale className="h-6 w-6 text-amber-600" />,
      iconBg: 'bg-amber-100',
      title: '심사 활동',
      stats: loading ? '데이터를 불러오는 중...' : '심사 대시보드',
      description: '배정된 심사 건을 확인하세요',
      href: '/judging',
      linkLabel: '심사 대시보드',
    },
    {
      icon: <Building2 className="h-6 w-6 text-violet-600" />,
      iconBg: 'bg-violet-100',
      title: '주최 활동',
      stats: loading ? '데이터를 불러오는 중...' : '주최 관리',
      description: '주최 중인 공모전을 관리하세요',
      href: '/host/dashboard',
      linkLabel: '주최 관리',
    },
  ];

  if (!loading && !user) {
    return (
      <Card className="border border-border">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          로그인이 필요합니다.
        </CardContent>
      </Card>
    );
  }

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
          <div className="py-8 text-center text-sm text-muted-foreground">
            최근 활동이 없습니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
