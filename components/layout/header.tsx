'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { TreePine, Sun, Moon, Sparkles, Menu, LogIn, LogOut, UserPen, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/supabase/auth-context';

/**
 * 공통 메뉴 아이템 (역할 무관)
 */
interface MenuItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const commonMenuItems: MenuItem[] = [
  // { label: '공모전', href: '/contests?status=open' }, // 미완성 — 배포 시 숨김
];

/**
 * 호버로 열리는 드롭다운 메뉴 컴포넌트
 */
function HoverDropdown({ linkClass, item }: { linkClass: string; item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  /* 언마운트 시 타이머 정리 */
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={() => {}} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={linkClass}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          {item.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-44"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onPointerDownOutside={() => setOpen(false)}
        onEscapeKeyDown={() => setOpen(false)}
      >
        {item.children?.map((child) => (
          <DropdownMenuItem key={child.href} asChild className="cursor-pointer">
            <Link href={child.href as any} className="w-full">
              {child.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 사용자 이름에서 아바타 이니셜 추출
 */
function getInitial(name: string | undefined | null): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

/**
 * 글로벌 헤더 컴포넌트
 * Supabase Auth 기반 인증 상태 반영
 */
export function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const { theme, setTheme } = useTheme();

  /* 인증 상태 파생 */

  const isGuest = !user;

  /* 유저 역할에 따른 대시보드 경로 */
  const dashboardHref = (() => {
    const roles = profile?.roles ?? [];
    if (roles.includes('admin')) return '/admin/dashboard';
    if (roles.includes('host')) return '/host/dashboard';
    return '/my/submissions';
  })();

  const isLoginPage = pathname === '/login' || pathname === '/signup';
  const isDashboardPage =
    pathname.startsWith('/host') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/judging') ||
    pathname.startsWith('/my');

  const displayName = profile?.name || profile?.nickname || user?.email?.split('@')[0] || '사용자';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  /* 로그아웃 후 현재 페이지 유지 */
  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  /**
   * 프로필 아바타 + 드롭다운 (데스크톱/모바일 공용)
   */
  const renderProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {getInitial(displayName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-48">
        {/* 사용자 정보 */}
        <div className="px-2 py-1.5 text-sm font-medium truncate">{displayName}</div>
        <DropdownMenuSeparator />
        {/* 테마 토글 그룹 */}
        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2 cursor-pointer">
          <Sun className="h-4 w-4" />
          라이트
          {mounted && theme === 'light' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2 cursor-pointer">
          <Moon className="h-4 w-4" />
          다크
          {mounted && theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('signature')} className="flex items-center gap-2 cursor-pointer">
          <Sparkles className="h-4 w-4" />
          시그니처
          {mounted && theme === 'signature' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* 프로필 편집 */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/my/profile" className="flex items-center gap-2">
            <UserPen className="h-4 w-4" />
            프로필 편집
          </Link>
        </DropdownMenuItem>
        {/* 로그아웃 */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  /* 알림 벨 — 알림 시스템 구현 전까지 숨김 */

  return (
    <>
      {!isDashboardPage && !isLoginPage && <header className="sticky top-0 z-50 w-full shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center px-4">
          {/* 왼쪽 — 로고 (데스크톱) */}
          <div className="hidden md:flex flex-shrink-0 items-center mr-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
              <TreePine className="h-5 w-5 text-primary" />
              <span>꿈플</span>
            </Link>
          </div>

          {/* 모바일 로고 */}
          <div className="flex md:hidden flex-shrink-0 items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
              <TreePine className="h-5 w-5 text-primary" />
              <span>꿈플</span>
            </Link>
          </div>

          {/* 중앙 — 공통 메뉴 */}
          <nav className="hidden md:flex items-center gap-8 mr-auto">
            {commonMenuItems.map((item) => {
              const hrefPath = item.href.split('?')[0];
              const isActive = pathname.startsWith('/gallery')
                ? item.href.startsWith('/gallery')
                : pathname === hrefPath || pathname.startsWith(hrefPath + '/');

              const linkClass = `relative text-[1.05rem] leading-snug cursor-pointer transition-all py-1 focus-visible:outline-none ${isActive
                ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full'
                : 'text-muted-foreground hover:text-primary hover:font-semibold after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-primary/60 after:rounded-full after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full'
                }`;

              if (item.children) {
                return (
                  <HoverDropdown key={item.label} linkClass={linkClass} item={item} />
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={linkClass}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 오른쪽 — 데스크톱 액션 영역 */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-end gap-2">
            {isGuest ? (
              <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 w-[10rem] justify-center cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  로그인
                </Button>
              </Link>
            ) : (
              <>
                {/* 대시보드 링크 */}
                <Link href={dashboardHref as any}>
                  <Button variant="outline" size="sm" className="w-[7.5rem] justify-center gap-1.5 cursor-pointer">
                    <LayoutGrid className="h-4 w-4" />
                    대시보드
                  </Button>
                </Link>

                {/* 프로필 아바타 + 드롭다운 */}
                {renderProfileDropdown()}

              </>
            )}
          </div>

          {/* 모바일 액션 영역 */}
          <div className="flex md:hidden flex-1 items-center justify-end gap-1">

            {/* 게스트 — 모바일 로그인 버튼 */}
            {isGuest ? (
              <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  로그인
                </Button>
              </Link>
            ) : (
              /* 프로필 아바타 — 모바일 */
              renderProfileDropdown()
            )}

            {/* 모바일 메뉴 */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-2 mt-8">
                  {commonMenuItems.map((item) => {
                    const hrefPath = item.href.split('?')[0];
                    const isActive = pathname.startsWith('/gallery')
                      ? item.href.startsWith('/gallery')
                      : pathname === hrefPath || pathname.startsWith(hrefPath + '/');

                    if (item.children) {
                      return (
                        <div key={item.label} className="space-y-1">
                          <div className={`px-4 py-2 text-[1.05rem] font-medium ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                            {item.label}
                          </div>
                          {item.children.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <Link key={child.href} href={child.href as any}>
                                <Button
                                  variant="ghost"
                                  className={`w-full justify-start text-base pl-8 ${childActive
                                    ? 'text-primary font-semibold bg-primary/5 border-l-2 border-primary'
                                    : 'hover:text-primary hover:font-semibold hover:bg-primary/5'
                                    }`}
                                >
                                  {child.label}
                                </Button>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    }

                    return (
                      <Link key={item.href} href={item.href as any}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-[1.05rem] focus-visible:ring-0 ${isActive
                            ? 'text-primary font-semibold bg-primary/5 border-l-2 border-primary'
                            : 'hover:text-primary hover:font-semibold hover:bg-primary/5'
                            }`}
                        >
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                  {!isGuest && (
                    <div className="border-t border-border pt-2 mt-2 space-y-1">
                      <Link href={dashboardHref as any}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <LayoutGrid className="h-4 w-4" />
                          대시보드
                        </Button>
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>}
    </>
  );
}
