'use client';

import { BarChart3, Eye, Heart, Lock, Sparkles, Trophy } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Submission } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ParticipantAnalyticsContentProps {
  submissions: Submission[];
}

export function ParticipantAnalyticsContent({ submissions }: ParticipantAnalyticsContentProps) {
  const totalViews = submissions.reduce((sum, submission) => sum + submission.views, 0);
  const totalLikes = submissions.reduce((sum, submission) => sum + submission.likeCount, 0);
  const avgViews = submissions.length > 0 ? Math.round(totalViews / submissions.length) : 0;

  const chartData = submissions
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
    .map((submission) => ({
      name: submission.title.length > 10 ? `${submission.title.slice(0, 10)}...` : submission.title,
      views: submission.views,
    }));

  const stats = [
    { label: '총 조회수', value: totalViews.toLocaleString(), icon: Eye, borderClass: 'border-l-primary' },
    { label: '총 좋아요', value: totalLikes.toLocaleString(), icon: Heart, borderClass: 'border-l-amber-500' },
    { label: '평균 조회수', value: avgViews.toLocaleString(), icon: BarChart3, borderClass: 'border-l-sky-500' },
  ];

  const premiumCards = [
    {
      title: '카테고리 경쟁률',
      description: '같은 장르 출품작 대비 상대 퍼포먼스를 제공합니다.',
      icon: Trophy,
    },
    {
      title: '상세 성장 리포트',
      description: '기간별 성과 추이와 유입 변화 분석을 제공합니다.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">내 분석</h1>
        <p className="text-sm text-muted-foreground">작품별 반응과 누적 성과를 기반으로 다음 전략을 준비하세요.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border-border border-l-4 ${stat.borderClass}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card className="border-border">
          <CardHeader>
            <CardTitle>작품별 조회수</CardTitle>
            <CardDescription>조회수 기준 상위 8개 작품</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                분석할 출품작이 아직 없습니다.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="participantViewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-15} height={52} />
                  <YAxis tickLine={false} axisLine={false} width={42} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--card))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#participantViewsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">프리미엄 분석</h2>
          <Badge variant="secondary">Locked</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {premiumCards.map((card) => (
            <Card key={card.title} className="relative overflow-hidden border-border bg-muted/20">
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div className="space-y-1.5">
                  <p className="font-semibold">{card.title}</p>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border bg-gradient-to-r from-primary/10 via-background to-amber-500/10">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold">프리미엄 오픈 알림 받기</p>
              <p className="text-sm text-muted-foreground">
                경쟁률 분석, 성장 예측, 추천 태그 리포트를 가장 먼저 확인할 수 있습니다.
              </p>
            </div>
            <Button className="w-full md:w-auto">출시 시 알림 받기</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
