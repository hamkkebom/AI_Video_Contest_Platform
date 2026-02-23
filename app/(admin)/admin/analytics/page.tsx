import { AdminAnalyticsContent } from '@/components/dashboard/admin-analytics-content';
import { getActivityLogs, getContests, getInquiries, getSubmissions, getUsers } from '@/lib/mock';

export default async function AdminAnalyticsPage() {
  try {
    const [users, contests, submissions, inquiries, activityLogs] = await Promise.all([
      getUsers(),
      getContests(),
      getSubmissions(),
      getInquiries(),
      getActivityLogs(),
    ]);

    const monthlyActivityMap = new Map<string, number>();
    for (const activity of activityLogs) {
      const month = new Date(activity.createdAt).toLocaleDateString('ko-KR', { month: 'numeric' });
      const monthLabel = `${month.replace('.', '').trim()}월`;
      monthlyActivityMap.set(monthLabel, (monthlyActivityMap.get(monthLabel) ?? 0) + 1);
    }

    const activityTrend = Array.from(monthlyActivityMap.entries()).map(([month, count]) => ({ month, count }));

    const monthlySignupMap = new Map<string, number>();
    for (const user of users) {
      const month = new Date(user.createdAt).toLocaleDateString('ko-KR', { month: 'numeric' });
      const monthLabel = `${month.replace('.', '').trim()}월`;
      monthlySignupMap.set(monthLabel, (monthlySignupMap.get(monthLabel) ?? 0) + 1);
    }

    const signupTrend = Array.from(monthlySignupMap.entries()).map(([month, count]) => ({ month, count }));

    const totalViews = submissions.reduce((sum, submission) => sum + submission.views, 0);
    const approvedCount = submissions.filter((submission) => submission.status === 'approved').length;
    const conversionRate = submissions.length > 0 ? Math.round((approvedCount / submissions.length) * 100) : 0;

    const submissionStatus = [
      { name: '검수대기', value: submissions.filter((item) => item.status === 'pending_review').length },
      { name: '승인', value: approvedCount },
      { name: '반려', value: submissions.filter((item) => item.status === 'rejected').length },
      { name: '자동반려', value: submissions.filter((item) => item.status === 'auto_rejected').length },
      { name: '심사중', value: submissions.filter((item) => item.status === 'judging').length },
      { name: '심사완료', value: submissions.filter((item) => item.status === 'judged').length },
    ];

    return (
      <AdminAnalyticsContent
        data={{
          totalViews,
          conversionRate,
          activeUsers: users.filter((user) => user.status === 'active').length,
          pendingInquiries: inquiries.filter((inquiry) => inquiry.status === 'pending').length,
          contests: contests.length,
          submissions: submissions.length,
          activityTrend,
          signupTrend,
          submissionStatus,
        }}
      />
    );
  } catch (error) {
    console.error('Failed to load analytics:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">분석 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }
}
