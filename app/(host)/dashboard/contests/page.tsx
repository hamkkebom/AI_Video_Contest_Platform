import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getContests, getSubmissions, getJudges } from '@/lib/mock';

/**
 * 주최자 공모전 목록 페이지
 * 호스트의 전체 공모전 목록을 그리드로 표시합니다.
 * 상태별 필터 및 정렬 버튼을 제공합니다.
 * 데모: user-2를 로그인한 호스트로 가정합니다.
 */
export default async function HostContestsPage() {
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

    const statusLabelMap: Record<string, { label: string; color: string; dotColor: string }> = {
      draft: { label: '초안', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
      open: { label: '접수중', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
      closed: { label: '마감', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500' },
      judging: { label: '심사중', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
      completed: { label: '완료', color: 'bg-purple-100 text-purple-700', dotColor: 'bg-purple-500' },
    };

    // 상태별 카운트
    const statusCounts = {
      all: hostContests.length,
      open: hostContests.filter((c) => c.status === 'open').length,
      closed: hostContests.filter((c) => c.status === 'closed').length,
      judging: hostContests.filter((c) => c.status === 'judging').length,
      completed: hostContests.filter((c) => c.status === 'completed').length,
    };

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">내 공모전</h1>
                <p className="text-muted-foreground">
                  총 {hostContests.length}개의 공모전을 관리하고 있습니다
                </p>
              </div>
              <Link href="/dashboard/contests/new">
                <Button className="bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold">
                  + 새 공모전
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 필터 & 정렬 */}
        <section className="py-4 px-4 bg-background border-b border-border sticky top-16 z-40">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="border-[#EA580C] text-[#EA580C] font-semibold">
                  전체 ({statusCounts.all})
                </Button>
                <Button variant="ghost" size="sm">접수중 ({statusCounts.open})</Button>
                <Button variant="ghost" size="sm">마감 ({statusCounts.closed})</Button>
                <Button variant="ghost" size="sm">심사중 ({statusCounts.judging})</Button>
                <Button variant="ghost" size="sm">완료 ({statusCounts.completed})</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-[#8B5CF6]">최신순</Button>
                <Button variant="ghost" size="sm">마감순</Button>
                <Button variant="ghost" size="sm">접수작순</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 공모전 그리드 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            {hostContests.length === 0 ? (
              <Card className="p-12 text-center border border-border">
                <div className="space-y-4">
                  <span className="text-5xl block">📋</span>
                  <p className="text-muted-foreground">아직 생성한 공모전이 없습니다</p>
                  <Link href="/dashboard/contests/new">
                    <Button className="bg-[#EA580C] hover:bg-[#C2540A]">첫 공모전 만들기</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostContests.map((contest) => {
                  const contestSubs = hostSubmissions.filter((s) => s.contestId === contest.id);
                  const contestJudges = hostJudges.filter((j) => j.contestId === contest.id);
                  const statusInfo = statusLabelMap[contest.status] || {
                    label: contest.status,
                    color: 'bg-gray-100 text-gray-700',
                    dotColor: 'bg-gray-400',
                  };

                  return (
                    <Card
                      key={contest.id}
                      className="border border-border overflow-hidden hover:shadow-lg hover:border-[#EA580C]/40 transition-all flex flex-col"
                    >
                      {/* 헤더 영역 */}
                      <div className="bg-gradient-to-br from-[#EA580C]/15 to-[#8B5CF6]/15 p-5 relative">
                        <div className="absolute top-3 right-3">
                          <Badge className={`${statusInfo.color} border-0`}>{statusInfo.label}</Badge>
                        </div>
                        <Link
                          href={`/dashboard/contests/${contest.id}`}
                          className="font-bold text-lg line-clamp-2 hover:text-[#EA580C] transition-colors block pr-16"
                        >
                          {contest.title}
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {contest.description}
                        </p>
                      </div>

                      {/* 통계 */}
                      <div className="p-4 flex-1">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-lg font-bold text-[#EA580C]">{contestSubs.length}</p>
                            <p className="text-xs text-muted-foreground">접수작</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-lg font-bold text-[#8B5CF6]">{contestJudges.length}</p>
                            <p className="text-xs text-muted-foreground">심사위원</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-lg font-bold text-[#F59E0B]">
                              {new Date(contest.submissionDeadline).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-muted-foreground">마감일</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>심사: {contest.judgingType === 'internal' ? '내부' : contest.judgingType === 'external' ? '외부' : '병행'}</span>
                          <span>·</span>
                          <span>{contest.region}</span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="p-4 border-t border-border flex gap-2">
                        <Link href={`/dashboard/contests/${contest.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10">
                            수정
                          </Button>
                        </Link>
                        <Link href={`/dashboard/contests/${contest.id}`} className="flex-1">
                          <Button size="sm" className="w-full bg-[#8B5CF6] hover:bg-[#7C4DCC]">
                            상세
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3">
                          삭제
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load contests:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">공모전 목록을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
