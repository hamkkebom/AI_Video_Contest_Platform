import { JudgeSubmissionContent } from '@/components/dashboard/judge-submission-content';
import {
  getAuthProfile,
  getJudgeAssignments,
  getContestById,
  getContestTemplate,
  getJudgingStages,
  getSimpleJudgments,
  getScoresByContest,
  getSubmissions,
} from '@/lib/data';
import { redirect } from 'next/navigation';

type JudgeSubmissionPageProps = {
  params: Promise<{ contestId: string; submissionId: string }>;
};

export default async function JudgeSubmissionPage({ params }: JudgeSubmissionPageProps) {
  const { contestId, submissionId } = await params;
  const profile = await getAuthProfile();
  if (!profile) redirect(`/login?redirect=/judging/${contestId}/${submissionId}`);

  try {

    const [contest, contestSubmissions, contestScores, judgeAssignments] = await Promise.all([
      getContestById(contestId),
      getSubmissions({ contestId }),
      getScoresByContest(contestId),
      getJudgeAssignments(profile.id),
    ]);

    const submission = contestSubmissions.find((item) => item.id === submissionId);

    if (!contest || !submission) {
      return (
        <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-muted-foreground">심사 대상을 찾을 수 없습니다.</p>
        </div>
      );
    }

    // 심사 단계 조회
    const stages = await getJudgingStages(contestId);
    const activeStage = stages.find((s) => s.isActive) ?? stages[0];

    // 간편 심사 단계: 기존 판정 조회
    let existingJudgment: 'pass' | 'fail' | 'hold' | undefined;
    if (activeStage?.method === 'simple') {
      const currentJudgeAssignment = judgeAssignments.find((j) => j.contestId === contestId);
      if (currentJudgeAssignment) {
        const allJudgments = await getSimpleJudgments(activeStage.id);
        const myJudgment = allJudgments.find(
          (j) => j.judgeId === currentJudgeAssignment.id && j.submissionId === submissionId
        );
        existingJudgment = myJudgment?.judgment;
      }
    }

    // 점수 심사 템플릿 조회
    const chosenTemplate = activeStage?.method === 'scored'
      ? (activeStage.template ?? await getContestTemplate(contestId))
      : await getContestTemplate(contestId);

    if (!chosenTemplate && activeStage?.method === 'scored') {
      return (
        <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center space-y-2">
          <p className="text-lg font-semibold">심사 기준이 설정되지 않았습니다</p>
          <p className="text-sm text-muted-foreground">관리자에게 공모전 심사 기준 설정을 요청해주세요.</p>
        </div>
      );
    }

    const currentJudgeAssignments = judgeAssignments.filter((judge) => judge.contestId === contestId);
    const currentJudgeIdSet = new Set(currentJudgeAssignments.map((judge) => judge.id));

    const submissionScores = contestScores.filter((score) => score.submissionId === submission.id);
    const currentJudgeScore = submissionScores
      .filter((score) => currentJudgeIdSet.has(score.judgeId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const templateForComponent = chosenTemplate ?? {
      id: 'simple',
      name: activeStage?.name ?? '간편 심사',
      description: '',
      criteria: [],
      createdAt: new Date().toISOString(),
    };

    const criteriaAverages = templateForComponent.criteria.map((criterion) => {
      const values = submissionScores
        .map((score) => score.criteriaScores.find((item) => item.criterionId === criterion.id)?.score)
        .filter((value): value is number => typeof value === 'number');

      const averageScore = values.length > 0 ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : 0;

      return {
        criterionId: criterion.id,
        criterion: criterion.label,
        averageScore,
        maxScore: criterion.maxScore,
      };
    });

    return (
      <JudgeSubmissionContent
        data={{
          contest,
          submission,
          template: templateForComponent,
          currentJudgeScore: currentJudgeScore ?? null,
          criteriaAverages,
          scoreCount: submissionScores.length,
          stage: activeStage,
          existingJudgment,
        }}
      />
    );
  } catch (error) {
    console.error('Failed to load submission judging page:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-red-600">출품작 심사 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }
}
