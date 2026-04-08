import { JudgeSubmissionContent } from '@/components/dashboard/judge-submission-content';
import {
  getAuthProfile,
  getJudgeAssignments,
  getContestById,
  getContestTemplate,
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

    // 단건/필터 조회로 최적화
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

    // 공모전별 심사 기준 → judging_templates 자동 동기화
    const chosenTemplate = await getContestTemplate(contestId);

    if (!chosenTemplate) {
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

    const criteriaAverages = chosenTemplate.criteria.map((criterion) => {
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
          template: chosenTemplate,
          currentJudgeScore: currentJudgeScore ?? null,
          criteriaAverages,
          scoreCount: submissionScores.length,
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
