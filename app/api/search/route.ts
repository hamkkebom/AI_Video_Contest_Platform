import { NextResponse } from 'next/server';
import { searchData } from '@/lib/data';

/** 통합 검색 API — query param `q`로 검색어 수신 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const data = await searchData({ query });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}