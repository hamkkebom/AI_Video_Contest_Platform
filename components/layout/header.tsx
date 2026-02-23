'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { TreePine, Search, Bell, Sun, Moon, Sparkles, Shield, Scale, Building2, Menu, User, LogIn, LogOut, UserPen, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DEMO_ROLES } from '@/config/constants';
import type { DemoRoles } from '@/lib/types';

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
  {
    label: '갤러리',
    href: '/gallery/all',
    children: [
      { label: '수상작 갤러리', href: '/gallery/awards' },
      { label: '전체 갤러리', href: '/gallery/all' },
    ],
  },
  { label: '스토리', href: '/story' },
  {
    label: '고객센터',
    href: '/support',
    children: [
      { label: 'FAQ', href: '/support/faq' },
      { label: '문의하기', href: '/support/inquiry' },
    ],
  },
];

/**
 * 역할별 대시보드 링크 목록 반환 (다중 역할 지원)
 */
interface RoleDashboardItem {
  role: string;
  label: string;
  href: string;
}

const getRoleDashboardLinks = (roles: DemoRoles): RoleDashboardItem[] => {
  if (roles.isGuest) return [{ role: 'guest', label: '로그인', href: '/login' }];
  if (roles.isAdmin) return [{ role: 'admin', label: '대시보드', href: '/admin/dashboard' }];

  const links: RoleDashboardItem[] = [];
  if (roles.isParticipant) links.push({ role: 'participant', label: '참가 관리', href: '/my/submissions' });
  if (roles.isJudge) links.push({ role: 'judge', label: '심사 관리', href: '/judging' });
  if (roles.isHost) links.push({ role: 'host', label: '주최 관리', href: '/host/dashboard' });

  return links.length > 0 ? links : [{ role: 'participant', label: '대시보드', href: '/my/submissions' }];
};

/**
 * 현재 활성 역할 키 반환 (우선순위: admin > host > judge > participant)
 */
const getActiveRoleKey = (roles: DemoRoles): string => {
  if (roles.isGuest) return 'guest';
  if (roles.isAdmin) return 'admin';
  if (roles.isHost) return 'host';
  if (roles.isJudge) return 'judge';
  return 'participant';
};

/**
 * 역할별 아이콘 매핑
 */
const roleIconMap: Record<string, React.ReactNode> = {
  guest: <User className="h-4 w-4" />,
  participant: <TreePine className="h-4 w-4" />,
  host: <Building2 className="h-4 w-4" />,
  judge: <Scale className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
};

/**
 * 역할별 아바타 이니셜
 */
const roleInitialMap: Record<string, string> = {
  participant: '참',
  host: '주',
  judge: '심',
  admin: '관',
};

/**
 * 더미 알림 데이터
 */
