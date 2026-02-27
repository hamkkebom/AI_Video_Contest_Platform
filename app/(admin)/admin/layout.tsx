'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  FilePlus,
  LayoutDashboard,
  Trophy,
  Users,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { RoleGuard } from '@/components/auth/role-guard';

const adminDashboardNavItems: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/contests', label: '공모전 관리', icon: Trophy },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  // TODO: 추후 활성화 예정
  // { href: '/admin/submissions', label: '제출물 관리', icon: Video },
  { href: '/admin/submissions/register', label: '출품작 등록', icon: FilePlus },
  // { href: '/admin/companies', label: '기업 관리', icon: Building2 },
  // { href: '/admin/inquiries', label: '문의 관리', icon: MessageSquare },
  // { href: '/admin/articles', label: '아티클', icon: Newspaper },
  // { href: '/admin/agency-requests', label: '대행 의뢰', icon: Briefcase },
  // { href: '/admin/analytics', label: '분석', icon: BarChart3 },
  // { href: '/admin/settings/pricing', label: '가격 설정', icon: Settings },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar items={adminDashboardNavItems} roleLabel="관리자" />
        <div className="md:pl-60">
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
