'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { Eye, Heart, Loader2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  creatorName: string;
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  contestId: string;
  contestTitle: string;
}

interface GalleryGridProps {
  /** 서버에서 전달한 초기 데이터 (첫 페이지) */
  initialItems: GalleryItem[];
  /** 전체 작품 수 */
  total: number;
  /** 더 불러올 데이터가 있는지 */
  initialHasMore: boolean;
  /** seed 기반 랜덤용 */
  seed: number;
  /** 현재 정렬 */
  sort: string;
  /** 검색어 */
  search: string;
  /** 공모전 필터 (빈 문자열이면 전체) */
  contest: string;
  /** 카드에 공모전명 배지 표시 — 전체 보기이고 공모전이 2개 이상일 때만 */
  showContestLabel: boolean;
}

/** 갤러리 그리드 — 서버 사이드 페이지네이션 + 더보기 */
export function GalleryGrid({ initialItems, total, initialHasMore, seed, sort, search, contest, showContestLabel }: GalleryGridProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const remainingCount = total - items.length;

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('sort', sort);
      params.set('seed', String(seed));
      if (search) params.set('search', search);
      if (contest) params.set('contest', contest);

      const res = await fetch(`/api/gallery?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();

      setItems(prev => [...prev, ...data.items]);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('갤러리 더보기 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, sort, seed, search, contest]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((submission) => (
          <Link key={submission.id} href={`/gallery/${submission.id}` as Route} className="group">
            <div className="relative rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur border border-white/10">
              {/* 썸네일 — next/image로 Vercel CDN 캐싱 + WebP 자동 변환 */}
              <div className="aspect-video overflow-hidden relative bg-muted">
                {submission.thumbnailUrl && (
                  <Image
                    src={submission.thumbnailUrl}
                    alt={submission.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {/* 어느 공모전 작품인지 — 전체 보기에서만 (필터 중엔 중복 정보) */}
                {showContestLabel && submission.contestTitle && (
                  <span className="absolute top-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    {submission.contestTitle}
                  </span>
                )}
              </div>

              {/* 콘텐츠 */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-accent-foreground transition-colors">
                  {submission.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{submission.creatorName}</p>

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
            disabled={isLoading}
            className="group relative px-10 py-2.5 rounded-full border-2 border-primary text-primary font-semibold text-base overflow-hidden transition-all duration-300 hover:text-white hover:shadow-lg hover:shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중...</>
              ) : (
                <>더보기 <span className="text-sm opacity-70">+{remainingCount.toLocaleString()}</span></>
              )}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
