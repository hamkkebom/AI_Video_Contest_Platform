import { PageHeader } from '@/components/layout/page-header';
import type { Metadata } from 'next';
import Link from 'next/link';
import { safeJsonLd } from '@/lib/utils';
import { GalleryGrid } from './gallery-grid';
import { SearchInput } from '@/components/ui/search-input';
import { headers } from 'next/headers';
import { getContests, getGallerySubmissions } from '@/lib/data';
import { keywordsFromContests } from '@/lib/seo';

/**
 * 갤러리 키워드는 공모전 태그에서 만든다.
 * 새 공모전이 등록되면 그 태그가 자동으로 검색 키워드에 반영된다.
 */
export async function generateMetadata(): Promise<Metadata> {
  const contests = await getContests().catch(() => []);
  const title = '갤러리 — AI 영상 작품 감상';
  const description = 'AI꿈 갤러리에서 AI로 제작된 창작 영상 작품들을 감상하세요. 공모전 수상작과 출품작을 확인할 수 있습니다.';
  return {
    title,
    description,
    keywords: ['AI 영상 갤러리', 'AI 영상 작품', '공모전 수상작', ...keywordsFromContests(contests)],
    alternates: { canonical: '/gallery/all' },
    openGraph: { title, description, url: '/gallery/all', type: 'website' },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

/**
 * 전체 갤러리 페이지
 * 서버 사이드 페이지네이션 — 첫 페이지만 서버에서 로드, 이후 클라이언트에서 API 호출
 */
export default async function GalleryAllPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; search?: string; contest?: string; _t?: string }>;
}) {
  const { sort, search, contest, _t } = await searchParams;
  const currentSort = sort || 'random';
  const seed = _t ? Number(_t) : Date.now();

  /* 공모전 필터 후보 — 실제로 갤러리에 작품이 있는 공모전만, 출품작 많은 순.
     같은 캐시(getGallerySubmissions)를 읽으므로 추가 DB 조회가 없다 */
  const allSubmissions = await getGallerySubmissions().catch(() => []);
  const contestFacets = (() => {
    const counts = new Map<string, { id: string; title: string; count: number }>();
    for (const s of allSubmissions) {
      const id = String(s.contestId);
      const entry = counts.get(id);
      if (entry) entry.count += 1;
      else counts.set(id, { id, title: s.contestTitle, count: 1 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count);
  })();
  /* 존재하지 않는 공모전 id가 들어오면 무시하고 전체로 */
  const currentContest = contest && contestFacets.some((c) => c.id === contest) ? contest : '';
  const currentContestTitle = contestFacets.find((c) => c.id === currentContest)?.title ?? '';

  /* 서버에서 첫 페이지 데이터를 API로 조회 */
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';

  const params = new URLSearchParams();
  params.set('page', '1');
  params.set('sort', currentSort);
  params.set('seed', String(seed));
  if (search) params.set('search', search);
  if (currentContest) params.set('contest', currentContest);

  let initialItems: Array<{ id: string; title: string; creatorName: string; thumbnailUrl: string | null; views: number; likeCount: number; contestId: string; contestTitle: string }> = [];
  let total = 0;
  let hasMore = false;

  try {
    const res = await fetch(`${protocol}://${host}/api/gallery?${params.toString()}`, {
      next: { tags: ['gallery'], revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      initialItems = data.items;
      total = data.total;
      hasMore = data.hasMore;
    }
  } catch (err) {
    console.error('갤러리 초기 데이터 로드 실패:', err);
  }

  const galleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '갤러리 작품 목록',
    itemListElement: initialItems.slice(0, 10).map((submission, index) => ({
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

      {/* 배경 장식 — 색은 globals.css .page-glow 가 테마 토큰으로 결정 */}
      <div className="page-glow" />

      <PageHeader
        title="Gallery"
        description={
          <>
{currentContestTitle
                ? `${currentContestTitle} 출품작`
                : '공모전에 출품된 작품들을 감상하세요'}
          </>
        }
        tight
      />

      {/* 필터 바 (Glassmorphism Sticky) */}
      <section className="sticky top-16 z-40 px-4 pb-8 pt-12">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 pr-4 space-y-2">
            {/* 1행: 공모전 필터 — 여러 공모전이 열리는 구조의 1차 축 */}
            {contestFacets.length > 1 && (
              <div className="flex items-center gap-1 flex-wrap border-b border-border/50 pb-2">
                <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  공모전
                </span>
                {[{ id: '', title: '전체', count: allSubmissions.length }, ...contestFacets].map((opt) => {
                  const linkParams = new URLSearchParams();
                  if (currentSort !== 'random') linkParams.set('sort', currentSort);
                  else linkParams.set('_t', String(seed));
                  if (search) linkParams.set('search', search);
                  if (opt.id) linkParams.set('contest', opt.id);
                  return (
                    <Link key={opt.id || 'all'} href={`/gallery/all?${linkParams.toString()}`} scroll={false}>
                      <button
                        type="button"
                        className={`px-3 py-2 rounded-lg text-sm tracking-tight transition-all cursor-pointer ${currentContest === opt.id
                          ? 'text-brand font-bold bg-brand/10'
                          : 'text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50'
                          }`}
                      >
                        {opt.title}
                        <span className="ml-1.5 text-xs opacity-60">{opt.count.toLocaleString()}</span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* 2행: 정렬 + 검색 */}
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: 'random', label: '🔀 랜덤' },
                  { id: 'latest', label: '최신순' },
                  { id: 'oldest', label: '오래된순' },
                ].map((tab) => {
                  const linkParams = new URLSearchParams();
                  if (tab.id === 'random') {
                    linkParams.set('_t', String(Date.now()));
                  } else {
                    linkParams.set('sort', tab.id);
                  }
                  if (search) linkParams.set('search', search);
                  if (currentContest) linkParams.set('contest', currentContest);
                  return (
                    <Link key={tab.id} href={`/gallery/all?${linkParams.toString()}`} scroll={false}>
                      <button
                        type="button"
                        className={`px-5 py-2.5 rounded-lg text-base tracking-tight transition-all cursor-pointer ${currentSort === tab.id
                          ? 'text-primary font-bold bg-primary/10'
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
              <SearchInput basePath="/gallery/all" currentSearch={search} extraParams={{ ...(currentSort !== 'random' ? { sort: currentSort } : { _t: String(seed) }), ...(currentContest ? { contest: currentContest } : {}) }} placeholder="작품 또는 제작자 검색..." />
            </div>
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
                총 <span className="text-brand font-semibold">{total.toLocaleString()}</span>개의 작품
              </p>
              {search && (
                <p className="text-sm text-muted-foreground">
                  &apos;<span className="text-foreground font-semibold">{search}</span>&apos; 검색 결과
                </p>
              )}
            </div>
          </div>

          <GalleryGrid
            initialItems={initialItems}
            total={total}
            initialHasMore={hasMore}
            seed={seed}
            sort={currentSort}
            search={search || ''}
            contest={currentContest}
            showContestLabel={!currentContest && contestFacets.length > 1}
          />
        </div>
      </section>
    </div>
  );
}
