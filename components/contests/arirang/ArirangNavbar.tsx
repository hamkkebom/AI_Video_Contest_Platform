'use client';

import { useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';

const NAV_ITEMS = [
  { label: '공모전 소개', href: '#about' },
  { label: '공모 개요', href: '#overview' },
  { label: '일정', href: '#schedule' },
  { label: '참여 방법', href: '#howto' },
  { label: '시상 내역', href: '#prizes' },
  { label: '유의사항', href: '#notes' },
];

/** 아리랑 랜딩페이지 전용 네비게이션 바 */
export function ArirangNavbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
      style={scrolled ? { backgroundColor: 'rgba(13,11,26,0.95)', backdropFilter: 'blur(12px)' } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* 로고 */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-bold text-lg md:text-xl tracking-tight cursor-pointer"
            style={{ color: 'var(--ar-accent)' }}
          >
            꿈꾸는 아리랑
          </button>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className="px-3 py-2 text-sm transition-colors cursor-pointer"
                style={{ color: 'rgba(245,240,232,0.7)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ar-cream)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,240,232,0.7)'; }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 우측 버튼 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer"
              style={{ color: 'rgba(245,240,232,0.7)', border: '1px solid rgba(245,240,232,0.2)' }}
            >
              <Globe className="w-4 h-4" />
              {lang === 'ko' ? 'EN' : 'KO'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="hidden md:block px-5 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)' }}
            >
              접수하기
            </button>

            {/* 모바일 햄버거 */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 cursor-pointer"
              style={{ color: 'var(--ar-cream)' }}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-1" style={{ backgroundColor: 'rgba(13,11,26,0.98)', backdropFilter: 'blur(12px)' }}>
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className="block w-full text-left px-4 py-3 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'rgba(245,240,232,0.8)' }}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="block w-full mt-2 px-4 py-3 font-semibold rounded-lg text-center cursor-pointer"
            style={{ backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)' }}
          >
            접수하기
          </button>
        </div>
      </div>
    </nav>
  );
}
