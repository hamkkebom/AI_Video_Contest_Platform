'use client';

import type { Contest } from '@/lib/types';
import { Lock, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HostAnalyticsData {
  totalContests: number;
  totalSubmissions: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  judgingCount: number;
  contestRows: Array<{
    contestId: string;
    title: string;
    status: Contest['status'];
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

interface HostAnalyticsContentProps {
  data: HostAnalyticsData;
}

const statusBadgeMap: Record<Contest['status'], { label: string; className: string }> = {
  draft: { label: '초안', className: 'bg-muted text-muted-foreground' },
  open: { label: '접수중', className: 'bg-primary/10 text-primary' },
  closed: { label: '마감', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  judging: { label: '심사중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  completed: { label: '완료', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
};

export function HostAnalyticsContent({ data }: HostAnalyticsContentProps) {
  const trendData = data.monthlyTrend.length > 0 ? data.monthlyTrend : [{ month: '데이터 없음', count: 0 }];

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">운영 성과 분석</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">분석</h1>
        <p className="text-sm text-muted-foreground">접수 추이와 상태별 처리량을 한 화면에서 확인하세요.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border border-l-4 border-l-primary">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">운영 공모전</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{data.totalContests}</p>
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">총 접수작</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{data.totalSubmissions}</p>
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">승인 완료</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{data.approvedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-destructive">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">반려/자동반려</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{data.rejectedCount}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="border-border xl:col-span-3">
          <CardHeader>
            <CardTitle>월별 접수 추이</CardTitle>
            <CardDescription>최근 구간의 월별 제출량을 표시합니다.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="host-submission-trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#host-submission-trend)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border xl:col-span-2">
          <CardHeader>
            <CardTitle>상태별 처리 요약</CardTitle>
            <CardDescription>현재 운영 단계별 접수작 수치입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-amber-500/10 p-4">
              <p className="text-xs text-muted-foreground">검수 대기</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{data.pendingCount}</p>
            </div>
            <div className="rounded-lg bg-sky-500/10 p-4">
              <p className="text-xs text-muted-foreground">심사 진행 중</p>
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{data.judgingCount}</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-4">
              <p className="text-xs text-muted-foreground">승인 완료</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{data.approvedCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border">
          <CardHeader>
            <CardTitle>공모전별 접수 현황</CardTitle>
            <CardDescription>운영 공모전의 접수 및 승인 상태를 비교합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.contestRows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                분석할 공모전 데이터가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {data.contestRows.map((row) => {
                  const status = statusBadgeMap[row.status];

                  return (
                    <div key={row.contestId} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-foreground">{row.title}</p>
                          <Badge className={status.className}>{status.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">총 {row.total}건 · 승인 {row.approved}건 · 대기 {row.pending}건 · 반려 {row.rejected}건</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary">승인율 {row.total > 0 ? Math.round((row.approved / row.total) * 100) : 0}%</Badge>
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
        <Card className="border-border border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> 프리미엄 분석
            </CardTitle>
            <CardDescription>참가자 세그먼트/채널 성과/전환 퍼널은 출시 후 제공됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">참가자 분포</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                <Users className="h-4 w-4" /> 잠금됨
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">채널별 성과</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                <TrendingUp className="h-4 w-4" /> 잠금됨
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">상세 분석 리포트</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">잠금됨</p>
            </div>
            <div className="md:col-span-3">
              <Button type="button" className="w-full md:w-auto">
                출시 시 알림 받기
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
