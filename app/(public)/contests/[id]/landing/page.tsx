'use client';

import { useEffect } from 'react';
import '@/components/contests/arirang/arirang-landing.css';
import { ArirangNavbar } from '@/components/contests/arirang/ArirangNavbar';


import { HeroSection } from '@/components/contests/arirang/sections/HeroSection';
import { AboutSection } from '@/components/contests/arirang/sections/AboutSection';
import { OverviewSection } from '@/components/contests/arirang/sections/OverviewSection';
import { ScheduleSection } from '@/components/contests/arirang/sections/ScheduleSection';
import { HowToSection } from '@/components/contests/arirang/sections/HowToSection';
import { PrizesSection } from '@/components/contests/arirang/sections/PrizesSection';
import { ApplySection } from '@/components/contests/arirang/sections/ApplySection';
import { NotesSection } from '@/components/contests/arirang/sections/NotesSection';
import { FooterSection } from '@/components/contests/arirang/sections/FooterSection';

/**
 * 아리랑 공모전 랜딩 페이지
 * - 주최자/관리자가 추가 비용을 지불하여 제작하는 프리미엄 랜딩 페이지
 * - 현재는 contest-1 (꿈꾸는 아리랑) 전용
 * - 공개 공모전 카드 클릭과는 별도로, 주최자/관리자 대시보드에서 접근
 */
export default function ArirangLandingPage() {
  /* Intersection Observer — .arirang-animate 요소에 .is-visible 추가 */
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
  );
}
