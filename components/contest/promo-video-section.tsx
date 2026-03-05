'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface PromoVideoSectionProps {
  videoUrls: string[];
  title: string;
}


/**
 * 예시영상 섹션 — 탭 없이 바로 노출
 * 영상 개수를 시각적으로 표시하고, 클릭으로 영상 전환
 */
export function PromoVideoSection({ videoUrls, title }: PromoVideoSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = videoUrls.length;

  return (
    <div className="space-y-4">
      {/* 섹션 헤더: 제목 */}
      <h2 className="text-xl sm:text-2xl font-bold">예시영상</h2>

      {/* 영상 선택 탭 — 2개 이상일 때만 */}
      {count > 1 && (
        <div className="flex gap-1.5">
          {videoUrls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeIndex === index
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              <Play className="h-3 w-3" />
              영상 {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* 영상 플레이어 */}
      <div className="overflow-hidden rounded-xl bg-black shadow-lg">
        <div className="aspect-video relative">
          <iframe
            src={videoUrls[activeIndex]}
            title={`${title} 예시영상 ${activeIndex + 1}`}
            className="w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

    </div>
  );
}
