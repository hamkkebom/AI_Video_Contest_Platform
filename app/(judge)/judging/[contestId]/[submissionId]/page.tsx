import { JudgeSubmissionContent } from '@/components/dashboard/judge-submission-content';
import { getContests, getJudges, getJudgingTemplates, getScores, getSubmissions } from '@/lib/mock';

type JudgeSubmissionPageProps = {
  params: Promise<{ contestId: string; submissionId: string }>;
};

export default async function JudgeSubmissionPage({ params }: JudgeSubmissionPageProps) {
  try {
    const DEMO_JUDGE_USER_ID = 'user-3';
    const { contestId, submissionId } = await params;

    const [allContests, allSubmissions, allScores, allJudges, templates] = await Promise.all([
      getContests(),
      getSubmissions(),
      getScores(),
      getJudges(),
      getJudgingTemplates(),
    ]);

    const contest = allContests.find((item) => item.id === contestId);
    const submission = allSubmissions.find((item) => item.id === submissionId && item.contestId === contestId);

    if (!contest || !submission) {
      return (
        <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-muted-foreground">심사 대상을 찾을 수 없습니다.</p>
        </div>
      );
    }

    const contestJudges = allJudges.filter((judge) => judge.contestId === contestId);
    const currentJudgeAssignments = contestJudges.filter((judge) => judge.userId === DEMO_JUDGE_USER_ID);
    const currentJudgeIdSet = new Set(currentJudgeAssignments.map((judge) => judge.id));

    const submissionScores = allScores.filter((score) => score.submissionId === submission.id);
    const currentJudgeScore = submissionScores
      .filter((score) => currentJudgeIdSet.has(score.judgeId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const templateById = templates.reduce<Record<string, (typeof templates)[number]>>((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {});

    const contestNumber = Number(contest.id.replace('contest-', '')) || 1;
    const fallbackTemplate = templates[(contestNumber - 1) % templates.length] ?? templates[0];
    const chosenTemplate =
      (currentJudgeScore ? templateById[currentJudgeScore.templateId] : undefined) ??
      (submissionScores.length > 0 ? templateById[submissionScores[0].templateId] : undefined) ??
      fallbackTemplate;

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
