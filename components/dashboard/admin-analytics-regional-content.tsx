'use client';

import Link from 'next/link';
import { MapPin, Trophy, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { RegionalMetric } from '@/lib/types';

interface AdminAnalyticsRegionalContentProps {
  data: {
    rows: RegionalMetric[];
    totalUsers: number;
    totalContests: number;
    totalSubmissions: number;
  };
}

export function AdminAnalyticsRegionalContent({ data }: AdminAnalyticsRegionalContentProps) {
  const chartData = data.rows.slice(0, 10).map((row) => ({
    region: row.region,
    회원수: row.userCount,
    출품작: row.submissionCount,
  }));

  const stats = [
    {
      label: '총 회원',
      value: `${data.totalUsers}명`,
      icon: Users,
      borderClass: 'border-l-primary',
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: '총 공모전',
      value: `${data.totalContests}개`,
      icon: Trophy,
      borderClass: 'border-l-amber-500',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: '총 출품작',
      value: `${data.totalSubmissions}개`,
      icon: MapPin,
      borderClass: 'border-l-sky-500',
      iconClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">지역별 분석</h1>
        <p className="text-sm text-muted-foreground">지역 단위 회원/공모전/출품작 분포를 비교합니다.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border-border border-l-4 ${stat.borderClass}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.iconClass}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>지역별 분포 차트</CardTitle>
            <CardDescription>회원 수와 출품작 수를 지역별로 비교합니다.</CardDescription>
          </div>
          <Link href="/admin/analytics">
            <Button variant="outline">분석 홈</Button>
          </Link>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="region" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                }}
              />
              <Bar dataKey="회원수" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="출품작" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border overflow-hidden">
        <CardHeader>
          <CardTitle>지역별 상세 통계</CardTitle>
          <CardDescription>회원 수 기준으로 상위 지역을 우선 노출합니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>지역</TableHead>
                <TableHead className="text-right">회원 수</TableHead>
                <TableHead className="text-right">공모전 수</TableHead>
                <TableHead className="text-right">출품작 수</TableHead>
                <TableHead className="text-right">회원 비율</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, index) => (
                <TableRow key={row.region} className={index < 3 ? 'bg-primary/5' : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index < 3 ? (
                        <Badge className="h-5 w-5 rounded-full bg-primary p-0 text-center text-xs leading-5 text-primary-foreground">
                          {index + 1}
                        </Badge>
                      ) : null}
                      <span className="font-medium">{row.region}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{row.userCount}명</TableCell>
                  <TableCell className="text-right">{row.contestCount}개</TableCell>
                  <TableCell className="text-right">{row.submissionCount}개</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-primary/10 text-primary">
                      {data.totalUsers > 0 ? Math.round((row.userCount / data.totalUsers) * 100) : 0}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
