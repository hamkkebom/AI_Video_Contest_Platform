import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

interface JudgmentBody {
  submissionId?: string;
  stageId?: string;
  contestId?: string;
  judgment?: 'pass' | 'fail' | 'hold';
  comment?: string;
}

const ALLOWED_JUDGMENTS = ['pass', 'fail', 'hold'] as const;

/** 간편 심사 투표 API (합격/불합격/보류) */
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

  try {
    const body = (await request.json()) as JudgmentBody;
    const { submissionId, stageId, contestId, judgment, comment } = body;

    if (!submissionId || !stageId || !contestId || !judgment) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    if (!ALLOWED_JUDGMENTS.includes(judgment)) {
      return NextResponse.json({ error: `유효하지 않은 판정입니다. 허용: ${ALLOWED_JUDGMENTS.join(', ')}` }, { status: 400 });
    }

    /* 단계 확인: method가 simple인지 */
    const { data: stage } = await supabase
      .from('judging_stages')
      .select('id, method')
      .eq('id', stageId)
      .maybeSingle();

    if (!stage) {
      return NextResponse.json({ error: '유효하지 않은 심사 단계입니다.' }, { status: 400 });
    }
    if (stage.method !== 'simple') {
      return NextResponse.json({ error: '이 단계는 간편 심사가 아닙니다.' }, { status: 400 });
    }

    /* 심사위원 배정 확인 */
    const { data: judgeAssignment } = await supabase
      .from('judges')
      .select('id')
      .eq('user_id', user.id)
      .eq('contest_id', contestId)
      .maybeSingle();

    if (!judgeAssignment) {
      return NextResponse.json({ error: '이 공모전의 심사위원이 아닙니다.' }, { status: 403 });
    }

    /* upsert 투표 */
    const { data: result, error } = await supabase
      .from('simple_judgments')
      .upsert({
        submission_id: submissionId,
        stage_id: stageId,
        judge_id: judgeAssignment.id,
        judgment,
        comment: comment?.trim() || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'submission_id,stage_id,judge_id' })
      .select('id')
      .single();

    if (error || !result) {
      console.error('[POST /api/judgments] 투표 저장 실패:', error);
      return NextResponse.json({ error: '투표 저장에 실패했습니다.' }, { status: 500 });
    }

    createActivityLog({
      userId: user.id,
      action: 'simple_judgment',
      targetType: 'submission',
      targetId: submissionId,
      metadata: { contestId, stageId, judgment },
    }).catch(console.error);

    revalidateTag('scores');

    return NextResponse.json({ success: true, judgment: { id: result.id, judgment } });
  } catch (error) {
    console.error('[POST /api/judgments] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '간편 심사 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
