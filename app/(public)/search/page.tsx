'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AutoFitTitle } from '@/components/ui/auto-fit-title';
import {
  Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from '@/components/ui/carousel';
import { Search, Trophy, Award, Upload, Eye, Heart, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { searchMockData } from '@/lib/mock';
import type { SearchResult } from '@/lib/types';
import { ARTICLE_TYPES } from '@/config/constants';

/** 캐러셀 스크롤 네비게이션 훅 */
function useCarouselNav() {
  const [api, setApi] = useState<CarouselApi>();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  return { api, setApi, canPrev, canNext };
}

/** 캐러셀 좌우 화살표 */
function CarouselArrows({ api, canPrev, canNext }: { api: CarouselApi | undefined; canPrev: boolean; canNext: boolean }) {
  return (
    <>
      {canPrev && (
        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:shadow-lg transition-all cursor-pointer hidden md:flex"
          aria-label="이전"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:shadow-lg transition-all cursor-pointer hidden md:flex"
          aria-label="다음"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      )}
    </>
  );
}

const CAROUSEL_OPTS = {
  align: 'start' as const,
  loop: false,
  slidesToScroll: 'auto' as const,
  containScroll: 'trimSnaps' as const,
  watchSlides: false,
};

/**
 * 검색 콘텐츠 컴포넌트
 * 캐러셀 형태로 공모전/영상/스토리 검색 결과 표시, 더보기로 각 페이지 연결
 */
function SearchContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({
    contests: [],
    submissions: [],
    users: [],
    articles: [],
  });
  const [hasSearched, setHasSearched] = useState(false);

  const contestNav = useCarouselNav();
  const submissionNav = useCarouselNav();
  const articleNav = useCarouselNav();

  /** KST 기준 D-day 계산 */
  const calcDDay = (deadlineStr: string) => {
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const nowKSTDay = Math.floor((Date.now() + KST_OFFSET) / MS_PER_DAY);
    const deadlineKSTDay = Math.floor((new Date(deadlineStr).getTime() + KST_OFFSET) / MS_PER_DAY);
    return deadlineKSTDay - nowKSTDay;
  };

  /** 검색 실행 (전체 카테고리) */
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults({ contests: [], submissions: [], users: [], articles: [] });
      setHasSearched(false);
      return;
    }
    const data = await searchMockData({ query });
    setResults(data);
    setHasSearched(true);
  }, []);

  /** URL 파라미터에서 초기 검색어 로드 */
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      const decoded = decodeURIComponent(q);
      setSearchQuery(decoded);
      performSearch(decoded);
    }
  }, [searchParams, performSearch]);

  /** 검색 폼 제출 */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const getTypeLabel = (type: string) => {
    return ARTICLE_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'notice':
        return 'bg-orange-500/90 text-white';
      case 'program':
        return 'bg-violet-500/90 text-white';
      case 'insight':
        return 'bg-emerald-500/90 text-white';
      default:
        return 'bg-gray-500/90 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const totalResults =
    results.contests.length + results.submissions.length + results.articles.length;
  const encodedQuery = encodeURIComponent(searchQuery);

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
              Search
            </h1>
            <p className="text-lg text-muted-foreground">
              공모전, 영상, 스토리를 통합 검색하세요
            </p>
          </div>
        </div>
      </section>

      {/* Sticky 검색바 (Glassmorphism) */}
      <section className="sticky top-16 z-40 px-4 pb-8 pt-8">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 pr-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="공모전, 영상, 스토리 검색..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-background/80 border border-border text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-violet-500 hover:bg-violet-600 rounded-lg px-6 py-2.5 cursor-pointer text-sm font-semibold">
                검색
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* 결과 영역 */}
      {!hasSearched ? (
        <section className="pb-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">무엇을 찾고 계신가요?</h3>
              <p className="text-muted-foreground max-w-md mb-10">
                검색어를 입력하면 공모전, 영상, 스토리에서 통합 검색합니다.
              </p>

              {/* 카테고리 바로가기 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                <Link href="/contests?status=open" className="group">
                  <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-background/50 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
                    <Trophy className="h-6 w-6 text-violet-500" />
                    <span className="text-sm font-semibold group-hover:text-violet-500 transition-colors">공모전</span>
                  </div>
                </Link>
                <Link href="/gallery/all" className="group">
                  <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-background/50 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300">
                    <Eye className="h-6 w-6 text-orange-500" />
                    <span className="text-sm font-semibold group-hover:text-orange-500 transition-colors">갤러리</span>
                  </div>
                </Link>
                <Link href="/story" className="group">
                  <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-background/50 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
                    <Heart className="h-6 w-6 text-emerald-500" />
                    <span className="text-sm font-semibold group-hover:text-emerald-500 transition-colors">스토리</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : totalResults === 0 ? (
        <section className="pb-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                &apos;<span className="text-violet-500">{searchQuery}</span>&apos;에 대한 결과가 없습니다
              </h3>
              <p className="text-muted-foreground max-w-md mb-8">
                다른 검색어로 다시 시도하거나, 아래 카테고리를 둘러보세요.
              </p>
              <div className="flex gap-3">
                <Link href="/contests?status=open">
                  <Button variant="outline" className="rounded-full px-6 cursor-pointer">공모전 보기</Button>
                </Link>
                <Link href="/gallery/all">
                  <Button variant="outline" className="rounded-full px-6 cursor-pointer">갤러리 보기</Button>
                </Link>
                <Link href="/story">
                  <Button variant="outline" className="rounded-full px-6 cursor-pointer">스토리 보기</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="pb-24">
          {/* 검색 결과 요약 */}
          <section className="px-4 mb-10">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col gap-1">
                <p className="text-base text-muted-foreground">
                  총 <span className="text-[#EA580C] font-semibold">{totalResults}</span>건의 결과
                </p>
                <p className="text-sm text-muted-foreground">
                  &apos;<span className="text-foreground font-semibold">{searchQuery}</span>&apos; 검색 결과
                </p>
              </div>
            </div>
          </section>

          <div className="space-y-16">

          {/* ── 공모전 캐러셀 ── */}
          {results.contests.length > 0 && (
            <section className="px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    공모전 <span className="text-primary text-lg font-semibold ml-1">{results.contests.length}</span>
                  </h2>
                  <Link
                    href={`/contests?search=${encodedQuery}` as any}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    더보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="relative">
                  <Carousel setApi={contestNav.setApi} opts={CAROUSEL_OPTS} className="w-full">
                    <CarouselContent className="-ml-4 py-2">
                      {results.contests.map((contest, index) => (
                        <CarouselItem key={contest.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                          <Link href={`/contests/${contest.id}` as any} className="group relative block">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EA580C] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top z-20" />
                              <img
                                src={contest.posterUrl || `/images/contest-${(index % 5) + 1}.jpg`}
                                alt={contest.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute top-[18px] right-3 z-10">
                                {contest.status === 'open' ? (() => {
                                  const dday = calcDDay(contest.submissionEndAt);
                                   const colorClass = dday <= 7 ? 'bg-red-500/70' : dday <= 14 ? 'bg-orange-500/70' : 'bg-violet-500/70';
                                  return (
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white ${colorClass}`}>
                                      {dday === 0 ? 'D-Day' : `D-${dday}`}
                                    </span>
                                  );
                                })() : (
                                   <span className={`px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white ${contest.status === 'judging' ? 'bg-pink-500/70' : 'bg-amber-500/70'}`}>
                                    {contest.status === 'judging' ? '심사중' : (<><Trophy className="inline h-3.5 w-3.5 mr-1" />결과발표</>)}
                                  </span>
                                )}
                              </div>
                              <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 flex flex-col justify-end">
                                <div className="absolute inset-0 bg-gradient-to-t from-black from-50% to-transparent" />
                                <div className="relative pb-4 px-4 flex flex-col gap-3">
                                  <AutoFitTitle
                                    className="font-bold text-white break-keep group-hover:text-[#EA580C] transition-colors leading-snug"
                                    maxFontSize={18}
                                    minFontSize={13}
                                    maxLines={2}
                                  >
                                    {contest.title}
                                  </AutoFitTitle>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-white/90"><Award className="inline h-3.5 w-3.5 mr-1" />총상금 {contest.prizeAmount ?? '미정'}</span>
                                    <span className="text-xs text-white/60">
                                      {contest.status === 'open'
                                        ? `마감 ${new Date(contest.submissionEndAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
                                        : `발표 ${new Date(contest.resultAnnouncedAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                  <CarouselArrows api={contestNav.api} canPrev={contestNav.canPrev} canNext={contestNav.canNext} />
                </div>
              </div>
            </section>
          )}

          {/* ── 영상 캐러셀 ── */}
          {results.submissions.length > 0 && (
            <section className="px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    영상 <span className="text-primary text-lg font-semibold ml-1">{results.submissions.length}</span>
                  </h2>
                  <Link
                    href={`/gallery/all?search=${encodedQuery}` as any}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    더보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="relative">
                  <Carousel setApi={submissionNav.setApi} opts={CAROUSEL_OPTS} className="w-full">
                    <CarouselContent className="-ml-4 py-2">
                      {results.submissions.map((submission, index) => (
                        <CarouselItem key={submission.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                          <Link href={`/gallery/${submission.id}` as any} className="group block">
                            <div className="rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer bg-background border border-border hover:border-border/80">
                              <div className="aspect-video overflow-hidden">
                                <img
                                  src={submission.thumbnailUrl || `/images/contest-${(index % 5) + 1}.jpg`}
                                  alt={submission.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="p-4 space-y-2">
                                <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-accent-foreground transition-colors">
                                  {submission.title}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                  <CarouselArrows api={submissionNav.api} canPrev={submissionNav.canPrev} canNext={submissionNav.canNext} />
                </div>
              </div>
            </section>
          )}

          {/* ── 스토리 캐러셀 ── */}
          {results.articles.length > 0 && (
            <section className="px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    스토리 <span className="text-primary text-lg font-semibold ml-1">{results.articles.length}</span>
                  </h2>
                  <Link
                    href={`/story?search=${encodedQuery}` as any}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    더보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="relative">
                  <Carousel setApi={articleNav.setApi} opts={CAROUSEL_OPTS} className="w-full">
                    <CarouselContent className="-ml-4 py-2">
                      {results.articles.map((article, index) => (
                        <CarouselItem key={article.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                          <Link href={`/story/${article.slug}` as any} className="group block">
                            <div className="rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer bg-background border border-border hover:border-border/80 h-full flex flex-col">
                              <div className="aspect-[16/9] relative overflow-hidden">
                                <img
                                  src={article.thumbnailUrl || `/images/hero-${(index % 6) + 1}.jpg`}
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[0.65rem] font-bold backdrop-blur-md border border-white/20 shadow-lg ${getTypeColor(article.type)}`}>
                                  {getTypeLabel(article.type)}
                                </div>
                              </div>
                              <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-1.5 group-hover:text-orange-400 transition-colors min-h-[2.5rem]">
                                  {article.title}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                                  {article.excerpt}
                                </p>
                                <div className="text-xs text-muted-foreground pt-1.5 border-t border-border">
                                  {formatDate(article.publishedAt)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                  <CarouselArrows api={articleNav.api} canPrev={articleNav.canPrev} canNext={articleNav.canNext} />
                </div>
              </div>
            </section>
          )}

          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 통합검색 페이지
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="w-full py-12 text-center">로딩 중...</div>}>
      <SearchContent />
    </Suspense>
  );
}
