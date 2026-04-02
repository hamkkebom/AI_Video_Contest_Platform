import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AdminDashboardContent } from '@/components/dashboard/admin-dashboard-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllActivityLogs, getContests, getInquiryCountByStatus, getSubmissions, getUsers } from '@/lib/data';
import { formatDate } from '@/lib/utils';

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

/**
 * 관리자 대시보드 페이지
 * - 통계 카드 + 차트: 캐시된 데이터로 즉시 렌더
 * - 활동 피드: Suspense로 독립 스트리밍 (체감 속도 개선)
 */
export default async function AdminDashboardPage() {
  try {
    // 통계 데이터: 모두 unstable_cache 적용 → 캐시 히트 시 즉시 반환
    const [users, contests, submissions, pendingInquiries] = await Promise.all([
      getUsers(),
      getContests(),
      getSubmissions(),
      getInquiryCountByStatus('pending'),
    ]);

    const activeUsers = users.filter((user) => user.status === 'active').length;
    const ongoingContests = contests.filter((contest) => contest.status === 'open' || contest.status === 'judging').length;
    const approvedSubmissions = submissions.filter((submission) => submission.status === 'approved').length;

    const roleDistribution = users.reduce(
      (acc, user) => {
        if (user.roles.includes('participant')) acc.participant += 1;
        if (user.roles.includes('host')) acc.host += 1;
        if (user.roles.includes('judge')) acc.judge += 1;
        if (user.roles.includes('admin')) acc.admin += 1;
        return acc;
      },
      { participant: 0, host: 0, judge: 0, admin: 0 }
    );

    return (
      <AdminDashboardContent
        data={{
          todayLabel: formatDate(new Date(), {
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
          recentActivities: [],
        }}
        activitySlot={
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <RecentActivitiesSection />
          </Suspense>
        }
      />
    );
  } catch {
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-2">
          <p className="text-lg font-semibold">대시보드를 불러올 수 없습니다</p>
          <p className="text-sm text-muted-foreground">일시적인 오류가 발생했습니다. 잠시 후 새로고침 해주세요.</p>
        </div>
      </div>
    );
  }
}

/** 활동 피드: 별도 서버 컴포넌트로 분리 → Suspense 스트리밍 */
async function RecentActivitiesSection() {
  let activityLogs;
  let users;
  try {
    [activityLogs, users] = await Promise.all([
      getAllActivityLogs(10),
      getUsers(),
    ]);
  } catch {
    return (
      <section>
        <Card className="border-border">
          <CardHeader>
            <CardTitle>최근 활동 피드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              활동 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const usersById = new Map(users.map((user) => [user.id, user]));

  const recentActivities = activityLogs
    .slice(0, 8)
    .map((activity) => {
      const user = usersById.get(activity.userId);
      const userName = user?.name ?? '알 수 없음';
      const userInitial = userName.charAt(0) || '?';
      const actionLabel = actionLabelMap[activity.action] ?? `${activity.action} 작업을 수행했습니다`;
      const targetLabel = targetLabelMap[activity.targetType as keyof typeof targetLabelMap] ?? activity.targetType;

      return {
        id: activity.id,
        userName,
        userInitial,
        description: `${actionLabel} (${targetLabel} ${activity.targetId})`,
        timestamp: formatDate(activity.createdAt, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });

  return (
    <section>
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>최근 활동 피드</CardTitle>
            <CardDescription>회원 행동 로그 기준 최신 8건</CardDescription>
          </div>
          <Link href="/admin/analytics">
            <Button variant="outline" size="sm" className="gap-1.5">
              활동 분석 <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              최근 활동 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-0">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 py-4">
                  <div className="relative flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {activity.userInitial}
                    </div>
                    {index < recentActivities.length - 1 ? (
                      <span className="mt-2 h-full w-px bg-border" aria-hidden="true" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1 border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium leading-relaxed">
                      <span className="font-semibold text-foreground">{activity.userName}</span>{' '}
                      <span className="text-muted-foreground">{activity.description}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

/** 활동 피드 로딩 스켈레톤 */
function ActivityFeedSkeleton() {
  return (
    <section>
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-28 rounded bg-muted animate-pulse" />
            <div className="h-4 w-44 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-8 w-24 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 border-b border-border pb-4">
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
