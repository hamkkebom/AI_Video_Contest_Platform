import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivityLogs, getContests, getSubmissions, getUsers } from '@/lib/mock';
import { Download, FileText, History, Trophy } from 'lucide-react';

export default async function HostReportsPage() {
  try {
    const DEMO_HOST_ID = 'user-2';
    const [allContests, allSubmissions, allActivityLogs, allUsers] = await Promise.all([
      getContests(),
      getSubmissions(),
      getActivityLogs(),
      getUsers(),
    ]);

    const hostContests = allContests.filter((contest) => contest.hostId === DEMO_HOST_ID);
    const hostContestIds = new Set(hostContests.map((contest) => contest.id));
    const hostSubmissions = allSubmissions.filter((submission) => hostContestIds.has(submission.contestId));
    const hostActivityLogs = allActivityLogs
      .filter(
        (log) =>
          (log.targetType === 'contest' && hostContestIds.has(log.targetId)) ||
          (log.targetType === 'submission' && hostSubmissions.some((submission) => submission.id === log.targetId))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const usersMap = new Map(allUsers.map((user) => [user.id, user]));
    const recentLogs = hostActivityLogs.slice(0, 12);

    return (
      <div className="space-y-6 pb-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">운영 리포트</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">리포트</h1>
            <p className="text-sm text-muted-foreground">주요 운영 지표와 최근 활동 이력을 확인하세요.</p>
          </div>
          <Button type="button" className="gap-1.5">
            <Download className="h-4 w-4" /> 리포트 내보내기
          </Button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="border-border border-l-4 border-l-primary">
            <CardContent className="flex items-start justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">공모전 수</p>
                <p className="text-3xl font-bold tracking-tight">{hostContests.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Trophy className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-amber-500">
            <CardContent className="flex items-start justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">접수작 수</p>
                <p className="text-3xl font-bold tracking-tight">{hostSubmissions.length}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300">
                <FileText className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-sky-500">
            <CardContent className="flex items-start justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">활동 로그 수</p>
                <p className="text-3xl font-bold tracking-tight">{hostActivityLogs.length}</p>
              </div>
              <div className="rounded-full bg-sky-500/10 p-2 text-sky-700 dark:text-sky-300">
                <History className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>최근 활동 로그</CardTitle>
              <CardDescription>최근 12건의 운영 이벤트를 시간순으로 제공합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                  표시할 활동 로그가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => {
                    const actor = usersMap.get(log.userId);

                    return (
                      <div key={log.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {actor?.name ?? '알 수 없음'} · {log.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString('ko-KR')} · 대상: {log.targetType} ({log.targetId})
                          </p>
                        </div>
                        <Badge className="bg-primary/10 text-primary">{log.targetType}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load reports:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">리포트 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }
}
