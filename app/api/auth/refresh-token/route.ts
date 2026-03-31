/**
 * POST /api/auth/refresh-token
 *
 * 서버 측 토큰 갱신 엔드포인트.
 * middleware가 요청 쿠키에서 세션을 읽고 필요시 자동 갱신하므로,
 * 이 라우트에 도달하면 이미 최신 세션이 쿠키에 반영된 상태.
 *
 * 클라이언트에서 직접 refreshSession()을 호출하면
 * middleware가 이미 rotate한 refresh_token과 충돌하여 실패할 수 있다.
 * 이 엔드포인트를 사용하면 그 문제를 우회한다.
 */
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from '@/lib/env';
import { COOKIE_MAX_AGE } from '@/lib/supabase/client';

export async function POST() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          const isDeleteCookie = options?.maxAge === 0;
          cookieStore.set(name, value, {
            ...options,
            ...(isDeleteCookie
              ? {}
              : {
                  maxAge: COOKIE_MAX_AGE,
                  path: '/',
                  sameSite: 'lax' as const,
                  secure: process.env.NODE_ENV === 'production',
                }),
          });
        }
      },
    },
  });

  /* 1차: refreshSession()으로 직접 토큰 갱신 (가장 확실) */
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshData?.session?.access_token) {
    return NextResponse.json({
      ok: true,
      accessToken: refreshData.session.access_token,
      expiresAt: refreshData.session.expires_at,
    });
  }

  /* 2차: refreshSession 실패 시 getSession으로 기존 유효 토큰 확인 */
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return NextResponse.json({
      ok: true,
      accessToken: session.access_token,
      expiresAt: session.expires_at,
    });
  }

  /* getUser() 제거 — navigator.locks 충돌 + refresh_token 소비 방지 */

  return NextResponse.json(
    { error: refreshError?.message ?? '세션 갱신에 실패했습니다.', ok: false },
    { status: 401 },
  );
}
