'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TreePine } from 'lucide-react';

const serviceLinks = [
  { label: '공모전', href: '/contests?status=open' },
  { label: '갤러리', href: '/gallery/all' },
  { label: '스토리', href: '/story' },
  { label: '고객센터', href: '/support/inquiry' },
];

const legalLinks = [
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
];

export function Footer() {
  const pathname = usePathname();
  /* 대시보드 경로에서는 사이드바(w-60) 패딩 적용 */
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/host') || pathname.startsWith('/my');

  return (
    <footer className={`bg-foreground text-background ${isDashboard ? 'md:pl-60' : ''}`}>
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* 브랜드 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-background/80" />
              <span className="text-lg font-bold">AI꿈(아이꿈)</span>
            </div>
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
                  href={link.href as any}
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
                  href={link.href as any}
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
            &copy; 2026 함께봄 주식회사. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
