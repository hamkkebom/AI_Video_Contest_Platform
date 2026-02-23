/**
 * 영상 업로드 API — Cloudflare Stream direct creator upload
 * 클라이언트에서 이 엔드포인트를 호출하면
 * Cloudflare Stream에 업로드 URL을 발급받아 반환
 *
 * Flow:
 * 1. 클라이언트 → POST /api/upload/video (영상 메타 정보)
 * 2. 서버 → Cloudflare Stream API로 direct upload URL 요청
 * 3. 서버 → 클라이언트에 uploadURL 반환
 * 4. 클라이언트 → uploadURL로 직접 PUT 업로드 (서버 경유 안 함)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

export async function POST(request: Request) {
  // 인증 확인
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return NextResponse.json(
      { error: 'Cloudflare 설정이 완료되지 않았습니다.' },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const maxDurationSeconds = body.maxDurationSeconds ?? 600; // 기본 10분

    // Cloudflare Stream: direct creator upload URL 발급
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds,
          creator: 'ai-video-contest',
          meta: {
            userId: user.id,
            uploadedAt: new Date().toISOString(),
          },
        }),
      },
    );

    if (!cfResponse.ok) {
      const cfError = await cfResponse.text();
      console.error('Cloudflare Stream 오류:', cfError);
      return NextResponse.json(
        { error: '영상 업로드 URL 생성에 실패했습니다.' },
        { status: 502 },
      );
    }

    const cfData = await cfResponse.json();
    const { uploadURL, uid } = cfData.result;

    return NextResponse.json({ uploadURL, uid });
  } catch (err) {
    console.error('영상 업로드 API 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
