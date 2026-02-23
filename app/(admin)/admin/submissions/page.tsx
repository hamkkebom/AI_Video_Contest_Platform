import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { REVIEW_TABS } from '@/config/constants';
import { getContests, getSubmissions, getUsers } from '@/lib/mock';
import type { SubmissionStatus } from '@/lib/types';
import { Inbox } from 'lucide-react';

type AdminSubmissionsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

/** 제출물 상태별 뱃지 스타일 */
const statusBadgeMap: Record<SubmissionStatus, { label: string; className: string }> = {
  pending_review: { label: '검수대기', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  approved: { label: '승인', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: '반려', className: 'bg-destructive/10 text-destructive' },
  auto_rejected: { label: '자동반려', className: 'bg-destructive/10 text-destructive' },
  judging: { label: '심사중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  judged: { label: '심사완료', className: 'bg-primary/10 text-primary' },
};

export default async function AdminSubmissionsPage({ searchParams }: AdminSubmissionsPageProps) {
  try {
    const { tab } = await searchParams;
    const activeTab = REVIEW_TABS.some((item) => item.value === tab) ? (tab as SubmissionStatus) : 'pending_review';

    const [allSubmissions, allContests, allUsers] = await Promise.all([
      getSubmissions(),
      getContests(),
      getUsers(),
    ]);

    const contestsMap = new Map(allContests.map((c) => [c.id, c]));
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const countByStatus = REVIEW_TABS.reduce<Record<string, number>>((acc, item) => {
      acc[item.value] = allSubmissions.filter((s) => s.status === item.value).length;
      return acc;
    }, {});

    const filteredSubmissions = allSubmissions.filter((s) => s.status === activeTab);

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">전체 제출물 통합 관리</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">제출물 관리</h1>
          <p className="text-sm text-muted-foreground">
            전체 {allSubmissions.length}개 · {allContests.length}개 공모전
          </p>
        </header>

        {/* 상태 필터 탭 */}
        <section>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>상태 필터</CardTitle>
              <CardDescription>현재 탭: {REVIEW_TABS.find((item) => item.value === activeTab)?.label}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {REVIEW_TABS.map((reviewTab) => {
                const isActive = reviewTab.value === activeTab;
                return (
                  <Link key={reviewTab.value} href={`/admin/submissions?tab=${reviewTab.value}` as Route}>
                    <Button variant={isActive ? 'default' : 'outline'} size="sm" className="gap-1.5">
                      {reviewTab.label}
                      <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-xs text-muted-foreground">
                        {countByStatus[reviewTab.value] ?? 0}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* 제출물 테이블 */}
        <section>
          {filteredSubmissions.length === 0 ? (
            <Card className="border-border">
              <CardContent className="space-y-3 py-14 text-center">
                <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">선택한 상태의 제출물이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>제출물 목록</CardTitle>
                <CardDescription>
                  {REVIEW_TABS.find((item) => item.value === activeTab)?.label} 상태 · {filteredSubmissions.length}건
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>작품</TableHead>
                      <TableHead>공모전</TableHead>
                      <TableHead>참가자</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>제출일</TableHead>
                      <TableHead>반응</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.slice(0, 50).map((submission) => {
                      const creator = usersMap.get(submission.userId);
                      const contest = contestsMap.get(submission.contestId);
                      const statusInfo = statusBadgeMap[submission.status];

                      return (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex min-w-[220px] items-center gap-3">
                              <img
                                src={submission.thumbnailUrl}
                                alt={submission.title}
                                className="h-14 w-24 rounded-md border border-border object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">{submission.title}</p>
                                <p className="line-clamp-1 text-xs text-muted-foreground">{submission.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[160px] truncate text-sm text-muted-foreground">
                              {contest?.title ?? submission.contestId}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{creator?.name ?? '알 수 없음'}</p>
                              <p className="text-xs text-muted-foreground">{creator?.email ?? '-'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            조회 {submission.views} · 좋아요 {submission.likeCount}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" type="button">
                                상세
                              </Button>
                              {(submission.status === 'pending_review' || submission.status === 'auto_rejected') && (
                                <>
                                  <Button size="sm" type="button">
                                    승인
                                  </Button>
                                  <Button size="sm" variant="outline" type="button" className="text-destructive">
                                    거절
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load submissions:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">제출물 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}