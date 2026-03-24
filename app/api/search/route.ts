import { NextResponse } from 'next/server';
import { searchData, createActivityLog } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

/** 통합 검색 API — query param `q`로 검색어 수신 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const data = await searchData({ query });

    // 로그인 상태면 검색 로그 기록
    const supabase = await createClient();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (user) {
        createActivityLog({
          userId: user.id,
          action: 'search',
          metadata: { query },
        }).catch(console.error);
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
