import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthProfile, getContestsByHost, getJudges, getSubmissions } from '@/lib/data';
import type { Contest } from '@/lib/types';
import { ClipboardList, Plus, UserCheck } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type ContestListPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusLabelMap: Record<Contest['status'], string> = {
  draft: '초안',
  open: '접수중',
  closed: '마감',
  judging: '심사중',
  completed: '완료',
};

const statusBadgeClassMap: Record<Contest['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  open: 'bg-primary/10 text-primary',
  closed: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  judging: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

type ContestTabStatus = 'all' | 'open' | 'closed' | 'judging' | 'completed';

const tabItems: Array<{ value: ContestTabStatus; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'open', label: '접수중' },
  { value: 'closed', label: '마감' },
  { value: 'judging', label: '심사중' },
  { value: 'completed', label: '완료' },
];

export default async function HostContestsPage({ searchParams }: ContestListPageProps) {
  const profile = await getAuthProfile();
  if (!profile) redirect('/login');

  try {
    const { status } = await searchParams;
    const activeStatus =
      status === 'open' || status === 'closed' || status === 'judging' || status === 'completed'
        ? status
        : 'all';

    const [hostContests, allSubmissions, allJudges] = await Promise.all([
      getContestsByHost(profile.id),
      getSubmissions(),
      getJudges(),
    ]);

    const hostContestIds = new Set(hostContests.map((contest) => contest.id));
    const hostSubmissions = allSubmissions.filter((submission) => hostContestIds.has(submission.contestId));
    const hostJudges = allJudges.filter((judge) => hostContestIds.has(judge.contestId));

    const statusCounts = {
      all: hostContests.length,
      open: hostContests.filter((contest) => contest.status === 'open').length,
      closed: hostContests.filter((contest) => contest.status === 'closed').length,
      judging: hostContests.filter((contest) => contest.status === 'judging').length,
      completed: hostContests.filter((contest) => contest.status === 'completed').length,
    };

    const filteredContests =
      activeStatus === 'all' ? hostContests : hostContests.filter((contest) => contest.status === activeStatus);

    return (
      <div className="space-y-6 pb-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">운영 중인 공모전 상태를 빠르게 확인하고 관리하세요.</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">공모전 목록</h1>
            <p className="text-sm text-muted-foreground">총 {hostContests.length}개의 공모전이 등록되어 있습니다.</p>
          </div>
          <Link href="/host/contests/new">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> 새 공모전
            </Button>
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">전체 공모전</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{statusCounts.all}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">전체 접수작</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{hostSubmissions.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-sky-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">배정 심사위원</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{hostJudges.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-emerald-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">진행 중</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{statusCounts.open + statusCounts.judging}</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>상태 필터</CardTitle>
              <CardDescription>필터를 선택하면 해당 상태의 공모전만 확인할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {tabItems.map((tab) => {
                const isActive = activeStatus === tab.value;
                const count = statusCounts[tab.value];

                return (
                  <Link
                    key={tab.value}
                    href={
                      tab.value === 'all'
                        ? '/host/contests'
                        : (`/host/contests?status=${tab.value}` as Route)
                    }
                  >
                    <Button variant={isActive ? 'default' : 'outline'} size="sm" className="gap-1.5">
                      {tab.label}
                      <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-xs text-muted-foreground">
                        {count}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section>
          {filteredContests.length === 0 ? (
            <Card className="border-border">
              <CardContent className="space-y-3 py-14 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">해당 상태의 공모전이 없습니다.</p>
                <Link href="/host/contests/new">
                  <Button size="sm" className="bg-accent-foreground text-white hover:bg-accent-foreground/90">공모전 생성하기</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredContests.map((contest) => {
                const contestSubs = hostSubmissions.filter((submission) => submission.contestId === contest.id);
                const contestJudges = hostJudges.filter((judge) => judge.contestId === contest.id);

                return (
                  <Card key={contest.id} className="border-border">
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <CardTitle className="truncate text-xl">{contest.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{contest.description}</CardDescription>
                        </div>
                        <Badge className={statusBadgeClassMap[contest.status]}>{statusLabelMap[contest.status]}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">접수작</p>
                          <p className="text-lg font-semibold text-foreground">{contestSubs.length}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">심사위원</p>
                          <p className="text-lg font-semibold text-foreground">{contestJudges.length}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">심사 유형</p>
                          <p className="text-sm font-semibold text-foreground">
                            {contest.judgingType === 'internal' ? '내부' : contest.judgingType === 'external' ? '외부' : '병행'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <div className="space-y-1 text-muted-foreground">
                          <p>접수 마감 {new Date(contest.submissionEndAt).toLocaleDateString('ko-KR')}</p>
                          <p>{contest.region}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/host/contests/${contest.id}/judges` as Route}>
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <UserCheck className="h-4 w-4" /> 심사위원
                            </Button>
                          </Link>
                          <Link href={`/host/contests/${contest.id}` as Route}>
                            <Button size="sm">상세</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
