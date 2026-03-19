'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Heart, Trophy } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

interface AwardItem {
  id: string;
  title: string;
  creatorName: string;
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  rank?: number | null;
  prizeLabel?: string | null;
}

interface AwardsGridProps {
  submissions: AwardItem[];
}

/** 수상작 그리드 — 클라이언트 상태로 더보기 처리 (스크롤 위치 유지) */
export function AwardsGrid({ submissions }: AwardsGridProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const displayed = submissions.slice(0, displayCount);
  const hasMore = submissions.length > displayCount;
  const remainingCount = submissions.length - displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <Trophy className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="text-xl font-bold mb-2">수상작이 없습니다</h3>
        <p className="text-muted-foreground mb-8 max-w-md">
          이 공모전에 수상작이 아직 등록되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayed.map((submission) => (
          <Link key={`${submission.id}-${submission.rank}`} href={`/gallery/${submission.id}` as any} className="group">
            <div className="relative rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur border border-white/10">
              {/* 썸네일 */}
              <div className="aspect-video overflow-hidden relative bg-muted">
                {submission.thumbnailUrl && (
                  <img
                    src={submission.thumbnailUrl}
                    alt={submission.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {/* 수상 뱃지 */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg ${
                    submission.rank === 1 ? 'bg-amber-500/90 text-white' :
                    submission.rank === 2 ? 'bg-slate-400/90 text-white' :
                    'bg-orange-600/90 text-white'
                  }`}>
                    <Trophy className="inline h-3.5 w-3.5 mr-1" />
                    {submission.prizeLabel}
                  </span>
                </div>
              </div>

              {/* 콘텐츠 */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent-foreground transition-colors">
                  {submission.title}
                </h3>
                <p className="text-xs text-muted-foreground">{submission.creatorName}</p>

                {/* 통계 */}
                <div className="flex gap-3 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {submission.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {submission.likeCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 더보기 버튼 */}
      {hasMore && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleLoadMore}
            className="group relative px-10 py-2.5 rounded-full border-2 border-violet-500 text-violet-500 font-semibold text-base overflow-hidden transition-all duration-300 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer"
          >
            <span className="absolute inset-0 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <span className="relative z-10 flex items-center gap-2">
              더보기
              <span className="text-sm opacity-70">+{remainingCount.toLocaleString()}</span>
            </span>
          </button>
        </div>
      )}
    </>
  );
}
