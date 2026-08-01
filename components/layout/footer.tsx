'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { TreePine } from 'lucide-react';

/* 푸터 링크는 docs/IA.md §3.2 기준 — 공개 라우트는 전부 푸터에서 도달 가능해야 한다 */
const serviceLinks: Array<{ label: string; href: Route }> = [
  { label: '공모전', href: '/contests' },
  { label: '갤러리', href: '/gallery/all' },
  { label: '수상작', href: '/gallery/awards' },
  { label: '크리에이터', href: '/creators' },
  { label: '스토리', href: '/story' },
];

const supportLinks: Array<{ label: string; href: Route }> = [
  { label: 'FAQ', href: '/support/faq' },
  { label: '문의하기', href: '/support/inquiry' },
  { label: '제작 대행 의뢰', href: '/support/agency' },
  { label: '공모전 개최 신청', href: '/hosts/apply' },
];

const legalLinks: Array<{ label: string; href: Route }> = [
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
];

export function Footer() {
  const pathname = usePathname();
  /* 대시보드 경로에서는 사이드바(w-60) 패딩 적용.
     세그먼트 경계까지 비교한다 — `/host`(대시보드)와 `/hosts`(공개 주최자 페이지)는 다른 화면이다 */
  const isUnder = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  const isDashboard =
    isUnder('/admin') || isUnder('/host') || isUnder('/my') || isUnder('/judging');

  return (
    <footer className={`bg-foreground text-background ${isDashboard ? 'md:pl-60' : ''}`}>
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* 브랜드 */}
          <div className="space-y-4">
            <a href="https://www.hamkkebom.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <TreePine className="h-5 w-5 text-background/80" />
              <span className="text-lg font-bold">함께봄</span>
            </a>
            <p className="text-sm text-background/60 leading-relaxed">
              AI와 함께 꿈을 설계하고 완성하다
            </p>
          </div>

          {/* 서비스 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/40">
              서비스
            </h4>
            <nav className="flex flex-col gap-2.5">
              {serviceLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 지원 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/40">
              지원
            </h4>
            <nav className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 안내 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/40">
              안내
            </h4>
            <nav className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <p className="text-xs text-background/40 text-center">
            &copy; 2026 <a href="https://www.hamkkebom.com/" target="_blank" rel="noopener noreferrer" className="hover:text-background/60 transition-colors">함께봄 주식회사</a>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
