import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/**
 * 관리자 출품작 갤러리 공개/비공개 토글 API
 * PATCH /api/admin/submissions/[id]/visibility
 * body: { isPublic: boolean }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  /* 1) 인증 확인 */
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  /* 2) admin 또는 host 권한 확인 */
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
    /* 3) body 파싱 + 검증 */
    const body = (await request.json()) as { isPublic?: unknown };
    if (typeof body.isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic은 boolean이어야 합니다.' },
        { status: 400 },
      );
    }
    const nextValue = body.isPublic;

    /* 4) 출품작 존재 확인 (host인 경우 자신의 공모전인지 확인) */
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('id, contest_id, is_public')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
    }

    /* host는 본인이 주최한 공모전의 출품작만 토글 가능 */
    if (!roles.includes('admin') && roles.includes('host')) {
      const { data: contest } = await supabase
        .from('contests')
        .select('host_user_id')
        .eq('id', submission.contest_id)
        .single();
      if (!contest || contest.host_user_id !== user.id) {
        return NextResponse.json({ error: '이 공모전의 주최자가 아닙니다.' }, { status: 403 });
      }
    }

    /* 5) 변경 사항 없으면 빠르게 반환 */
    if (submission.is_public === nextValue) {
      return NextResponse.json({ success: true, isPublic: nextValue, unchanged: true });
    }

    /* 6) 업데이트 */
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ is_public: nextValue })
      .eq('id', submissionId);

    if (updateError) {
      console.error('[PATCH visibility] 업데이트 실패:', updateError.message);
      return NextResponse.json({ error: '공개 여부 변경에 실패했습니다.' }, { status: 500 });
    }

    /* 7) 활동 로그 */
    createActivityLog({
      userId: user.id,
      action: nextValue ? 'show_submission' : 'hide_submission',
      targetType: 'submission',
      targetId: submissionId,
      metadata: { contestId: submission.contest_id, isPublic: nextValue },
    }).catch(console.error);

    /* 8) 캐시 무효화 */
    revalidateTag('submissions');
    revalidateTag('gallery');
    revalidateTag('contests');

    return NextResponse.json({ success: true, isPublic: nextValue });
  } catch (error) {
    console.error('[PATCH /api/admin/submissions/[id]/visibility] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: '공개 여부 변경 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
