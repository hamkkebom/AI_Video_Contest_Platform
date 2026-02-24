/**
 * Middleware용 Supabase 클라이언트
 * 요청마다 세션(쿠키) 갱신 + 보호 라우트 인증 가드
 *
 * 세션 정상 (슬라이딩 만료):
 * - 매 요청마다 쿠키 maxAge를 1시간으로 재설정
 * - 마지막 활동 기준 1시간 동안 움직임이 없으면 세션 만료
 * - 브라우저 종료 시에도 쿠키 소멸
 * - 보호 경로 미인증 시 /login으로 리다이렉트
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_MAX_AGE } from './client';

/** 쿠키 옵션 (모든 auth 쿠키에 동일 적용) */
const COOKIE_OPTIONS = {
  maxAge: SESSION_MAX_AGE,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export async function updateSession(request: NextRequest) {
  /* Supabase 미설정 시 미들웨어 건너뛰기 */
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'
  ) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, {
              ...options,
              ...COOKIE_OPTIONS,
            });
          }
        },
      },
    },
  );

  /* 세션 갱신 (만료된 토큰 자동 리프레시) */
  const { data: { user } } = await supabase.auth.getUser();
  /* ====== 라우트 가드: 보호 경로 미인증 시 /login 리다이렉트 ====== */
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/my') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/host') ||
    pathname.startsWith('/judging') ||
    /^\/contests\/[^/]+\/submit/.test(pathname);

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  /**
   * 슬라이딩 만료: 유저가 인증된 상태면
   * 매 요청마다 모든 sb-* 쿠키의 maxAge를 1시간으로 재설정
   *
   * setAll은 토큰 리프레시 시에만 호출되므로,
   * 활동 중이지만 토큰 갱신이 불필요한 경우에도 maxAge를 연장해야 함
   */
  if (user) {
    const authCookies = request.cookies.getAll().filter(c => c.name.startsWith('sb-'));
    for (const cookie of authCookies) {
      supabaseResponse.cookies.set(cookie.name, cookie.value, COOKIE_OPTIONS);
    }
  }
  return supabaseResponse;
}
