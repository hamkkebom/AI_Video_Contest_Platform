import { JudgeContestContent } from '@/components/dashboard/judge-contest-content';
import {
  getAuthProfile,
  getJudgeAssignments,
  getContestById,
  getContestTemplate,
  getJudgingStages,
  getSimpleJudgments,
  getScoresByContest,
  getSubmissions,
  getSubmissionsForStage,
} from '@/lib/data';
import { redirect } from 'next/navigation';

type JudgeContestPageProps = {
  params: Promise<{ contestId: string }>;
};

export default async function JudgeContestPage({ params }: JudgeContestPageProps) {
  const { contestId } = await params;
  const profile = await getAuthProfile();
  if (!profile) redirect(`/login?redirect=/judging/${contestId}`);

  try {

    // 단건/필터 조회로 최적화 (전체 조회 제거)
    const [contest, contestSubmissions, contestScores, judgeAssignments] = await Promise.all([
      getContestById(contestId),
      getSubmissions({ contestId }),
      getScoresByContest(contestId),
      getJudgeAssignments(profile.id),
    ]);

    if (!contest) {
      return (
        <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-muted-foreground">존재하지 않는 공모전입니다.</p>
        </div>
      );
    }

    // 심사 단계 조회
    const stages = await getJudgingStages(contestId);
    const activeStage = stages.find((s) => s.isActive) ?? stages[0];

    // 활성 단계의 심사 대상 출품작 조회
    let stageSubmissions = contestSubmissions;
    if (activeStage) {
      stageSubmissions = await getSubmissionsForStage(contestId, activeStage.id, activeStage.stageNumber);
    }

    // 점수 심사 단계: 템플릿 조회
    const selectedTemplate = activeStage?.method === 'scored'
      ? (activeStage.template ?? await getContestTemplate(contestId))
      : await getContestTemplate(contestId);

    // 간편 심사 단계: 기존 판정 조회
    let existingJudgments: Record<string, 'pass' | 'fail' | 'hold'> = {};
    if (activeStage?.method === 'simple') {
      const currentJudgeAssignment = judgeAssignments.find((j) => j.contestId === contest.id);
      if (currentJudgeAssignment) {
        const allJudgments = await getSimpleJudgments(activeStage.id);
        for (const j of allJudgments) {
          if (j.judgeId === currentJudgeAssignment.id) {
            existingJudgments[j.submissionId] = j.judgment;
          }
        }
      }
    }

    if (!selectedTemplate && activeStage?.method === 'scored') {
      return (
        <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center space-y-2">
          <p className="text-lg font-semibold">심사 기준이 설정되지 않았습니다</p>
          <p className="text-sm text-muted-foreground">관리자에게 공모전 심사 기준 설정을 요청해주세요.</p>
        </div>
      );
    }

    const currentJudgeAssignments = judgeAssignments.filter((judge) => judge.contestId === contest.id);
    const currentJudgeIdSet = new Set(currentJudgeAssignments.map((judge) => judge.id));

    const currentJudgeScores = contestScores.filter((score) => currentJudgeIdSet.has(score.judgeId));

    const scoreDistributionRanges = [
      { label: '0-20', min: 0, max: 20 },
      { label: '21-40', min: 21, max: 40 },
      { label: '41-60', min: 41, max: 60 },
      { label: '61-80', min: 61, max: 80 },
      { label: '81-100', min: 81, max: 100 },
    ];

    const scoreDistribution = scoreDistributionRanges.map((range) => ({
      range: range.label,
      count: contestScores.filter((score) => score.total >= range.min && score.total <= range.max).length,
    }));

    const scoreBySubmissionId = currentJudgeScores.reduce<Record<string, (typeof currentJudgeScores)[number]>>(
      (acc, score) => {
        const existing = acc[score.submissionId];
        if (!existing || new Date(existing.createdAt).getTime() < new Date(score.createdAt).getTime()) {
          acc[score.submissionId] = score;
        }
        return acc;
      },
      {}
    );

    // 간편 심사일 때 template이 없으면 더미 생성 (컴포넌트 렌더링용)
    const templateForComponent = selectedTemplate ?? {
      id: 'simple',
      name: activeStage?.name ?? '간편 심사',
      description: '',
      criteria: [],
      createdAt: new Date().toISOString(),
    };

    return (
      <JudgeContestContent
        data={{
          contest,
          submissions: stageSubmissions,
          template: templateForComponent,
          scoreDistribution,
          scoreBySubmissionId,
          stage: activeStage,
          existingJudgments,
        }}
      />
    );
  } catch (error) {
    console.error('Failed to load contest judging page:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-red-600">공모전 심사 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }
}
