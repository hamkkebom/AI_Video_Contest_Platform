import { REGIONS_KR } from '@/config/constants';
import { AdminAnalyticsRegionalContent } from '@/components/dashboard/admin-analytics-regional-content';
import { getContests, getSubmissions, getUsers } from '@/lib/data';
import type { RegionalMetric } from '@/lib/types';

export default async function AdminAnalyticsRegionalPage() {
  try {
    const [users, contests, submissions] = await Promise.all([getUsers(), getContests(), getSubmissions()]);

    const regionalMetrics: RegionalMetric[] = REGIONS_KR.map((region) => ({
      region,
      userCount: users.filter((user) => user.region === region).length,
      contestCount: contests.filter((contest) => contest.region === region).length,
      submissionCount: submissions.filter((submission) => {
        const contest = contests.find((item) => item.id === submission.contestId);
        return contest?.region === region;
      }).length,
    }));

    const sortedMetrics = [...regionalMetrics].sort((a, b) => b.userCount - a.userCount);

    return (
      <AdminAnalyticsRegionalContent
        data={{
          rows: sortedMetrics,
          totalUsers: sortedMetrics.reduce((sum, metric) => sum + metric.userCount, 0),
          totalContests: sortedMetrics.reduce((sum, metric) => sum + metric.contestCount, 0),
          totalSubmissions: sortedMetrics.reduce((sum, metric) => sum + metric.submissionCount, 0),
        }}
      />
    );
  } catch (error) {
    console.error('Failed to load regional analytics:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">지역별 분석 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }
}
