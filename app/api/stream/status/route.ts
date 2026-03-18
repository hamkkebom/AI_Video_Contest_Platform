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

    return NextResponse.json({
      readyToStream: info.readyToStream,
      status: info.status,
    });
  } catch {
    return NextResponse.json({ error: '상태 확인 실패' }, { status: 500 });
  }
}
