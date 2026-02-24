import { JudgeDashboardContent } from '@/components/dashboard/judge-dashboard-content';
import {
  getAuthProfile,
  getJudgeAssignments,
  getContests,
  getJudgingTemplates,
  getScores,
  getSubmissions,
} from '@/lib/data';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default async function JudgeContestsPage() {
  const profile = await getAuthProfile();
  if (!profile) redirect('/login');

  try {
    const [allContests, judgeAssignments, allSubmissions, allScores, templates] = await Promise.all([
      getContests(),
      getJudgeAssignments(profile.id),
      getSubmissions(),
      getScores(),
      getJudgingTemplates(),
    ]);

    const assignedContestIds = new Set(judgeAssignments.map((judge) => judge.contestId));
    const assignedContests = allContests.filter((contest) => assignedContestIds.has(contest.id));

    const judgeIdsByContest = judgeAssignments.reduce<Record<string, Set<string>>>((acc, assignment) => {
      const existing = acc[assignment.contestId] ?? new Set<string>();
      existing.add(assignment.id);
      acc[assignment.contestId] = existing;
      return acc;
    }, {});

    const submissionsByContest = allSubmissions.reduce<Record<string, typeof allSubmissions>>((acc, submission) => {
      if (!assignedContestIds.has(submission.contestId)) {
        return acc;
      }
      const existing = acc[submission.contestId] ?? [];
      existing.push(submission);
      acc[submission.contestId] = existing;
      return acc;
    }, {});

    const submissionContestMap = allSubmissions.reduce<Record<string, string>>((acc, submission) => {
      acc[submission.id] = submission.contestId;
      return acc;
    }, {});

    const contestProgress = assignedContests.map((contest) => {
      const contestSubmissions = submissionsByContest[contest.id] ?? [];
      const judgeIds = judgeIdsByContest[contest.id] ?? new Set<string>();

      const scoredSubmissionIds = new Set(
        allScores
          .filter(
            (score) =>
              judgeIds.has(score.judgeId) && submissionContestMap[score.submissionId] === contest.id
          )
          .map((score) => score.submissionId)
      );

      const submissionCount = contestSubmissions.length;
      const scoredCount = scoredSubmissionIds.size;
      const progressPercent = submissionCount > 0 ? Math.round((scoredCount / submissionCount) * 100) : 0;

      return {
        contestId: contest.id,
        title: contest.title,
        description: contest.description,
        status: contest.status,
        submissionCount,
        scoredCount,
        progressPercent,
      };
    });

    const totalSubmissionCount = contestProgress.reduce((sum, contest) => sum + contest.submissionCount, 0);
    const totalScoredCount = contestProgress.reduce((sum, contest) => sum + contest.scoredCount, 0);
    const overallProgressPercent =
      totalSubmissionCount > 0 ? Math.round((totalScoredCount / totalSubmissionCount) * 100) : 0;

    const assignedJudgeIds = new Set(judgeAssignments.map((assignment) => assignment.id));
    const judgeScores = allScores.filter((score) => assignedJudgeIds.has(score.judgeId));

    const scoreDistributionRanges = [
      { label: '0-20', min: 0, max: 20 },
      { label: '21-40', min: 21, max: 40 },
      { label: '41-60', min: 41, max: 60 },
      { label: '61-80', min: 61, max: 80 },
      { label: '81-100', min: 81, max: 100 },
    ];

    const scoreDistribution = scoreDistributionRanges.map((range) => ({
      range: range.label,
      count: judgeScores.filter((score) => score.total >= range.min && score.total <= range.max).length,
    }));

    const templateById = templates.reduce<Record<string, (typeof templates)[number]>>((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {});

    const criteriaAccumulator = judgeScores.reduce<Record<string, { label: string; sum: number; count: number }>>(
      (acc, score) => {
        const template = templateById[score.templateId];
        if (!template) {
          return acc;
        }

        const criterionById = template.criteria.reduce<Record<string, (typeof template.criteria)[number]>>(
          (criterionAcc, criterion) => {
            criterionAcc[criterion.id] = criterion;
            return criterionAcc;
          },
          {}
        );

        score.criteriaScores.forEach((criterionScore) => {
          const criterion = criterionById[criterionScore.criterionId];
          if (!criterion) {
            return;
          }

          const current = acc[criterion.id] ?? { label: criterion.label, sum: 0, count: 0 };
          current.sum += criterionScore.score;
          current.count += 1;
          acc[criterion.id] = current;
        });

        return acc;
      },
      {}
    );

    const criteriaAverageScores = Object.values(criteriaAccumulator)
      .map((item) => ({
        criterion: item.label,
        averageScore: Number((item.sum / item.count).toFixed(1)),
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    const now = new Date();
    const currentHour = now.getHours();
    const greeting =
      currentHour < 12
        ? '좋은 아침입니다. 오늘의 심사 진행 현황을 확인하세요.'
        : currentHour < 18
          ? '좋은 오후입니다. 배정된 심사 건을 차근차근 완료해보세요.'
          : '좋은 저녁입니다. 남은 심사 일정을 마무리해보세요.';

    return (
      <JudgeDashboardContent
        data={{
          todayLabel: formatDate(now, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          }),
          greeting,
          assignedContestCount: assignedContests.length,
          totalSubmissionCount,
          totalScoredCount,
          overallProgressPercent,
          contests: contestProgress,
          scoreDistribution,
          criteriaAverageScores,
        }}
      />
    );
  } catch (error) {
    console.error('Failed to load judging contests:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-red-600">심사 대시보드 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
