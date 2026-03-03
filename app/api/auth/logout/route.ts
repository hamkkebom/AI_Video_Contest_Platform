/**
 * 서버사이드 강제 로그아웃
 * 모든 sb-* 쿠키를 서버에서 직접 삭제 후 홈으로 리다이렉트
 */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  // 1. Supabase signOut (서버사이드 — 리프레시 토큰 무효화)
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // signOut 실패해도 쿠키는 강제 삭제
  }

  // 2. 모든 sb-* 쿠키 강제 삭제
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

  // 3. 홈으로 리다이렉트
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com'));
}
