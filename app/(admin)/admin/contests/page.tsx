import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CONTEST_STATUS_TABS, STATUS_LABEL_MAP, STATUS_BADGE_CLASS_MAP } from '@/config/constants';
import { getContests, getSubmissions } from '@/lib/data';

import { Inbox, Calendar, Gavel, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils';


type AdminContestsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminContestsPage({ searchParams }: AdminContestsPageProps) {
  try {
    const { status } = await searchParams;
    const [allContests, allSubmissions] = await Promise.all([
      getContests(),
      getSubmissions(),
    ]);

    /* 상태별 카운트 집계 */
    const countByStatus = allContests.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {});

    /* 기본 탭: URL 파라미터 우선, 없으면 컨텐츠가 있는 첫 탭 자동 선택 */
    let activeStatus = CONTEST_STATUS_TABS.some((t) => t.value === status) ? status! : 'all';
    if (!status && allContests.length > 0) {
      const hasOpen = (countByStatus['open'] ?? 0) > 0;
      if (!hasOpen) {
        const tabOrder = ['judging', 'closed', 'completed', 'draft'];
        const firstWithData = tabOrder.find((s) => (countByStatus[s] ?? 0) > 0);
        if (firstWithData) activeStatus = firstWithData;
      }
    }

    /* 필터링된 공모전 목록 */
    const filteredContests = activeStatus === 'all'
      ? allContests
      : allContests.filter((c) => c.status === activeStatus);

    /* 공모전별 접수작 수 집계 */
    const submissionCountByContest = allSubmissions.reduce<Record<string, number>>((acc, s) => {
      acc[s.contestId] = (acc[s.contestId] ?? 0) + 1;
      return acc;
    }, {});

    /* 공모전별 검수대기 수 집계 */
    const pendingCountByContest = allSubmissions.reduce<Record<string, number>>((acc, s) => {
      if (s.status === 'pending_review') {
        acc[s.contestId] = (acc[s.contestId] ?? 0) + 1;
      }
      return acc;
    }, {});

    /* 요약 통계용 날짜 계산 */
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const pendingReviewCount = allSubmissions.filter((s) => s.status === 'pending_review').length;
    const openCount = allContests.filter((c) => c.status === 'open').length;
    const closingSoonCount = allContests.filter(
      (c) => c.status === 'open' && new Date(c.submissionEndAt) <= threeDaysFromNow && new Date(c.submissionEndAt) > now,
    ).length;
    const todaySubmissionCount = allSubmissions.filter((s) => {
      const d = new Date(s.submittedAt);
      return d >= todayStart && d < todayEnd;
    }).length;
    const judgingContestCount = allContests.filter((c) => c.status === 'judging').length;
    const completedCount = allContests.filter((c) => c.status === 'completed').length;
    const resultAnnouncedCount = allContests.filter(
      (c) => c.status === 'completed' && new Date(c.resultAnnouncedAt) <= now,
    ).length;

    /* 핵심 현황 카드 (4개) */
    const primaryCards = [
      { label: '총 공모전 수', value: allContests.length, border: 'border-l-primary' },
      { label: '진행 중', value: openCount, border: 'border-l-emerald-500' },
      { label: '승인대기', value: pendingReviewCount, border: 'border-l-amber-500' },
      { label: '마감 임박', value: closingSoonCount, border: 'border-l-red-500' },
    ];

    /* 보조 현황 (인라인 stat) */
    const secondaryStats = [
      { label: '오늘 접수 작품 수', value: todaySubmissionCount, color: 'text-sky-600 dark:text-sky-400' },
      { label: '심사 중', value: judgingContestCount, color: 'text-pink-600 dark:text-pink-400' },
      { label: '심사 완료', value: completedCount, color: 'text-teal-600 dark:text-teal-400' },
      { label: '결과 발표', value: resultAnnouncedCount, color: 'text-orange-600 dark:text-orange-400' },
    ];
    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">공모전 관리</h1>
        </header>

        {/* 핵심 현황 카드 */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {primaryCards.map((card) => (
            <Card key={card.label} className={`border-border border-l-4 ${card.border}`}>
              <CardContent className="p-4">
                <p className="text-base font-semibold text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* 보조 현황 — 인라인 stat */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/30 px-5 py-3">
          {secondaryStats.map((stat) => (
            <span key={stat.label} className="flex items-center gap-2 text-base">
              <span className="text-muted-foreground">{stat.label}</span>
              <span className={`font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
            </span>
          ))}
        </div>

        {/* 상태 필터 */}
        <section className="mt-16 flex flex-wrap items-start gap-2">
          {CONTEST_STATUS_TABS.map((tab) => {
            const isActive = tab.value === activeStatus;
            const count = tab.value === 'all' ? allContests.length : (countByStatus[tab.value] ?? 0);
            return (
              <Link key={tab.value} href={tab.value === 'all' ? ('/admin/contests' as Route) : (`/admin/contests?status=${tab.value}` as Route)}>
                <span
                  className={[
                    'inline-flex min-w-[72px] items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-border bg-background text-muted-foreground hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-300',
                  ].join(' ')}
                >
                  {tab.label}
                  <span className="text-xs tabular-nums opacity-70">
                    {count}
                  </span>
                </span>
              </Link>
            );
          })}
        </section>

        {/* 공모전 목록 — 리스트형 카드 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">공모전 목록</h2>
            <Link href={'/admin/contests/new' as Route}>
              <Button size="sm">+ 공모전 등록</Button>
            </Link>
          </div>
          {filteredContests.length === 0 ? (
            <Card className="border-border">
              <CardContent className="space-y-3 py-14 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">해당 상태의 공모전이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredContests.map((contest) => {
                const subCount = submissionCountByContest[contest.id] ?? 0;
                const pendingCount = pendingCountByContest[contest.id] ?? 0;
                return (
                  <Link key={contest.id} href={`/admin/contests/${contest.id}` as Route} className="block">
                    <Card className="border-border transition-colors hover:border-primary/40 hover:bg-muted/30">
                      <CardContent className="flex items-stretch p-0">
                        {/* 왼쪽: 공모전 정보 */}
                        <div className="flex-1 space-y-3 p-6">
                          <div className="flex items-center gap-2.5">
                            <h3 className="truncate text-xl font-semibold text-foreground">{contest.title}</h3>
                            <Badge className={STATUS_BADGE_CLASS_MAP[contest.status]}>
                              {STATUS_LABEL_MAP[contest.status]}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-emerald-500" />
                              <span className="font-medium text-foreground/70">접수</span>
                              {formatDate(contest.submissionStartAt)} ~ {formatDate(contest.submissionEndAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Gavel className="h-4 w-4 text-sky-500" />
                              <span className="font-medium text-foreground/70">심사</span>
                              {formatDate(contest.judgingStartAt)} ~ {formatDate(contest.judgingEndAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Trophy className="h-4 w-4 text-amber-500" />
                              <span className="font-medium text-foreground/70">결과발표</span>
                              {formatDate(contest.resultAnnouncedAt)}
                            </span>
                          </div>
                        </div>
                        {/* 오른쪽: 접수/검수 통계 — 전체 높이 채움 */}
                        <div className="flex shrink-0 items-center gap-6 px-8">
                          <div className="text-center">
                            <p className="text-3xl font-bold tabular-nums text-foreground">{subCount}</p>
                            <p className="mt-1 text-xs text-muted-foreground">접수</p>
                          </div>
                          <div className="h-10 w-px" />
                          <div className="text-center">
                            <p className={['text-3xl font-bold tabular-nums', pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'].join(' ')}>{pendingCount}</p>
                            <p className="mt-1 text-xs text-muted-foreground">검수대기</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load contests:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">공모전 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
