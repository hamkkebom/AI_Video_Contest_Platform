'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import { Trophy, UserCircle } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

const participantNavItems: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: '/my/submissions', label: '내 공모전', icon: Trophy },
  { href: '/my/profile', label: '프로필', icon: UserCircle },
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
