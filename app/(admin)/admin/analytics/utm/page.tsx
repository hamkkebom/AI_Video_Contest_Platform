'use client';

import Link from 'next/link';
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

const campaignRows = [
  {
    name: 'ai_contest_2026_naver_blog',
    channel: '네이버 블로그',
    source: 'naver',
    medium: 'blog',
    sessions: 1240,
    signups: 186,
    submissions: 47,
    conversionRate: 15.0,
  },
  {
    name: 'ai_contest_2026_instagram_ad',
    channel: '인스타그램 광고',
    source: 'instagram',
    medium: 'paid_social',
    sessions: 2120,
    signups: 255,
    submissions: 63,
    conversionRate: 12.0,
  },
  {
    name: 'ai_contest_2026_google_cpc',
    channel: '구글 검색광고',
    source: 'google',
    medium: 'cpc',
    sessions: 1760,
    signups: 214,
    submissions: 58,
    conversionRate: 12.2,
  },
  {
    name: 'ai_contest_2026_kakao_channel',
    channel: '카카오톡 채널',
    source: 'kakao',
    medium: 'channel',
    sessions: 980,
    signups: 149,
    submissions: 31,
    conversionRate: 15.2,
  },
];

export default function AdminAnalyticsUtmPage() {
  const totalSessions = campaignRows.reduce((sum, row) => sum + row.sessions, 0);
  const totalSignups = campaignRows.reduce((sum, row) => sum + row.signups, 0);
  const totalSubmissions = campaignRows.reduce((sum, row) => sum + row.submissions, 0);

  const channelStats = campaignRows.map((row) => ({
    channel: row.channel,
    유입수: row.sessions,
    가입수: row.signups,
  }));

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">UTM 캠페인 분석</h1>
        <p className="text-sm text-muted-foreground">채널별 유입과 전환 성과를 비교해 운영 효율을 점검합니다.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border border-l-4 border-l-primary">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">총 유입 세션</p>
            <p className="text-3xl font-bold tracking-tight">{totalSessions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-sky-500">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">총 가입 전환</p>
            <p className="text-3xl font-bold tracking-tight">{totalSignups.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">총 출품 전환</p>
            <p className="text-3xl font-bold tracking-tight">{totalSubmissions.toLocaleString()}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>유입 채널별 통계</CardTitle>
            <CardDescription>채널별 세션/가입 수를 비교합니다.</CardDescription>
          </div>
          <Link href="/admin/analytics">
            <Button variant="outline">분석 홈</Button>
          </Link>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelStats} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="channel" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                }}
              />
              <Bar dataKey="유입수" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="가입수" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border overflow-hidden">
        <CardHeader>
          <CardTitle>캠페인 성과 테이블</CardTitle>
          <CardDescription>UTM 파라미터 기준 캠페인별 성과 상세입니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>캠페인</TableHead>
                <TableHead>채널</TableHead>
                <TableHead>소스/매체</TableHead>
                <TableHead className="text-right">세션</TableHead>
                <TableHead className="text-right">가입</TableHead>
                <TableHead className="text-right">출품</TableHead>
                <TableHead className="text-right">전환율</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignRows.map((row) => (
                <TableRow key={row.name} className="transition-colors hover:bg-primary/5">
                  <TableCell>
                    <p className="font-medium">{row.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary">{row.channel}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.source} / {row.medium}
                  </TableCell>
                  <TableCell className="text-right">{row.sessions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.signups.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.submissions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">{row.conversionRate}%</Badge>
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
