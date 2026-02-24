import Link from 'next/link';
import { Trophy, Film, Eye, Heart, Clock, ChevronRight, CalendarDays } from 'lucide-react';
import type { Contest, Submission, SubmissionStatus } from '@/lib/types';
import { getSubmissions, getContests, getAuthProfile } from '@/lib/data';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateCompact } from '@/lib/utils';

/** 출품작 상태 메타 정보 */
const statusMeta: Record<SubmissionStatus, { label: string; className: string }> = {
  pending_review: { label: '검토 중', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  approved: { label: '승인됨', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: '거절됨', className: 'bg-destructive/10 text-destructive' },
  auto_rejected: { label: '자동 거절', className: 'bg-destructive/10 text-destructive' },
  judging: { label: '심사 중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  judged: { label: '심사 완료', className: 'bg-primary/10 text-primary' },
};

/** 공모전 상태 한글 매핑 */
const contestStatusLabel: Record<string, { label: string; className: string }> = {
  draft: { label: '준비 중', className: 'bg-muted text-muted-foreground' },
  open: { label: '접수 중', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  closed: { label: '접수 마감', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  judging: { label: '심사 중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  completed: { label: '완료', className: 'bg-primary/10 text-primary' },
};

/** 공모전별 출품작 그룹 */
interface ContestGroup {
  contest: Contest;
  submissions: Submission[];
}

export default async function MyContestsPage() {
  const profile = await getAuthProfile();
  if (!profile) redirect('/login');

  try {
    /* 내 출품작 조회 */
    const allSubmissions = await getSubmissions();
    const userSubmissions = allSubmissions.filter((s) => s.userId === profile.id);

    /* 공모전 ID 추출 → 공모전 정보 조회 */
    const contestIds = [...new Set(userSubmissions.map((s) => s.contestId))];
    const allContests = contestIds.length > 0 ? await getContests() : [];
    const contestMap = new Map(allContests.map((c) => [c.id, c]));

    /* 공모전별 그룹핑 */
    const groups: ContestGroup[] = contestIds
      .map((cid) => {
        const contest = contestMap.get(cid);
        if (!contest) return null;
        const submissions = userSubmissions
          .filter((s) => s.contestId === cid)
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        return { contest, submissions };
      })
      .filter((g): g is ContestGroup => g !== null)
      .sort((a, b) => new Date(b.contest.submissionStartAt).getTime() - new Date(a.contest.submissionStartAt).getTime());

    const totalSubmissions = userSubmissions.length;

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">내 출품작</h1>
          <p className="text-sm text-muted-foreground">
            참가한 공모전 {groups.length}개 · 총 {totalSubmissions}개 작품
          </p>
        </header>

        {groups.length === 0 ? (
          /* 빈 상태 */
          <Card className="border-border border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">출품작이 없습니다</p>
                <p className="text-sm text-muted-foreground">
                  공모전에 참가하고 작품을 등록해보세요.
                </p>
              </div>
              <Link href="/">
                <Button>공모전 둘러보기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* 공모전 카드 목록 */
          <div className="space-y-4">
            {groups.map(({ contest, submissions }) => {
              const cStatus = contestStatusLabel[contest.status] ?? contestStatusLabel.draft;

              return (
                <Card key={contest.id} className="overflow-hidden border-border">
                  {/* 공모전 헤더 */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cStatus.className}>{cStatus.label}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDateCompact(contest.submissionStartAt)} ~ {formatDateCompact(contest.submissionEndAt)}
                          </span>
                        </div>
                        <CardTitle className="text-lg leading-snug line-clamp-2">
                          {contest.title}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="shrink-0 gap-1">
                        <Film className="h-3 w-3" />
                        {submissions.length}개 출품
                      </Badge>
                    </div>
                  </CardHeader>

                  {/* 출품작 목록 */}
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {submissions.map((submission) => {
                        const sStatus = statusMeta[submission.status];

                        return (
                          <Link
                            key={submission.id}
                            href={`/gallery/${submission.id}`}
                            className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                          >
                            {/* 썸네일 */}
                            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                              {submission.thumbnailUrl ? (
                                <img
                                  src={submission.thumbnailUrl}
                                  alt={submission.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <Film className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            {/* 제목 + 상태 + 지표 */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium">{submission.title}</p>
                                <Badge className={`shrink-0 text-[10px] px-1.5 py-0 ${sStatus.className}`}>
                                  {sStatus.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {submission.views.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {submission.likeCount.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDateCompact(submission.submittedAt)}
                                </span>
                              </div>
                            </div>
                            {/* 상세보기 화살표 */}
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </Link>
                        );
                      })}
                    </div>

                    {/* 공모전에 추가 출품 (접수 중일 때만) */}
                    {contest.status === 'open' && submissions.length < contest.maxSubmissionsPerUser && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <Link href={`/contests/${contest.id}/submit`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Film className="h-3.5 w-3.5" />
                            추가 출품하기
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to load contests:', error);

    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-10 text-center">
          <p className="font-medium text-destructive">데이터를 불러오지 못했습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
        </CardContent>
      </Card>
    );
  }
}
