import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getContests, getSubmissions, getJudges } from '@/lib/mock';

/**
 * 주최자 대시보드 페이지
 * 호스트의 공모전 통계, 최근 공모전, 빠른 실행 버튼을 표시합니다.
 * 데모: user-2를 로그인한 호스트로 가정합니다.
 */
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

    const stats = [
      { label: '전체 공모전', value: hostContests.length, icon: '📋', accent: 'border-l-[#EA580C]' },
      { label: '총 접수작', value: hostSubmissions.length, icon: '🎬', accent: 'border-l-[#F59E0B]' },
      { label: '심사위원', value: hostJudges.length, icon: '⚖️', accent: 'border-l-[#8B5CF6]' },
      { label: '승인율', value: `${acceptanceRate}%`, icon: '✅', accent: 'border-l-green-500' },
    ];

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">주최자 대시보드</h1>
                <p className="text-muted-foreground">공모전 운영 현황을 한눈에 확인하세요</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/contests/new">
                  <Button className="bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold">
                    + 공모전 만들기
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10">
                    📊 분석 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 통계 카드 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
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
        </section>

        {/* 최근 공모전 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">최근 공모전</h2>
              <Link href="/dashboard/contests">
                <Button variant="ghost" className="text-[#EA580C] hover:text-[#C2540A]">전체 보기 →</Button>
              </Link>
            </div>

            {recentContests.length === 0 ? (
              <Card className="p-12 text-center border border-border">
                <p className="text-muted-foreground mb-4">아직 생성한 공모전이 없습니다</p>
                <Link href="/dashboard/contests/new">
                  <Button className="bg-[#EA580C] hover:bg-[#C2540A]">첫 공모전 만들기</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentContests.map((contest) => {
                  const contestSubs = hostSubmissions.filter((s) => s.contestId === contest.id);
                  const contestJudges = hostJudges.filter((j) => j.contestId === contest.id);
                  const statusInfo = statusLabelMap[contest.status] || { label: contest.status, color: 'bg-gray-100 text-gray-700' };

                  return (
                    <Card key={contest.id} className="p-4 border border-border hover:border-[#EA580C]/40 hover:shadow-sm transition-all">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <Link href={`/dashboard/contests/${contest.id}`} className="font-bold text-lg hover:text-[#EA580C] transition-colors truncate">
                              {contest.title}
                            </Link>
                            <Badge className={`${statusInfo.color} border-0 shrink-0`}>{statusInfo.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{contest.description}</p>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                          <div className="text-center">
                            <p className="font-bold text-foreground">{contestSubs.length}</p>
                            <p className="text-xs">접수작</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-foreground">{contestJudges.length}</p>
                            <p className="text-xs">심사위원</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-foreground">
                              {new Date(contest.submissionDeadline).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs">마감일</p>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <Link href={`/dashboard/contests/${contest.id}/edit`}>
                            <Button size="sm" variant="outline" className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10">수정</Button>
                          </Link>
                          <Link href={`/dashboard/contests/${contest.id}`}>
                            <Button size="sm" className="bg-[#8B5CF6] hover:bg-[#7C4DCC]">상세</Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 빠른 실행 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-6">빠른 실행</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/contests/new">
                <Card className="p-6 border border-border hover:border-[#EA580C] hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-center space-y-3">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">📝</span>
                    <p className="font-semibold">새 공모전 만들기</p>
                    <p className="text-xs text-muted-foreground">공모전을 생성하고 설정하세요</p>
                  </div>
                </Card>
              </Link>
              <Link href="/dashboard/contests">
                <Card className="p-6 border border-border hover:border-[#F59E0B] hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-center space-y-3">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">📋</span>
                    <p className="font-semibold">공모전 관리</p>
                    <p className="text-xs text-muted-foreground">공모전 목록을 확인하세요</p>
                  </div>
                </Card>
              </Link>
              <Link href="/dashboard/reports">
                <Card className="p-6 border border-border hover:border-[#8B5CF6] hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-center space-y-3">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">📊</span>
                    <p className="font-semibold">리포트 보기</p>
                    <p className="text-xs text-muted-foreground">운영 현황을 분석하세요</p>
                  </div>
                </Card>
              </Link>
              <Link href="/dashboard/analytics">
                <Card className="p-6 border border-border hover:border-green-500 hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-center space-y-3">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">📈</span>
                    <p className="font-semibold">분석 대시보드</p>
                    <p className="text-xs text-muted-foreground">상세 분석 데이터를 확인하세요</p>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">대시보드 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
