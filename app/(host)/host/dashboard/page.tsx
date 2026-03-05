import { HostDashboardContent } from '@/components/dashboard/host-dashboard-content';
import { getAuthProfile, getContestsByHost, getSubmissions, getJudges } from '@/lib/data';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default async function HostDashboardPage() {
  try {
    // getAuthProfile과 독립적인 쿼리를 병렬 실행 (순차 대기 제거)
    const [profile, allSubmissions, allJudges] = await Promise.all([
      getAuthProfile(),
      getSubmissions(),
      getJudges(),
    ]);

    if (!profile) redirect('/login?redirect=/host/dashboard');

    // profile.id 의존 쿼리만 순차 실행
    const hostContests = await getContestsByHost(profile.id);

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
          todayLabel: formatDate(new Date(), {
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
