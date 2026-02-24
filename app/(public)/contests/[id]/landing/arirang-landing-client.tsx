'use client';

import { useEffect } from 'react';
import '@/components/contests/arirang/arirang-landing.css';
import { ArirangNavbar } from '@/components/contests/arirang/ArirangNavbar';
import { LangProvider } from '@/components/contests/arirang/lang-context';
import { HeroSection } from '@/components/contests/arirang/sections/HeroSection';
import { AboutSection } from '@/components/contests/arirang/sections/AboutSection';
import { OverviewSection } from '@/components/contests/arirang/sections/OverviewSection';
import { ScheduleSection } from '@/components/contests/arirang/sections/ScheduleSection';
import { HowToSection } from '@/components/contests/arirang/sections/HowToSection';
import { PrizesSection } from '@/components/contests/arirang/sections/PrizesSection';
import { ApplySection } from '@/components/contests/arirang/sections/ApplySection';
import { NotesSection } from '@/components/contests/arirang/sections/NotesSection';
import { FooterSection } from '@/components/contests/arirang/sections/FooterSection';

/** 아리랑 랜딩페이지 클라이언트 컴포넌트 (애니메이션 + 렌더링) */
export default function ArirangLandingClient() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    const elements = document.querySelectorAll('.arirang-animate');
    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <LangProvider>
      <div className="arirang-landing">
        <ArirangNavbar />
        <HeroSection />
        <AboutSection />
        <OverviewSection />
        <ScheduleSection />
        <HowToSection />
        <PrizesSection />
        <ApplySection />
        <NotesSection />
        <FooterSection />
      </div>
    </LangProvider>
  );
}