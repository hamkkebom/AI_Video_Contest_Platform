/**
 * 견고한 토큰 갱신 유틸리티
 * - getSession → refreshSession 순서로 시도
 * - 최대 3회 재시도 + 백오프
 * - 각 시도에 타임아웃 적용하여 hang 방지
 */
import type { SupabaseClient } from '@supabase/supabase-js';

type RefreshResult = {
  accessToken: string;
  ok: true;
} | {
  accessToken: null;
  ok: false;
};

function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Supabase 세션에서 유효한 access_token을 가져온다.
 * getSession → refreshSession 순서로 시도하며, 실패 시 최대 maxRetries회 재시도한다.
 *
 * @param supabase - 브라우저 Supabase 클라이언트
 * @param options.maxRetries - 최대 재시도 횟수 (기본 3)
 * @param options.timeoutMs - 각 호출 타임아웃 (기본 5000ms)
 * @param options.log - 로그 함수 (기본 console.log)
 */
export async function refreshAccessToken(
  supabase: SupabaseClient,
  options?: {
    maxRetries?: number;
    timeoutMs?: number;
    log?: (msg: string) => void;
  },
): Promise<RefreshResult> {
  const maxRetries = options?.maxRetries ?? 3;
  const timeoutMs = options?.timeoutMs ?? 5000;
  const log = options?.log ?? ((msg: string) => console.log(`[토큰갱신] ${msg}`));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    /* 1) getSession — 쿠키/메모리 기반, 빠름 */
    try {
      const result = await raceTimeout(supabase.auth.getSession(), timeoutMs);
      if (result && 'data' in result && result.data.session?.access_token) {
        log(`getSession 성공 (시도 ${attempt}/${maxRetries})`);
        return { accessToken: result.data.session.access_token, ok: true };
      }
    } catch {
      /* getSession 예외 — refreshSession으로 진행 */
    }

    /* 2) refreshSession — HTTP 호출, 새 토큰 발급 */
    try {
      const result = await raceTimeout(supabase.auth.refreshSession(), timeoutMs);
      if (result && 'data' in result && result.data.session?.access_token) {
        log(`refreshSession 성공 (시도 ${attempt}/${maxRetries})`);
        return { accessToken: result.data.session.access_token, ok: true };
      }
    } catch {
      /* refreshSession 예외 — 재시도 */
    }

    /* 마지막 시도가 아니면 백오프 후 재시도 */
    if (attempt < maxRetries) {
      const delay = attempt * 1500; // 1.5s, 3s, 4.5s ...
      log(`시도 ${attempt} 실패, ${delay}ms 후 재시도...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  log(`${maxRetries}회 시도 모두 실패`);
  return { accessToken: null, ok: false };
}
