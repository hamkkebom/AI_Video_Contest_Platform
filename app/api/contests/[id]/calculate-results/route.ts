import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/**
 * 공모전 최종 순위 계산 API
 * 심사위원 점수(80%) + 대중평가(17%) + 가산점(3%) 합산
 *
 * POST /api/contests/[id]/calculate-results
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contestId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  /* 관리자 권한 확인 */
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const roles = Array.isArray(profile?.roles) ? profile.roles : [];
  if (!roles.includes('admin') && !roles.includes('host')) {
    return NextResponse.json({ error: '관리자 또는 주최자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    /* ── 공모전 정보 ── */
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('*')
      .eq('id', contestId)
      .single();

    if (contestError || !contest) {
      return NextResponse.json({ error: '공모전을 찾을 수 없습니다.' }, { status: 404 });
    }

    /* 가중치 (기본값: 심사 80%, 대중 17%, 가산점 3%) */
    const judgeWeight = (contest.judge_weight_percent ?? 80) / 100;
    const onlineWeight = (contest.online_vote_weight_percent ?? 17) / 100;
    const bonusWeight = (contest.bonus_percentage ?? 3) / 100;
    const onlineVoteType = contest.online_vote_type ?? 'likes';
    const voteLikesPercent = (contest.vote_likes_percent ?? 70) / 100;
    const voteViewsPercent = (contest.vote_views_percent ?? 30) / 100;

    /* ── 승인된 출품작 조회 ── */
    const { data: submissions } = await supabase
      .from('submissions')
      .select('id, views, like_count')
      .eq('contest_id', contestId)
      .in('status', ['approved', 'judging', 'judged']);

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ error: '승인된 출품작이 없습니다.' }, { status: 400 });
    }

    /* ── 심사위원 점수 조회 ── */
    const submissionIds = submissions.map(s => s.id);
    const { data: allScores } = await supabase
      .from('scores')
      .select('submission_id, total')
      .in('submission_id', submissionIds);

    /* 출품작별 심사 평균 점수 */
    const judgeAvgBySubmission = new Map<string, number>();
    if (allScores && allScores.length > 0) {
      const grouped = new Map<string, number[]>();
      for (const score of allScores) {
        const arr = grouped.get(score.submission_id) ?? [];
        arr.push(score.total);
        grouped.set(score.submission_id, arr);
      }
      for (const [subId, totals] of grouped) {
        judgeAvgBySubmission.set(subId, totals.reduce((a, b) => a + b, 0) / totals.length);
      }
    }

    /* ── 가산점 조회 ── */
    const { data: bonusEntries } = await supabase
      .from('bonus_entries')
      .select('submission_id')
      .in('submission_id', submissionIds);

    const bonusCountBySubmission = new Map<string, number>();
    if (bonusEntries) {
      for (const entry of bonusEntries) {
        bonusCountBySubmission.set(
          entry.submission_id,
          (bonusCountBySubmission.get(entry.submission_id) ?? 0) + 1
        );
      }
    }

    const bonusMaxScore = contest.bonus_max_score ?? 3;

    /* ── 정규화를 위한 최대값 계산 ── */
    const maxJudgeAvg = Math.max(...submissions.map(s => judgeAvgBySubmission.get(s.id) ?? 0), 1);
    const maxLikes = Math.max(...submissions.map(s => s.like_count ?? 0), 1);
    const maxViews = Math.max(...submissions.map(s => s.views ?? 0), 1);

    /* ── 최종 점수 계산 ── */
    const results = submissions.map(submission => {
      /* 1. 심사위원 점수 (0~100으로 정규화) */
      const judgeAvg = judgeAvgBySubmission.get(submission.id) ?? 0;
      const judgeNormalized = maxJudgeAvg > 0 ? (judgeAvg / maxJudgeAvg) * 100 : 0;

      /* 2. 대중평가 점수 (0~100으로 정규화) */
      let onlineNormalized = 0;
      if (onlineVoteType === 'likes') {
        onlineNormalized = maxLikes > 0 ? ((submission.like_count ?? 0) / maxLikes) * 100 : 0;
      } else if (onlineVoteType === 'views') {
        onlineNormalized = maxViews > 0 ? ((submission.views ?? 0) / maxViews) * 100 : 0;
      } else {
        /* likes_and_views */
        const likesNorm = maxLikes > 0 ? ((submission.like_count ?? 0) / maxLikes) * 100 : 0;
        const viewsNorm = maxViews > 0 ? ((submission.views ?? 0) / maxViews) * 100 : 0;
        onlineNormalized = likesNorm * voteLikesPercent + viewsNorm * voteViewsPercent;
      }

      /* 3. 가산점 (0~100으로 정규화) */
      const bonusCount = bonusCountBySubmission.get(submission.id) ?? 0;
      const bonusNormalized = bonusMaxScore > 0 ? (Math.min(bonusCount, bonusMaxScore) / bonusMaxScore) * 100 : 0;

      /* 가중 합산 */
      const finalScore = Math.round(
        (judgeNormalized * judgeWeight +
         onlineNormalized * onlineWeight +
         bonusNormalized * bonusWeight) * 100
      ) / 100;

      return {
        submissionId: submission.id,
        judgeScore: Math.round(judgeNormalized * 100) / 100,
        onlineScore: Math.round(onlineNormalized * 100) / 100,
        bonusScore: Math.round(bonusNormalized * 100) / 100,
        finalScore,
      };
    });

    /* 순위 정렬 */
    results.sort((a, b) => b.finalScore - a.finalScore);

    /* ── 시상 티어 배정 ── */
    const awardTiers = contest.award_tiers ?? [];
    let rank = 0;

    /* contest_results 기존 데이터 삭제 후 재삽입 */
    await supabase.from('contest_results').delete().eq('contest_id', contestId);

    const resultInserts: Array<{
      contest_id: string;
      submission_id: string;
      rank: number;
      prize_label: string | null;
      awarded_at: string;
    }> = [];

    for (const result of results) {
      rank++;
      let prizeLabel: string | null = null;

      /* 시상 티어에서 해당 순위의 상 찾기 */
      let cumulative = 0;
      for (const tier of awardTiers) {
        cumulative += tier.count ?? 1;
        if (rank <= cumulative) {
          prizeLabel = tier.label;
          break;
        }
      }

      resultInserts.push({
        contest_id: contestId,
        submission_id: result.submissionId,
        rank,
        prize_label: prizeLabel,
        awarded_at: new Date().toISOString(),
      });
    }

    if (resultInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('contest_results')
        .insert(resultInserts);

      if (insertError) {
        console.error('[calculate-results] contest_results 저장 실패:', insertError);
        return NextResponse.json({ error: '순위 결과 저장에 실패했습니다.' }, { status: 500 });
      }
    }

    /* 활동 로그 */
    createActivityLog({
      userId: user.id,
      action: 'calculate_results',
      targetType: 'contest',
      targetId: contestId,
      metadata: { submissionCount: results.length, topScore: results[0]?.finalScore },
    }).catch(console.error);

    revalidateTag('contests');
    revalidateTag('submissions');

    return NextResponse.json({
      results: results.map((r, i) => ({
        ...r,
        rank: i + 1,
        prizeLabel: resultInserts[i]?.prize_label ?? null,
      })),
      weights: {
        judge: judgeWeight * 100,
        online: onlineWeight * 100,
        bonus: bonusWeight * 100,
      },
    });
  } catch (error) {
    console.error('[calculate-results] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '순위 계산 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