const DUMMY_NOTIFICATIONS = [
  { id: '1', title: '새로운 공모전 시작', message: '"AI 영상 공모전 2025" 접수가 시작되었습니다.' },
  { id: '2', title: '심사 결과 발표', message: '참여하신 공모전의 심사 결과가 발표되었습니다.' },
  { id: '3', title: '좋아요 알림', message: '당신의 작품에 새로운 좋아요가 있습니다.' },
  { id: '4', title: '메시지 수신', message: '기업에서 의뢰 요청을 보냈습니다.' },
  { id: '5', title: '시스템 공지', message: '플랫폼 점검이 예정되어 있습니다.' },
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

  // 언마운트 시 타이머 정리
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
 * 역할 메뉴 호버 드롭다운 컴포넌트
 */
function RoleActivityDropdown({
  dashboardLinks,
}: {
  dashboardLinks: RoleDashboardItem[];
}) {
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

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Link
          href={'/my/activity' as any}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          <Button variant="outline" size="sm" className="w-[7.5rem] justify-center gap-1.5 cursor-pointer">
            <LayoutGrid className="h-4 w-4" />
            내 활동
          </Button>
        </Link>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-48"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        {dashboardLinks.map((link) => (
          <DropdownMenuItem key={link.role} asChild className="cursor-pointer">
            <Link href={link.href as any} className="flex items-center gap-2 w-full">
              {roleIconMap[link.role]}
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 글로벌 헤더 컴포넌트
 * 역할 전환 패널, 알림 벨, GNB 메뉴, 프로필 드롭다운(테마 포함) 기능
 */
export function Header() {
  const [demoRoles, setDemoRoles] = useState<DemoRoles>({
    isGuest: false,
    isParticipant: true,
    isHost: false,
    isJudge: false,
    isAdmin: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const { theme, setTheme } = useTheme();
  const dashboardLinks = getRoleDashboardLinks(demoRoles);
  const isMultiRole = dashboardLinks.length > 1;
  const activeRoleKey = getActiveRoleKey(demoRoles);
  const isGuest = demoRoles.isGuest;
  const isDashboardPage =
    pathname.startsWith('/host') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/judging') ||
    pathname.startsWith('/my');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  /**
   * 역할 전환 핸들러
   * guest/admin은 배타적, participant/host/judge는 다중 선택 가능
   */
  const handleRoleChange = (role: string) => {
    if (role === 'guest') {
      /* 게스트 = 비로그인, 모든 역할 해제 */
      setDemoRoles({ isGuest: true, isParticipant: false, isHost: false, isJudge: false, isAdmin: false });
      return;
    }
    if (role === 'admin') {
      /* 관리자 = 전체 접근, 배타적 */
      setDemoRoles({ isGuest: false, isParticipant: false, isHost: false, isJudge: false, isAdmin: true });
      return;
    }
    /* participant / host / judge → 토글 (다중 선택) */
    setDemoRoles((prev) => {
      const key = demoRoleKeyMap[role];
      const updated = { ...prev, isGuest: false, isAdmin: false, [key]: !prev[key] };
      /* 아무 역할도 없으면 게스트로 복귀 */
      if (!updated.isParticipant && !updated.isHost && !updated.isJudge) {
        return { ...updated, isGuest: true };
      }
      return updated;
    });
  };

  /**
   * DEMO_ROLES 키를 DemoRoles 키로 매핑
   */
  const demoRoleKeyMap: Record<string, keyof DemoRoles> = {
    guest: 'isGuest',
    participant: 'isParticipant',
    host: 'isHost',
    judge: 'isJudge',
    admin: 'isAdmin',
  };

  return (
    <>
      {/* 데모 역할 전환 유틸리티 바 */}
      <div className="w-full bg-muted/50">
        <div className="container flex h-8 items-center justify-end px-4 gap-2">
          <span className="text-xs text-muted-foreground mr-1">데모 역할:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {Object.entries(DEMO_ROLES).map(([key, value]) => (
              <button
                type="button"
                key={key}
                onClick={() => handleRoleChange(key)}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full cursor-pointer transition-colors whitespace-nowrap ${demoRoles[demoRoleKeyMap[key]]
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                {roleIconMap[key]}
                {value.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isDashboardPage && <header className="sticky top-0 z-50 w-full shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center px-4">
          {/* 4a: 왼쪽 — 로고 컨테이너 (대칭 min-w) */}
          <div className="hidden md:flex flex-shrink-0 items-center mr-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
              <TreePine className="h-5 w-5 text-primary" />
              <span>꿈플</span>
            </Link>
          </div>

          {/* 모바일 로고 (min-w 없음) */}
          <div className="flex md:hidden flex-shrink-0 items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
              <TreePine className="h-5 w-5 text-primary" />
              <span>꿈플</span>
            </Link>
          </div>

          {/* 4b: 중앙 — 공통 메뉴 (활성 상태 + 호버 강조 + 드롭다운) */}
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

              // 드롭다운 서브메뉴가 있는 항목 (호버로 열림)
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

          {/* 4a: 오른쪽 — 액션 영역 (대칭 min-w + justify-end) */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-end gap-2">
            {/* 검색바 — 데스크톱 (포커스 시 확장 + 검색 버튼) */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색..."
                  className="pl-3 pr-9 py-1.5 w-44 focus:w-56 text-sm border border-border rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-background transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 transition-colors cursor-pointer"
                  aria-label="검색"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            {/* 4f: 게스트 상태 — 로그인 버튼만 표시 */}
            {isGuest ? (
              <Link href="/login">
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
                {/* 4c: 역할 대시보드 링크 — 단일역할: 직행 / 다중역할: 드롭다운 */}
                {isMultiRole ? (
                  <RoleActivityDropdown dashboardLinks={dashboardLinks} />
                ) : (
                  <Link href={dashboardLinks[0].href as any}>
                    <Button variant="outline" size="sm" className="w-[7.5rem] justify-center gap-1.5 cursor-pointer">
                      {roleIconMap[dashboardLinks[0].role]}
                      대시보드
                    </Button>
                  </Link>
                )}

                {/* 4d + 4e: 프로필 아바타 + 드롭다운 (테마 포함) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          {roleInitialMap[activeRoleKey] ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end" className="w-48">
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
                      onClick={() => handleRoleChange('guest')}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* 알림 벨 (오른쪽 끝 이동) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-4 w-4" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end" className="w-80">
                    <div className="px-2 py-1.5 text-sm font-semibold">알림</div>
                    {DUMMY_NOTIFICATIONS.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                        <div className="font-medium text-sm">{notif.title}</div>
                        <div className="text-xs text-muted-foreground">{notif.message}</div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* 모바일 액션 영역 */}
          <div className="flex md:hidden flex-1 items-center justify-end gap-1">
            {/* 검색 — 모바일 */}
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {/* 알림 벨 — 모바일 (비로그인 숨김) */}
            {!isGuest && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-80">
                  <div className="px-2 py-1.5 text-sm font-semibold">알림</div>
                  {DUMMY_NOTIFICATIONS.map((notif) => (
                    <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                      <div className="font-medium text-sm">{notif.title}</div>
                      <div className="text-xs text-muted-foreground">{notif.message}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* 4f: 게스트 — 모바일 로그인 버튼 */}
            {isGuest ? (
              <Link href="/login">
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
              /* 4d: 프로필 아바타 — 모바일 */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                        {roleInitialMap[activeRoleKey] ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-48">
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
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my/profile" className="flex items-center gap-2">
                      <UserPen className="h-4 w-4" />
                      프로필 편집
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('guest')}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

                    // 서브메뉴가 있는 항목 — 모바일에서는 하위 링크를 직접 나열
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
                      {isMultiRole && (
                        <Link href={'/my/activity' as any}>
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            내 활동
                          </Button>
                        </Link>
                      )}
                      {dashboardLinks.map((link) => (
                        <Link key={link.role} href={link.href as any}>
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            {roleIconMap[link.role]}
                            {isMultiRole ? link.label : '대시보드'}
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
