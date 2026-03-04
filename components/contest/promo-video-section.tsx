'use client';

import { useState } from 'react';
import { Play, Film } from 'lucide-react';

interface PromoVideoSectionProps {
  videoUrls: string[];
  title: string;
}

/**
 * 홍보영상 섹션 — 탭 없이 바로 노출
 * 영상 개수를 시각적으로 표시하고, 클릭으로 영상 전환
 */
export function PromoVideoSection({ videoUrls, title }: PromoVideoSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = videoUrls.length;

  return (
    <div className="space-y-4">
      {/* 섹션 헤더: 제목 + 영상 개수 */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">홍보영상</h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-sm font-semibold">
          <Film className="h-3.5 w-3.5" />
          {count}개
        </span>
      </div>

      {/* 영상 플레이어 */}
      <div className="overflow-hidden rounded-xl bg-black shadow-lg">
        <div className="aspect-video relative">
          <iframe
            src={videoUrls[activeIndex]}
            title={`${title} 홍보영상 ${activeIndex + 1}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* 영상 선택 썸네일 리스트 — 2개 이상일 때만 */}
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {videoUrls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeIndex === index
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              영상 {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
