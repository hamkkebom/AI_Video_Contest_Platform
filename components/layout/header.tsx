'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { TreePine, Sun, Moon, Sparkles, Menu, LogIn, LogOut, Loader2, UserPen, LayoutGrid, Shield, Building2, User, Scale } from 'lucide-react';
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
  { label: '공모전', href: '/contests?status=open' },
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
  const [isSigningOut, setIsSigningOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const { theme, setTheme } = useTheme();

  /* 인증 상태 파생 */

  const isGuest = !user;

  /* 유저 역할 */
  const roles = profile?.roles ?? [];
  const isAdmin = roles.includes('admin');

  /* admin이 아닌 유저용 단일 대시보드 경로 */
  const dashboardHref = (() => {
    if (roles.includes('host')) return '/host/dashboard';
    return '/my/submissions';
  })();

  /* admin용 대시보드 선택지 */
  const adminDashboards = [
    { label: '관리자 대시보드', href: '/admin/dashboard', icon: Shield },
    { label: '주최자 대시보드', href: '/host/dashboard', icon: Building2 },
    { label: '참가자 대시보드', href: '/my/submissions', icon: User },
    { label: '심사위원 대시보드', href: '/judging', icon: Scale },
  ];

  const isLoginPage = pathname === '/login' || pathname === '/signup';
  const isDashboardPage =
    pathname.startsWith('/host') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/judging') ||
    pathname.startsWith('/my');

  const displayName = profile?.name || profile?.nickname || user?.email?.split('@')[0] || '사용자';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  /* 로그아웃 후 랜딩페이지로 이동 (클라이언트 사이드 내비게이션, 새로고침 없음) */
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      /* signOut()이 user/profile/session을 null로 초기화하므로
         router.refresh() 없이 replace만으로 충분 */
      router.replace('/contests/3/landing');
    } catch {
      /* signOut 실패 시에도 랜딩으로 이동 */
      router.replace('/contests/3/landing');
    } finally {
      setIsSigningOut(false);
    }
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
          disabled={isSigningOut}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          {isSigningOut ? '로그아웃 중...' : '로그아웃'}
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
            <Link href="/contests/3/landing" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
              <TreePine className="h-5 w-5 text-primary" />
              <span>꿈플</span>
            </Link>
          </div>

          {/* 모바일 로고 */}
          <div className="flex md:hidden flex-shrink-0 items-center">
            <Link href="/contests/3/landing" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
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
                {/* 대시보드 링크 — admin은 드롭다운, 그 외는 바로 이동 */}
                {isAdmin ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-[7.5rem] justify-center gap-1.5 cursor-pointer">
                        <LayoutGrid className="h-4 w-4" />
                        대시보드
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end" className="w-48">
                      {adminDashboards.map((d) => (
                        <DropdownMenuItem key={d.href} asChild className="cursor-pointer">
                          <Link href={d.href as any} className="flex items-center gap-2">
                            <d.icon className="h-4 w-4" />
                            {d.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href={dashboardHref as any}>
                    <Button variant="outline" size="sm" className="w-[7.5rem] justify-center gap-1.5 cursor-pointer">
                      <LayoutGrid className="h-4 w-4" />
                      대시보드
                    </Button>
                  </Link>
                )}

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
                      {isAdmin ? (
                        /* admin — 4가지 대시보드 선택 */
                        adminDashboards.map((d) => (
                          <Link key={d.href} href={d.href as any}>
                            <Button variant="ghost" className="w-full justify-start gap-2">
                              <d.icon className="h-4 w-4" />
                              {d.label}
                            </Button>
                          </Link>
                        ))
                      ) : (
                        <Link href={dashboardHref as any}>
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            대시보드
                          </Button>
                        </Link>
                      )}
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
