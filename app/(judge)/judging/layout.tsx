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
 * 초대 수락(/invite/[token])은 아직 judge 역할이 없는 사람이 여는 페이지이므로
 * 역할 가드로 감싸면 초대 흐름 자체가 막힌다. (docs/IA.md §4)
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
