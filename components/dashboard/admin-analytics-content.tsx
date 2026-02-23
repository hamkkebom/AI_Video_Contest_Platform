'use client';

import Link from 'next/link';
import { Activity, ArrowUpRight, Link2, MapPin, MousePointerClick, TrendingUp, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminAnalyticsContentProps {
  data: {
    totalViews: number;
    conversionRate: number;
    activeUsers: number;
    pendingInquiries: number;
    contests: number;
    submissions: number;
    activityTrend: Array<{ month: string; count: number }>;
    signupTrend: Array<{ month: string; count: number }>;
    submissionStatus: Array<{ name: string; value: number }>;
  };
}

const pieColors = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))',
];

export function AdminAnalyticsContent({ data }: AdminAnalyticsContentProps) {
  const stats = [
    {
      label: '총 방문 (추정)',
      value: data.totalViews.toLocaleString(),
      sub: '출품작 조회수 합계',
      icon: MousePointerClick,
      borderClass: 'border-l-primary',
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: '전환율',
      value: `${data.conversionRate}%`,
      sub: '출품작 승인 기준',
      icon: TrendingUp,
      borderClass: 'border-l-amber-500',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: '활성 회원',
      value: data.activeUsers,
      sub: `전체 공모전 ${data.contests}개`,
      icon: Users,
      borderClass: 'border-l-sky-500',
      iconClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
      label: '대기 문의',
      value: data.pendingInquiries,
      sub: `전체 출품작 ${data.submissions}건`,
      icon: Activity,
      borderClass: 'border-l-destructive',
      iconClass: 'bg-destructive/10 text-destructive',
    },
  ];

  const activityTrend = data.activityTrend.length > 0 ? data.activityTrend : [{ month: '데이터 없음', count: 0 }];
  const signupTrend = data.signupTrend.length > 0 ? data.signupTrend : [{ month: '데이터 없음', count: 0 }];
  const submissionStatus = data.submissionStatus.filter((item) => item.value > 0);
  const pieData = submissionStatus.length > 0 ? submissionStatus : [{ name: '데이터 없음', value: 1 }];

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">분석 개요</h1>
        <p className="text-sm text-muted-foreground">핵심 KPI와 추이 차트로 운영 성과를 한 번에 확인합니다.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border-border border-l-4 ${stat.borderClass}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.iconClass}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>활동 추이</CardTitle>
            <CardDescription>월별 활동 로그 증가 추이</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrend} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="admin-activity-trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#admin-activity-trend)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>사용자 증가</CardTitle>
            <CardDescription>월별 신규 가입자 추이</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupTrend} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="admin-signup-trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#admin-signup-trend)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="border-border xl:col-span-3">
          <CardHeader>
            <CardTitle>출품작 상태 분포</CardTitle>
            <CardDescription>검수/심사 단계별 비중</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={64} outerRadius={110} paddingAngle={2}>
                  {pieData.map((item, index) => (
                    <Cell key={`${item.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border xl:col-span-2">
          <CardHeader>
            <CardTitle>상세 분석 이동</CardTitle>
            <CardDescription>하위 분석 페이지로 바로 이동합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/analytics/regional">
              <Card className="border-border transition-colors hover:border-primary/40 hover:bg-muted/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-semibold">지역별 분석</p>
                    <p className="text-xs text-muted-foreground">지역 단위 회원/출품 분포 확인</p>
                  </div>
                  <MapPin className="h-5 w-5 text-primary" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/analytics/utm">
              <Card className="border-border transition-colors hover:border-primary/40 hover:bg-muted/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-semibold">UTM 캠페인 분석</p>
                    <p className="text-xs text-muted-foreground">채널 성과 테이블과 유입 차트 확인</p>
                  </div>
                  <Link2 className="h-5 w-5 text-primary" />
                </CardContent>
              </Card>
            </Link>
            <Button variant="outline" className="w-full gap-1.5">
              리포트 다운로드 <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
