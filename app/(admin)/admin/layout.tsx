'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import {
  BarChart3,
  Briefcase,
  Building2,
  FilePlus,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  Newspaper,
  PlayCircle,
  Settings,
  Trophy,
  UserCircle,
  Users,
  Video,
} from 'lucide-react';
import { DashboardSidebar, type DashboardSidebarSection } from '@/components/dashboard/dashboard-sidebar';
import { RoleGuard } from '@/components/auth/role-guard';

/* 과업 단위 섹션 (docs/IA.md §3.3)
   — "준비중" 라벨은 전부 삭제: 6개 페이지 모두 실구현 상태였음 (문의·대행은 D-011로 검증).
   가격 설정만 수익화 동결(D-005) 섹션에 남긴다. */
const adminSidebarSections: DashboardSidebarSection[] = [
  {
    label: '운영 현황',
    items: [
      { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
      { href: '/admin/analytics', label: '분석', icon: BarChart3 },
    ],
  },
  {
    label: '공모전',
    items: [
      { href: '/admin/contests', label: '공모전 관리', icon: Trophy },
      { href: '/admin/submissions', label: '제출물 관리', icon: Video },
      { href: '/admin/submissions/register', label: '출품작 수동 등록', icon: FilePlus },
      { href: '/admin/videos', label: '영상 플레이어', icon: PlayCircle },
    ],
  },
  {
    label: '회원·문의',
    items: [
      { href: '/admin/users', label: '회원 관리', icon: Users },
      { href: '/admin/companies', label: '기업 관리', icon: Building2 },
      { href: '/admin/inquiries', label: '문의 관리', icon: MessageSquare },
      { href: '/admin/agency-requests', label: '대행 의뢰', icon: Briefcase },
    ],
  },
  {
    label: '콘텐츠',
    items: [
      { href: '/admin/articles', label: '아티클', icon: Newspaper },
      { href: '/admin/popups', label: '팝업 관리', icon: Megaphone },
    ],
  },
  {
    label: '설정',
    items: [
      { href: '/admin/settings' as Route, label: '사이트 설정', icon: Settings },
      { href: '/admin/settings/pricing', label: '가격 설정 (동결)', icon: Settings },
      { href: '/admin/profile', label: '프로필', icon: UserCircle },
    ],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar sections={adminSidebarSections} roleLabel="관리자" />
        <div className="md:pl-60">
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
