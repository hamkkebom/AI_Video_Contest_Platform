'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { Contest } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, CheckCircle2, ClipboardList, Film } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface JudgeContestProgress {
  contestId: string;
  title: string;
  description: string;
  status: Contest['status'];
  submissionCount: number;
  scoredCount: number;
  progressPercent: number;
}

interface JudgeDashboardData {
  todayLabel: string;
  greeting: string;
  assignedContestCount: number;
  totalSubmissionCount: number;
  totalScoredCount: number;
  overallProgressPercent: number;
  contests: JudgeContestProgress[];
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  criteriaAverageScores: Array<{
    criterion: string;
    averageScore: number;
  }>;
}

interface JudgeDashboardContentProps {
  data: JudgeDashboardData;
}

interface StatCard {
  label: string;
  value: number;
  trend: string;
  icon: LucideIcon;
  borderClass: string;
  iconClass: string;
}

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

const pieColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary-foreground))',
  'hsl(var(--accent-foreground))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--destructive))',
];

export function JudgeDashboardContent({ data }: JudgeDashboardContentProps) {
  const remainingCount = Math.max(data.totalSubmissionCount - data.totalScoredCount, 0);
  const scoreDistributionForChart =
    data.scoreDistribution.some((item) => item.count > 0) ? data.scoreDistribution : [{ range: '데이터 없음', count: 1 }];

  const criteriaAveragesForChart =
    data.criteriaAverageScores.length > 0 ? data.criteriaAverageScores : [{ criterion: '데이터 없음', averageScore: 0 }];

  const stats: StatCard[] = [
    {
      label: '배정된 공모전',
      value: data.assignedContestCount,
      trend: `현재 배정 ${data.assignedContestCount}건`,
      icon: ClipboardList,
      borderClass: 'border-l-primary',
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: '총 심사 대상',
      value: data.totalSubmissionCount,
      trend: `남은 심사 ${remainingCount}건`,
      icon: Film,
      borderClass: 'border-l-amber-500',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: '완료된 심사',
      value: data.totalScoredCount,
      trend: `전체 진행률 ${data.overallProgressPercent}%`,
      icon: CheckCircle2,
      borderClass: 'border-l-emerald-500',
      iconClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{data.todayLabel}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">심사위원 대시보드</h1>
        <p className="text-sm text-muted-foreground">{data.greeting}</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      <section>
        <Card className="border-border">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <CardTitle>전체 심사 진행률</CardTitle>
                <CardDescription>
                  총 {data.totalSubmissionCount}건 중 {data.totalScoredCount}건 완료
                </CardDescription>
              </div>
              <p className="text-3xl font-bold tracking-tight text-primary">{data.overallProgressPercent}%</p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${data.overallProgressPercent}%` }} />
            </div>
          </CardHeader>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>채점 분포</CardTitle>
            <CardDescription>총점 구간별 채점 건수</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionForChart} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="range" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>기준별 평균 점수</CardTitle>
            <CardDescription>심사 기준별 평균 점수 분포</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={criteriaAveragesForChart}
                  dataKey="averageScore"
                  nameKey="criterion"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={105}
                  paddingAngle={2}
                >
                  {criteriaAveragesForChart.map((item, index) => (
                    <Cell key={`${item.criterion}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)}점`, '평균 점수']}
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
          <CardHeader>
            <CardTitle>배정된 공모전</CardTitle>
            <CardDescription>공모전별 심사 현황과 진행 상태를 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.contests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                현재 배정된 공모전이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {data.contests.map((contest) => (
                  <div
                    key={contest.contestId}
                    className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-base font-semibold">{contest.title}</p>
                            <Badge className={statusBadgeClassMap[contest.status]}>{statusLabelMap[contest.status]}</Badge>
                          </div>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{contest.description}</p>
                        </div>

                        <div className="flex items-center gap-5 text-sm md:justify-end">
                          <div>
                            <p className="font-semibold text-foreground">{contest.submissionCount}</p>
                            <p className="text-xs text-muted-foreground">심사 대상</p>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{contest.scoredCount}</p>
                            <p className="text-xs text-muted-foreground">완료</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">진행률</span>
                          <span className="font-semibold text-primary">{contest.progressPercent}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${contest.progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Link href={`/judging/${contest.contestId}` as Route}>
                          <Button size="sm" className="gap-1.5">
                            심사 시작 <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
