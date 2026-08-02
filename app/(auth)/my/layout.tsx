'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import { Film, MessageSquareMore, UserCircle } from 'lucide-react';
import { DashboardSidebar, type DashboardSidebarSection } from '@/components/dashboard/dashboard-sidebar';
import { useOtherDashboards } from '@/components/dashboard/use-other-dashboards';

const participantNavItems: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: '/my/submissions', label: '내 출품작', icon: Film },
  { href: '/my/inquiries', label: '내 문의', icon: MessageSquareMore },
  { href: '/my/profile', label: '프로필', icon: UserCircle },
];

interface ParticipantMyLayoutProps {
  children: ReactNode;
}

export default function ParticipantMyLayout({ children }: ParticipantMyLayoutProps) {
  const otherDashboards = useOtherDashboards('my');
  const sections: DashboardSidebarSection[] = [
    { items: participantNavItems },
    ...(otherDashboards ? [otherDashboards] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar sections={sections} roleLabel="참가자" />
      <div className="md:pl-60">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
