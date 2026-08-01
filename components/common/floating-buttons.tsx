'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';

/** 카카오 채널 상담 링크 */
const KAKAO_CHAT_URL = 'https://pf.kakao.com/_cFfIX/chat';

export function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* 맨위로 */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-xl ${
          showScrollTop
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
        aria-label="맨위로"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* 문의하기 — 모바일에서는 원형 아이콘만.
          라벨까지 띄우면 좁은 화면에서 본문 위를 넓게 덮는다 */}
      <a
        href={KAKAO_CHAT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-hover hover:shadow-xl sm:w-auto sm:px-5"
        aria-label="문의하기"
      >
        <MessageCircle className="h-5 w-5 shrink-0" />
        <span className="hidden text-sm font-semibold sm:inline">문의하기</span>
      </a>
    </div>
  );
}
