import { HostDashboardContent } from '@/components/dashboard/host-dashboard-content';
import { getContests, getSubmissions, getJudges } from '@/lib/mock';

export default async function HostDashboardPage() {
  try {
    const DEMO_HOST_ID = 'user-2';

    const [allContests, allSubmissions, allJudges] = await Promise.all([
      getContests(),
      getSubmissions(),
      getJudges(),
    ]);

    const hostContests = allContests.filter((c) => c.hostId === DEMO_HOST_ID);
    const hostContestIds = new Set(hostContests.map((c) => c.id));
    const hostSubmissions = allSubmissions.filter((s) => hostContestIds.has(s.contestId));
    const hostJudges = allJudges.filter((j) => hostContestIds.has(j.contestId));

    const approvedCount = hostSubmissions.filter((s) => s.status === 'approved').length;
    const acceptanceRate =
      hostSubmissions.length > 0
        ? Math.round((approvedCount / hostSubmissions.length) * 100)
        : 0;

    return (
      <HostDashboardContent
        data={{
          contests: hostContests,
          submissions: hostSubmissions,
          judges: hostJudges,
          acceptanceRate,
          todayLabel: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          }),
        }}
      />
    );
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-red-600">대시보드 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
