import Link from 'next/link';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Heart, Search, Trophy, Calendar, User, Film } from 'lucide-react';
import { getSubmissionById, getRelatedSubmissions, getAuthProfile, hasUserLiked } from '@/lib/data';
import { formatDateCompact, safeJsonLd } from '@/lib/utils';
import { AdminDownloadButton } from './admin-download-button';
import { SubmissionActions } from '@/components/submissions/submission-actions';
import { AdminSubmissionActions } from '@/components/submissions/admin-submission-actions';
import { LikeButton } from '@/components/common/like-button';
import { ViewTracker } from '@/components/common/view-tracker';

type SubmissionDetailPageProps = {
  params: Promise<{ id: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

/** 영상 상세 페이지 동적 메타데이터 */
export async function generateMetadata({ params }: SubmissionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const submission = await getSubmissionById(id);
  if (!submission) {
    return { title: '영상을 찾을 수 없습니다' };
  }

  const title = `${submission.title} — AI 영상 작품`;
  const description = submission.description
    ? submission.description.slice(0, 155)
    : `AI꿈 갤러리에서 '${submission.title}' 영상을 감상하세요.`;
  const url = `${SITE_URL}/gallery/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'video.other',
      images: submission.thumbnailUrl
        ? [{ url: submission.thumbnailUrl, width: 1280, height: 720, alt: submission.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: submission.thumbnailUrl ? [submission.thumbnailUrl] : undefined,
    },
  };
}

/**
 * 영상 상세 페이지
 * 갤러리/내 출품작에서 영상 클릭 시 이동하는 상세 보기
 * 단일 컬럼 레이아웃: 영상 → 작품 정보 → 공모전 정보 → 관련 작품
 */
export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  /* 존재하지 않는 출품작 */
  if (!submission) {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
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

  /* 같은 공모전의 다른 작품 (최대 4개) — 최적화된 쿼리 사용 */
  const relatedSubmissions = await getRelatedSubmissions(submission.contestId, submission.id, 4);

  /* 관리자 여부 확인 */
  const profile = await getAuthProfile();
  const isAdmin = profile?.roles?.includes('admin') ?? false;
  const userLiked = profile ? await hasUserLiked(profile.id, id) : false;

  /* JSON-LD 구조화 데이터 — VideoObject 스키마 */
  const videoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: submission.title,
    description: submission.description || submission.title,
    thumbnailUrl: submission.thumbnailUrl,
    uploadDate: submission.submittedAt,
    ...(submission.videoDuration > 0 ? { duration: `PT${Math.floor(submission.videoDuration / 60)}M${Math.floor(submission.videoDuration % 60)}S` } : {}),
    contentUrl: submission.videoUrl ? `https://iframe.videodelivery.net/${submission.videoUrl}` : undefined,
    embedUrl: submission.videoUrl ? `https://iframe.videodelivery.net/${submission.videoUrl}` : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'AI꿈',
      url: SITE_URL,
    },
    interactionStatistic: [
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/WatchAction', userInteractionCount: submission.views },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: submission.likeCount },
    ],
    inLanguage: 'ko',
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(videoJsonLd) }}
      />
      {/* 상단 네비게이션 */}
      <div className="border-b border-border">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <Link
            href="/gallery/all"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            갤러리로 돌아가기
          </Link>
        </div>
      </div>

      {/* 메인 콘텐츠 — 단일 컬럼 */}
      <section className="py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">

          {/* 1. 영상 플레이어 (풀 너비) */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
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
          {/* 조회수 추적 */}
          <ViewTracker submissionId={id} />

          {/* 2. 작품 제목 + 메타 정보 */}
          <div className="space-y-3">
            {/* 수상 뱃지 + 제목 */}
            <div className="space-y-2">
              {submission.prizeLabel && (
                <Badge
                  className={`gap-1.5 px-3 py-1 text-xs font-bold ${
                    submission.rank === 1
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      : submission.rank === 2
                        ? 'bg-slate-400/10 text-slate-500 border-slate-400/30'
                        : 'bg-orange-600/10 text-orange-600 border-orange-600/30'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  {submission.prizeLabel}
                </Badge>
              )}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{submission.title}</h1>
            </div>

            {/* 메타 정보 */}
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
                조회 {submission.views.toLocaleString()}
              </span>
              <LikeButton submissionId={id} liked={userLiked} initialCount={submission.likeCount} />
            </div>

          {/* 관리자 전용: 영상 다운로드 */}
          {isAdmin && submission.videoUrl && (
            <AdminDownloadButton videoUrl={submission.videoUrl} />
          )}

          {/* 관리자 전용: 승인/거절 버튼 (검수대기 또는 자동반려 상태) */}
          {isAdmin && (submission.status === 'pending_review' || submission.status === 'auto_rejected') && (
            <div className="flex items-center gap-2">
              <SubmissionActions submissionId={String(submission.id)} submissionTitle={submission.title} />
            </div>
          )}

          {/* 관리자 전용: 수정/삭제 (모든 상태) */}
          {isAdmin && (
            <AdminSubmissionActions
              submissionId={String(submission.id)}
              submissionTitle={submission.title}
              contestId={String(submission.contestId)}
              currentData={{
                title: submission.title,
                description: submission.description || '',
                aiTools: submission.aiTools || '',
                productionProcess: submission.productionProcess || '',
                submitterName: submission.submitterName || '',
                submitterPhone: submission.submitterPhone || '',
                videoUrl: submission.videoUrl || '',
                thumbnailUrl: submission.thumbnailUrl || '',
              }}
            />
          )}
          </div>

          {/* 3. 설명 */}
          {submission.description && (
            <div className="pt-2 border-t border-border">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {submission.description}
              </p>
            </div>
          )}

          {/* 4. 공모전 정보 카드 */}
          <Card className="p-5 border border-border">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-1">출품 공모전</p>
                <Link
                  href={`/contests/${submission.contestId}`}
                  className="text-sm font-semibold text-primary hover:underline line-clamp-1"
                >
                  {submission.contestTitle}
                </Link>
              </div>
              {submission.prizeLabel && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground mb-1">수상</p>
                  <p className="text-sm font-semibold text-amber-600">{submission.prizeLabel}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* 5. 같은 공모전의 다른 작품 — TODO: 추후 다시 활성화 */}
      {false && relatedSubmissions.length > 0 && (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-4xl space-y-5">
            <h2 className="text-lg sm:text-xl font-bold">같은 공모전의 다른 작품</h2>
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
                        <div className="absolute top-2 left-2 z-10">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/20 shadow-lg ${
                            sub.rank === 1
                              ? 'bg-amber-500/90 text-white'
                              : sub.rank === 2
                                ? 'bg-slate-400/90 text-white'
                                : 'bg-orange-600/90 text-white'
                          }`}>
                            {sub.prizeLabel}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1.5">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent-foreground transition-colors">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{sub.creatorName}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {sub.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
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
