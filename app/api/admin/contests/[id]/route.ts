import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { deleteContest, getContestById, updateContest, createActivityLog, type ContestMutationInput } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';
import { deleteDownloadsForUrls } from '@/lib/cloudflare-stream';

async function getAuthUser() {
  const supabase = await createClient();
  if (!supabase) {
    return { user: null, error: NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 }) };
  }

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (authError || !user) {
    return { user: null, error: NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 }) };
  }

  return { user, error: null };
}

/** 관리자 공모전 상세 조회 API */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const { id } = await params;
    const contest = await getContestById(id);

    if (!contest) {
      return NextResponse.json({ error: '공모전을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ contest });
  } catch (err) {
    console.error('Failed to load contest detail:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자 공모전 수정 API */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as ContestMutationInput;
    const contest = await updateContest(id, body);

    if (!contest) {
      return NextResponse.json({ error: '공모전 수정에 실패했습니다.' }, { status: 500 });
    }

    // 활동 로그 기록
    if (user) {
      createActivityLog({
        userId: user.id,
        action: 'update_contest',
        targetType: 'contest',
        targetId: id,
        metadata: { title: contest.title, role: 'admin' },
      }).catch(console.error);
    }

    // 예시영상 CF Stream 다운로드 자동 삭제 (사용자 다운로드 방지)
    if (body.promotionVideoUrls && body.promotionVideoUrls.length > 0) {
      deleteDownloadsForUrls(body.promotionVideoUrls).catch((err) =>
        console.error('CF Stream 다운로드 삭제 실패:', err),
      );
    }

    revalidateTag('contests');
    return NextResponse.json({ contest });
  } catch (err) {
    console.error('Failed to update contest:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/** 관리자 공모전 삭제 API */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const { id } = await params;
    const deleted = await deleteContest(id);

    if (!deleted) {
      return NextResponse.json({ error: '공모전 삭제에 실패했습니다.' }, { status: 500 });
    }

    // 활동 로그 기록
    if (user) {
      createActivityLog({
        userId: user.id,
        action: 'delete_contest',
        targetType: 'contest',
        targetId: id,
        metadata: { role: 'admin' },
      }).catch(console.error);
    }

    revalidateTag('contests');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete contest:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
