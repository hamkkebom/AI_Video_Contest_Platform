import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getContests, getSubmissions, getJudges, getUsers } from '@/lib/mock';

type ContestDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * 공모전 상세 페이지 (주최자 관점)
 * 공모전 정보, 접수 통계, 심사위원 현황, 액션 버튼을 표시합니다.
 */
export default async function HostContestDetailPage({ params }: ContestDetailPageProps) {
  try {
    const { id } = await params;
    const [allContests, allSubmissions, allJudges, allUsers] = await Promise.all([
      getContests(),
      getSubmissions(),
      getJudges(),
      getUsers(),
    ]);

    const contest = allContests.find((item) => item.id === id);

    if (!contest) {
      return (
        <div className="w-full py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center space-y-4">
            <span className="text-5xl block">🔍</span>
            <h1 className="text-2xl font-bold">공모전을 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">ID: {id}</p>
            <Link href="/dashboard/contests">
              <Button className="bg-[#EA580C] hover:bg-[#C2540A]">목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      );
    }

    const submissions = allSubmissions.filter((s) => s.contestId === id);
    const judges = allJudges.filter((j) => j.contestId === id);
    const host = allUsers.find((u) => u.id === contest.hostId);

    // 접수 상태별 카운트
    const subsByStatus = {
      pending_review: submissions.filter((s) => s.status === 'pending_review').length,
      approved: submissions.filter((s) => s.status === 'approved').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
      auto_rejected: submissions.filter((s) => s.status === 'auto_rejected').length,
      judging: submissions.filter((s) => s.status === 'judging').length,
      judged: submissions.filter((s) => s.status === 'judged').length,
    };

    // 심사위원 상태
    const judgesAccepted = judges.filter((j) => j.acceptedAt).length;
    const judgesInvited = judges.length - judgesAccepted;

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      draft: { label: '초안', color: 'bg-gray-100 text-gray-700' },
      open: { label: '접수중', color: 'bg-green-100 text-green-700' },
      closed: { label: '마감', color: 'bg-yellow-100 text-yellow-700' },
      judging: { label: '심사중', color: 'bg-blue-100 text-blue-700' },
      completed: { label: '완료', color: 'bg-purple-100 text-purple-700' },
    };

    const statusInfo = statusLabelMap[contest.status] || { label: contest.status, color: 'bg-gray-100 text-gray-700' };

    const judgingTypeLabel =
      contest.judgingType === 'internal' ? '내부 심사' : contest.judgingType === 'external' ? '외부 심사' : '내부 + 외부 병행';

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/dashboard" className="hover:text-[#EA580C]">대시보드</Link>
              <span>/</span>
              <Link href="/dashboard/contests" className="hover:text-[#EA580C]">공모전</Link>
              <span>/</span>
              <span className="text-foreground">{contest.title}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{contest.title}</h1>
                  <Badge className={`${statusInfo.color} border-0 text-sm`}>{statusInfo.label}</Badge>
                </div>
                <p className="text-muted-foreground max-w-2xl">{contest.description}</p>
                {host && (
                  <p className="text-sm text-muted-foreground mt-2">
                    주최: <span className="font-medium text-foreground">{host.name}</span>
                    {host.companyName && ` (${host.companyName})`}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/dashboard/contests/${id}/edit`}>
                  <Button variant="outline" className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10">
                    수정
                  </Button>
                </Link>
                <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 접수 통계 카드 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-xl font-bold mb-4">접수 현황</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: '검수대기', count: subsByStatus.pending_review, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                { label: '승인', count: subsByStatus.approved, color: 'text-green-600', bg: 'bg-green-50' },
                { label: '반려', count: subsByStatus.rejected, color: 'text-red-600', bg: 'bg-red-50' },
                { label: '자동반려', count: subsByStatus.auto_rejected, color: 'text-red-500', bg: 'bg-red-50' },
                { label: '심사중', count: subsByStatus.judging, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: '심사완료', count: subsByStatus.judged, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((item) => (
                <Card key={item.label} className={`p-4 border border-border ${item.bg}`}>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 심사위원 & 공모전 정보 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 심사위원 현황 */}
              <Card className="p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">심사위원</h2>
                  <Link href={`/dashboard/contests/${id}/judges`}>
                    <Button size="sm" variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10">
                      관리 →
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{judgesAccepted}</p>
                    <p className="text-xs text-muted-foreground mt-1">수락</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{judgesInvited}</p>
                    <p className="text-xs text-muted-foreground mt-1">초대 대기</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  총 {judges.length}명의 심사위원이 배정되어 있습니다
                </p>
              </Card>

              {/* 공모전 정보 */}
              <Card className="p-6 border border-border">
                <h2 className="text-xl font-bold mb-4">공모전 정보</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">시작일</span>
                    <span className="font-medium">{new Date(contest.startAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">종료일</span>
                    <span className="font-medium">{new Date(contest.endAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">접수 마감</span>
                    <span className="font-medium">{new Date(contest.submissionDeadline).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">심사 유형</span>
                    <span className="font-medium">{judgingTypeLabel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">검수 정책</span>
                    <span className="font-medium">{contest.reviewPolicy === 'manual' ? '수동 검수' : '자동 후 수동'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">인당 최대 출품</span>
                    <span className="font-medium">{contest.maxSubmissionsPerUser}개</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">지역</span>
                    <span className="font-medium">{contest.region}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 빠른 액션 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-xl font-bold mb-4">빠른 액션</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href={`/dashboard/contests/${id}/submissions`}>
                <Card className="p-5 border border-border hover:border-[#EA580C] hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">📬</span>
                    <div>
                      <p className="font-semibold">접수작 관리</p>
                      <p className="text-xs text-muted-foreground">{submissions.length}개 접수작 검토</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href={`/dashboard/contests/${id}/judges`}>
                <Card className="p-5 border border-border hover:border-[#8B5CF6] hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">⚖️</span>
                    <div>
                      <p className="font-semibold">심사위원 관리</p>
                      <p className="text-xs text-muted-foreground">{judges.length}명 배정됨</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href={`/dashboard/contests/${id}/edit`}>
                <Card className="p-5 border border-border hover:border-[#F59E0B] hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">✏️</span>
                    <div>
                      <p className="font-semibold">공모전 수정</p>
                      <p className="text-xs text-muted-foreground">설정 및 정보 변경</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load contest detail:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">공모전 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
