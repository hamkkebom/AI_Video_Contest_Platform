import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { REVIEW_TABS } from '@/config/constants';
import { getSubmissions, getContests, getUsers } from '@/lib/mock';
import type { SubmissionStatus } from '@/lib/types';

type ContestSubmissionsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

/**
 * 접수작 관리 페이지
 * 6개 상태 탭으로 접수작을 분류하여 표시합니다.
 * URL searchParams로 탭 전환을 구현합니다 (서버 컴포넌트).
 */
export default async function HostContestSubmissionsPage({ params, searchParams }: ContestSubmissionsPageProps) {
  try {
    const { id } = await params;
    const { tab: activeTab = 'pending_review' } = await searchParams;

    const [allSubmissions, allContests, allUsers] = await Promise.all([
      getSubmissions({ contestId: id }),
      getContests(),
      getUsers(),
    ]);

    const contest = allContests.find((c) => c.id === id);
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    // 상태별 카운트
    const countByStatus: Record<string, number> = {};
    for (const tab of REVIEW_TABS) {
      countByStatus[tab.value] = allSubmissions.filter((s) => s.status === tab.value).length;
    }

    // 현재 탭의 접수작
    const filteredSubmissions = allSubmissions.filter(
      (s) => s.status === (activeTab as SubmissionStatus)
    );

    // 탭별 색상 매핑
    const tabColorMap: Record<string, { bg: string; text: string; activeBg: string; activeBorder: string }> = {
      pending_review: { bg: 'bg-yellow-50', text: 'text-yellow-700', activeBg: 'bg-yellow-100', activeBorder: 'border-b-yellow-500' },
      approved: { bg: 'bg-green-50', text: 'text-green-700', activeBg: 'bg-green-100', activeBorder: 'border-b-green-500' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', activeBg: 'bg-red-100', activeBorder: 'border-b-red-500' },
      auto_rejected: { bg: 'bg-red-50', text: 'text-red-600', activeBg: 'bg-red-100', activeBorder: 'border-b-red-400' },
      judging: { bg: 'bg-blue-50', text: 'text-blue-700', activeBg: 'bg-blue-100', activeBorder: 'border-b-blue-500' },
      judged: { bg: 'bg-purple-50', text: 'text-purple-700', activeBg: 'bg-purple-100', activeBorder: 'border-b-purple-500' },
    };

    const statusBadgeMap: Record<string, { bg: string; text: string; label: string }> = {
      pending_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '검수대기' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: '승인' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '반려' },
      auto_rejected: { bg: 'bg-red-100', text: 'text-red-700', label: '자동반려' },
      judging: { bg: 'bg-blue-100', text: 'text-blue-800', label: '심사중' },
      judged: { bg: 'bg-purple-100', text: 'text-purple-800', label: '심사완료' },
    };

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/dashboard" className="hover:text-[#EA580C]">대시보드</Link>
              <span>/</span>
              <Link href="/dashboard/contests" className="hover:text-[#EA580C]">공모전</Link>
              <span>/</span>
              <Link href={`/dashboard/contests/${id}`} className="hover:text-[#EA580C]">
                {contest?.title ?? id}
              </Link>
              <span>/</span>
              <span className="text-foreground">접수작 관리</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">접수작 관리</h1>
            <p className="text-muted-foreground">
              총 {allSubmissions.length}개의 접수작 · {contest?.title}
            </p>
          </div>
        </section>

        {/* 6-탭 인터페이스 */}
        <section className="px-4 bg-background border-b border-border sticky top-16 z-40">
          <div className="container mx-auto max-w-6xl">
            <div className="flex overflow-x-auto gap-0 -mb-px">
              {REVIEW_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                const colors = tabColorMap[tab.value] || tabColorMap.pending_review;
                return (
                  <Link
                    key={tab.value}
                    href={`/dashboard/contests/${id}/submissions?tab=${tab.value}`}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      isActive
                        ? `${colors.activeBorder} ${colors.text} ${colors.activeBg}`
                        : 'border-b-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isActive ? `${colors.bg} ${colors.text}` : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {countByStatus[tab.value] ?? 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 접수작 목록 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            {filteredSubmissions.length === 0 ? (
              <Card className="p-12 text-center border border-border">
                <span className="text-4xl block mb-4">📭</span>
                <p className="text-muted-foreground">
                  {REVIEW_TABS.find((t) => t.value === activeTab)?.label ?? activeTab} 상태의 접수작이 없습니다
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubmissions.map((submission) => {
                  const creator = usersMap.get(submission.userId);
                  const badgeInfo = statusBadgeMap[submission.status] || statusBadgeMap.pending_review;

                  return (
                    <Card
                      key={submission.id}
                      className="border border-border overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* 썸네일 */}
                      <div className="relative w-full h-40 bg-gradient-to-br from-[#EA580C]/10 to-[#8B5CF6]/10 overflow-hidden">
                        <img
                          src={submission.thumbnailUrl}
                          alt={submission.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={`${badgeInfo.bg} ${badgeInfo.text} border-0`}>
                            {badgeInfo.label}
                          </Badge>
                        </div>
                      </div>

                      {/* 정보 */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-lg line-clamp-1">{submission.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {submission.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">제출자:</span>
                          <span className="font-medium">{creator?.name ?? '알 수 없음'}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border">
                          <span>👁️ {submission.views}</span>
                          <span>❤️ {submission.likeCount}</span>
                          <span className="ml-auto">
                            {new Date(submission.submittedAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>

                        {submission.autoRejectedReason && (
                          <div className="bg-red-50 text-red-700 text-xs p-2 rounded">
                            사유: {submission.autoRejectedReason}
                          </div>
                        )}

                        {/* 액션 버튼 */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                          >
                            상세보기
                          </Button>
                          {(activeTab === 'pending_review' || activeTab === 'auto_rejected') && (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                승인
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-red-400 text-red-600 hover:bg-red-50"
                              >
                                반려
                              </Button>
                            </>
                          )}
                        </div>
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
    console.error('Failed to load submissions:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">접수작 목록을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
