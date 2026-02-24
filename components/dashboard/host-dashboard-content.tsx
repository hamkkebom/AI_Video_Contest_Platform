'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { Contest, Judge, Submission } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  FileText,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface HostDashboardData {
  contests: Contest[];
  submissions: Submission[];
  judges: Judge[];
  acceptanceRate: number;
  todayLabel: string;
}

interface HostDashboardContentProps {
  data: HostDashboardData;
}

interface StatCard {
  label: string;
  value: string | number;
  trend: string;
  icon: LucideIcon;
  borderClass: string;
  iconClass: string;
}

const monthlySubmissionData = [
  { month: '1월', count: 12 },
  { month: '2월', count: 19 },
  { month: '3월', count: 26 },
  { month: '4월', count: 31 },
  { month: '5월', count: 25 },
  { month: '6월', count: 38 },
  { month: '7월', count: 43 },
  { month: '8월', count: 48 },
];

const pieColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary-foreground))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--accent-foreground))',
  'hsl(var(--destructive))',
];

const statusLabelMap: Record<Contest['status'], string> = {
  draft: '초안',
  open: '접수중',
  closed: '마감',
  judging: '심사중',
  completed: '완료',
};

const statusBadgeClassMap: Record<Contest['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  open: 'bg-primary/10 text-primary',
  closed: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  judging: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

const quickActions: Array<{
  href: Route;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
    {
      href: '/host/contests/new',
      title: '새 공모전 만들기',
      description: '모집 요강과 심사 정책을 빠르게 설정합니다.',
      icon: Sparkles,
    },
    {
      href: '/host/contests',
      title: '공모전 관리',
      description: '진행 중인 공모전 상태를 한 번에 관리합니다.',
      icon: Trophy,
    },
    {
      href: '/host/analytics',
      title: '성과 분석 보기',
      description: '접수 증가 추세와 승인율을 확인합니다.',
      icon: BarChart3,
    },
    {
      href: '/host/reports',
      title: '운영 리포트',
      description: '주간 보고용 운영 지표를 내보냅니다.',
      icon: FileText,
    },
  ];

export function HostDashboardContent({ data }: HostDashboardContentProps) {
  const recentContests = [...data.contests]
    .sort((a, b) => new Date(b.submissionStartAt).getTime() - new Date(a.submissionStartAt).getTime())
    .slice(0, 6);

  const submissionsByContest = data.submissions.reduce<Record<string, number>>((acc, submission) => {
    acc[submission.contestId] = (acc[submission.contestId] ?? 0) + 1;
    return acc;
  }, {});

  const judgesByContest = data.judges.reduce<Record<string, number>>((acc, judge) => {
    acc[judge.contestId] = (acc[judge.contestId] ?? 0) + 1;
    return acc;
  }, {});

  const statusCounts = data.contests.reduce<Record<Contest['status'], number>>(
    (acc, contest) => {
      acc[contest.status] += 1;
      return acc;
    },
    { draft: 0, open: 0, closed: 0, judging: 0, completed: 0 }
  );

  const contestStatusDistribution = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: statusLabelMap[status as Contest['status']], value: count }));

  const chartStatusData =
    contestStatusDistribution.length > 0 ? contestStatusDistribution : [{ name: '데이터 없음', value: 1 }];

  const stats: StatCard[] = [
    {
      label: '전체 공모전',
      value: data.contests.length,
      trend: '전월 대비 +12%',
      icon: ClipboardList,
      borderClass: 'border-l-primary',
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: '총 접수작',
      value: data.submissions.length,
      trend: '전월 대비 +18%',
      icon: Trophy,
      borderClass: 'border-l-amber-500',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: '심사위원',
      value: data.judges.length,
      trend: '전월 대비 +6%',
      icon: Users,
      borderClass: 'border-l-sky-500',
      iconClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
      label: '승인율',
      value: `${data.acceptanceRate}%`,
      trend: '전월 대비 +9%',
      icon: ShieldCheck,
      borderClass: 'border-l-emerald-500',
      iconClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{data.todayLabel}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">안녕하세요, 주최자님</h1>
        <p className="text-sm text-muted-foreground">운영 현황을 한눈에 확인하고 빠르게 액션을 실행하세요.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border-border border-l-4 ${stat.borderClass}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
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
            <CardTitle>월별 접수 현황</CardTitle>
            <CardDescription>최근 8개월 접수 추세</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySubmissionData} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="submissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#submissionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>공모전 상태 분포</CardTitle>
            <CardDescription>현재 진행 단계별 공모전 수</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {chartStatusData.map((item, index) => (
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
      </section>

      <section>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 공모전</CardTitle>
              <CardDescription>최근 등록 순으로 최대 6개 표시</CardDescription>
            </div>
            <Link href="/host/contests">
              <Button variant="outline" size="sm" className="gap-1.5">
                전체 보기 <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentContests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                아직 생성된 공모전이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {recentContests.map((contest) => {
                  const submissionCount = submissionsByContest[contest.id] ?? 0;
                  const judgeCount = judgesByContest[contest.id] ?? 0;

                  return (
                    <div
                      key={contest.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-4 md:flex-row md:items-center"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-base font-semibold">{contest.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={statusBadgeClassMap[contest.status]}>{statusLabelMap[contest.status]}</Badge>
                          <span className="text-xs text-muted-foreground">마감 {formatDate(contest.submissionEndAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 text-sm text-muted-foreground md:justify-end">
                        <div>
                          <p className="font-semibold text-foreground">{submissionCount}</p>
                          <p className="text-xs">접수작</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{judgeCount}</p>
                          <p className="text-xs">심사위원</p>
                        </div>
                      </div>

                      <div className="flex gap-2 md:justify-end">
                        <Link href={`/host/contests/${contest.id}/edit`}>
                          <Button size="sm" variant="outline">
                            수정
                          </Button>
                        </Link>
                        <Link href={`/host/contests/${contest.id}`}>
                          <Button size="sm">상세</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">빠른 실행</h2>
          <p className="text-xs text-muted-foreground">자주 사용하는 작업으로 바로 이동합니다.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.href} href={action.href}>
                <Card className="h-full border-border transition-colors hover:border-primary/40 hover:bg-muted/40">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
