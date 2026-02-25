'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { useState, useEffect, useCallback } from 'react';
import { Menu, X, Globe, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

const NAV_ITEMS = [
  { labelKey: 'navAbout', href: '#about' },
  { labelKey: 'navOverview', href: '#overview' },
  { labelKey: 'navSchedule', href: '#schedule' },
  { labelKey: 'navHowTo', href: '#howto' },
  { labelKey: 'navPrizes', href: '#prizes' },
  { labelKey: 'navApply', href: '#apply' },
  { labelKey: 'navNotes', href: '#notes' },
];

/** 아리랑 랜딩페이지 전용 네비게이션 바 */
export function ArirangNavbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const params = useParams();
  const contestId = params.id as string;
  const { lang, setLang } = useLang();
  const { user, profile, signOut } = useAuth();
  const navbarTranslations = translations.navbar;

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


  /** 로그아웃 후 홈으로 하드 리디렉트 */
  const handleSignOut = useCallback(async () => {
    await signOut();
    window.location.href = '/';
  }, [signOut]);

  /** 역할별 대시보드 경로 */
  const getDashboardPath = useCallback(() => {
    const roles = profile?.roles || [];
    if (roles.includes('admin')) return '/admin/dashboard';
    if (roles.includes('host')) return '/host/dashboard';
    if (roles.includes('judge')) return '/judging';
    return '/my/submissions';
  }, [profile]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'shadow-lg shadow-black/20'
          : 'bg-transparent'
        }`}
      style={scrolled ? { backgroundColor: 'rgba(13,11,26,0.95)', backdropFilter: 'blur(12px)' } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* 로고 */}
          <Link
            href="/contests"
            className="font-bold text-lg md:text-xl tracking-tight"
            style={{ color: 'var(--ar-accent)' }}
          >
            {t(navbarTranslations, 'brand', lang)}
          </Link>

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
                {t(navbarTranslations, item.labelKey, lang)}
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

            {/* 로그인 상태에 따라 버튼 분기 */}
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push(getDashboardPath())}
                  className="hidden md:block px-5 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)' }}
                >
                  {profile?.name || t(navbarTranslations, 'myPage', lang)}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer"
                  style={{ color: 'rgba(245,240,232,0.7)', border: '1px solid rgba(245,240,232,0.2)' }}
                >
                  <LogOut className="w-4 h-4" />
                  {t(navbarTranslations, 'signOut', lang)}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push(`/login?redirectTo=/contests/${contestId}/landing`)}
                className="hidden md:block px-5 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)' }}
              >
                {t(navbarTranslations, 'signIn', lang)}
              </button>
            )}

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
        className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
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
              {t(navbarTranslations, item.labelKey, lang)}
            </button>
          ))}
          {user ? (
            <>
              <button
                type="button"
                onClick={() => router.push(getDashboardPath())}
                className="block w-full mt-2 px-4 py-3 font-semibold rounded-lg text-center cursor-pointer"
                style={{ backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)' }}
              >
                {profile?.name || t(navbarTranslations, 'myPage', lang)}
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="block w-full mt-1 px-4 py-3 rounded-lg text-center cursor-pointer"
                style={{ color: 'rgba(245,240,232,0.8)', border: '1px solid rgba(245,240,232,0.2)' }}
              >
                {t(navbarTranslations, 'signOut', lang)}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => router.push(`/login?redirectTo=/contests/${contestId}/landing`)}
              className="block w-full mt-2 px-4 py-3 font-semibold rounded-lg text-center cursor-pointer"
              style={{ backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)' }}
            >
              {t(navbarTranslations, 'signIn', lang)}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}