import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { getArticles } from '@/lib/data';
import type { Article } from '@/lib/types';
import { ARTICLE_TYPES } from '@/config/constants';
import { formatDate } from '@/lib/utils';

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

  try {
    const articles = await getArticles();
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
      return (
        <main className="min-h-screen py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              아티클을 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground mb-6">
              요청하신 아티클이 존재하지 않습니다.
            </p>
            <Link
              href="/story"
              className="inline-flex items-center rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              스토리 목록으로 돌아가기
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
        case 'notice':
          return 'bg-orange-500 text-white';
        case 'program':
          return 'bg-violet-500 text-white';
        case 'insight':
          return 'bg-emerald-500 text-white';
        default:
          return 'bg-muted-foreground text-background';
      }
    };
return (
      <div className="w-full">
        {/* Back Button */}
        <div className="py-4 px-4 bg-background border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <Link
              href="/story"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              ← 스토리 목록으로 돌아가기
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className={`inline-block rounded-md px-4 py-2 text-xs font-semibold mb-4 ${getTypeColor(article.type)}`}>
              {getTypeLabel(article.type)}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground mb-6">
              {article.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(article.publishedAt)}</span>
              <span className="flex items-center gap-1"><Tag className="h-4 w-4" /> {article.tags.join(', ')}</span>
            </div>
          </div>
        </section>

        {/* Thumbnail */}
        {article.thumbnailUrl && (
          <section className="py-10 px-4 bg-background">
            <div className="max-w-4xl mx-auto">
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            {/* Excerpt */}
            <div className="text-lg font-semibold text-foreground leading-relaxed mb-8 pb-6 border-b-2 border-primary">
              {article.excerpt}
            </div>

            {/* Main Content */}
            <div className="text-lg leading-relaxed text-foreground/90 mb-10 space-y-4">
              <p>{article.content}</p>
              <p>
                이 아티클은 AI 영상 제작 분야의 최신 트렌드와 정보를 제공합니다. 더 많은 정보를 원하시면
                스토리 목록을 확인해주세요.
              </p>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-12 px-4 bg-muted/30">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
                관련 아티클
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle, index) => (
                  <Link key={relatedArticle.id} href={`/story/${relatedArticle.slug}`}>
                    <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-primary hover:-translate-y-1 cursor-pointer h-full flex flex-col bg-background">
                      {/* Thumbnail */}
                      <div className="relative h-40 overflow-hidden bg-muted/30">
                        <img
                          src={relatedArticle.thumbnailUrl || `/images/hero-${(index % 6) + 1}.jpg`}
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded text-xs font-semibold ${getTypeColor(relatedArticle.type)}`}>
                          {getTypeLabel(relatedArticle.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 mb-2">
                          {relatedArticle.title}
                        </h3>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed flex-1">
                          {relatedArticle.excerpt}
                        </p>

                        <div className="text-xs text-muted-foreground border-t border-border pt-2">
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
      <main className="min-h-screen py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            오류가 발생했습니다
          </h1>
          <p className="text-muted-foreground mb-6">
            아티클을 불러오는 중에 오류가 발생했습니다.
          </p>
          <Link
            href="/story"
            className="inline-flex items-center rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            스토리 목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }
}
