import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Eye, Heart, Search, Trophy, Calendar, User, Film } from 'lucide-react';
import { getSubmissionById, getGallerySubmissions } from '@/lib/data';
import { formatDateCompact } from '@/lib/utils';

type SubmissionDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * 영상 상세 페이지
 * 갤러리/내 출품작에서 영상 클릭 시 이동하는 상세 보기
 */
export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  /* 존재하지 않는 출품작 */
  if (!submission) {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-12 text-center border border-border">
              <div className="space-y-4">
                <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                <h1 className="text-2xl font-bold">작품을 찾을 수 없습니다</h1>
                <p className="text-muted-foreground">요청하신 작품이 존재하지 않거나 삭제되었습니다.</p>
                <Link
                  href="/gallery/all"
                  className="text-sm text-muted-foreground hover:text-primary hover:font-bold transition-all cursor-pointer"
                >
                  갤러리로 돌아가기 →
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  /* 같은 공모전의 다른 작품 (최대 4개) */
  const allSubmissions = await getGallerySubmissions();
  const relatedSubmissions = allSubmissions
    .filter((s) => s.contestId === submission.contestId && s.id !== submission.id)
    .slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* 상단 바: 뒤로가기 */}
      <div className="border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <Link
            href="/gallery/all"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            갤러리로 돌아가기
          </Link>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 영상 + 상세정보 */}
          <div className="lg:col-span-2 space-y-5">
            {/* Cloudflare Stream 영상 플레이어 */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              {submission.videoUrl ? (
                <iframe
                  src={`https://iframe.videodelivery.net/${submission.videoUrl}?poster=${encodeURIComponent(submission.thumbnailUrl || '')}`}
                  title={submission.title}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Film className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* 작품 정보 */}
            <div className="space-y-4">
              {/* 수상 뱃지 */}
              {submission.prizeLabel && (
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${submission.rank === 1 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' :
                    submission.rank === 2 ? 'bg-slate-400/10 text-slate-500 border border-slate-400/30' :
                      'bg-orange-600/10 text-orange-600 border border-orange-600/30'
                  }`}>
                  <Trophy className="h-4 w-4" />
                  {submission.prizeLabel}
                </span>
              )}

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{submission.title}</h1>

              {/* 메타 정보 (한 줄) */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {submission.creatorName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDateCompact(submission.submittedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {submission.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4" />
                  {submission.likeCount.toLocaleString()}
                </span>
              </div>

              {/* 설명 */}
              <div className="pt-3 border-t border-border">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{submission.description}</p>
              </div>
            </div>
          </div>

          {/* 우측 사이드바: 공모전 정보만 */}
          <div className="space-y-6">
            <Card className="p-6 border border-border space-y-4">
              <h3 className="text-lg font-bold">공모전 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground shrink-0">공모전</span>
                  <Link
                    href={`/contests/${submission.contestId}/landing` as any}
                    className="text-right font-medium text-primary hover:underline line-clamp-2"
                  >
                    {submission.contestTitle}
                  </Link>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground shrink-0">크리에이터</span>
                  <span className="text-right font-medium">{submission.creatorName}</span>
                </div>
                {submission.prizeLabel && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground shrink-0">수상</span>
                    <span className="text-right font-medium text-amber-600">{submission.prizeLabel}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 같은 공모전의 다른 작품 */}
      {relatedSubmissions.length > 0 && (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-6xl space-y-5">
            <h2 className="text-2xl font-bold">같은 공모전의 다른 작품</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedSubmissions.map((sub) => (
                <Link key={sub.id} href={`/gallery/${sub.id}` as any} className="group">
                  <div className="relative rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur border border-border">
                    <div className="aspect-video overflow-hidden relative bg-muted">
                      {sub.thumbnailUrl ? (
                        <img
                          src={sub.thumbnailUrl}
                          alt={sub.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Film className="h-6 w-6" />
                        </div>
                      )}
                      {/* 수상 뱃지 */}
                      {sub.prizeLabel && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg ${sub.rank === 1 ? 'bg-amber-500/90 text-white' :
                              sub.rank === 2 ? 'bg-slate-400/90 text-white' :
                                'bg-orange-600/90 text-white'
                            }`}>
                            {sub.prizeLabel}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent-foreground transition-colors">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{sub.creatorName}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {sub.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {sub.likeCount.toLocaleString()}
                        </span>
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
}
