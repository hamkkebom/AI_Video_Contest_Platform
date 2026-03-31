/**
 * 서버사이드 강제 로그아웃
 * 쿠키만 삭제하고 즉시 리다이렉트 (Supabase API 호출 없음 — hang 방지)
 */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // 모든 sb-* 쿠키 강제 삭제 (Supabase signOut 호출 안 함 — hang 원인 제거)
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-') || cookie.name.startsWith('sb_')) {
      cookieStore.set(cookie.name, '', {
        maxAge: 0,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
  }

  // 홈으로 리다이렉트
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com'));
}
