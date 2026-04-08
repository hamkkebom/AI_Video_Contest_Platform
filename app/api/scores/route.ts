import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

interface ScoreBody {
  submissionId?: string;
  contestId?: string;
  templateId?: string;
  criteriaScores?: Array<{ criterionId: string; score: number }>;
  comment?: string;
}

/** 채점 저장/수정 API */
export async function POST(request: Request) {
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

  try {
    const body = (await request.json()) as ScoreBody;
    const { submissionId, contestId, templateId, criteriaScores, comment } = body;

    if (!submissionId || !contestId || !templateId || !criteriaScores || criteriaScores.length === 0) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    /* ── 심사위원 권한 확인 ── */
    const { data: judgeAssignment } = await supabase
      .from('judges')
      .select('id')
      .eq('user_id', user.id)
      .eq('contest_id', contestId)
      .maybeSingle();

    if (!judgeAssignment) {
      return NextResponse.json({ error: '이 공모전의 심사위원이 아닙니다.' }, { status: 403 });
    }

    const judgeId = judgeAssignment.id;

    /* ── 채점 템플릿 유효성 검증 (공모전 연결 템플릿 확인) ── */
    const { data: template } = await supabase
      .from('judging_templates')
      .select('id, name')
      .eq('id', templateId)
      .maybeSingle();

    if (!template) {
      return NextResponse.json({ error: '유효하지 않은 채점 템플릿입니다. 공모전에 심사 기준이 설정되었는지 확인해주세요.' }, { status: 400 });
    }

    /* ── 기준별 점수 유효성 검증 ── */
    const { data: criteria } = await supabase
      .from('judging_criteria')
      .select('id, max_score')
      .eq('template_id', templateId);

    if (!criteria || criteria.length === 0) {
      return NextResponse.json({ error: '채점 기준이 없습니다.' }, { status: 400 });
    }

    const criteriaMap = new Map(criteria.map(c => [c.id, c.max_score]));

    for (const cs of criteriaScores) {
      const maxScore = criteriaMap.get(cs.criterionId);
      if (maxScore === undefined) {
        return NextResponse.json({ error: `유효하지 않은 기준 ID: ${cs.criterionId}` }, { status: 400 });
      }
      if (cs.score < 0 || cs.score > maxScore) {
        return NextResponse.json({ error: `점수는 0~${maxScore} 범위여야 합니다.` }, { status: 400 });
      }
      if (!Number.isInteger(cs.score)) {
        return NextResponse.json({ error: '점수는 정수여야 합니다.' }, { status: 400 });
      }
    }

    if (criteriaScores.length !== criteria.length) {
      return NextResponse.json({ error: `모든 기준(${criteria.length}개)에 대해 점수를 입력해야 합니다.` }, { status: 400 });
    }

    const total = criteriaScores.reduce((sum, cs) => sum + cs.score, 0);

    /* ── 기존 채점 확인 (수정 vs 신규) ── */
    const { data: existingScore } = await supabase
      .from('scores')
      .select('id')
      .eq('judge_id', judgeId)
      .eq('submission_id', submissionId)
      .maybeSingle();

    let scoreId: string;

    if (existingScore) {
      /* 기존 점수 수정 */
      const { error: updateError } = await supabase
        .from('scores')
        .update({
          template_id: templateId,
          total,
          comment: comment?.trim() || null,
        })
        .eq('id', existingScore.id);

      if (updateError) {
        console.error('[POST /api/scores] 점수 수정 실패:', updateError);
        return NextResponse.json({ error: '점수 수정에 실패했습니다.' }, { status: 500 });
      }

      scoreId = existingScore.id;

      /* 기존 기준별 점수 삭제 후 재삽입 */
      await supabase.from('score_criteria').delete().eq('score_id', scoreId);
    } else {
      /* 신규 점수 생성 */
      const { data: newScore, error: insertError } = await supabase
        .from('scores')
        .insert({
          judge_id: judgeId,
          submission_id: submissionId,
          template_id: templateId,
          total,
          comment: comment?.trim() || null,
        })
        .select('id')
        .single();

      if (insertError || !newScore) {
        console.error('[POST /api/scores] 점수 생성 실패:', insertError);
        return NextResponse.json({ error: '점수 저장에 실패했습니다.' }, { status: 500 });
      }

      scoreId = newScore.id;
    }

    /* ── 기준별 점수 저장 ── */
    const scoreCriteriaInserts = criteriaScores.map(cs => ({
      score_id: scoreId,
      criterion_id: cs.criterionId,
      score: cs.score,
    }));

    const { error: criteriaInsertError } = await supabase
      .from('score_criteria')
      .insert(scoreCriteriaInserts);

    if (criteriaInsertError) {
      console.error('[POST /api/scores] 기준별 점수 저장 실패:', criteriaInsertError);
      return NextResponse.json(
        { score: { id: scoreId, total }, warning: '총점은 저장되었으나 기준별 점수 저장에 실패했습니다.' },
        { status: 201 },
      );
    }

    /* ── 활동 로그 ── */
    createActivityLog({
      userId: user.id,
      action: existingScore ? 'update_score' : 'create_score',
      targetType: 'submission',
      targetId: submissionId,
      metadata: { contestId, judgeId, scoreId, total, isUpdate: !!existingScore },
    }).catch(console.error);

    revalidateTag('scores');

    return NextResponse.json({
      score: { id: scoreId, total },
      isUpdate: !!existingScore,
    }, { status: existingScore ? 200 : 201 });
  } catch (error) {
    console.error('[POST /api/scores] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '채점 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
