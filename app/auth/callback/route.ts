/**
 * OAuth 콜백 라우트
 * Supabase Auth 코드를 세션으로 교환
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams, origin } = requestUrl;
  const code = searchParams.get('code');

  /* 리다이렉트 경로 */
  const cookieStore = await cookies();
  const redirectCookie = cookieStore.get('sb_redirect_to');
  const next = redirectCookie?.value
    ? decodeURIComponent(redirectCookie.value)
    : (searchParams.get('next') ?? '/');

  if (code) {
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
      successResponse.cookies.delete('sb_redirect_to');
      return successResponse;
    }

    console.error('[auth/callback] 세션 교환 실패:', error.message);
  }

  const errorResponse = NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  errorResponse.cookies.delete('sb_redirect_to');
  return errorResponse;
}
