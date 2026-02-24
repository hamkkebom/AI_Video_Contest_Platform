'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { ExternalLink, LogOut, Menu, TreePine, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/supabase/auth-context';

interface DashboardSidebarItem {
  href: Route;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  items: DashboardSidebarItem[];
  roleLabel: string;
}

function isItemActive(pathname: string, href: Route): boolean {
  if (href === '/host/dashboard') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ items, pathname }: { items: DashboardSidebarItem[]; pathname: string }) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(pathname, item.href);

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
    </nav>
  );
}

/** 사이드바 하단 — 로그인 계정 정보 + 로그아웃 */
function SidebarFooter({ roleLabel }: { roleLabel: string }) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.name || profile?.nickname || user?.email?.split('@')[0] || '사용자';
  const email = profile?.email || user?.email || '';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
          <p className="truncate text-xs text-muted-foreground leading-tight">{email}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {roleLabel}
        </span>
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

export function DashboardSidebar({ items, roleLabel }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-card md:flex md:flex-col">
        <div className="border-b border-border px-4 py-4">
          <Link href="/" className="mb-3 flex items-center gap-2 text-lg font-bold transition-colors hover:text-foreground">
            <TreePine className="h-5 w-5 text-primary" />
            <span>꿈플</span>
          </Link>
          <Link href="/contests">
            <Button variant="outline" size="sm" className="w-full justify-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              공모전 보기
            </Button>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav items={items} pathname={pathname} />
        </div>
        <SidebarFooter roleLabel={roleLabel} />
      </aside>

      {/* 모바일 사이드바 */}
      <div className="sticky top-16 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu className="h-4 w-4" /> 메뉴
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <div className="border-b border-border px-4 py-4">
              <Link href="/" className="mb-3 flex items-center gap-2 text-lg font-bold transition-colors hover:text-foreground">
                <TreePine className="h-5 w-5 text-primary" />
                <span>꿈플</span>
              </Link>
              <Link href="/contests">
                <Button variant="outline" size="sm" className="w-full justify-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  공모전 보기
                </Button>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <SidebarNav items={items} pathname={pathname} />
            </div>
            <SidebarFooter roleLabel={roleLabel} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
