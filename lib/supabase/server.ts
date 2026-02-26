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
              /**
               * Supabase가 삭제하려는 쿠키(code verifier 등)는
               * maxAge가 0이므로 원본 옵션을 유지해야 합니다.
               * 세션 쿠키에만 커스텀 옵션을 적용합니다.
               */
              const isDeleteCookie = options?.maxAge === 0;
              cookieStore.set(name, value, {
                ...options,
                ...(isDeleteCookie
                  ? {} // 삭제 쿠키는 Supabase 원본 옵션 유지
                  : {
                    maxAge: SESSION_MAX_AGE,
                    path: '/',
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                  }),
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


/**
 * 공개 데이터 조회용 Supabase 클라이언트 (쿠키 없음)
 * unstable_cache 내부에서 사용 — cookies() 호출이 불가능한 환경용
 * RLS가 anon 역할로 허용된 테이블만 조회 가능
 */
export function createPublicClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'
  ) {
    return null;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}