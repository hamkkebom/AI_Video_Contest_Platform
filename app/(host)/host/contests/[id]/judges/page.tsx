import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getContests, getJudges, getUsers } from '@/lib/mock';
import { Lightbulb, MailPlus, UserCheck } from 'lucide-react';

type ContestJudgesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function HostContestJudgesPage({ params }: ContestJudgesPageProps) {
  try {
    const { id } = await params;
    const [allJudges, allContests, allUsers] = await Promise.all([getJudges(), getContests(), getUsers()]);

    const contest = allContests.find((item) => item.id === id);
    const contestJudges = allJudges.filter((judge) => judge.contestId === id);
    const usersMap = new Map(allUsers.map((user) => [user.id, user]));

    const acceptedCount = contestJudges.filter((judge) => judge.acceptedAt).length;
    const pendingCount = contestJudges.length - acceptedCount;
    const externalCount = contestJudges.filter((judge) => judge.isExternal).length;

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
              <p className="text-sm text-muted-foreground">수락</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{acceptedCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">대기</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{pendingCount}</p>
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
              <CardTitle>이메일 초대</CardTitle>
              <CardDescription>데모 모드에서는 실제 메일이 전송되지 않습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id="judge-invite-email" type="email" placeholder="judge@example.com" className="flex-1" />
                 <Button className="gap-1.5 sm:w-auto bg-accent-foreground text-white hover:bg-accent-foreground/90" type="button">
                   <MailPlus className="h-4 w-4" /> 초대 보내기
                 </Button>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5" /> 초대 버튼은 데모 동작이며 실제 발송은 수행되지 않습니다.
              </p>
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
                <CardDescription>수락 상태와 초대 이력을 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>심사위원</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>초대일</TableHead>
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
                              {isAccepted ? '수락' : '대기'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(judge.invitedAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {!isAccepted && (
                                <Button size="sm" variant="outline" type="button">
                                  재초대
                                </Button>
                              )}
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
