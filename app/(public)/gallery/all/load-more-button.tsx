'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';

interface LoadMoreButtonProps {
  href: Route;
  remainingCount: number;
}

/** 더보기 버튼 — 스크롤 위치를 유지하면서 다음 페이지 로드 */
export function LoadMoreButton({ href, remainingCount }: LoadMoreButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href, { scroll: false });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative px-10 py-2.5 rounded-full border-2 border-violet-500 text-violet-500 font-semibold text-base overflow-hidden transition-all duration-300 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer"
    >
      <span className="absolute inset-0 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <span className="relative z-10 flex items-center gap-2">
        더보기
        <span className="text-sm opacity-70">+{remainingCount.toLocaleString()}</span>
      </span>
    </button>
  );
}
