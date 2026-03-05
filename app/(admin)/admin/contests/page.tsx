import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CONTEST_STATUS_TABS } from '@/config/constants';
import { getContests, getSubmissions } from '@/lib/data';
import type { Contest, ContestStatus } from '@/lib/types';
import { Inbox } from 'lucide-react';
import ContestRowActions from './contest-row-actions';
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

        {/* 상태 필터 */}
        <section className="flex flex-wrap gap-2">
          {CONTEST_STATUS_TABS.map((tab) => {
            const isActive = tab.value === activeStatus;
            const count = tab.value === 'all' ? allContests.length : (countByStatus[tab.value] ?? 0);
            return (
              <Link key={tab.value} href={tab.value === 'all' ? ('/admin/contests' as Route) : (`/admin/contests?status=${tab.value}` as Route)}>
                <Button variant={isActive ? 'default' : 'outline'} size="sm" className="gap-1.5">
                  {tab.label}
                  <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-xs text-muted-foreground">
                    {count}
                  </span>
                </Button>
              </Link>
            );
          })}
        </section>

        {/* 공모전 테이블 */}
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
            <Card className="border-border">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>공모전명</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>접수작</TableHead>
                      <TableHead>검수대기</TableHead>
                      <TableHead>접수 기간</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContests.map((contest) => (
                      <TableRow key={contest.id}>
                        <TableCell>
                          <p className="max-w-[280px] truncate font-semibold text-foreground">{contest.title}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClassMap[contest.status]}>
                            {statusLabelMap[contest.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submissionCountByContest[contest.id] ?? 0}건
                        </TableCell>
                        <TableCell>
                          {(pendingCountByContest[contest.id] ?? 0) > 0 ? (
                            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
                              {pendingCountByContest[contest.id]}건
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0건</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(contest.submissionStartAt)} ~{' '}
                          {formatDate(contest.submissionEndAt)}
                        </TableCell>
                        <TableCell>
                          <ContestRowActions contestId={contest.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
