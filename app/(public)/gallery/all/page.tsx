import Link from 'next/link';
import { Eye, Heart } from 'lucide-react';
import { getGallerySubmissions, getFeaturedSubmissions } from '@/lib/data';
import { FeaturedWorksCarousel } from '@/components/landing/featured-works-carousel';
import { SearchInput } from '@/components/ui/search-input';

/**
 * 전체 갤러리 페이지
 * 결과발표된 공모전의 모든 출품작 표시
 */
export default async function GalleryAllPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; search?: string }>;
}) {
  const allSubmissions = await getGallerySubmissions();
  const featuredSubmissions = await getFeaturedSubmissions(12);
  const { sort, page, search } = await searchParams;

  const currentSort = sort || 'latest';
  const currentPage = Math.max(1, Number(page) || 1);
  const ITEMS_PER_PAGE = 12;

  // 인기순 점수: (조회수 × 0.7 + 좋아요 × 0.3) × 시청유지율 승수
  const popularityScore = (s: typeof allSubmissions[number]) => {
    const rate = s.videoDuration > 0 ? Math.min(s.avgWatchDuration / s.videoDuration, 1) : 0;
    const retentionMul = 0.5 + rate * 0.5;
    return (s.views * 0.7 + s.likeCount * 0.3) * retentionMul;
  };

  // 검색 필터링
  const searchFiltered = search
    ? allSubmissions.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.creatorName.toLowerCase().includes(search.toLowerCase())
      )
    : allSubmissions;

  // 정렬
  const sortedSubmissions = [...searchFiltered].sort((a, b) => {
    switch (currentSort) {
      case 'latest':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case 'popular':
        return popularityScore(b) - popularityScore(a);
      default:
        return 0;
    }
  });

  // 페이지네이션 (12개씩)
  const displayedSubmissions = sortedSubmissions.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = sortedSubmissions.length > displayedSubmissions.length;
  const remainingCount = sortedSubmissions.length - displayedSubmissions.length;

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-4 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-500/80 to-foreground/70">
              Gallery
            </h1>
            <p className="text-lg text-muted-foreground">
              공모전에 출품된 작품들을 감상하세요
            </p>
          </div>
        </div>
      </section>

      {/* 주목할 작품 캐러셀 */}
      <FeaturedWorksCarousel submissions={featuredSubmissions} showGalleryLink={false} />

      {/* 필터 바 (Glassmorphism Sticky) */}
      <section className="sticky top-16 z-40 px-4 pb-8 pt-12">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 pr-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-1">
              {[
                { id: 'latest', label: '최신순' },
                { id: 'popular', label: '인기순' },
              ].map((tab) => {
                const params = new URLSearchParams();
                params.set('sort', tab.id);
                if (search) params.set('search', search);
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
            </div>

            {/* 검색 입력 */}
            <SearchInput basePath="/gallery/all" currentSearch={search} extraParams={{ sort: currentSort }} placeholder="작품 검색..." />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedSubmissions.map((submission, index) => (
              <Link key={submission.id} href={`/gallery/${submission.id}` as any} className="group">
                <div className="relative rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur border border-white/10">
                  {/* 썸네일 */}
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={`/images/contest-${(index % 5) + 1}.jpg`}
                      alt={submission.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* 콘텐츠 */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-accent-foreground transition-colors">
                      {submission.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{submission.creatorName}</p>

                    {/* 통계 (숫자 쉼표 적용) */}
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

          {/* 더보기 버튼 — 공모전 페이지와 동일 스타일 */}
          {hasMore && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link href={`/gallery/all?sort=${currentSort}&page=${currentPage + 1}${search ? `&search=${search}` : ''}`} scroll={false}>
                <button type="button" className="group relative px-10 py-2.5 rounded-full border-2 border-violet-500 text-violet-500 font-semibold text-base overflow-hidden transition-all duration-300 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer">
                  <span className="absolute inset-0 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="relative z-10 flex items-center gap-2">
                    더보기
                    <span className="text-sm opacity-70">+{remainingCount.toLocaleString()}</span>
                  </span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
