'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getArticles } from '@/lib/mock';
import type { Article } from '@/lib/types';
import { ARTICLE_TYPES } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { SortSelect } from '@/components/ui/sort-select';
import { SearchInput } from '@/components/ui/search-input';

/**
 * 뉴스 목록 페이지
 * 공모전 페이지 디자인 통일
 */
function NewsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const data = await getArticles();
        setArticles(data);
      } catch (error) {
        console.error('Failed to load articles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  useEffect(() => {
    let result = articles;

    // URL 검색어 필터링
    if (urlSearch) {
      const q = urlSearch.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(q) ||
          article.excerpt.toLowerCase().includes(q) ||
          article.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (filterType) {
      result = result.filter((article) => article.type === filterType);
    }

    if (sortBy === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } else if (sortBy === 'popular') {
      result = [...result].sort((a, b) => b.tags.length - a.tags.length);
    }

    setFilteredArticles(result);
  }, [articles, sortBy, filterType, urlSearch]);

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
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 pb-1 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-500/80 to-foreground/70">
              Story
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              꿈플의 새로운 소식을 만나보세요
            </p>
          </div>
        </div>
      </section>

      {/* 필터 & 정렬 (Glassmorphism) */}
      <section className="sticky top-16 z-40 px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 pr-4 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* 타입 필터 */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFilterType(null)}
                className={`px-5 py-2.5 rounded-lg text-base tracking-tight transition-all cursor-pointer ${filterType === null
                  ? 'text-violet-500 font-bold bg-violet-500/10'
                  : 'text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                전체
              </button>
              {ARTICLE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`px-5 py-2.5 rounded-lg text-base tracking-tight transition-all cursor-pointer ${filterType === type.value
                    ? 'text-violet-500 font-bold bg-violet-500/10'
                    : 'text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* 검색 & 정렬 */}
            <div className="flex items-center gap-3">
              <SortSelect
                options={[
                  { value: 'newest', label: '최신순' },
                  { value: 'popular', label: '인기순' },
                ]}
                value={sortBy}
                onChange={(val) => setSortBy(val as 'newest' | 'popular')}
              />
              <SearchInput basePath="/story" currentSearch={urlSearch} placeholder="스토리 검색..." />
            </div>
          </div>
        </div>
      </section>

      {/* 아티클 그리드 */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* 로딩 중에는 카운트 숨기고, 로딩 완료 후 표시 */}
          {!loading && (
            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-col gap-1">
                <p className="text-base text-muted-foreground">
                  총 <span className="text-[#EA580C] font-semibold">{filteredArticles.length}</span>개의 아티클
                </p>
                {urlSearch && (
                  <p className="text-sm text-muted-foreground">
                    &apos;<span className="text-foreground font-semibold">{urlSearch}</span>&apos; 검색 결과
                  </p>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'].map((skId) => (
                <div key={skId} className="rounded-xl overflow-hidden bg-background/50 backdrop-blur border border-white/10 h-full flex flex-col animate-pulse">
                  <div className="h-52 bg-muted/50" />
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="h-5 bg-muted/50 rounded w-3/4" />
                    <div className="h-4 bg-muted/30 rounded w-full" />
                    <div className="h-4 bg-muted/30 rounded w-2/3" />
                    <div className="mt-auto pt-3 border-t border-white/10">
                      <div className="h-3 bg-muted/30 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">📰</span>
              </div>
              <h3 className="text-xl font-bold mb-2">해당하는 아티클이 없어요</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                필터 조건을 변경해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <Link key={article.id} href={`/story/${article.slug}`}>
                  <div className="group rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur border border-white/10 h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="h-52 relative overflow-hidden">
                      <img
                        src={article.thumbnailUrl || `/images/hero-${(index % 6) + 1}.jpg`}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Type Badge */}
                      <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg ${getTypeColor(article.type)}`}>
                        {getTypeLabel(article.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-3 leading-snug group-hover:text-orange-400 transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {article.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-3 border-t border-white/10">
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * 스토리 페이지 (Suspense 경계 포함)
 */
export default function NewsPage() {
  return (
    <Suspense fallback={<div className="w-full py-12 text-center text-muted-foreground">로딩 중...</div>}>
      <NewsContent />
    </Suspense>
  );
}
