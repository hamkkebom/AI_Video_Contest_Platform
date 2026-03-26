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

  /* getUser()는 Supabase Auth 서버에 검증 요청 → 세션이 유효하면 갱신된 토큰 반환 */
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: '세션이 만료되었습니다.', ok: false },
      { status: 401 },
    );
  }

  /* getUser 성공 후 getSession으로 최신 access_token 읽기 */
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json(
      { error: '토큰을 가져올 수 없습니다.', ok: false },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    accessToken: session.access_token,
    expiresAt: session.expires_at,
  });
}
