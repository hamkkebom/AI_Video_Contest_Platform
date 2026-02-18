import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getContests, getJudges, getSubmissions, getScores } from '@/lib/mock';

/**
 * 심사위원 배정 공모전 목록 페이지
 * 심사위원에게 배정된 공모전 목록과 심사 진행 상황을 표시합니다.
 * 데모: user-3을 로그인한 심사위원으로 가정합니다.
 */
export default async function JudgeContestsPage() {
  try {
    const DEMO_JUDGE_USER_ID = 'user-3';

    const [allContests, allJudges, allSubmissions, allScores] = await Promise.all([
      getContests(),
      getJudges(),
      getSubmissions(),
      getScores(),
    ]);

    // 현재 심사위원에게 배정된 공모전 찾기
    const judgeAssignments = allJudges.filter((j) => j.userId === DEMO_JUDGE_USER_ID);
    const assignedContestIds = new Set(judgeAssignments.map((j) => j.contestId));
    const assignedContests = allContests.filter((c) => assignedContestIds.has(c.id));

    // 각 공모전별 심사 진행 상황 계산
    const contestProgress = assignedContests.map((contest) => {
      const contestSubmissions = allSubmissions.filter((s) => s.contestId === contest.id);
      const contestScores = allScores.filter((score) => {
        const judgeAssignment = judgeAssignments.find((j) => j.contestId === contest.id);
        return judgeAssignment && score.judgeId === judgeAssignment.id;
      });

      const progressPercent =
        contestSubmissions.length > 0
          ? Math.round((contestScores.length / contestSubmissions.length) * 100)
          : 0;

      return {
        contest,
        submissionCount: contestSubmissions.length,
        scoredCount: contestScores.length,
        progressPercent,
      };
    });

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      draft: { label: '초안', color: 'bg-gray-100 text-gray-700' },
      open: { label: '접수중', color: 'bg-green-100 text-green-700' },
      closed: { label: '마감', color: 'bg-yellow-100 text-yellow-700' },
      judging: { label: '심사중', color: 'bg-blue-100 text-blue-700' },
      completed: { label: '완료', color: 'bg-purple-100 text-purple-700' },
    };

    const stats = [
      { label: '배정된 공모전', value: assignedContests.length, icon: '📋', accent: 'border-l-[#EA580C]' },
      { label: '총 심사 대상', value: contestProgress.reduce((sum, cp) => sum + cp.submissionCount, 0), icon: '🎬', accent: 'border-l-[#F59E0B]' },
      { label: '완료된 심사', value: contestProgress.reduce((sum, cp) => sum + cp.scoredCount, 0), icon: '✅', accent: 'border-l-[#8B5CF6]' },
    ];

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">배정된 공모전</h1>
                <p className="text-muted-foreground">심사 대상 공모전 목록과 진행 상황을 확인하세요</p>
              </div>
            </div>
          </div>
        </section>

        {/* 통계 카드 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* 공모전 목록 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-6">심사 공모전</h2>

            {contestProgress.length === 0 ? (
              <Card className="p-12 text-center border border-border">
                <p className="text-muted-foreground mb-4">배정된 공모전이 없습니다</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {contestProgress.map(({ contest, submissionCount, scoredCount, progressPercent }) => {
                  const statusInfo = statusLabelMap[contest.status] || { label: contest.status, color: 'bg-gray-100 text-gray-700' };

                  return (
                    <Card key={contest.id} className="p-6 border border-border hover:border-[#EA580C]/40 hover:shadow-sm transition-all">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg hover:text-[#EA580C] transition-colors truncate">
                                {contest.title}
                              </h3>
                              <Badge className={`${statusInfo.color} border-0 shrink-0`}>{statusInfo.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{contest.description}</p>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                            <div className="text-center">
                              <p className="font-bold text-foreground">{submissionCount}</p>
                              <p className="text-xs">심사 대상</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-foreground">{scoredCount}</p>
                              <p className="text-xs">완료</p>
                            </div>
                          </div>
                        </div>

                        {/* 진행률 바 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">심사 진행률</span>
                            <span className="font-semibold text-[#EA580C]">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#EA580C] transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-2 justify-end">
                          <Link href={`/judging/${contest.id}`}>
                            <Button className="bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold">
                              심사 시작 →
                            </Button>
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
      </div>
    );
  } catch (error) {
    console.error('Failed to load judging contests:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">심사 공모전 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
