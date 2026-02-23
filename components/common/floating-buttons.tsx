'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp, MessageCircle } from 'lucide-react';

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* 맨위로 버튼 */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`w-12 h-12 rounded-full bg-violet-500 text-white shadow-lg hover:shadow-xl hover:bg-violet-600 hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer ${
          showScrollTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="맨위로"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* 문의하기 버튼 */}
      <Link
        href="/support"
        className="w-12 h-12 rounded-full bg-[#EA580C] text-white shadow-lg hover:shadow-xl hover:bg-[#C2410C] hover:scale-105 transition-all duration-300 flex items-center justify-center"
        aria-label="문의하기"
      >
        <MessageCircle className="h-5 w-5" />
      </Link>
    </div>
  );
}
