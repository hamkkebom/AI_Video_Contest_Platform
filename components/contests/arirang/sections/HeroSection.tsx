'use client';

import { useRouter } from 'next/navigation';

import { useCountdown } from '@/hooks/useCountdown';
import { ChevronDown } from 'lucide-react';

/** 히어로 섹션 — 메인 비주얼 + 카운트다운 */
export function HeroSection() {
  const countdown = useCountdown('2026-03-28T23:59:59+09:00');

  const router = useRouter();
  const goToLogin = () => router.push('/login');

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
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
        <svg viewBox="0 0 1440 200" className="w-full" preserveAspectRatio="none" role="img" aria-label="산 실루엣">
          <title>산 실루엣</title>
          <path d="M0,200 L0,120 Q180,40 360,100 Q540,160 720,80 Q900,0 1080,60 Q1260,120 1440,80 L1440,200 Z" fill="#0D0B1A" opacity="0.6" />
          <path d="M0,200 L0,150 Q240,80 480,130 Q720,180 960,100 Q1200,20 1440,110 L1440,200 Z" fill="#0D0B1A" />
        </svg>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* 뱃지 */}
        <div className="inline-block mb-6 animate-fade-in">
          <span className="px-6 py-2 text-2xl md:text-3xl font-bold rounded-full" style={{ backgroundColor: 'rgba(212,168,67,0.2)', color: 'var(--ar-accent)', border: '1px solid rgba(212,168,67,0.3)' }}>
            제1회
          </span>
        </div>

        {/* 130주년 기념 문구 */}
        <p className="text-xl md:text-2xl font-semibold mb-5 animate-fade-in-up" style={{ color: 'rgba(212,168,67,0.9)' }}>
          헐버트 박사의 아리랑 채보 130주년 기념!
        </p>

        {/* 제목 */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 animate-fade-in-up" style={{ color: 'var(--ar-cream)' }}>
          꿈꾸는 아리랑
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl font-light mb-10 animate-fade-in-up" style={{ color: 'rgba(245,240,232,0.8)' }}>
          AI 뮤직비디오 공모전
        </p>

        {/* 헐버트 명언 */}
        <blockquote className="mb-10 animate-fade-in-up">
          <p className="text-lg md:text-xl italic" style={{ color: 'rgba(232,199,106,0.9)' }}>
            &ldquo;아리랑은 한국인의 영원한 노래&rdquo;
          </p>
          <footer className="mt-3 text-sm" style={{ color: 'rgba(245,240,232,0.6)' }}>
            &mdash; 호머 헐버트{' '}
            <span style={{ color: 'rgba(245,240,232,0.4)' }}>(한국의 외국인 독립운동가)</span>
          </footer>
        </blockquote>

        {/* 카운트다운 */}
        <div className="mb-8 animate-fade-in-up">
          <p className="text-sm uppercase tracking-widest mb-3" style={{ color: 'rgba(245,240,232,0.5)' }}>
            접수 마감까지
          </p>
          <div className="flex justify-center gap-3 md:gap-5">
            {[
              { value: countdown.days, label: '일' },
              { value: countdown.hours, label: '시간' },
              { value: countdown.minutes, label: '분' },
              { value: countdown.seconds, label: '초' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 backdrop-blur-sm rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(45,35,153,0.3)', border: '1px solid rgba(245,240,232,0.1)' }}>
                  <span className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color: 'var(--ar-cream)' }}>
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
            onClick={goToLogin}
            className="px-10 py-4 font-bold text-lg rounded-full hover:scale-105 transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: 'var(--ar-accent)', color: 'var(--ar-primary-dark)', boxShadow: '0 10px 25px rgba(212,168,67,0.25)' }}
          >
            지금 접수하기
          </button>
          <p className="mt-4 font-bold text-xl md:text-2xl" style={{ color: 'rgba(212,168,67,0.8)' }}>
            총 상금 1,300만 원
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
