import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 해당 출품작의 제출자가 Storage에 업로드한 가산점 증빙 이미지 목록.
 * 관리자가 수정 모달에서 이미지를 config에 매칭할 때 사용.
 * GET /api/admin/submissions/[id]/proof-images
 */

function isAdmin(roles: unknown): boolean {
  if (Array.isArray(roles)) return roles.includes('admin');
  if (typeof roles === 'string') return roles.split(',').map((r) => r.trim()).includes('admin');
  return false;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  /* 관리자 권한 확인 */
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('roles').eq('id', user.id).single();
  if (!profile || !isAdmin(profile.roles)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  /* 출품작 → contest_id + user_id 조회 */
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('id, contest_id, user_id')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: '출품작을 찾을 수 없습니다.' }, { status: 404 });
  }

  /* 해당 유저의 proof-images 폴더 조회 */
  const folderPath = `${submission.contest_id}/${submission.user_id}`;
  const { data: listData, error: listError } = await supabase.storage
    .from('proof-images')
    .list(folderPath, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'asc' },
    });

  if (listError) {
    console.error('[proof-images API] Storage 조회 실패:', listError.message);
    return NextResponse.json({ error: '이미지 목록 조회에 실패했습니다.' }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const images = (listData ?? [])
    .filter((f) => f.name && f.id) /* 폴더가 아닌 실제 파일만 */
    .map((f) => {
      const fullPath = `${folderPath}/${f.name}`;
      return {
        name: fullPath,
        createdAt: f.created_at ?? f.updated_at ?? new Date().toISOString(),
        publicUrl: `${supabaseUrl}/storage/v1/object/public/proof-images/${fullPath}`,
      };
    });

  return NextResponse.json({ images });
}
