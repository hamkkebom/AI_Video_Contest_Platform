import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  extractStreamVideoUid,
  createStreamDownload,
  deleteStreamDownloads,
  getStreamDownloads,
  deleteDownloadsForUrls,
} from '@/lib/cloudflare-stream';

/** 관리자 인증 확인 */
async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) {
    return { user: null, error: NextResponse.json({ error: 'Supabase 미설정' }, { status: 500 }) };
  }

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (authError || !user) {
    return { user: null, error: NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 }) };
  }

  // 관리자 역할 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const roles = (profile?.roles as string[]) ?? [];
  if (!roles.includes('admin') && !roles.includes('super_admin')) {
    return { user: null, error: NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 }) };
  }

  return { user, error: null };
}

/**
 * GET — 비디오 다운로드 상태 조회
 * ?videoUrl=https://iframe.videodelivery.net/xxx
 */
export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('videoUrl');

  if (!videoUrl) {
    return NextResponse.json({ error: 'videoUrl 파라미터가 필요합니다.' }, { status: 400 });
  }

  const uid = extractStreamVideoUid(videoUrl);
  if (!uid) {
    return NextResponse.json({ error: 'Cloudflare Stream URL이 아닙니다.', isStreamUrl: false }, { status: 200 });
  }

  const download = await getStreamDownloads(uid);
  return NextResponse.json({ uid, download, isStreamUrl: true });
}

/**
 * POST — 비디오 다운로드 생성 (관리자 다운로드용)
 * body: { videoUrl: string }
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'videoUrl이 필요합니다.' }, { status: 400 });
    }

    const uid = extractStreamVideoUid(videoUrl);
    if (!uid) {
      return NextResponse.json({ error: 'Cloudflare Stream URL이 아닙니다.' }, { status: 400 });
    }

    const result = await createStreamDownload(uid);

    /* null = 환경변수 미설정 등 치명적 오류 */
    if (!result) {
      return NextResponse.json({ error: '다운로드 생성에 실패했습니다.' }, { status: 500 });
    }

    /* CF API가 구체적 에러 메시지를 반환한 경우 */
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({ uid, download: result });
  } catch (err) {
    console.error('다운로드 생성 API 오류:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

/**
 * DELETE — 비디오 다운로드 삭제 (사용자에게 다운로드 숨기기)
 * body: { videoUrl?: string, videoUrls?: string[] }
 */
export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { videoUrl, videoUrls } = body as { videoUrl?: string; videoUrls?: string[] };

    // 단일 URL
    if (videoUrl) {
      const uid = extractStreamVideoUid(videoUrl);
      if (!uid) {
        return NextResponse.json({ error: 'Cloudflare Stream URL이 아닙니다.' }, { status: 400 });
      }

      const success = await deleteStreamDownloads(uid);
      return NextResponse.json({ uid, deleted: success });
    }

    // 여러 URL 일괄 삭제
    if (videoUrls && videoUrls.length > 0) {
      const deleted = await deleteDownloadsForUrls(videoUrls);
      return NextResponse.json({ deleted, count: deleted.length });
    }

    return NextResponse.json({ error: 'videoUrl 또는 videoUrls가 필요합니다.' }, { status: 400 });
  } catch (err) {
    console.error('다운로드 삭제 API 오류:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
