'use client';

import type { Route } from 'next';
import { Building2, Scale, Shield, User } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import type { DashboardSidebarSection } from './dashboard-sidebar';

/** 대시보드 세계 식별자 — 라우트 접두사와 1:1 */
export type DashboardWorld = 'my' | 'judging' | 'host' | 'admin';

const WORLDS: Array<{
  world: DashboardWorld;
  label: string;
  href: Route;
  icon: typeof User;
  /** 이 세계에 들어갈 수 있는 역할 (빈 배열 = 로그인만 하면 됨) */
  roles: string[];
}> = [
  { world: 'my', label: '참가자 대시보드', href: '/my/submissions' as Route, icon: User, roles: [] },
  { world: 'judging', label: '심사위원 대시보드', href: '/judging' as Route, icon: Scale, roles: ['judge'] },
  { world: 'host', label: '주최자 대시보드', href: '/host/dashboard' as Route, icon: Building2, roles: ['host'] },
  { world: 'admin', label: '관리자 대시보드', href: '/admin/dashboard' as Route, icon: Shield, roles: ['admin'] },
];

/**
 * 지금 보고 있는 대시보드를 뺀, 이 사용자가 들어갈 수 있는 다른 대시보드 목록.
 *
 * 예전에는 /my·/judging·/host·/admin 이 서로를 전혀 모르는 별개의 사이드바였다.
 * 심사위원으로 배정되면 judge 역할이 붙어도(054) /my 안에서는 /judging 으로 갈 링크가
 * 없어서 헤더 메뉴로 되돌아가야 했다. 라우트는 그대로 두고 사이드바끼리만 잇는다.
 *
 * 역할이 하나뿐인 대다수 사용자에게는 아무것도 늘어나지 않는다(빈 배열 → 섹션 없음).
 */
export function useOtherDashboards(current: DashboardWorld): DashboardSidebarSection | null {
  const { profile } = useAuth();
  const roles = profile?.roles ?? [];

  /* 관리자는 전 영역 접근 — 역할 배열에 host/judge 가 없어도 들어갈 수 있다 */
  const isAdmin = roles.includes('admin');

  const items = WORLDS.filter((entry) => {
    if (entry.world === current) return false;
    if (entry.roles.length === 0) return true;
    return isAdmin || entry.roles.some((role) => roles.includes(role));
  }).map(({ label, href, icon }) => ({ label, href, icon }));

  if (items.length === 0) return null;
  return { label: '다른 대시보드', items };
}
