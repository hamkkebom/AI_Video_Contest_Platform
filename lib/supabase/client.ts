/**
 * 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트
 * 'use client' 컴포넌트에서 사용
 * 환경변수 미설정 시 null 반환
 *
 * 세션 정책:
 * - sessionStorage 기반 → 브라우저/탭 닫으면 토큰 소멸
 * - JWT Expiry 7일 (Supabase 대시보드 설정)
 * - 쿠키 maxAge 7일 (middleware에서 슬라이딩 연장)
 * - 비활동 타임아웃 24시간 (SessionTimeoutGuard)
 */
import { createBrowserClient } from '@supabase/ssr';

/** 비활동 세션 타임아웃 (초) — 24시간 (SessionTimeoutGuard에서 사용) */
export const SESSION_MAX_AGE = 24 * 3600;

/**
 * 쿠키 유효기간 (초) — 7일
 * JWT Expiry(7일)와 맞춰서 refresh_token을 보존.
 */
export const COOKIE_MAX_AGE = 7 * 24 * 3600;

/** Supabase 환경변수가 설정되어 있는지 확인 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co'
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        /**
         * Navigator LockManager 타임아웃 방지
         * lock 획득을 시도하되, stale lock / 탭 경쟁 시 graceful fallback
         * → 동시 토큰 갱신 경쟁은 최소화하면서 타임아웃 차단 방지
         */
        lock: async <R>(name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
          if (typeof navigator === 'undefined' || !navigator.locks) {
            return await fn();
          }
          try {
            return await navigator.locks.request(
              name,
              { mode: 'exclusive', ifAvailable: true },
              async (lock) => {
                if (lock) {
                  // lock 획득 성공 — 정상 실행
                  return await fn();
                }
                // lock 점유 중 (다른 탭이 사용 중) — 대기 없이 실행
                return await fn();
              },
            );
          } catch {
            // LockManager API 오류 (브라우저 미지원 등) — fallback
            return await fn();
          }
        },
      },
      cookieOptions: {
        // refresh_token 보존을 위해 7일 유지
        // 세션 타임아웃(1시간)은 SessionTimeoutGuard에서 별도 처리
        maxAge: COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      storage: {
        /* 직접 스토리지 호스트명 사용 — request buffering 비활성화로 업로드 성능 향상 */
        /* *.supabase.co → *.storage.supabase.co */
        useNewHostname: true,
      },
    },
  );
}
