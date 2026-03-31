/**
 * 토큰 갱신 유틸리티 (단순화)
 *
 * JWT 7일 설정이므로 대부분의 경우 갱신이 불필요.
 * 만료 시: 서버 API 1회 호출 → 실패 시 실패 반환 (클라이언트 refreshSession 사용 안 함 — 레이스 컨디션 방지)
 */
import type { SupabaseClient } from '@supabase/supabase-js';

type RefreshResult = { accessToken: string; ok: true } | { accessToken: null; ok: false };

/** JWT exp 클레임으로 만료 여부 판단 (60초 마진) */
export function isTokenExpired(token: string, marginSeconds = 60): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp !== 'number' || Date.now() >= (payload.exp - marginSeconds) * 1000;
  } catch {
    return true;
  }
}

/**
 * 유효한 access_token을 가져온다.
 *
 * 1) getSession()으로 현재 토큰 확인 — 유효하면 즉시 반환
 * 2) 만료된 경우 서버 API(/api/auth/refresh-token) 1회 호출
 * 3) 실패 시 { ok: false } 반환
 */
export async function refreshAccessToken(
  supabase: SupabaseClient,
  options?: {
    timeoutMs?: number;
    log?: (msg: string) => void;
  },
): Promise<RefreshResult> {
  const timeoutMs = options?.timeoutMs ?? 10000;
  const log = options?.log ?? (() => {});

  /* 1) getSession()으로 현재 토큰 확인 (네트워크 호출 없음, 즉시) */
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && !isTokenExpired(session.access_token)) {
      return { accessToken: session.access_token, ok: true };
    }
  } catch {}

  /* 2) 토큰 만료/없음 → 서버 API로 갱신 (1회만, 타임아웃 적용) */
  try {
    log('서버 API 토큰 갱신 호출');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const body = await res.json();
      if (body.accessToken && !isTokenExpired(body.accessToken)) {
        log('토큰 갱신 성공');
        return { accessToken: body.accessToken, ok: true };
      }
    }
    log('서버 API 갱신 실패');
  } catch (e) {
    log(`서버 API 예외: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { accessToken: null, ok: false };
}
