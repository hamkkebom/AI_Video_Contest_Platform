import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getContests, getSubmissions } from '@/lib/data';
import type { Contest } from '@/lib/types';
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

export default async function AdminContestsPage() {
  try {
    const [allContests, allSubmissions] = await Promise.all([
      getContests(),
      getSubmissions(),
    ]);

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
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">전체 공모전 관리</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">공모전 관리</h1>
            <p className="text-sm text-muted-foreground">총 {allContests.length}개 공모전</p>
          </div>
          <Link href={'/admin/contests/new' as Route}>
            <Button>새 공모전</Button>
          </Link>
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

        {/* 공모전 테이블 */}
        <section>
          {allContests.length === 0 ? (
            <Card className="border-border">
              <CardContent className="space-y-3 py-14 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">등록된 공모전이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>공모전 목록</CardTitle>
                <CardDescription>공모전별 접수 현황을 확인하고 영상을 관리하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>공모전명</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>지역</TableHead>
                      <TableHead>접수작</TableHead>
                      <TableHead>검수대기</TableHead>
                      <TableHead>접수 기간</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allContests.map((contest) => (
                      <TableRow key={contest.id}>
                        <TableCell>
                          <p className="max-w-[280px] truncate font-semibold text-foreground">{contest.title}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClassMap[contest.status]}>
                            {statusLabelMap[contest.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{contest.region}</TableCell>
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
