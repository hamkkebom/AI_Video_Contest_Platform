import { HostAnalyticsContent } from '@/components/dashboard/host-analytics-content';
import { getAuthProfile, getContestsByHost, getSubmissions } from '@/lib/data';
import { redirect } from 'next/navigation';

export default async function HostAnalyticsPage() {
  const profile = await getAuthProfile();
  if (!profile) redirect('/login?redirect=/host/analytics');

  try {
    const [hostContests, allSubmissions] = await Promise.all([
      getContestsByHost(profile.id),
      getSubmissions(),
    ]);

    const hostContestIds = new Set(hostContests.map((contest) => contest.id));
    const hostSubmissions = allSubmissions.filter((submission) => hostContestIds.has(submission.contestId));

    const pendingCount = hostSubmissions.filter((submission) => submission.status === 'pending_review').length;
    const approvedCount = hostSubmissions.filter((submission) => submission.status === 'approved').length;
    const rejectedCount = hostSubmissions.filter(
      (submission) => submission.status === 'rejected' || submission.status === 'auto_rejected'
    ).length;
    const judgingCount = hostSubmissions.filter((submission) => submission.status === 'judging').length;

    const contestRows = hostContests.map((contest) => {
      const contestSubmissions = hostSubmissions.filter((submission) => submission.contestId === contest.id);

      return {
        contestId: contest.id,
        title: contest.title,
        status: contest.status,
        total: contestSubmissions.length,
        pending: contestSubmissions.filter((submission) => submission.status === 'pending_review').length,
        approved: contestSubmissions.filter((submission) => submission.status === 'approved').length,
        rejected: contestSubmissions.filter(
          (submission) => submission.status === 'rejected' || submission.status === 'auto_rejected'
        ).length,
      };
    });

    const monthlyTrendMap = hostSubmissions.reduce<Record<string, number>>((acc, submission) => {
      const date = new Date(submission.submittedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const monthlyTrend = Object.entries(monthlyTrendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, count]) => ({ month: month.slice(5).replace(/^0/, '') + '월', count }));

    return (
      <HostAnalyticsContent
        data={{
          totalContests: hostContests.length,
          totalSubmissions: hostSubmissions.length,
          pendingCount,
          approvedCount,
          rejectedCount,
          judgingCount,
          contestRows,
          monthlyTrend,
        }}
      />
    );
  } catch (error) {
    console.error('Failed to load analytics:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">분석 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }
}
