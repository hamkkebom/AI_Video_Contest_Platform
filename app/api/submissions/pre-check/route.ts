import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 업로드 전 사전 검증 API (#1)
 * 공모전 상태/마감일/쿼터를 확인하여 영상 업로드 전에 빠르게 실패 처리
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contestId = searchParams.get('contestId');

  if (!contestId) {
    return NextResponse.json({ error: '공모전 ID가 필요합니다.' }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.', code: 'AUTH_REQUIRED' }, { status: 401 });
  }

  /* 공모전 정보 조회 */
  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('status, submission_end_at, max_submissions_per_user')
    .eq('id', contestId)
    .single();

  if (contestError || !contest) {
    return NextResponse.json({ error: '공모전 정보를 찾을 수 없습니다.' }, { status: 404 });
  }

  /* 공모전 상태 검증 */
  if (contest.status !== 'open') {
    return NextResponse.json(
      { error: '이 공모전은 현재 접수 기간이 아닙니다.', code: 'CONTEST_NOT_OPEN' },
      { status: 410 },
    );
  }

  /* 마감일 검증 */
  if (contest.submission_end_at && new Date(contest.submission_end_at) < new Date()) {
    return NextResponse.json(
      { error: '공모전 접수 마감일이 지났습니다.', code: 'DEADLINE_PASSED' },
      { status: 403 },
    );
  }

  /* 쿼터 검증 */
  const maxSubmissions = contest.max_submissions_per_user ?? 1;
  const { count } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('contest_id', contestId)
    .eq('user_id', user.id);

  /* 재제출 허용된 출품작은 쿼터에서 제외 */
  const { count: resubCount } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('contest_id', contestId)
    .eq('user_id', user.id)
    .gt('resubmission_count', 0);
  const effectiveCount = (count ?? 0) - (resubCount ?? 0);

  if (effectiveCount >= maxSubmissions) {
    return NextResponse.json(
      { error: `이 공모전의 최대 출품 가능 수(${maxSubmissions}개)를 초과했습니다.`, code: 'QUOTA_EXCEEDED' },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
