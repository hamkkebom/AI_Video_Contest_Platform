'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 검색 콘텐츠 컴포넌트
 */
function SearchContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'all' | 'contests' | 'videos' | 'creators'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(decodeURIComponent(q));
    }
  }, [searchParams]);

  const mockResults = {
    contests: Array.from({ length: 6 }, (_, i) => ({
      id: `c-${i}`,
      title: `공모전 ${i + 1}`,
      description: '설명',
    })),
    videos: Array.from({ length: 8 }, (_, i) => ({
      id: `v-${i}`,
      title: `영상 ${i + 1}`,
      creator: `크리에이터 ${i + 1}`,
    })),
    creators: Array.from({ length: 6 }, (_, i) => ({
      id: `cr-${i}`,
      name: `크리에이터 ${i + 1}`,
      region: '서울',
    })),
  };

  return (
    <div className="w-full">
      {/* 검색 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-6">검색</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="공모전, 영상, 크리에이터 검색..."
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="bg-[#8B5CF6] hover:bg-[#7C4DCC]">검색</Button>
          </div>
        </div>
      </section>

      {/* 탭 */}
      <section className="py-6 px-4 bg-background border-b border-border sticky top-16 z-40">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-2">
            {(['all', 'contests', 'videos', 'creators'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab === 'all' && '전체'}
                {tab === 'contests' && '공모전'}
                {tab === 'videos' && '영상'}
                {tab === 'creators' && '크리에이터'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 결과 */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          {/* 공모전 */}
          {(activeTab === 'all' || activeTab === 'contests') && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">공모전</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockResults.contests.map((contest) => (
                  <Link key={contest.id} href={`/contests/${contest.id}` as any}>
                    <div className="border border-border rounded-lg p-4 hover:shadow-lg transition-all hover:border-[#EA580C] cursor-pointer">
                      <div className="bg-gradient-to-r from-[#EA580C] to-[#F59E0B] h-24 rounded mb-3 flex items-center justify-center">
                        <span className="text-3xl">🎬</span>
                      </div>
                      <h3 className="font-bold">{contest.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{contest.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 영상 */}
          {(activeTab === 'all' || activeTab === 'videos') && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">영상</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockResults.videos.map((video) => (
                  <div key={video.id} className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-[#EA580C] cursor-pointer">
                    <div className="bg-gradient-to-br from-[#EA580C] to-[#8B5CF6] aspect-video flex items-center justify-center">
                      <span className="text-3xl">🎬</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{video.creator}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 크리에이터 */}
          {(activeTab === 'all' || activeTab === 'creators') && (
            <div>
              <h2 className="text-2xl font-bold mb-6">크리에이터</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockResults.creators.map((creator) => (
                  <div key={creator.id} className="border border-border rounded-lg p-4 hover:shadow-lg transition-all hover:border-[#EA580C] cursor-pointer text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EA580C] to-[#8B5CF6] flex items-center justify-center text-white font-bold mx-auto mb-3">
                      {creator.name.charAt(0)}
                    </div>
                    <h3 className="font-bold">{creator.name}</h3>
                    <p className="text-sm text-muted-foreground">{creator.region}</p>
                    <Button className="w-full mt-3 bg-[#8B5CF6] hover:bg-[#7C4DCC]" size="sm">
                      프로필 보기
                    </Button>
                  </div>
                ))}
              </div>
            </div>
           )}
         </div>
       </section>
     </div>
   );
 }

/**
 * 통합검색 페이지
 * 탭: 전체/공모전/영상/크리에이터
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="w-full py-12 text-center">로딩 중...</div>}>
      <SearchContent />
    </Suspense>
  );
}
