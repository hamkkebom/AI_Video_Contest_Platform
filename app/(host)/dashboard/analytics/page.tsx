import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getContests, getSubmissions } from '@/lib/mock';

/**
 * 주최자 분석 페이지
 * 호스트의 공모전 접수 현황을 표시합니다 (데모: user-2)
 * 무료: 총 접수작, 대기, 승인, 거절 수
 * 유료: 상세 분석 (잠금)
 */
export default async function HostAnalyticsPage() {
  try {
    const DEMO_HOST_ID = 'user-2';
    const [allContests, allSubmissions] = await Promise.all([
      getContests(),
      getSubmissions(),
    ]);

    const hostContests = allContests.filter((c) => c.hostId === DEMO_HOST_ID);
    const hostContestIds = new Set(hostContests.map((c) => c.id));
    const hostSubmissions = allSubmissions.filter((s) => hostContestIds.has(s.contestId));

    // 상태별 통계
    const pendingCount = hostSubmissions.filter((s) => s.status === 'pending_review').length;
    const approvedCount = hostSubmissions.filter((s) => s.status === 'approved').length;
    const rejectedCount = hostSubmissions.filter((s) => s.status === 'rejected' || s.status === 'auto_rejected').length;

    const freeStats = [
      { label: '총 접수작', value: hostSubmissions.length, icon: '📋', accent: 'border-l-[#EA580C]' },
      { label: '검수 대기', value: pendingCount, icon: '⏳', accent: 'border-l-[#F59E0B]' },
      { label: '승인됨', value: approvedCount, icon: '✅', accent: 'border-l-green-500' },
      { label: '거절됨', value: rejectedCount, icon: '❌', accent: 'border-l-red-500' },
    ];

    const paidStats = [
      { label: '참가자 분포', value: '분석 중...', icon: '👥', locked: true },
      { label: '채널별 성과', value: '분석 중...', icon: '📊', locked: true },
      { label: '상세 분석', value: '분석 중...', icon: '📈', locked: true },
    ];

    // 최근 공모전 (상세 통계)
    const recentContests = hostContests
      .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
      .slice(0, 5);

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      draft: { label: '초안', color: 'bg-gray-100 text-gray-700' },
      open: { label: '접수중', color: 'bg-green-100 text-green-700' },
      closed: { label: '마감', color: 'bg-yellow-100 text-yellow-700' },
      judging: { label: '심사중', color: 'bg-blue-100 text-blue-700' },
      completed: { label: '완료', color: 'bg-purple-100 text-purple-700' },
    };

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl font-bold mb-2">주최자 분석</h1>
            <p className="text-muted-foreground">
              공모전 접수 현황과 성과를 분석하세요
            </p>
          </div>
        </section>

        {/* 무료 섹션 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">무료 분석</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {freeStats.map((stat) => (
                  <Card
                    key={stat.label}
                    className={`p-6 border border-border border-l-4 ${stat.accent} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* 공모전별 접수 현황 */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">공모전별 접수 현황</h3>
              {recentContests.length === 0 ? (
                <Card className="p-8 text-center border border-border">
                  <p className="text-muted-foreground mb-4">아직 생성한 공모전이 없습니다</p>
                  <Button className="bg-[#EA580C] hover:bg-[#C2540A]">
                    첫 공모전 만들기
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentContests.map((contest) => {
                    const contestSubs = hostSubmissions.filter((s) => s.contestId === contest.id);
                    const contestPending = contestSubs.filter((s) => s.status === 'pending_review').length;
                    const contestApproved = contestSubs.filter((s) => s.status === 'approved').length;
                    const contestRejected = contestSubs.filter((s) => s.status === 'rejected' || s.status === 'auto_rejected').length;
                    const statusInfo = statusLabelMap[contest.status] || { label: contest.status, color: 'bg-gray-100 text-gray-700' };

                    return (
                      <Card key={contest.id} className="p-4 border border-border hover:border-[#EA580C]/40 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-lg hover:text-[#EA580C] transition-colors truncate">
                                {contest.title}
                              </h4>
                              <Badge className={`${statusInfo.color} border-0 shrink-0`}>{statusInfo.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{contest.description}</p>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                            <div className="text-center">
                              <p className="font-bold text-foreground">{contestSubs.length}</p>
                              <p className="text-xs">총 접수</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-yellow-600">{contestPending}</p>
                              <p className="text-xs">대기</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-green-600">{contestApproved}</p>
                              <p className="text-xs">승인</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-red-600">{contestRejected}</p>
                              <p className="text-xs">거절</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 유료 섹션 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-6">프리미엄 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paidStats.map((stat) => (
                <Card
                  key={stat.label}
                  className="p-6 border border-border border-l-4 border-l-[#8B5CF6] hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent pointer-events-none" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-muted-foreground">{stat.value}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-lg">🔒</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 프리미엄 CTA */}
            <Card className="mt-8 p-8 border border-[#8B5CF6]/30 bg-gradient-to-r from-[#8B5CF6]/5 to-[#EA580C]/5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">프리미엄 분석으로 더 깊이 있는 인사이트를 얻으세요</h3>
                  <p className="text-muted-foreground">
                    참가자 분포, 채널별 성과, 상세 분석 등 프리미엄 기능을 이용할 수 있습니다.
                  </p>
                </div>
                <Button className="bg-[#8B5CF6] hover:bg-[#7C4DCC] text-white font-semibold shrink-0">
                  출시 시 알림 받기
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load analytics:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">분석 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
