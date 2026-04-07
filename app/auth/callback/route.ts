/**
 * OAuth / 이메일 인증 콜백 라우트
 *
 * 두 가지 인증 플로우를 지원:
 * 1. PKCE 플로우 (code): OAuth 로그인, 이메일 인증 — code_verifier 쿠키 필요
 * 2. Token Hash 플로우 (token_hash + type): 비밀번호 재설정, 이메일 확인
 *    — 모바일 인앱 브라우저에서 PKCE 쿠키가 없어도 동작
 *
 * 다른 PC에서 IP 주소로 접속 시:
 * 1. Supabase가 Site URL(localhost)로 폴백할 수 있음
 * 2. sb_origin 쿠키를 통해 원래 접속한 origin(IP 주소) 복원
 * 3. 세션 교환 후 원래 origin으로 리다이렉트
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  /* Host 헤더 기반 origin 결정 (--hostname 0.0.0.0 환경에서 request.url이 0.0.0.0이 되는 문제 방지) */
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || requestUrl.host;
  const protocol = request.headers.get('x-forwarded-proto') || (requestUrl.protocol === 'https:' ? 'https' : 'http');
  const currentOrigin = `${protocol}://${host}`;

  /* 쿠키에서 원래 origin 복원 (다른 PC에서 IP로 접속했을 때 Supabase가 localhost로 폴백한 경우) */
  const cookieStore = await cookies();
  const originCookie = cookieStore.get('sb_origin');
  const savedOrigin = originCookie?.value ? decodeURIComponent(originCookie.value) : null;

  const origin = savedOrigin || currentOrigin;

  /* 리다이렉트 경로 */
  const redirectCookie = cookieStore.get('sb_redirect_to');
  const next = redirectCookie?.value
    ? decodeURIComponent(redirectCookie.value)
    : (searchParams.get('next') ?? '/');

  /** Supabase 클라이언트를 생성하고 세션 쿠키를 response에 설정하는 헬퍼 */
  function createSupabaseWithResponse(response: ReturnType<typeof NextResponse.redirect>) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      },
    );
  }

  /** 성공 시 쿠키 정리 + 리다이렉트 헬퍼 */
  function cleanupAndRedirect(response: ReturnType<typeof NextResponse.redirect>) {
    response.cookies.delete('sb_redirect_to');
    response.cookies.delete('sb_origin');
    return response;
  }

  /* ──────────────────────────────────────
   * 플로우 1: PKCE (code 기반)
   * OAuth 로그인, 이메일 인증 시 사용
   * ────────────────────────────────────── */
  if (code) {
    /* savedOrigin 리다이렉트 (다른 PC/IP 접속 대응) */
    if (savedOrigin && savedOrigin !== currentOrigin) {
      const realCallbackUrl = new URL('/auth/callback', savedOrigin);
      realCallbackUrl.searchParams.set('code', code);
      realCallbackUrl.searchParams.set('next', next);
      if (type) realCallbackUrl.searchParams.set('type', type);

      const redirectResponse = NextResponse.redirect(realCallbackUrl.toString());
      redirectResponse.cookies.delete('sb_origin');
      redirectResponse.cookies.delete('sb_redirect_to');
      return redirectResponse;
    }

    const successResponse = NextResponse.redirect(`${origin}${next}`);
    const supabase = createSupabaseWithResponse(successResponse);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (type === 'recovery') {
        const recoveryResponse = NextResponse.redirect(`${origin}/reset-password`);
        for (const cookie of successResponse.cookies.getAll()) {
          recoveryResponse.cookies.set(cookie.name, cookie.value);
        }
        return cleanupAndRedirect(recoveryResponse);
      }
      return cleanupAndRedirect(successResponse);
    }

    /* PKCE 실패 — 모바일 인앱 브라우저에서 code_verifier 쿠키 없는 경우 */
    if (type === 'recovery') {
      return cleanupAndRedirect(
        NextResponse.redirect(`${origin}/forgot-password?error=link_expired`),
      );
    }
    if (type === 'signup' || type === 'email') {
      return cleanupAndRedirect(
        NextResponse.redirect(`${origin}/login#notice=email_verified`),
      );
    }
  }

  /* ──────────────────────────────────────
   * 플로우 2: Token Hash (PKCE 불필요)
   * 모바일 인앱 브라우저에서 비밀번호 재설정 / 이메일 확인 시 사용
   * Supabase가 code_verifier 없이도 세션을 생성할 수 있음
   * ────────────────────────────────────── */
  if (tokenHash && type) {
    const successResponse = NextResponse.redirect(`${origin}${next}`);
    const supabase = createSupabaseWithResponse(successResponse);

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'recovery' | 'email' | 'signup' | 'magiclink' | 'invite',
    });

    if (!error) {
      if (type === 'recovery') {
        const recoveryResponse = NextResponse.redirect(`${origin}/reset-password`);
        for (const cookie of successResponse.cookies.getAll()) {
          recoveryResponse.cookies.set(cookie.name, cookie.value);
        }
        return cleanupAndRedirect(recoveryResponse);
      }
      return cleanupAndRedirect(successResponse);
    }

    /* token_hash 만료 또는 이미 사용된 경우 */
    if (type === 'recovery') {
      return cleanupAndRedirect(
        NextResponse.redirect(`${origin}/forgot-password?error=link_expired`),
      );
    }
    if (type === 'signup' || type === 'email') {
      return cleanupAndRedirect(
        NextResponse.redirect(`${origin}/login#notice=email_confirm_expired`),
      );
    }
  }

  /* ──────────────────────────────────────
   * 모든 플로우 실패 → 로그인 에러
   * ────────────────────────────────────── */
  const errorResponse = NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  errorResponse.cookies.delete('sb_redirect_to');
  errorResponse.cookies.delete('sb_origin');
  return errorResponse;
}
