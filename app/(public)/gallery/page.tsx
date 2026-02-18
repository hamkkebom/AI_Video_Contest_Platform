'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 갤러리 페이지
 * 포스터 캐러셀 + 무한스크롤 + 좋아요 토글
 */
export default function GalleryPage() {
  const [submissions] = useState([
    ...Array.from({ length: 24 }, (_, i) => ({
      id: `sub-${i + 1}`,
      title: `AI 영상 작품 ${i + 1}`,
      creator: `크리에이터 ${Math.floor(Math.random() * 50) + 1}`,
      likes: Math.floor(Math.random() * 50) + 1,
      views: Math.floor(Math.random() * 1000) + 100,
      contestId: `contest-${Math.floor(Math.random() * 10) + 1}`,
    })),
  ]);

  const [likedSubmissions, setLikedSubmissions] = useState<Set<string>>(new Set());

  const handleLike = (submissionId: string) => {
    const newLiked = new Set(likedSubmissions);
    if (newLiked.has(submissionId)) {
      newLiked.delete(submissionId);
    } else {
      newLiked.add(submissionId);
    }
    setLikedSubmissions(newLiked);
  };

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">갤러리</h1>
          <p className="text-muted-foreground">
            공모전 수상작 및 우수 작품들을 감상하세요
          </p>
        </div>
      </section>

      {/* 포스터 캐러셀 */}
      <section className="py-8 px-4 bg-background border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-6">주목할 작품</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {submissions.slice(0, 5).map((submission) => (
              <div
                key={submission.id}
                className="flex-shrink-0 w-64 bg-gradient-to-br from-[#EA580C]/20 to-[#8B5CF6]/20 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
                <h3 className="font-semibold line-clamp-2">{submission.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{submission.creator}</p>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>👁️ {submission.views}</span>
                  <span>❤️ {submission.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 필터 & 정렬 */}
      <section className="py-6 px-4 bg-background border-b border-border sticky top-16 z-40">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="border-[#EA580C] text-[#EA580C]">
                전체
              </Button>
              <Button variant="ghost" size="sm">
                최신순
              </Button>
              <Button variant="ghost" size="sm">
                인기순
              </Button>
              <Button variant="ghost" size="sm">
                좋아요순
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 무한스크롤 그리드 */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-[#EA580C] group"
              >
                {/* 썸네일 */}
                <div className="bg-gradient-to-br from-[#EA580C] to-[#F59E0B] aspect-video flex items-center justify-center relative overflow-hidden">
                  <span className="text-4xl group-hover:scale-110 transition-transform">🎬</span>
                </div>

                {/* 콘텐츠 */}
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{submission.title}</h3>
                  <p className="text-xs text-muted-foreground">{submission.creator}</p>

                  {/* 통계 */}
                  <div className="flex gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>👁️ {submission.views}</span>
                    <span>❤️ {submission.likes}</span>
                  </div>

                  {/* 좋아요 버튼 */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleLike(submission.id)}
                      className="w-full py-2 px-3 rounded bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] text-sm font-medium transition-colors"
                    >
                      {likedSubmissions.has(submission.id) ? '❤️ 좋아요' : '🤍 좋아요'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 더보기 */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              더 많은 작품 보기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
