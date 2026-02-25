/**
 * OAuth 콜백 라우트
 * 디버깅용: 로그를 파일에 기록
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

function debugLog(msg: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  try {
    appendFileSync(join(process.cwd(), 'auth-debug.log'), line);
  } catch {
    // ignore
  }
  console.log(msg);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams, origin } = requestUrl;
  const code = searchParams.get('code');

  debugLog('========================================');
  debugLog('[auth/callback] 콜백 진입!');
  debugLog(`[auth/callback] 전체 URL: ${request.url}`);
  debugLog(`[auth/callback] code 존재: ${!!code}`);
  debugLog(`[auth/callback] searchParams: ${JSON.stringify(Object.fromEntries(searchParams))}`);

  /* 리다이렉트 경로 */
  const cookieStore = await cookies();
  const redirectCookie = cookieStore.get('sb_redirect_to');
  const next = redirectCookie?.value
    ? decodeURIComponent(redirectCookie.value)
    : (searchParams.get('next') ?? '/');

  debugLog(`[auth/callback] redirect 경로: ${next}`);

  /* 현재 쿠키 목록 */
  const allCookies = cookieStore.getAll();
  debugLog(`[auth/callback] 현재 쿠키 수: ${allCookies.length}`);
  debugLog(`[auth/callback] 쿠키 이름들: ${allCookies.map(c => c.name).join(', ')}`);

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
            debugLog(`[auth/callback] setAll 호출, 쿠키 ${cookiesToSet.length}개 설정`);
            for (const { name, value, options } of cookiesToSet) {
              debugLog(`[auth/callback]   쿠키: ${name} (maxAge: ${options?.maxAge})`);
              successResponse.cookies.set(name, value, options);
            }
          },
        },
      },
    );

    debugLog('[auth/callback] exchangeCodeForSession 시작...');
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      successResponse.cookies.delete('sb_redirect_to');
      debugLog(`[auth/callback] ✅ 성공! → ${redirectUrl}`);
      debugLog('========================================');
      return successResponse;
    }

    debugLog(`[auth/callback] ❌ 실패: ${error.message}`);
    debugLog(`[auth/callback] ❌ 에러 코드: ${error.status}`);
    debugLog(`[auth/callback] ❌ 에러 전체: ${JSON.stringify(error)}`);
  } else {
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    debugLog(`[auth/callback] ❌ code 없음! error: ${errorParam}`);
    debugLog(`[auth/callback] ❌ error_description: ${errorDesc}`);
  }

  debugLog('========================================');
  const errorResponse = NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  errorResponse.cookies.delete('sb_redirect_to');
  return errorResponse;
}
