'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { LogOut, Menu, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/supabase/auth-context';

interface DashboardSidebarItem {
  href: Route;
  label: string;
  icon: LucideIcon;
}

/** 섹션 단위 메뉴 — label 없는 섹션은 구분선 없이 평평하게 렌더 */
export interface DashboardSidebarSection {
  label?: string;
  items: DashboardSidebarItem[];
}

interface DashboardSidebarProps {
  /** 평면 메뉴 (host/my/judging처럼 섹션이 필요 없는 대시보드용) */
  items?: DashboardSidebarItem[];
  /** 섹션 메뉴 (admin처럼 메뉴가 많은 대시보드용) — items보다 우선 */
  sections?: DashboardSidebarSection[];
  roleLabel: string;
}

function isItemActive(pathname: string, href: Route, allHrefs: Route[]): boolean {
  if (pathname === href) return true;
  if (pathname.startsWith(`${href}/`)) {
    /* 더 구체적인 href가 있으면 그쪽이 우선 (예: /admin/submissions vs /admin/submissions/register) */
    const hasMoreSpecific = allHrefs.some(
      (other) => other !== href && other.startsWith(`${href}/`) && pathname.startsWith(other as string),
    );
    return !hasMoreSpecific;
  }
  return false;
}

function SidebarNav({ sections, pathname }: { sections: DashboardSidebarSection[]; pathname: string }) {
  const allHrefs = sections.flatMap((section) => section.items.map((item) => item.href));
  return (
    <nav className="space-y-4">
      {sections.map((section, sectionIndex) => (
        <div key={section.label ?? sectionIndex} className="space-y-1">
          {section.label && (
            <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </p>
          )}
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(pathname, item.href, allHrefs);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** 사이드바 하단 — 로그인 계정 정보 + 로그아웃 */
function SidebarFooter({ roleLabel }: { roleLabel: string }) {
  const { user, profile, signOut } = useAuth();
  const displayName = profile?.name || profile?.nickname || user?.email?.split('@')[0] || '사용자';
  const email = profile?.email || user?.email || '';
  const handleSignOut = () => {
    signOut(); /* /api/auth/logout → 쿠키 삭제 → 홈 리다이렉트 */
  };

  return (
    <div className="border-t border-border px-3 py-3 space-y-2">
      {/* 계정 정보 */}
      <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserCircle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground leading-tight">{email} · {roleLabel}</p>
        </div>
      </div>
      {/* 로그아웃 */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive cursor-pointer"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        로그아웃
      </Button>
    </div>
  );
}

/**
 * 대시보드 사이드바
 * 글로벌 헤더(h-16)와 공존한다 — 헤더가 사라지지 않으므로 로고/서비스 홈 중복 없이
 * 헤더 아래(top-16)에서 시작한다. (docs/IA.md §3.1·§3.3)
 */
export function DashboardSidebar({ items, sections, roleLabel }: DashboardSidebarProps) {
  const pathname = usePathname();
  const resolvedSections: DashboardSidebarSection[] = sections ?? [{ items: items ?? [] }];

  return (
    <>
      {/* 데스크톱 사이드바 — 글로벌 헤더 아래에서 시작 */}
      <aside className="fixed top-16 bottom-0 left-0 z-30 hidden w-60 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav sections={resolvedSections} pathname={pathname} />
        </div>
        <SidebarFooter roleLabel={roleLabel} />
      </aside>

      {/* 모바일 사이드바 */}
      <div className="sticky top-16 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu className="h-4 w-4" /> {roleLabel} 메뉴
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 pt-10">
              <SidebarNav sections={resolvedSections} pathname={pathname} />
            </div>
            <SidebarFooter roleLabel={roleLabel} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
