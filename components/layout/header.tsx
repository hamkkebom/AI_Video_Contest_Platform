'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Film, Search, Bell, Sun, Moon, Sparkles, Shield, Scale, Building2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DEMO_ROLES } from '@/config/constants';
import type { DemoRoles } from '@/lib/types';

/**
 * 공통 메뉴 아이템 (역할 무관)
 */
interface MenuItem {
  label: string;
  href: string;
}

const commonMenuItems: MenuItem[] = [
  { label: '공모전', href: '/contests' },
  { label: '갤러리', href: '/gallery' },
  { label: '소식/트렌드', href: '/news' },
  { label: '고객센터', href: '/support' },
];

/**
 * 역할별 대시보드 링크 반환
 */
const getRoleDashboardLink = (roles: DemoRoles): { label: string; href: string } => {
  if (roles.isAdmin) return { label: '관리자', href: '/admin/dashboard' };
  if (roles.isHost) return { label: '대시보드', href: '/dashboard' };
  if (roles.isJudge) return { label: '심사', href: '/judging' };
  return { label: '내 공모전', href: '/my/submissions' };
};

/**
 * 현재 활성 역할 키 반환
 */
const getActiveRoleKey = (roles: DemoRoles): string => {
  if (roles.isAdmin) return 'admin';
  if (roles.isHost) return 'host';
  if (roles.isJudge) return 'judge';
  return 'participant';
};

/**
 * 역할별 아이콘 매핑
 */
const roleIconMap: Record<string, React.ReactNode> = {
  participant: <Film className="h-4 w-4" />,
  host: <Building2 className="h-4 w-4" />,
  judge: <Scale className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
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
 * 글로벌 헤더 컴포넌트
 * 역할 전환 패널, 알림 벨, GNB 메뉴, 테마 전환 기능 포함
 */
export function Header() {
  const [demoRoles, setDemoRoles] = useState<DemoRoles>({
    isParticipant: true,
    isHost: false,
    isJudge: false,
    isAdmin: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const { theme, setTheme } = useTheme();
  const roleDashboardLink = getRoleDashboardLink(demoRoles);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  /**
   * 역할 전환 핸들러
   * DEMO_ROLES 키 (participant, host, judge, admin)를 받아서 DemoRoles 상태로 변환
   */
  const handleRoleChange = (role: string) => {
    setDemoRoles({
      isParticipant: role === 'participant',
      isHost: role === 'host',
      isJudge: role === 'judge',
      isAdmin: role === 'admin',
    });
  };

  /**
   * DEMO_ROLES 키를 DemoRoles 키로 매핑
   */
  const demoRoleKeyMap: Record<string, keyof DemoRoles> = {
    participant: 'isParticipant',
    host: 'isHost',
    judge: 'isJudge',
    admin: 'isAdmin',
  };

  return (
    <>
      {/* 데모 역할 전환 유틸리티 바 */}
      <div className="w-full border-b border-border/50 bg-muted/50">
        <div className="container flex h-8 items-center justify-end px-4 gap-2">
          <span className="text-xs text-muted-foreground mr-1">데모 역할:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {Object.entries(DEMO_ROLES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleRoleChange(key)}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full cursor-pointer transition-colors whitespace-nowrap ${
                  demoRoles[demoRoleKeyMap[key]]
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

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          {/* 왼쪽: 로고 */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-foreground transition-colors">
              <Film className="h-5 w-5 text-primary" />
              <span>AI 영상 공모전</span>
            </Link>
          </div>

          {/* 중앙: 공통 메뉴 */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
            {commonMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 오른쪽: 액션 영역 */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* 검색바 — 데스크톱 */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색..."
                  className="pl-8 pr-3 py-1.5 w-44 text-sm border border-border rounded-md bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-colors"
                />
              </div>
            </form>

            {/* 검색 — 모바일 */}
            <Link href="/search" className="md:hidden">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {/* 알림 벨 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-2 py-1.5 text-sm font-semibold">알림</div>
                {DUMMY_NOTIFICATIONS.map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <div className="font-medium text-sm">{notif.title}</div>
                    <div className="text-xs text-muted-foreground">{notif.message}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 테마 전환 */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon">
                   {mounted ? (
                     theme === 'light' ? (
                       <Sun className="h-4 w-4" />
                     ) : theme === 'dark' ? (
                       <Moon className="h-4 w-4" />
                     ) : (
                       <Sparkles className="h-4 w-4" />
                     )
                   ) : (
                     <Sun className="h-4 w-4" />
                   )}
                 </Button>
               </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('signature')} className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Signature
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 역할 대시보드 링크 — 맨 오른쪽 */}
            <Link href={roleDashboardLink.href as any}>
              <Button variant="outline" size="sm" className="hidden md:inline-flex gap-1.5 cursor-pointer">
                {roleIconMap[getActiveRoleKey(demoRoles)]}
                {roleDashboardLink.label}
              </Button>
            </Link>

            {/* 모바일 메뉴 */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-2 mt-8">
                  {commonMenuItems.map((item) => (
                    <Link key={item.href} href={item.href as any}>
                      <Button variant="ghost" className="w-full justify-start">
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <Link href={roleDashboardLink.href as any}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        {roleIconMap[getActiveRoleKey(demoRoles)]}
                        {roleDashboardLink.label}
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
