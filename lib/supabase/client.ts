/**
 * 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트
 * 'use client' 컴포넌트에서 사용
 * 환경변수 미설정 시 null 반환
 *
 * 세션 정책:
 * - sessionStorage 기반 → 브라우저/탭 닫으면 토큰 소멸
 * - 쿠키 maxAge 1시간 (middleware에서 강제) → 1시간 후 자동 만료
 */
import { createBrowserClient } from '@supabase/ssr';

/** 세션 만료 시간 (초) — 1시간 */
export const SESSION_MAX_AGE = 3600;

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
         * stale lock / 탭 경쟁으로 인한 10s 타임아웃 에러 해결
         */
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<unknown>) => {
          return await fn();
        },
      },
      cookieOptions: {
        // maxAge 없이 session cookie — 브라우저 종료 시 삭제
        // (middleware에서도 maxAge: 3600 적용하여 1시간 제한)
        maxAge: SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  );
}
