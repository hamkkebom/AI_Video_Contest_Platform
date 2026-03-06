import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CONTEST_STATUS_TABS } from '@/config/constants';
import { getContests, getSubmissions } from '@/lib/data';
import type { Contest } from '@/lib/types';
import { Inbox, Calendar, Gavel, Trophy, FileVideo, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

/** 공모전 상태 라벨 */
const statusLabelMap: Record<Contest['status'], string> = {
  draft: '초안',
  open: '접수중',
  closed: '마감',
  judging: '심사중',
  completed: '완료',
};

/** 공모전 상태별 뱃지 스타일 */
const statusBadgeClassMap: Record<Contest['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  open: 'bg-primary/10 text-primary',
  closed: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  judging: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

type AdminContestsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminContestsPage({ searchParams }: AdminContestsPageProps) {
  try {
    const { status } = await searchParams;
    const activeStatus = CONTEST_STATUS_TABS.some((t) => t.value === status) ? status! : 'all';

    const [allContests, allSubmissions] = await Promise.all([
      getContests(),
      getSubmissions(),
    ]);

    /* 상태별 카운트 집계 */
    const countByStatus = allContests.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {});

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

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">공모전 관리</h1>
          <p className="text-base text-muted-foreground">총 <span className="text-lg font-bold text-primary">{allContests.length}</span>개 공모전</p>
        </header>

        {/* 요약 카드 */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">전체 공모전</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{allContests.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-emerald-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">접수중</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {allContests.filter((c) => c.status === 'open').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-sky-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">심사중</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {allContests.filter((c) => c.status === 'judging').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">전체 접수작</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{allSubmissions.length}</p>
            </CardContent>
          </Card>
        </section>

        {/* 상태 필터 — min-h로 레이아웃 시프트 방지 */}
        <section className="flex min-h-[40px] flex-wrap items-start gap-2">
          {CONTEST_STATUS_TABS.map((tab) => {
            const isActive = tab.value === activeStatus;
            const count = tab.value === 'all' ? allContests.length : (countByStatus[tab.value] ?? 0);
            return (
              <Link key={tab.value} href={tab.value === 'all' ? ('/admin/contests' as Route) : (`/admin/contests?status=${tab.value}` as Route)}>
                <Button variant={isActive ? 'default' : 'outline'} size="sm" className="min-w-[72px] gap-1.5">
                  {tab.label}
                  <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-background/70 px-1.5 py-0.5 text-xs text-muted-foreground">
                    {count}
                  </span>
                </Button>
              </Link>
            );
          })}
        </section>

        {/* 공모전 목록 — 리스트형 카드 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">공모전 목록</h2>
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
                      <CardContent className="p-5">
                        {/* 상단: 제목 + 상태 뱃지 + 접수 통계 */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5">
                              <h3 className="truncate text-base font-semibold text-foreground">{contest.title}</h3>
                              <Badge className={statusBadgeClassMap[contest.status]}>
                                {statusLabelMap[contest.status]}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <FileVideo className="h-3.5 w-3.5" />
                              접수 {subCount}건
                            </span>
                            {pendingCount > 0 ? (
                              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                검수대기 {pendingCount}건
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">검수대기 0건</span>
                            )}
                          </div>
                        </div>

                        {/* 하단: 일정 정보 */}
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="font-medium text-foreground/70">접수</span>
                            {formatDate(contest.submissionStartAt)} ~ {formatDate(contest.submissionEndAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Gavel className="h-3.5 w-3.5 text-sky-500" />
                            <span className="font-medium text-foreground/70">심사</span>
                            {formatDate(contest.judgingStartAt)} ~ {formatDate(contest.judgingEndAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                            <span className="font-medium text-foreground/70">결과발표</span>
                            {formatDate(contest.resultAnnouncedAt)}
                          </span>
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
