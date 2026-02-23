import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getContests, getJudges, getSubmissions, getUsers } from '@/lib/mock';
import type { Contest } from '@/lib/types';
import { ExternalLink, Inbox, Search, SquarePen, UserCheck } from 'lucide-react';

type ContestDetailPageProps = {
  params: Promise<{ id: string }>;
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

export default async function HostContestDetailPage({ params }: ContestDetailPageProps) {
  try {
    const { id } = await params;
    const [allContests, allSubmissions, allJudges, allUsers] = await Promise.all([
      getContests(),
      getSubmissions(),
      getJudges(),
      getUsers(),
    ]);

    const contest = allContests.find((item) => item.id === id);

    if (!contest) {
      return (
        <div className="space-y-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">공모전을 찾을 수 없습니다</h1>
          <p className="text-sm text-muted-foreground">ID: {id}</p>
          <Link href="/host/contests">
            <Button size="sm">목록으로 돌아가기</Button>
          </Link>
        </div>
      );
    }

    const submissions = allSubmissions.filter((submission) => submission.contestId === id);
    const judges = allJudges.filter((judge) => judge.contestId === id);
    const host = allUsers.find((user) => user.id === contest.hostUserId);

    const subsByStatus = {
      pendingReview: submissions.filter((submission) => submission.status === 'pending_review').length,
      approved: submissions.filter((submission) => submission.status === 'approved').length,
      rejected:
        submissions.filter(
          (submission) => submission.status === 'rejected' || submission.status === 'auto_rejected'
        ).length,
      judging: submissions.filter((submission) => submission.status === 'judging').length,
      judged: submissions.filter((submission) => submission.status === 'judged').length,
    };

    const judgesAccepted = judges.filter((judge) => judge.acceptedAt).length;
    const judgesInvited = judges.length - judgesAccepted;

    const judgingTypeLabel =
      contest.judgingType === 'internal' ? '내부 심사' : contest.judgingType === 'external' ? '외부 심사' : '내부 + 외부 병행';

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">공모전 운영 상세</p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{contest.title}</h1>
            <Badge className={statusBadgeClassMap[contest.status]}>{statusLabelMap[contest.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{contest.description}</p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">전체 접수작</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{submissions.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">검수 대기</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{subsByStatus.pendingReview}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-sky-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">심사위원</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{judges.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-emerald-500">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">심사 완료</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{subsByStatus.judged}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="border-border xl:col-span-2">
            <CardHeader>
              <CardTitle>공모전 정보</CardTitle>
              <CardDescription>기본 설정과 일정 정보를 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">주최자</p>
                <p className="text-sm font-semibold text-foreground">{host?.name ?? '정보 없음'}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">지역</p>
                <p className="text-sm font-semibold text-foreground">{contest.region}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">제출 기간</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(contest.submissionStartAt).toLocaleDateString('ko-KR')} - {new Date(contest.submissionEndAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">심사 기간</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(contest.judgingStartAt).toLocaleDateString('ko-KR')} - {new Date(contest.judgingEndAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">결과 발표일</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(contest.resultAnnouncedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">심사 유형</p>
                <p className="text-sm font-semibold text-foreground">{judgingTypeLabel}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">인당 최대 출품</p>
                <p className="text-sm font-semibold text-foreground">{contest.maxSubmissionsPerUser}개</p>
              </div>
              {/* 수상 설정 정보 */}
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-4 sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-2">수상 설정 (총 {contest.awardTiers.reduce((s, t) => s + t.count, 0)}명)</p>
                <div className="flex flex-wrap gap-2">
                  {contest.awardTiers.map((tier) => (
                    <span key={tier.label} className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                      {tier.label} {tier.count}명
                      {tier.prizeAmount && <span className="text-amber-500/70">({tier.prizeAmount})</span>}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>심사위원 현황</CardTitle>
              <CardDescription>수락과 대기 상태를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-emerald-500/10 p-4">
                <p className="text-xs text-muted-foreground">수락</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{judgesAccepted}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-4">
                <p className="text-xs text-muted-foreground">대기</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{judgesInvited}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-xs text-muted-foreground">반려/자동반려</p>
                <p className="text-2xl font-bold text-destructive">{subsByStatus.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>운영 동선에 맞춘 페이지로 즉시 이동합니다.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Link href={`/host/contests/${id}/edit` as Route}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <SquarePen className="h-4 w-4" /> 공모전 수정
                </Button>
              </Link>
              <Link href={`/host/contests/${id}/judges` as Route}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <UserCheck className="h-4 w-4" /> 심사위원 관리
                </Button>
              </Link>
              <Link href={`/host/contests/${id}/submissions` as Route}>
                <Button className="w-full justify-start gap-2">
                  <Inbox className="h-4 w-4" /> 접수작 관리 ({subsByStatus.approved + subsByStatus.judging + subsByStatus.judged})
                </Button>
              </Link>
              {/* 프리미엄 랜딩페이지 버튼 (유료 부가 서비스) */}
              {contest.hasLandingPage && (
                <Link href={`/contests/${id}/landing` as Route} target="_blank">
                  <Button variant="outline" className="w-full justify-start gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400">
                    <ExternalLink className="h-4 w-4" /> 랜딩페이지 보기
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load contest detail:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">공모전 정보를 불러올 수 없습니다</p>
      </div>
    );
  }
}
