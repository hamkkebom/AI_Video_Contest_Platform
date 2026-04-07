import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * 심사위원 배정 API
 * POST: 사용자를 특정 공모전의 심사위원으로 배정
 * GET: 특정 공모전의 심사위원 목록 조회
 */

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
    const body = await request.json();
    const { userId, contestId, isExternal } = body;

    if (!userId || !contestId) {
      return NextResponse.json({ error: '사용자 ID와 공모전 ID가 필요합니다.' }, { status: 400 });
    }

    /* 이미 배정된 심사위원인지 확인 */
    const { data: existing } = await supabase
      .from('judges')
      .select('id')
      .eq('user_id', userId)
      .eq('contest_id', contestId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ judge: { id: existing.id }, message: '이미 배정된 심사위원입니다.' });
    }

    const { data: judge, error } = await supabase
      .from('judges')
      .insert({
        user_id: userId,
        contest_id: contestId,
        is_external: isExternal ?? false,
        invited_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !judge) {
      console.error('[POST /api/judges] 심사위원 배정 실패:', error);
      return NextResponse.json({ error: '심사위원 배정에 실패했습니다.' }, { status: 500 });
    }

    /* 사용자 roles에 judge 추가 */
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', userId)
      .single();

    if (targetProfile) {
      const currentRoles = Array.isArray(targetProfile.roles) ? targetProfile.roles : [];
      if (!currentRoles.includes('judge')) {
        await supabase
          .from('profiles')
          .update({ roles: [...currentRoles, 'judge'] })
          .eq('id', userId);
      }
    }

    revalidateTag('judges');
    revalidateTag('users');

    return NextResponse.json({ judge: { id: judge.id } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/judges] 실패:', error);
    return NextResponse.json({ error: '심사위원 배정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { data: { session } } = await supabase.auth.getSession();
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
  if (!roles.includes('admin')) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const judgeId = searchParams.get('judgeId');

  if (!judgeId) {
    return NextResponse.json({ error: '심사위원 ID가 필요합니다.' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('judges')
      .delete()
      .eq('id', judgeId);

    if (error) {
      console.error('[DELETE /api/judges] 심사위원 해제 실패:', error);
      return NextResponse.json({ error: '심사위원 해제에 실패했습니다.' }, { status: 500 });
    }

    revalidateTag('judges');
    revalidateTag('users');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/judges] 실패:', error);
    return NextResponse.json({ error: '심사위원 해제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

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

  const { data: judges, error } = await supabase
    .from('judges')
    .select('id, user_id, contest_id, is_external, invited_at, accepted_at')
    .eq('contest_id', contestId);

  if (error) {
    return NextResponse.json({ error: '심사위원 목록 조회에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ judges: judges ?? [] });
}
