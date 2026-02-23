/**
 * 서버(Server Component / Route Handler / Server Action)용 Supabase 클라이언트
 * 쿠키 기반 세션 관리
 * 환경변수 미설정 시 null 반환
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SESSION_MAX_AGE } from './client';

export async function createClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'
  ) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, {
                ...options,
                maxAge: SESSION_MAX_AGE,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              });
            }
          } catch {
            /* Server Component에서는 쿠키 설정 불가 — middleware에서 처리 */
          }
        },
      },
    },
  );
}
