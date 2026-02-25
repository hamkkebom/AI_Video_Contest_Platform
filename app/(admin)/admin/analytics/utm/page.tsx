'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

/**
 * UTM 캠페인 분석 페이지
 * 실제 UTM 데이터 수집 연동 전까지 빈 상태 표시
 */
export default function AdminAnalyticsUtmPage() {
  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">UTM 캠페인 분석</h1>
        <p className="text-sm text-muted-foreground">채널별 유입과 전환 성과를 비교해 운영 효율을 점검합니다.</p>
      </header>

      {/* 요약 카드 — 데이터 없음 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border border-l-4 border-l-primary">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">총 유입 세션</p>
            <p className="text-3xl font-bold tracking-tight">0</p>
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-sky-500">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">총 가입 전환</p>
            <p className="text-3xl font-bold tracking-tight">0</p>
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">총 출품 전환</p>
            <p className="text-3xl font-bold tracking-tight">0</p>
          </CardContent>
        </Card>
      </section>

      {/* 빈 상태 안내 */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>유입 채널별 통계</CardTitle>
            <CardDescription>UTM 파라미터가 포함된 유입 데이터가 수집되면 이곳에 표시됩니다.</CardDescription>
          </div>
          <Link href="/admin/analytics">
            <Button variant="outline">분석 홈</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">아직 수집된 UTM 데이터가 없습니다</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              UTM 파라미터가 포함된 링크를 통해 유입이 발생하면 채널별 통계가 자동으로 집계됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
