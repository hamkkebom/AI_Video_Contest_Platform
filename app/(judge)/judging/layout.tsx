'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import { ClipboardList } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { RoleGuard } from '@/components/auth/role-guard';

const judgeDashboardNavItems: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: '/judging', label: '배정된 공모전', icon: ClipboardList },
];

interface JudgeLayoutProps {
  children: ReactNode;
}

/**
 * /judging 전용 레이아웃 — RoleGuard는 여기에만 건다.
 * 심사위원은 주최자가 배정하는 즉시 judge 역할을 받으므로(054) 이 가드를 그대로 통과한다.
 */
export default function JudgeLayout({ children }: JudgeLayoutProps) {
  return (
    <RoleGuard allowedRoles={['judge', 'admin', 'host']}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar items={judgeDashboardNavItems} roleLabel="심사위원" />
        <div className="md:pl-60">
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
