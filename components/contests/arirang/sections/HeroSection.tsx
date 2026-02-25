'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';

import { useCountdown } from '@/hooks/useCountdown';
import { ChevronDown } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

/** 히어로 섹션 — 메인 비주얼 + 카운트다운 */
export function HeroSection() {
  const countdown = useCountdown('2026-03-28T23:59:59+09:00');
  const { lang } = useLang();
  const heroTranslations = translations.hero;

  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;
  const { user, loading } = useAuth();
  const goToContestDetail = () => {
    // 인증 로딩 중이면 무시
    if (loading) return;
    router.push(user ? `/contests/${contestId}` : '/login');
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 md:pt-20"
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--ar-primary-dark), var(--ar-primary), var(--ar-primary-dark))' }} />

      {/* 별 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 50 }).map((_, i) => {
          const size = (i * 7 + 3) % 3 + 1;
          const left = (i * 37 + 13) % 100;
          const top = (i * 53 + 7) % 100;
          const delay = (i * 0.06) % 3;
          const duration = (i * 0.04) % 2 + 2;
          return (
            <div
              key={`star-${left}-${top}`}
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                backgroundColor: 'rgba(245,240,232,0.3)',
              }}
            />
          );
        })}
      </div>

      {/* 산 실루엣 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 200" className="w-full" preserveAspectRatio="none" role="img" aria-label={t(heroTranslations, 'mountainLabel', lang)}>
          <title>{t(heroTranslations, 'mountainTitle', lang)}</title>
          <path d="M0,200 L0,120 Q180,40 360,100 Q540,160 720,80 Q900,0 1080,60 Q1260,120 1440,80 L1440,200 Z" fill="#0D0B1A" opacity="0.6" />
          <path d="M0,200 L0,150 Q240,80 480,130 Q720,180 960,100 Q1200,20 1440,110 L1440,200 Z" fill="#0D0B1A" />
        </svg>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* 뱃지 */}
        <div className="inline-block mb-6 animate-fade-in">
          <span className="px-4 py-1.5 text-lg sm:text-2xl md:text-3xl font-bold rounded-full" style={{ backgroundColor: 'rgba(212,168,67,0.2)', color: 'var(--ar-accent)', border: '1px solid rgba(212,168,67,0.3)' }}>
            {t(heroTranslations, 'badge', lang)}
          </span>
        </div>

        {/* 130주년 기념 문구 */}
        <p className="text-base sm:text-xl md:text-2xl font-semibold mb-5 animate-fade-in-up" style={{ color: 'rgba(212,168,67,0.9)' }}>
          {t(heroTranslations, 'anniversary', lang)}
        </p>

        {/* 제목 */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 animate-fade-in-up" style={{ color: 'var(--ar-cream)' }}>
          {t(heroTranslations, 'title', lang)}
        </h1>
        <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-light mb-8 sm:mb-10 animate-fade-in-up" style={{ color: 'rgba(245,240,232,0.8)' }}>
          {t(heroTranslations, 'subtitle', lang)}
        </p>

        {/* 헐버트 명언 */}
        <blockquote className="mb-10 animate-fade-in-up">
          <p className="text-sm sm:text-lg md:text-xl italic" style={{ color: 'rgba(232,199,106,0.9)' }}>
            &ldquo;{t(heroTranslations, 'quote', lang)}&rdquo;
          </p>
          <footer className="mt-3 text-sm" style={{ color: 'rgba(245,240,232,0.6)' }}>
            &mdash; {t(heroTranslations, 'quoteAuthor', lang)}{' '}
            <span style={{ color: 'rgba(245,240,232,0.4)' }}>{t(heroTranslations, 'quoteAuthorDesc', lang)}</span>
          </footer>
        </blockquote>

        {/* 카운트다운 */}
        <div className="mb-8 animate-fade-in-up">
          <p className="text-sm uppercase tracking-widest mb-3" style={{ color: 'rgba(245,240,232,0.5)' }}>
            {t(heroTranslations, 'countdownTitle', lang)}
          </p>
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-5">
            {[
              { value: countdown.days, label: t(heroTranslations, 'countdownDays', lang) },
              { value: countdown.hours, label: t(heroTranslations, 'countdownHours', lang) },
              { value: countdown.minutes, label: t(heroTranslations, 'countdownMinutes', lang) },
              { value: countdown.seconds, label: t(heroTranslations, 'countdownSeconds', lang) },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 backdrop-blur-sm rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(45,35,153,0.3)', border: '1px solid rgba(245,240,232,0.1)' }}>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold tabular-nums" style={{ color: 'var(--ar-cream)' }}>
                    {String(item.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs mt-1.5" style={{ color: 'rgba(245,240,232,0.5)' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up">
          <button
            type="button"
            onClick={goToContestDetail}
            className="px-10 py-4 font-bold text-lg rounded-full hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)', boxShadow: '0 10px 25px rgba(212,168,67,0.25)' }}
          >
            {t(heroTranslations, 'cta', lang)}
          </button>
          <p className="mt-4 font-bold text-lg sm:text-xl md:text-2xl" style={{ color: 'rgba(212,168,67,0.8)' }}>
            {t(heroTranslations, 'totalPrize', lang)}
          </p>
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="w-6 h-6" style={{ color: 'rgba(245,240,232,0.3)' }} />
      </div>
    </section>
  );
}