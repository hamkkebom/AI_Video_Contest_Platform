import { AdminDashboardContent } from '@/components/dashboard/admin-dashboard-content';
import { getActivityLogs, getContests, getInquiries, getSubmissions, getUsers } from '@/lib/mock';

const actionLabelMap: Record<string, string> = {
  create_submission: '출품작을 등록했습니다',
  like_submission: '출품작에 좋아요를 눌렀습니다',
};

const targetLabelMap = {
  contest: '공모전',
  submission: '출품작',
  user: '회원',
  article: '아티클',
  inquiry: '문의',
} as const;

export default async function AdminDashboardPage() {
  try {
    const [users, contests, submissions, inquiries, activityLogs] = await Promise.all([
      getUsers(),
      getContests(),
      getSubmissions(),
      getInquiries(),
      getActivityLogs(),
    ]);

    const activeUsers = users.filter((user) => user.status === 'active').length;
    const ongoingContests = contests.filter((contest) => contest.status === 'open' || contest.status === 'judging').length;
    const approvedSubmissions = submissions.filter((submission) => submission.status === 'approved').length;
    const pendingInquiries = inquiries.filter((inquiry) => inquiry.status === 'pending').length;

    const roleDistribution = users.reduce(
      (acc, user) => {
        switch (user.role) {
          case 'participant':
            acc.participant += 1;
            break;
          case 'host':
            acc.host += 1;
            break;
          case 'judge':
            acc.judge += 1;
            break;
          case 'admin':
            acc.admin += 1;
            break;
          default:
            break;
        }
        return acc;
      },
      { participant: 0, host: 0, judge: 0, admin: 0 }
    );

    const usersById = new Map(users.map((user) => [user.id, user]));

    const recentActivities = [...activityLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((activity) => {
        const user = usersById.get(activity.userId);
        const userName = user?.name ?? '알 수 없음';
        const userInitial = userName.charAt(0) || '?';
        const actionLabel = actionLabelMap[activity.action] ?? `${activity.action} 작업을 수행했습니다`;
        const targetLabel = targetLabelMap[activity.targetType] ?? activity.targetType;

        return {
          id: activity.id,
          userName,
          userInitial,
          description: `${actionLabel} (${targetLabel} ${activity.targetId})`,
          timestamp: new Date(activity.createdAt).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      });

    return (
      <AdminDashboardContent
        data={{
          todayLabel: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          }),
          totalUsers: users.length,
          activeUsers,
          totalContests: contests.length,
          ongoingContests,
          totalSubmissions: submissions.length,
          approvedSubmissions,
          pendingInquiries,
          roleDistribution,
          recentActivities,
        }}
      />
    );
  } catch (error) {
    console.error('Failed to load admin dashboard data:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-red-600">관리자 대시보드 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
