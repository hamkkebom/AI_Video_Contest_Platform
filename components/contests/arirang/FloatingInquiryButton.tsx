'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLang } from '@/components/contests/arirang/lang-context';
import { t, translations } from '@/components/contests/arirang/translations';

/**
 * 플로팅 문의하기 버튼
 * — 히어로 CTA(#hero-cta)가 뷰포트에서 사라지면 우하단에 나타남
 */
export function FloatingInquiryButton() {
  const [visible, setVisible] = useState(false);
  const { lang } = useLang();
  const heroTranslations = translations.hero;

  useEffect(() => {
    const target = document.getElementById('hero-cta');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 히어로 CTA가 보이지 않으면 플로팅 버튼 표시
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href="http://pf.kakao.com/_cFfIX/chat"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 font-bold rounded-full shadow-lg transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{
        backgroundColor: '#EA580C',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(234,88,12,0.35)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#C2540A';
        e.currentTarget.style.transform = visible ? 'translateY(0) scale(1.05)' : '';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#EA580C';
        e.currentTarget.style.transform = visible ? 'translateY(0) scale(1)' : '';
      }}
    >
      <MessageCircle className="w-5 h-5" />
      {t(heroTranslations, 'ctaInquiry', lang)}
    </a>
  );
}
