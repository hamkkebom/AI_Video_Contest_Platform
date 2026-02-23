'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { ExternalLink, Menu, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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

export function DashboardSidebar({ items, roleLabel }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-card md:flex md:flex-col">
        <div className="border-b border-border px-4 py-4">
          <Link href="/" className="mb-3 flex items-center gap-2 text-lg font-bold transition-colors hover:text-foreground">
            <TreePine className="h-5 w-5 text-primary" />
            <span>꿈플</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="w-full justify-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              공모전 보기
            </Button>
          </Link>
        </div>
        <div className="border-b border-border px-4 py-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            {roleLabel}
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav items={items} pathname={pathname} />
        </div>
      </aside>

      <div className="sticky top-16 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu className="h-4 w-4" /> 메뉴
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="border-b border-border px-4 py-4">
              <Link href="/" className="mb-3 flex items-center gap-2 text-lg font-bold transition-colors hover:text-foreground">
                <TreePine className="h-5 w-5 text-primary" />
                <span>꿈플</span>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full justify-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  공모전 보기
                </Button>
              </Link>
            </div>
            <div className="border-b border-border px-4 py-3">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                {roleLabel}
              </Badge>
            </div>
            <div className="p-3">
              <SidebarNav items={items} pathname={pathname} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
