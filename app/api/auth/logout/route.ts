/**
 * 서버사이드 강제 로그아웃
 * 쿠키만 삭제하고 즉시 리다이렉트 (Supabase API 호출 없음 — hang 방지)
 */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // 모든 sb-* 쿠키 강제 삭제 — 모든 가능한 옵션 조합으로 삭제
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const isProduction = process.env.NODE_ENV === 'production';
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-') || cookie.name.startsWith('sb_')) {
      // 여러 옵션 조합으로 삭제 시도 (원래 설정을 모르므로 모두 시도)
      for (const sameSite of ['lax', 'strict', 'none'] as const) {
        cookieStore.set(cookie.name, '', {
          maxAge: 0,
          expires: new Date(0),
          path: '/',
          secure: isProduction,
          sameSite,
          httpOnly: true,
        });
        cookieStore.set(cookie.name, '', {
          maxAge: 0,
          expires: new Date(0),
          path: '/',
          secure: isProduction,
          sameSite,
          httpOnly: false,
        });
      }
    }
  }

  // 홈으로 리다이렉트
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com'));
}
