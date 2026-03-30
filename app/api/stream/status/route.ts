import { NextResponse } from 'next/server';
import { getStreamVideoInfo } from '@/lib/cloudflare-stream';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid || !/^[a-f0-9]{32}$/.test(uid)) {
    return NextResponse.json({ error: 'uid 파라미터가 필요합니다.' }, { status: 400 });
  }

  try {
    const info = await getStreamVideoInfo(uid);
    if (!info) {
      return NextResponse.json({ error: '상태 확인 실패' }, { status: 500 });
    }

    /* pendingupload = 파일이 Cloudflare에 도착하지 않음 → 404로 응답하여 클라이언트가 재시도 */
    if (info.status?.state === 'pendingupload') {
      return NextResponse.json({
        readyToStream: false,
        status: info.status,
        uploaded: false,
      }, { status: 404 });
    }

    return NextResponse.json({
      readyToStream: info.readyToStream,
      status: info.status,
      uploaded: true,
    });
  } catch {
    return NextResponse.json({ error: '상태 확인 실패' }, { status: 500 });
  }
}
