import type { Metadata } from 'next';
import Link from 'next/link';
import { safeJsonLd } from '@/lib/utils';
import { GalleryGrid } from './gallery-grid';

export const metadata: Metadata = {
  title: '갤러리 — AI 영상 작품 감상',
  description: 'AI꿈 갤러리에서 AI로 제작된 창작 영상 작품들을 감상하세요. 공모전 수상작과 출품작을 확인할 수 있습니다.',
  keywords: ['AI 영상 갤러리', 'AI 영상 작품', '공모전 수상작', 'AI꿈', '꿈꾸는 아리랑', '꿈꾸는 아리랑 영상', '꿈꾸는 아리랑 공모전', '아리랑 AI 작품'],
  alternates: { canonical: '/gallery/all' },
  openGraph: {
    title: '갤러리 — AI 영상 작품 감상',
    description: 'AI꿈 갤러리에서 AI로 제작된 창작 영상 작품들을 감상하세요.',
    url: '/gallery/all',
    type: 'website',
  },
};
import { getGallerySubmissions } from '@/lib/data';
import { SearchInput } from '@/components/ui/search-input';
import { DateRangeFilter } from './date-range-filter';
import { DurationFilter } from './duration-filter';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

/**
 * 전체 갤러리 페이지
 * 결과발표된 공모전의 모든 출품작 표시
 */
export default async function GalleryAllPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; search?: string; from?: string; to?: string; minDur?: string; maxDur?: string }>;
}) {
  const allSubmissions = await getGallerySubmissions();
  const { sort, search, from, to, minDur, maxDur } = await searchParams;

  const currentSort = sort || 'oldest';

  // 검색 필터링
  const searchFiltered = search
    ? allSubmissions.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.creatorName.toLowerCase().includes(search.toLowerCase())
    )
    : allSubmissions;
  // 시간대 + 영상 길이 필터링
  const minDurSec = minDur ? Number(minDur) : 0;
  const maxDurSec = maxDur ? Number(maxDur) : Infinity;
  const timeFiltered = searchFiltered.filter(s => {
    const date = new Date(s.submittedAt);
    if (from && date < new Date(from)) return false;
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      if (date > toEnd) return false;
    }
    if (s.videoDuration < minDurSec) return false;
    if (s.videoDuration > maxDurSec) return false;
    return true;
  });

  // 정렬
  const sortedSubmissions = [...timeFiltered].sort((a, b) => {
    switch (currentSort) {
      case 'oldest':
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      case 'latest':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      default:
        return 0;
    }
  });

  // GalleryGrid 클라이언트 컴포넌트에 전달할 직렬화 가능한 데이터
  const gridSubmissions = sortedSubmissions.map((s) => ({
    id: s.id,
    title: s.title,
    creatorName: s.creatorName,
    thumbnailUrl: s.thumbnailUrl,
    views: s.views,
    likeCount: s.likeCount,
  }));

  const galleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '갤러리 작품 목록',
    itemListElement: allSubmissions.slice(0, 10).map((submission, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/gallery/${submission.id}`,
      name: submission.title,
    })),
  };

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(galleryJsonLd) }}
      />

      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-4 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-500/80 to-foreground/70">
              Gallery
            </h1>
            <p className="text-lg text-muted-foreground">
              공모전에 출품된 작품들을 감상하세요
            </p>
          </div>
        </div>
      </section>

      {/* 필터 바 (Glassmorphism Sticky) */}
      <section className="sticky top-16 z-40 px-4 pb-8 pt-12">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 pr-4 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: 'oldest', label: '오래된순' },
                { id: 'latest', label: '최신순' },
              ].map((tab) => {
                const params = new URLSearchParams();
                params.set('sort', tab.id);
                if (search) params.set('search', search);
                if (from) params.set('from', from);
                if (to) params.set('to', to);
                return (
                  <Link key={tab.id} href={`/gallery/all?${params.toString()}`} scroll={false}>
                    <button
                      type="button"
                      className={`px-5 py-2.5 rounded-lg text-base tracking-tight transition-all cursor-pointer ${currentSort === tab.id
                        ? 'text-violet-500 font-bold bg-violet-500/10'
                        : 'text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      {tab.label}
                    </button>
                  </Link>
                );
              })}
              {/* 기간 필터 */}
              <DateRangeFilter from={from} to={to} />
              {/* 영상 길이 필터 */}
              <DurationFilter minDur={minDur} maxDur={maxDur} />
            </div>

            {/* 검색 입력 */}
            <SearchInput basePath="/gallery/all" currentSearch={search} extraParams={{ sort: currentSort, ...(from ? { from } : {}), ...(to ? { to } : {}) }} placeholder="작품 검색..." />
          </div>
        </div>
      </section>

      {/* 갤러리 그리드 */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* 작품 수 표시 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col gap-1">
              <p className="text-base text-muted-foreground">
                총 <span className="text-[#EA580C] font-semibold">{sortedSubmissions.length.toLocaleString()}</span>개의 작품
              </p>
              {search && (
                <p className="text-sm text-muted-foreground">
                  &apos;<span className="text-foreground font-semibold">{search}</span>&apos; 검색 결과
                </p>
              )}
            </div>
          </div>

          <GalleryGrid submissions={gridSubmissions} />
        </div>
      </section>
    </div>
  );
}
