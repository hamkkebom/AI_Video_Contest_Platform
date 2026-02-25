'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  /** 허용할 역할 목록 (OR 조건 — 하나라도 있으면 통과) */
  allowedRoles: string[];
  children: ReactNode;
}

/**
 * 역할 기반 라우트 가드
 * - 로딩 중이면 스켈레톤 UI 표시
 * - 프로필 로드 후 역할 체크 → 권한 없으면 홈으로 리다이렉트
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hasRole = profile?.roles?.some((r) => allowedRoles.includes(r)) ?? false;

  useEffect(() => {
    /* 로딩 중이면 아직 판단 불가 */
    if (loading) return;

    /* 비로그인 — 미들웨어가 리다이렉트 못했을 때의 폴백 */
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    /* 프로필 로드됨 + 권한 없음 */
    if (profile && !hasRole) {
      router.replace('/');
    }
  }, [loading, user, profile, hasRole, router]);

  /* 로딩 / 프로필 대기 */
  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  /* 권한 없음 — 리다이렉트 대기 중 표시 */
  if (!hasRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold">접근 권한이 없습니다</h2>
          <p className="text-sm text-muted-foreground">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}