import { NextResponse } from 'next/server';
import { createContest, createActivityLog, type ContestMutationInput } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

/** 관리자 공모전 생성 API */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ContestMutationInput;

    const contest = await createContest(body);
    if (!contest) {
      return NextResponse.json({ error: '공모전 생성에 실패했습니다. (반환값 null)' }, { status: 500 });
    }
    // 활동 로그 기록
    await createActivityLog({
      userId: user.id,
      action: 'create_contest',
      targetType: 'contest',
      targetId: contest.id,
      metadata: { title: contest.title, role: 'admin' },
    });
    return NextResponse.json({ contest }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('[POST /api/admin/contests] 실패:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
