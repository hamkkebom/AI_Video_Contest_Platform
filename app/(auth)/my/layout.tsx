'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Film, LayoutGrid, Smartphone, UserCircle } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

const participantNavItems: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: '/my/activity' as Route, label: '내 활동', icon: LayoutGrid },
  { href: '/my/submissions', label: '내 출품작', icon: Film },
  { href: '/my/analytics', label: '내 분석', icon: BarChart3 },
  { href: '/my/profile', label: '프로필', icon: UserCircle },
  { href: '/my/devices', label: '기기 관리', icon: Smartphone },
];

interface ParticipantMyLayoutProps {
  children: ReactNode;
}

export default function ParticipantMyLayout({ children }: ParticipantMyLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar items={participantNavItems} roleLabel="참가자" />
      <div className="md:pl-60">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
