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

export default function JudgeLayout({ children }: JudgeLayoutProps) {
  return (
    <RoleGuard allowedRoles={['judge']}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar items={judgeDashboardNavItems} roleLabel="심사위원" />
        <div className="md:pl-60">
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
