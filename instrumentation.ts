/**
 * Next.js Instrumentation — 서버 시작 시 한 번 실행
 * 필수 환경변수가 누락되면 즉시 에러를 던져 빠른 실패를 보장한다.
 */
export async function register() {
  // 서버(Node.js) 런타임에서만 검증 (Edge 런타임 제외)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getSupabaseEnv } = await import('@/lib/env');
    getSupabaseEnv();
  }
}
