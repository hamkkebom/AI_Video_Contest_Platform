import { getContests, getSubmissions, getUsersByIds } from '@/lib/data';
import type { SubmissionStatus } from '@/lib/types';
import { VideoPlayerView } from './_components/video-player-view';

/** 승인 이후 상태만 표시 */
const VIEWABLE_STATUSES: SubmissionStatus[] = ['approved', 'judging', 'judged'];

type AdminVideosPageProps = {
  searchParams: Promise<{ contestId?: string }>;
};

export default async function AdminVideosPage({ searchParams }: AdminVideosPageProps) {
  const { contestId: rawContestId } = await searchParams;

  /* 공모전 목록 조회 */
  const contests = await getContests();
  if (contests.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-muted-foreground">등록된 공모전이 없습니다.</p>
      </div>
    );
  }

  /* 선택된 공모전 결정 (없으면 첫 번째) */
  const currentContestId = rawContestId && contests.some((c) => c.id === rawContestId)
    ? rawContestId
    : contests[0].id;

  /* 해당 공모전 제출물 조회 + 승인된 것만 필터 */
  const allSubmissions = await getSubmissions({ contestId: currentContestId });
  const submissions = allSubmissions.filter((s) => VIEWABLE_STATUSES.includes(s.status));

  /* 제출자 정보 조회 */
  const userIds = [...new Set(submissions.map((s) => s.userId))];
  const users = userIds.length > 0 ? await getUsersByIds(userIds) : [];
  const usersMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <VideoPlayerView
      contests={contests}
      submissions={submissions}
      currentContestId={currentContestId}
      usersMap={usersMap}
    />
  );
}
