/**
 * Middleware용 Supabase 클라이언트
 * 요청마다 세션(쿠키) 갱신 + 보호 라우트 인증 가드
 *
 * 세션 정상 (슬라이딩 만료):
 * - 매 요청마다 쿠키 maxAge를 7일로 재설정
 * - 비활동 타임아웃 24시간 (SessionTimeoutGuard에서 처리)
 * - 브라우저 종료 시에도 쿠키 소멸
 * - 보호 경로 미인증 시 /login으로 리다이렉트
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_MAX_AGE } from './client';
import { getSupabaseEnv } from '@/lib/env';

/** 쿠키 옵션 (모든 auth 쿠키에 동일 적용) */
const COOKIE_OPTIONS = {
  maxAge: COOKIE_MAX_AGE,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export async function updateSession(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    url,
    anonKey,
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
            /**
             * 삭제 쿠키(code verifier 등)는 원본 옵션 유지
             */
            const isDeleteCookie = options?.maxAge === 0;
            supabaseResponse.cookies.set(name, value, {
              ...options,
              ...(isDeleteCookie
                ? {}
                : COOKIE_OPTIONS),
            });
          }
        },
      },
    },
  );

  /* 세션 갱신: getUser()로 서버 검증 + 자동 토큰 갱신 (5초 타임아웃)
     getUser()는 만료된 토큰을 자동으로 갱신해주지만 hang 위험이 있어 타임아웃 적용.
     타임아웃 시 getSession() 폴백 (캐시된 세션, 갱신 없음). */
  let user: { id: string; email?: string } | null = null;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);
    if (result && 'data' in result) {
      user = result.data.user;
    }
  } catch { /* getUser 실패 시 폴백 */ }
  /* getUser() 실패/타임아웃 시 getSession() 폴백 */
  if (!user) {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user ?? null;
  }

  /* 깨진 세션 자동 정리: 쿠키는 있지만 유저 인증 불가 → 쿠키 강제 삭제
     → 다음 요청 시 미로그인 → 보호 페이지면 자동 로그인 리다이렉트
     → 사용자가 로그아웃 안 해도 새 세션 발급됨 */
  const hasAuthCookies = request.cookies.getAll().some(c => c.name.startsWith('sb-'));
  if (hasAuthCookies && !user) {
    const expiredOptions = { path: '/', maxAge: 0 } as const;
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith('sb-')) {
        supabaseResponse.cookies.set(cookie.name, '', expiredOptions);
      }
    }
  }
  /* ====== 라우트 가드: 보호 경로 미인증 시 /login 리다이렉트 ====== */
  const { pathname } = request.nextUrl;

  /* ====== 슬러그 리다이렉트: /contests/contest-1/* → /contests/3/* ====== */
  const slugMatch = pathname.match(/^\/contests\/([^/]+)(\/.+)?$/);
  if (slugMatch) {
    const contestIdOrSlug = slugMatch[1];
    const rest = slugMatch[2] ?? '';
    /* 숫자가 아닌 경우 슬러그로 판단 → DB에서 실제 ID 조회 */
    if (!/^\d+$/.test(contestIdOrSlug)) {
      /* 디코딩된 slug로 조회 (한글 URL 지원) */
      const decodedSlug = decodeURIComponent(contestIdOrSlug);
      const { data } = await supabase
        .from('contests')
        .select('id')
        .eq('slug', decodedSlug)
        .maybeSingle();
      if (data) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/contests/${data.id}${rest}`;
        return NextResponse.redirect(redirectUrl, 301);
      }
    }
  }

  const isProtectedRoute =
    pathname.startsWith('/my') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/host') ||
    pathname.startsWith('/judging') ||
    /^\/gallery\/\d+/.test(pathname) ||
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
