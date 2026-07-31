'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { TreePine, Sun, Moon, Sparkles, Menu, LogIn, LogOut, Loader2, UserPen, LayoutGrid, Shield, Building2, User, Scale, Search } from 'lucide-react';
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
  href: Route;
  settingKey?: string;
}

/* 내비 모델은 docs/IA.md §3.1 기준 — 링크에 쿼리 파라미터 금지, 기본 탭은 목록 페이지가 결정 */
const allMenuItems: MenuItem[] = [
  { label: '공모전', href: '/contests' },
  { label: '갤러리', href: '/gallery/all', settingKey: 'menu.gallery' },
  { label: '수상작', href: '/gallery/awards' },
  { label: '스토리', href: '/story', settingKey: 'menu.story' },
];

/** 갤러리 하위 경로는 수상작(/gallery/awards)과 그 외로 나눠 활성 표시 */
function isMenuActive(pathname: string, hrefPath: string): boolean {
  if (hrefPath === '/gallery/all') {
    return pathname.startsWith('/gallery') && !pathname.startsWith('/gallery/awards');
  }
  return pathname === hrefPath || pathname.startsWith(hrefPath + '/');
}

interface HeaderProps {
  siteSettings?: Record<string, boolean>;
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
export function Header({ siteSettings = {} }: HeaderProps) {
  const { user, profile, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const commonMenuItems = allMenuItems.filter(
    (item) => !item.settingKey || siteSettings[item.settingKey],
  );

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const { theme, setTheme } = useTheme();

  /* 인증 상태 파생 */

  const isGuest = !user;

  /* 유저 역할 */
  const roles = profile?.roles ?? [];
  const isAdmin = roles.includes('admin');

  /* 역할별 프로필 경로 */
  const profileHref: Route = (() => {
    if (roles.includes('admin')) return '/admin/profile' as Route;
    if (roles.includes('host')) return '/host/profile' as Route;
    return '/my/profile' as Route;
  })();

  /* 대시보드 선택지 — 보유 역할만 나열한다.
     참가자 대시보드는 모든 로그인 유저에게 열려 있으므로 항상 포함
     (host 겸직 유저가 자기 출품작으로 갈 진입점을 잃지 않게). admin은 전체 노출 */
  const roleDashboards: Array<{ label: string; href: Route; icon: typeof Shield }> = isAdmin
    ? [
        { label: '관리자 대시보드', href: '/admin/dashboard', icon: Shield },
        { label: '주최자 대시보드', href: '/host/dashboard', icon: Building2 },
        { label: '참가자 대시보드', href: '/my/submissions', icon: User },
        { label: '심사위원 대시보드', href: '/judging', icon: Scale },
      ]
    : [
        ...(roles.includes('host')
          ? [{ label: '주최자 대시보드', href: '/host/dashboard' as Route, icon: Building2 }]
          : []),
        { label: '참가자 대시보드', href: '/my/submissions' as Route, icon: User },
        ...(roles.includes('judge')
          ? [{ label: '심사위원 대시보드', href: '/judging' as Route, icon: Scale }]
          : []),
      ];

  const isLoginPage = pathname === '/login' || pathname === '/signup';

  const displayName = profile?.name || profile?.nickname || user?.email?.split('@')[0] || '사용자';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  /* 로그아웃 처리: 공개 페이지면 현재 위치 유지, 보호 라우트면 홈으로 이동 */
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      /* 보호 라우트에서 로그아웃하면 미들웨어가 login으로 보내기 전에 홈으로 이동 */
      const isProtected =
        pathname.startsWith('/my') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/host') ||
        pathname.startsWith('/judging') ||
        /^\/contests\/[^/]+\/submit/.test(pathname);
      if (isProtected) {
        router.replace('/');
      }
    } catch {
      /* signOut 실패 시에도 보호 라우트면 홈으로 */
      const isProtected =
        pathname.startsWith('/my') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/host') ||
        pathname.startsWith('/judging') ||
        /^\/contests\/[^/]+\/submit/.test(pathname);
      if (isProtected) {
        router.replace('/');
      }
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
        {/* 프로필 */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={profileHref} className="flex items-center gap-2">
            <UserPen className="h-4 w-4" />
            프로필
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
      {/* 대시보드에서도 헤더를 유지한다 — 공개 영역과 대시보드가 한 세계 (docs/IA.md §3.1) */}
      {!isLoginPage && <header className="sticky top-0 z-50 w-full shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center px-4">
          {/* 왼쪽 — 로고 (데스크톱) */}
          <div className="hidden md:flex flex-shrink-0 items-center mr-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
              <TreePine className="h-5 w-5 text-primary" />
              <span>AI꿈</span>
            </Link>
          </div>

          {/* 모바일 로고 */}
          <div className="flex md:hidden flex-shrink-0 items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
              <TreePine className="h-5 w-5 text-primary" />
              <span>AI꿈</span>
            </Link>
          </div>

          {/* 중앙 — 공통 메뉴 */}
          <nav className="hidden md:flex items-center gap-8 mr-auto">
            {commonMenuItems.map((item) => {
              const isActive = isMenuActive(pathname, item.href);

              const linkClass = `relative text-[1.05rem] leading-snug cursor-pointer transition-all py-1 focus-visible:outline-none ${isActive
                ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full'
                : 'text-muted-foreground hover:text-primary hover:font-semibold after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-primary/60 after:rounded-full after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full'
                }`;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 오른쪽 — 데스크톱 액션 영역 */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-end gap-2">
            {/* 통합 검색 */}
            <Link href="/search" aria-label="검색">
              <Button variant="ghost" size="icon" className="cursor-pointer text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
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
                {/* 대시보드 링크 — 역할이 여럿이면 드롭다운, 하나면 바로 이동 */}
                {roleDashboards.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-[7.5rem] justify-center gap-1.5 cursor-pointer">
                        <LayoutGrid className="h-4 w-4" />
                        대시보드
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end" className="w-48">
                      {roleDashboards.map((d) => (
                        <DropdownMenuItem key={d.href} asChild className="cursor-pointer">
                          <Link href={d.href} className="flex items-center gap-2">
                            <d.icon className="h-4 w-4" />
                            {d.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href={roleDashboards[0].href}>
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

            {/* 통합 검색 — 모바일 */}
            <Link href="/search" aria-label="검색">
              <Button variant="ghost" size="icon" className="cursor-pointer text-muted-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

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
                    const isActive = isMenuActive(pathname, item.href);

                    return (
                      <Link key={item.href} href={item.href}>
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
                      {/* 보유 역할의 대시보드만 나열 */}
                      {roleDashboards.map((d) => (
                        <Link key={d.href} href={d.href}>
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <d.icon className="h-4 w-4" />
                            {d.label}
                          </Button>
                        </Link>
                      ))}
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
