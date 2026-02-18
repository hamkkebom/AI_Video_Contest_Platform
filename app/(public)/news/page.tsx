'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getArticles } from '@/lib/mock';
import type { Article } from '@/lib/types';
import { ARTICLE_TYPES } from '@/config/constants';

/**
 * 뉴스 목록 페이지
 * 아티클 그리드, 필터, 정렬 기능
 */
export default function NewsPage() {
  const PRIMARY = '#EA580C';
  const SECONDARY = '#F59E0B';
  const ACCENT = '#8B5CF6';

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
        setFilteredArticles(data);
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

    // Filter by type
    if (filterType) {
      result = result.filter((article) => article.type === filterType);
    }

    // Sort
    if (sortBy === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } else if (sortBy === 'popular') {
      result = [...result].sort((a, b) => b.tags.length - a.tags.length);
    }

    setFilteredArticles(result);
  }, [articles, sortBy, filterType]);

  const getTypeLabel = (type: string) => {
    return ARTICLE_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend_report':
        return ACCENT;
      case 'announcement':
        return PRIMARY;
      case 'press_release':
        return SECONDARY;
      default:
        return '#999';
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
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
          color: '#fff',
          padding: '60px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '40px', margin: '0 0 16px', fontWeight: 700 }}>
            뉴스 & 트렌드
          </h1>
          <p style={{ fontSize: '18px', margin: 0, opacity: 0.95 }}>
            AI 영상 제작의 최신 뉴스와 트렌드를 만나보세요
          </p>
        </div>
      </section>

      {/* Filter & Sort Section */}
      <section
        style={{
          padding: '24px 40px',
          background: '#fff',
          borderBottom: '1px solid #e5e5e5',
          position: 'sticky',
          top: '64px',
          zIndex: 40,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Type Filter */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>유형:</span>
              <button
                onClick={() => setFilterType(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterType === null ? PRIMARY : '#f0f0f0',
                  color: filterType === null ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                전체
              </button>
              {ARTICLE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: filterType === type.value ? PRIMARY : '#f0f0f0',
                    color: filterType === type.value ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>정렬:</span>
              <button
                onClick={() => setSortBy('newest')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: sortBy === 'newest' ? ACCENT : '#f0f0f0',
                  color: sortBy === 'newest' ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                최신순
              </button>
              <button
                onClick={() => setSortBy('popular')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: sortBy === 'popular' ? ACCENT : '#f0f0f0',
                  color: sortBy === 'popular' ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                인기순
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section style={{ padding: '40px', background: '#f9f9f9', minHeight: '60vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              로딩 중...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              해당하는 아티클이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: `2px solid transparent`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.12)`;
                      el.style.borderColor = PRIMARY;
                      el.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      el.style.borderColor = 'transparent';
                      el.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '100%',
                        height: '200px',
                        background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                        backgroundImage: article.thumbnailUrl
                          ? `url(${article.thumbnailUrl})`
                          : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      {/* Type Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: getTypeColor(article.type),
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {getTypeLabel(article.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3
                        style={{
                          margin: '0 0 12px',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#1a1a1a',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.title}
                      </h3>

                      <p
                        style={{
                          margin: '0 0 16px',
                          fontSize: '14px',
                          color: '#666',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flex: 1,
                        }}
                      >
                        {article.excerpt}
                      </p>

                      {/* Meta */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px',
                          color: '#999',
                          borderTop: '1px solid #f0f0f0',
                          paddingTop: '12px',
                        }}
                      >
                        <span>{formatDate(article.publishedAt)}</span>
                        <span style={{ color: ACCENT }}>→</span>
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
