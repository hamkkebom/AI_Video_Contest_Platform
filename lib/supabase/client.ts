/**
 * 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트
 * 'use client' 컴포넌트에서 사용
 * 환경변수 미설정 시 null 반환
 */
import { createBrowserClient } from '@supabase/ssr';

/** Supabase 환경변수가 설정되어 있는지 확인 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co'
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
