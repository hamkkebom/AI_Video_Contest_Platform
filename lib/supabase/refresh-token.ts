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
    /** 첫 시도 전 대기 시간 (ms). 대용량 업로드 직후 네트워크 안정 대기용 */
    initialDelayMs?: number;
    log?: (msg: string) => void;
  },
): Promise<RefreshResult> {
  const maxRetries = options?.maxRetries ?? 3;
  const timeoutMs = options?.timeoutMs ?? 15000;
  const initialDelayMs = options?.initialDelayMs ?? 0;
  const log = options?.log ?? ((msg: string) => console.log(`[토큰갱신] ${msg}`));

  /* 업로드 직후 네트워크 포화 상태 완화를 위한 대기 */
  if (initialDelayMs > 0) {
    log(`네트워크 안정 대기 ${initialDelayMs}ms...`);
    await new Promise((r) => setTimeout(r, initialDelayMs));
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    /* 1) getSession — 캐시된 토큰이 아직 유효한지 확인 */
    try {
      log(`[${attempt}/${maxRetries}] getSession 호출 중...`);
      const result = await raceTimeout(supabase.auth.getSession(), timeoutMs);

      if (!result) {
        log(`[${attempt}/${maxRetries}] getSession ${timeoutMs}ms 타임아웃`);
      } else {
        const cachedToken = 'data' in result ? result.data.session?.access_token : null;
        const hasSession = 'data' in result ? !!result.data.session : false;

        if (cachedToken && !isTokenExpired(cachedToken)) {
          log(`[${attempt}/${maxRetries}] getSession 성공 — 토큰 유효`);
          return { accessToken: cachedToken, ok: true };
        }

        if (cachedToken) {
          log(`[${attempt}/${maxRetries}] getSession 토큰 만료됨 — refreshSession 진행`);
        } else {
          log(`[${attempt}/${maxRetries}] getSession 세션 없음 (session=${hasSession}) — refreshSession 진행`);
        }
      }
    } catch (e) {
      log(`[${attempt}/${maxRetries}] getSession 예외: ${e instanceof Error ? e.message : String(e)}`);
    }

    /* 2) refreshSession — 서버에서 새 토큰 발급 */
    try {
      log(`[${attempt}/${maxRetries}] refreshSession 호출 중...`);
      const result = await raceTimeout(supabase.auth.refreshSession(), timeoutMs);

      if (!result) {
        log(`[${attempt}/${maxRetries}] refreshSession ${timeoutMs}ms 타임아웃`);
      } else {
        const newToken = 'data' in result ? result.data.session?.access_token : null;

        if (newToken && !isTokenExpired(newToken)) {
          log(`[${attempt}/${maxRetries}] refreshSession 성공`);
          return { accessToken: newToken, ok: true };
        }

        if ('error' in result && result.error) {
          log(`[${attempt}/${maxRetries}] refreshSession 오류: ${result.error.message}`);
        } else {
          log(`[${attempt}/${maxRetries}] refreshSession 토큰 없음 (newToken=${!!newToken})`);
        }
      }
    } catch (e) {
      log(`[${attempt}/${maxRetries}] refreshSession 예외: ${e instanceof Error ? e.message : String(e)}`);
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
