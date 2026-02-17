'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DemoRolePanel } from '@/components/common/demo-role-panel';
import { DEMO_ROLES } from '@/config/constants';
import type { DemoRoles } from '@/lib/types';

/**
 * 역할별 GNB 메뉴 아이템 정의
 */
interface MenuItem {
  label: string;
  href: string;
}

const getMenuItems = (roles: DemoRoles): MenuItem[] => {
  const baseItems: MenuItem[] = [
    { label: '홈', href: '/' },
    { label: '갤러리', href: '/gallery' },
    { label: '소식/트렌드', href: '/news' },
    { label: '고객센터', href: '/support' },
  ];

  if (roles.isAdmin) {
    return [
      { label: '홈', href: '/' },
      { label: '관리자', href: '/admin/dashboard' },
      { label: '갤러리', href: '/gallery' },
      { label: '소식/트렌드', href: '/news' },
      { label: '고객센터', href: '/support' },
    ];
  }

  if (roles.isJudge) {
    return [
      { label: '홈', href: '/' },
      { label: '심사', href: '/judging' },
      { label: '갤러리', href: '/gallery' },
      { label: '소식/트렌드', href: '/news' },
      { label: '고객센터', href: '/support' },
    ];
  }

  if (roles.isHost) {
    return [
      { label: '홈', href: '/' },
      { label: '대시보드', href: '/dashboard' },
      { label: '공모전', href: '/contests' },
      { label: '갤러리', href: '/gallery' },
      { label: '소식/트렌드', href: '/news' },
      { label: '고객센터', href: '/support' },
    ];
  }

  // 참가자 (기본)
  return [
    { label: '홈', href: '/' },
    { label: '공모전', href: '/contests' },
    ...baseItems.filter(item => item.href !== '/'),
  ];
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
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const menuItems = getMenuItems(demoRoles);

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">🎬</span>
          <span>AI 영상 공모전</span>
        </Link>

        {/* 데스크톱 GNB */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href as any}>
              <Button variant="ghost" size="sm">
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* 오른쪽 액션 영역 */}
        <div className="flex items-center gap-2">
          {/* 검색바 — 데스크톱 */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
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
            <Button variant="ghost" size="icon">🔍</Button>
          </Link>

          {/* 알림 벨 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <span className="text-xl">🔔</span>
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
                {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '✨'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                ☀️ Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                🌙 Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('signature')}>
                ✨ Signature
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 역할 전환 데모 패널 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {demoRoles.isAdmin ? '🛡️' : demoRoles.isJudge ? '⚖️' : demoRoles.isHost ? '🏢' : '🎬'} 역할
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(DEMO_ROLES).map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleRoleChange(key)}
                  className={demoRoles[demoRoleKeyMap[key]] ? 'bg-accent' : ''}
                >
                  {value.icon} {value.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 모바일 메뉴 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                ☰
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-2 mt-8">
                {menuItems.map((item) => (
                  <Link key={item.href} href={item.href as any}>
                    <Button variant="ghost" className="w-full justify-start">
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
