import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { setSubmissionStageResult } from '@/lib/data';

/**
 * 심사 단계 관리 API
 * GET: 공모전의 심사 단계 목록 조회
 * POST: 단계 결과 확정 / 다음 단계 진행
 */

function isAdmin(roles: unknown): boolean {
  if (Array.isArray(roles)) return roles.includes('admin');
  if (typeof roles === 'string') return roles.split(',').map((r) => r.trim()).includes('admin');
  return false;
}

/** 공모전의 심사 단계 + 출품작별 결과 조회 */
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const contestId = searchParams.get('contestId');
  if (!contestId) {
    return NextResponse.json({ error: '공모전 ID가 필요합니다.' }, { status: 400 });
  }

  const { data: stages, error } = await supabase
    .from('judging_stages')
    .select('*')
    .eq('contest_id', contestId)
    .order('stage_number', { ascending: true });

  if (error) {
    return NextResponse.json({ error: '심사 단계 조회에 실패했습니다.' }, { status: 500 });
  }

  // 각 단계별 결과 카운트
  const stageIds = (stages ?? []).map((s) => s.id as number);
  const { data: results } = await supabase
    .from('submission_stage_results')
    .select('stage_id, result')
    .in('stage_id', stageIds.length > 0 ? stageIds : [0]);

  const countsByStage: Record<string, Record<string, number>> = {};
  for (const r of results ?? []) {
    const sid = String(r.stage_id);
    if (!countsByStage[sid]) countsByStage[sid] = { pass: 0, fail: 0, hold: 0, pending: 0 };
    const result = r.result as string;
    countsByStage[sid][result] = (countsByStage[sid][result] ?? 0) + 1;
  }

  const stagesWithCounts = (stages ?? []).map((s) => ({
    ...s,
    resultCounts: countsByStage[String(s.id)] ?? { pass: 0, fail: 0, hold: 0, pending: 0 },
  }));

  return NextResponse.json({ stages: stagesWithCounts });
}

/** 단계 결과 확정 / 개별 결과 설정 */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (!profile || !isAdmin(profile.roles)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      action: 'setResult' | 'advanceStage';
      contestId: string;
      stageId: string;
      // setResult용
      submissionId?: string;
      result?: 'pass' | 'fail' | 'hold';
      // advanceStage용 — 현재 단계를 확정하고 다음 단계 활성화
    };

    if (body.action === 'setResult') {
      if (!body.submissionId || !body.result || !body.stageId) {
        return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 });
      }

      const success = await setSubmissionStageResult(
        body.submissionId, body.stageId, body.result, user.id,
      );

      if (!success) {
        return NextResponse.json({ error: '결과 저장에 실패했습니다.' }, { status: 500 });
      }

      revalidateTag('scores');
      return NextResponse.json({ success: true });
    }

    if (body.action === 'advanceStage') {
      if (!body.contestId || !body.stageId) {
        return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 });
      }

      // 현재 단계 비활성화
      await supabase
        .from('judging_stages')
        .update({ is_active: false })
        .eq('id', body.stageId);

      // 현재 단계 번호 조회
      const { data: currentStage } = await supabase
        .from('judging_stages')
        .select('stage_number')
        .eq('id', body.stageId)
        .single();

      if (!currentStage) {
        return NextResponse.json({ error: '단계를 찾을 수 없습니다.' }, { status: 404 });
      }

      // 다음 단계 활성화
      const nextStageNumber = (currentStage.stage_number as number) + 1;
      const { data: nextStage } = await supabase
        .from('judging_stages')
        .update({ is_active: true })
        .eq('contest_id', body.contestId)
        .eq('stage_number', nextStageNumber)
        .select('id')
        .maybeSingle();

      if (!nextStage) {
        return NextResponse.json({ success: true, message: '마지막 단계입니다. 더 이상 진행할 단계가 없습니다.' });
      }

      // 통과한 출품작에 대해 다음 단계 pending 결과 생성
      const { data: passedResults } = await supabase
        .from('submission_stage_results')
        .select('submission_id')
        .eq('stage_id', body.stageId)
        .eq('result', 'pass');

      if (passedResults && passedResults.length > 0) {
        const pendingInserts = passedResults.map((r) => ({
          submission_id: r.submission_id,
          stage_id: nextStage.id,
          result: 'pending' as const,
        }));
        await supabase.from('submission_stage_results').upsert(pendingInserts, {
          onConflict: 'submission_id,stage_id',
        });
      }

      revalidateTag('scores');
      return NextResponse.json({
        success: true,
        nextStageId: nextStage.id,
        passedCount: passedResults?.length ?? 0,
      });
    }

    return NextResponse.json({ error: '유효하지 않은 액션입니다.' }, { status: 400 });
  } catch (error) {
    console.error('[POST /api/stages] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '심사 단계 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
