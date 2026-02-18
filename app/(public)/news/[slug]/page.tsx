import Link from 'next/link';
import { getArticles } from '@/lib/mock';
import type { Article } from '@/lib/types';
import { ARTICLE_TYPES } from '@/config/constants';

type NewsDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * 뉴스 상세 페이지
 * 전체 아티클 내용, 저자 정보, 관련 아티클
 */
export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const PRIMARY = '#EA580C';
  const SECONDARY = '#F59E0B';
  const ACCENT = '#8B5CF6';

  try {
    const articles = await getArticles();
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
      return (
        <main style={{ padding: '40px 20px', minHeight: '100vh', background: '#f9f9f9' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>
              아티클을 찾을 수 없습니다
            </h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              요청하신 아티클이 존재하지 않습니다.
            </p>
            <Link
              href="/news"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                background: PRIMARY,
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              뉴스 목록으로 돌아가기
            </Link>
          </div>
        </main>
      );
    }

    // Get related articles (same type, different article)
    const relatedArticles = articles
      .filter((a) => a.type === article.type && a.id !== article.id)
      .slice(0, 3);

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
        {/* Back Button */}
        <div
          style={{
            padding: '16px 40px',
            background: '#fff',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link
              href="/news"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: PRIMARY,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              ← 뉴스 목록으로 돌아가기
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <section
          style={{
            background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
            color: '#fff',
            padding: '60px 40px',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-block',
                background: getTypeColor(article.type),
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              {getTypeLabel(article.type)}
            </div>
            <h1 style={{ fontSize: '40px', margin: '0 0 24px', fontWeight: 700, lineHeight: 1.3 }}>
              {article.title}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: '24px',
                fontSize: '14px',
                opacity: 0.95,
                flexWrap: 'wrap',
              }}
            >
              <span>📅 {formatDate(article.publishedAt)}</span>
              <span>🏷️ {article.tags.join(', ')}</span>
            </div>
          </div>
        </section>

        {/* Thumbnail */}
        {article.thumbnailUrl && (
          <section style={{ padding: '40px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section style={{ padding: '40px', background: '#fff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Excerpt */}
            <div
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: `2px solid ${PRIMARY}`,
                lineHeight: 1.6,
              }}
            >
              {article.excerpt}
            </div>

            {/* Main Content */}
            <div
              style={{
                fontSize: '16px',
                lineHeight: 1.8,
                color: '#444',
                marginBottom: '40px',
              }}
            >
              <p>{article.content}</p>
              <p style={{ marginTop: '16px' }}>
                이 아티클은 AI 영상 제작 분야의 최신 트렌드와 정보를 제공합니다. 더 많은 정보를 원하시면
                뉴스 목록을 확인해주세요.
              </p>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section style={{ padding: '40px', background: '#f9f9f9' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '32px', color: '#1a1a1a' }}>
                관련 아티클
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                }}
              >
                {relatedArticles.map((relatedArticle) => (
                  <Link key={relatedArticle.id} href={`/news/${relatedArticle.slug}`}>
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
                          height: '160px',
                          background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                          backgroundImage: relatedArticle.thumbnailUrl
                            ? `url(${relatedArticle.thumbnailUrl})`
                            : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: getTypeColor(relatedArticle.type),
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {getTypeLabel(relatedArticle.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3
                          style={{
                            margin: '0 0 8px',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#1a1a1a',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {relatedArticle.title}
                        </h3>

                        <p
                          style={{
                            margin: '0 0 12px',
                            fontSize: '13px',
                            color: '#666',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flex: 1,
                          }}
                        >
                          {relatedArticle.excerpt}
                        </p>

                        <div
                          style={{
                            fontSize: '11px',
                            color: '#999',
                            borderTop: '1px solid #f0f0f0',
                            paddingTop: '8px',
                          }}
                        >
                          {formatDate(relatedArticle.publishedAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading article:', error);
    return (
      <main style={{ padding: '40px 20px', minHeight: '100vh', background: '#f9f9f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>
            오류가 발생했습니다
          </h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            아티클을 불러오는 중에 오류가 발생했습니다.
          </p>
          <Link
            href="/news"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: PRIMARY,
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            뉴스 목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }
}
