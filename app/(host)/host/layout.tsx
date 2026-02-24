'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, FileText, LayoutDashboard, Trophy } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { RoleGuard } from '@/components/auth/role-guard';

const hostDashboardNavItems: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: '/host/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/host/contests', label: '공모전 관리', icon: Trophy },
  { href: '/host/analytics', label: '분석', icon: BarChart3 },
  { href: '/host/reports', label: '리포트', icon: FileText },
];

interface HostDashboardLayoutProps {
  children: ReactNode;
}

export default function HostDashboardLayout({ children }: HostDashboardLayoutProps) {
  return (
    <RoleGuard allowedRoles={['host']}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar items={hostDashboardNavItems} roleLabel="주최자" />
        <div className="md:pl-60">
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
