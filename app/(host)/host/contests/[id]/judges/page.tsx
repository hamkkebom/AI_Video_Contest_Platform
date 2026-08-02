import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getContestById, getJudgesByContest, getUsersByIds } from '@/lib/data';
import { UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { JudgeAssign } from './_components/judge-assign';
import { JudgeRemove } from './_components/judge-remove';

type ContestJudgesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function HostContestJudgesPage({ params }: ContestJudgesPageProps) {
  try {
    const { id } = await params;
    // 단건/필터 조회로 최적화
    const [contestJudges, contest] = await Promise.all([
      getJudgesByContest(id),
      getContestById(id),
    ]);
    // 심사위원 유저 정보만 별도 조회
    const judgeUserIds = [...new Set(contestJudges.map((j) => j.userId))];
    const users = await getUsersByIds(judgeUserIds);
    const usersMap = new Map(users.map((user) => [user.id, user]));

    /* 배정이 곧 확정이므로(054) '대기' 상태는 054 이전에 만들어진 행에만 남는다 */
    const externalCount = contestJudges.filter((judge) => judge.isExternal).length;
    const internalCount = contestJudges.length - externalCount;
    const legacyPendingCount = contestJudges.filter((judge) => !judge.acceptedAt).length;

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">심사위원 운영</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">심사위원 관리</h1>
          <p className="text-sm text-muted-foreground">
            {contest?.title ?? id} · 총 {contestJudges.length}명
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">전체 심사위원</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{contestJudges.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-emerald-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">내부</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{internalCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">수락 대기</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{legacyPendingCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">예전 초대 방식으로 남은 건</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-sky-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">외부 심사위원</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{externalCount}</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>심사위원 배정</CardTitle>
              <CardDescription>가입한 회원의 이메일로 찾아 바로 배정합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <JudgeAssign contestId={id} />
            </CardContent>
          </Card>
        </section>

        <section>
          {contestJudges.length === 0 ? (
            <Card className="border-border">
              <CardContent className="space-y-3 py-14 text-center">
                <UserCheck className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">배정된 심사위원이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>심사위원 목록</CardTitle>
                <CardDescription>배정 이력을 확인하고 필요하면 해제합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>심사위원</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>배정일</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contestJudges.map((judge) => {
                      const user = usersMap.get(judge.userId);
                      const isAccepted = Boolean(judge.acceptedAt);

                      return (
                        <TableRow key={judge.id}>
                          <TableCell className="font-medium">{user?.name ?? '외부 심사위원'}</TableCell>
                          <TableCell className="text-muted-foreground">{judge.email ?? user?.email ?? '-'}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                judge.isExternal
                                  ? 'border-amber-500/40 text-amber-700 dark:text-amber-300'
                                  : 'border-primary/40 text-primary'
                              }
                            >
                              {judge.isExternal ? '외부' : '내부'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                isAccepted
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              }
                            >
                              {isAccepted ? '활동' : '수락 대기'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(judge.invitedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <JudgeRemove
                                judgeId={judge.id}
                                judgeName={user?.name ?? '이 심사위원'}
                              />
                              <Link href={`/host/contests/${id}` as Route}>
                                <Button size="sm" type="button">
                                  공모전 보기
                                </Button>
                              </Link>
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
    console.error('Failed to load judges:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">심사위원 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
