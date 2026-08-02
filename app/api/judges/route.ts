import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * 심사위원 배정 API
 *
 * 배정·해제는 마이그레이션 054 의 SECURITY DEFINER RPC 로만 수행한다.
 * 이유가 둘 있다 —
 *  ① judges 테이블에는 SELECT 정책만 있어 직접 insert/delete 가 RLS 에 막힌다.
 *  ② 예전 구현은 `roles ⊇ {admin|host}` 만 확인하고 **그 공모전의 주최자인지 보지 않아**
 *     아무 주최자나 남의 공모전에 심사위원을 넣을 수 있었다. 소유권 검사는 RPC 안에 있다.
 */

/** RPC 예외 → HTTP 상태. 권한(42501)과 없음(P0002)을 500 으로 뭉뚱그리지 않는다 */
function rpcStatus(code?: string): number {
  if (code === '42501') return 403;
  if (code === 'P0002') return 404;
  if (code === '23503') return 409;
  return 500;
}

/** RPC 미배포 환경(054 미적용)을 배정 실패와 구분한다 */
function isMissingFunction(code?: string): boolean {
  return code === 'PGRST202' || code === '42883';
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const userId = typeof body.userId === 'string' ? body.userId : '';
  const contestId = Number(body.contestId);
  if (!userId || !Number.isFinite(contestId)) {
    return NextResponse.json({ error: '회원과 공모전을 지정해주세요.' }, { status: 400 });
  }

  const { data: judgeId, error } = await supabase.rpc('assign_contest_judge', {
    p_contest_id: contestId,
    p_user_id: userId,
    p_is_external: Boolean(body.isExternal),
  });

  if (error) {
    console.error('[POST /api/judges] 배정 실패:', error.code, error.message);
    if (isMissingFunction(error.code)) {
      return NextResponse.json(
        { error: '심사위원 배정 설정이 완료되지 않았습니다. 마이그레이션 054를 적용해주세요.', code: 'MIGRATION_NOT_APPLIED' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: error.message || '심사위원 배정에 실패했습니다.' },
      { status: rpcStatus(error.code) },
    );
  }

  revalidateTag('judges');
  revalidateTag('users');

  return NextResponse.json({ judge: { id: judgeId } }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const judgeId = Number(searchParams.get('judgeId'));
  if (!Number.isFinite(judgeId)) {
    return NextResponse.json({ error: '심사위원 ID가 필요합니다.' }, { status: 400 });
  }

  const { error } = await supabase.rpc('remove_contest_judge', { p_judge_id: judgeId });

  if (error) {
    console.error('[DELETE /api/judges] 해제 실패:', error.code, error.message);
    if (isMissingFunction(error.code)) {
      return NextResponse.json(
        { error: '심사위원 관리 설정이 완료되지 않았습니다. 마이그레이션 054를 적용해주세요.', code: 'MIGRATION_NOT_APPLIED' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: error.message || '심사위원 해제에 실패했습니다.' },
      { status: rpcStatus(error.code) },
    );
  }

  revalidateTag('judges');
  revalidateTag('users');

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const contestId = searchParams.get('contestId');

  if (!contestId) {
    return NextResponse.json({ error: '공모전 ID가 필요합니다.' }, { status: 400 });
  }

  /* judges 는 042 이후 익명 조회가 막혀 있다 — 미인증 요청은 빈 배열이 아니라 401 로 답한다 */
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { data: judges, error } = await supabase
    .from('judges')
    .select('id, user_id, contest_id, is_external, invited_at, accepted_at')
    .eq('contest_id', contestId);

  if (error) {
    console.error('[GET /api/judges] 조회 실패:', error.code, error.message);
    return NextResponse.json({ error: '심사위원 목록 조회에 실패했습니다.' }, { status: 500 });
  }

  /* 심사위원 유저 프로필 정보 조인 */
  const userIds = [...new Set((judges ?? []).map((j) => j.user_id as string))];
  let profilesMap = new Map<string, { name: string; email: string }>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);
    if (profiles) {
      profilesMap = new Map(profiles.map((p) => [p.id as string, { name: p.name as string, email: p.email as string }]));
    }
  }

  const judgesWithUser = (judges ?? []).map((j) => {
    const profile = profilesMap.get(j.user_id as string);
    return {
      ...j,
      userName: profile?.name ?? null,
      userEmail: profile?.email ?? null,
    };
  });

  return NextResponse.json({ judges: judgesWithUser });
}
