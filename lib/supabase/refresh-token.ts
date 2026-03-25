/**
 * 견고한 토큰 갱신 유틸리티
 * - JWT 만료 시간 검증 후 getSession / refreshSession 분기
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
 * JWT의 exp 클레임을 읽어 만료 여부를 판단한다.
 * 만료 60초 전부터 만료로 간주 (여유 마진)
 */
function isTokenExpired(token: string, marginSeconds = 60): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (typeof exp !== 'number') return true;
    return Date.now() >= (exp - marginSeconds) * 1000;
  } catch {
    return true; // 파싱 실패 → 만료 취급
  }
}

/**
 * Supabase 세션에서 유효한(만료되지 않은) access_token을 가져온다.
 *
 * 1) getSession으로 캐시된 토큰 확인 → 만료 안 됐으면 즉시 반환
 * 2) 만료됐거나 없으면 refreshSession으로 새 토큰 발급
 * 3) 실패 시 최대 maxRetries회 재시도 + 백오프
 *
 * @param supabase - 브라우저 Supabase 클라이언트
 * @param options.maxRetries - 최대 재시도 횟수 (기본 3)
 * @param options.timeoutMs - 각 호출 타임아웃 (기본 8000ms)
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
  const timeoutMs = options?.timeoutMs ?? 8000;
  const log = options?.log ?? ((msg: string) => console.log(`[토큰갱신] ${msg}`));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    /* 1) getSession — 캐시된 토큰이 아직 유효한지 확인 */
    try {
      const result = await raceTimeout(supabase.auth.getSession(), timeoutMs);
      const cachedToken = result && 'data' in result ? result.data.session?.access_token : null;

      if (cachedToken && !isTokenExpired(cachedToken)) {
        log(`getSession 성공 — 토큰 유효 (시도 ${attempt}/${maxRetries})`);
        return { accessToken: cachedToken, ok: true };
      }

      if (cachedToken) {
        log(`getSession 토큰 만료됨 — refreshSession 진행 (시도 ${attempt}/${maxRetries})`);
      }
    } catch {
      log(`getSession 예외 — refreshSession 진행 (시도 ${attempt}/${maxRetries})`);
    }

    /* 2) refreshSession — 서버에서 새 토큰 발급 */
    try {
      const result = await raceTimeout(supabase.auth.refreshSession(), timeoutMs);
      const newToken = result && 'data' in result ? result.data.session?.access_token : null;

      if (newToken && !isTokenExpired(newToken)) {
        log(`refreshSession 성공 (시도 ${attempt}/${maxRetries})`);
        return { accessToken: newToken, ok: true };
      }

      if (result && 'error' in result && result.error) {
        log(`refreshSession 오류: ${result.error.message} (시도 ${attempt}/${maxRetries})`);
      }
    } catch {
      log(`refreshSession 예외 (시도 ${attempt}/${maxRetries})`);
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
