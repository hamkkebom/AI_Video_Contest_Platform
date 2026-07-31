import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';

/**
 * 헬스체크 API
 * GET /api/health
 *
 * UptimeRobot 같은 외부 감시 도구가 주기적으로 호출하도록 만든 엔드포인트다.
 * 앱이 살아있는지뿐 아니라 DB까지 실제로 닿는지 확인한다 —
 * 앱은 200 을 주는데 DB 연결만 끊긴 상태를 놓치지 않기 위해서다.
 *
 * 응답:
 *   200 { status: 'ok', ... }        정상
 *   503 { status: 'degraded', ... }  DB 조회 실패
 *
 * 익명으로 접근하므로 공개 뷰(public_submissions)만 건드리고,
 * 내부 구조나 오류 상세는 노출하지 않는다.
 */
export const dynamic = 'force-dynamic';

/** DB 응답이 이 시간을 넘으면 실패로 간주 */
const DB_TIMEOUT_MS = 5000;

export async function GET() {
  const startedAt = Date.now();

  let dbOk = false;
  try {
    const supabase = createPublicClient();
    /* 가장 가벼운 쿼리 — 행 데이터 없이 존재 여부만 확인 */
    const probe = supabase.from('contests').select('id', { count: 'exact', head: true });
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), DB_TIMEOUT_MS),
    );
    const { error } = (await Promise.race([probe, timeout])) as { error: unknown };
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  const body = {
    status: dbOk ? 'ok' : 'degraded',
    database: dbOk ? 'up' : 'down',
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: dbOk ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
