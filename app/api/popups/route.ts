import { NextResponse } from 'next/server';
import { getActivePopups } from '@/lib/data';

/** 활성 팝업 목록 API */
export async function GET() {
  try {
    const popups = await getActivePopups();
    return NextResponse.json({ popups });
  } catch (error) {
    console.error('[GET /api/popups] 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
