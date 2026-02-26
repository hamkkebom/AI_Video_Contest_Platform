/**
 * OAuth 콜백 라우트
 * Supabase Auth 코드를 세션으로 교환
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

  /* Host 헤더 기반 origin 결정 (--hostname 0.0.0.0 환경에서 request.url이 0.0.0.0이 되는 문제 방지) */
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || requestUrl.host;
  const protocol = request.headers.get('x-forwarded-proto') || (requestUrl.protocol === 'https:' ? 'https' : 'http');
  const currentOrigin = `${protocol}://${host}`;

  /* 쿠키에서 원래 origin 복원 (다른 PC에서 IP로 접속했을 때 Supabase가 localhost로 폴백한 경우) */
  const cookieStore = await cookies();
  const originCookie = cookieStore.get('sb_origin');
  const savedOrigin = originCookie?.value ? decodeURIComponent(originCookie.value) : null;

  /*
   * 원래 origin과 현재 origin이 다르면 → Supabase가 localhost로 폴백한 것
   * 이 경우 원래 origin(IP 주소)으로 리다이렉트해야 함
   */
  const origin = savedOrigin || currentOrigin;

  /* 리다이렉트 경로 */
  const redirectCookie = cookieStore.get('sb_redirect_to');
  const next = redirectCookie?.value
    ? decodeURIComponent(redirectCookie.value)
    : (searchParams.get('next') ?? '/');

  if (code) {
    /*
     * savedOrigin이 있고, 현재 origin(localhost)과 다르면 →
     * 세션 코드를 쿼리에 포함해 원래 origin의 콜백으로 리다이렉트
     * (세션 쿠키가 올바른 도메인에 설정되도록)
     */
    if (savedOrigin && savedOrigin !== currentOrigin) {
      const realCallbackUrl = new URL('/auth/callback', savedOrigin);
      realCallbackUrl.searchParams.set('code', code);
      realCallbackUrl.searchParams.set('next', next);

      const redirectResponse = NextResponse.redirect(realCallbackUrl.toString());
      // origin 쿠키 삭제 (무한 루프 방지)
      redirectResponse.cookies.delete('sb_origin');
      redirectResponse.cookies.delete('sb_redirect_to');
      return redirectResponse;
    }

    const redirectUrl = `${origin}${next}`;
    const successResponse = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              successResponse.cookies.set(name, value, options);
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      /* 비밀번호 재설정 콜백인 경우 재설정 페이지로 이동 */
      const type = searchParams.get('type');
      if (type === 'recovery') {
        const recoveryResponse = NextResponse.redirect(`${origin}/reset-password`);
        recoveryResponse.cookies.delete('sb_redirect_to');
        recoveryResponse.cookies.delete('sb_origin');
        return recoveryResponse;
      }
      successResponse.cookies.delete('sb_redirect_to');
      successResponse.cookies.delete('sb_origin');
      return successResponse;
    }

    console.error('[auth/callback] 세션 교환 실패:', error.message);
  }

  const errorResponse = NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  errorResponse.cookies.delete('sb_redirect_to');
  errorResponse.cookies.delete('sb_origin');
  return errorResponse;
}
