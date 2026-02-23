import { JudgeContestContent } from '@/components/dashboard/judge-contest-content';
import { getContests, getJudges, getJudgingTemplates, getScores, getSubmissions } from '@/lib/mock';

type JudgeContestPageProps = {
  params: Promise<{ contestId: string }>;
};

export default async function JudgeContestPage({ params }: JudgeContestPageProps) {
  try {
    const DEMO_JUDGE_USER_ID = 'user-3';
    const { contestId } = await params;

    const [allContests, allSubmissions, allScores, allJudges, templates] = await Promise.all([
      getContests(),
      getSubmissions(),
      getScores(),
      getJudges(),
      getJudgingTemplates(),
    ]);

    const contest = allContests.find((item) => item.id === contestId);
    if (!contest) {
      return (
        <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-muted-foreground">존재하지 않는 공모전입니다.</p>
        </div>
      );
    }

    const contestSubmissions = allSubmissions.filter((submission) => submission.contestId === contest.id);
    const submissionIdSet = new Set(contestSubmissions.map((submission) => submission.id));

    const contestJudges = allJudges.filter((judge) => judge.contestId === contest.id);
    const currentJudgeAssignments = contestJudges.filter((judge) => judge.userId === DEMO_JUDGE_USER_ID);
    const currentJudgeIdSet = new Set(currentJudgeAssignments.map((judge) => judge.id));

    const contestScores = allScores.filter((score) => submissionIdSet.has(score.submissionId));
    const currentJudgeScores = contestScores.filter((score) => currentJudgeIdSet.has(score.judgeId));

    const templateById = templates.reduce<Record<string, (typeof templates)[number]>>((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {});

    const contestNumber = Number(contest.id.replace('contest-', '')) || 1;
    const fallbackTemplate = templates[(contestNumber - 1) % templates.length] ?? templates[0];
    const templateFromScores = contestScores.length > 0 ? templateById[contestScores[0].templateId] : undefined;
    const selectedTemplate = templateFromScores ?? fallbackTemplate;

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

    return (
      <JudgeContestContent
        data={{
          contest,
          submissions: contestSubmissions,
          template: selectedTemplate,
          scoreDistribution,
          scoreBySubmissionId,
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
