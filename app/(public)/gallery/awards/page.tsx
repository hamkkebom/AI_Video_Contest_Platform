import { PageHeader } from '@/components/layout/page-header';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata, Route } from 'next';
import { Trophy, Award } from 'lucide-react';
import { AutoFitTitle } from '@/components/ui/auto-fit-title';
import { getCompletedContests, getAwardedSubmissions } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { keywordsFromContests } from '@/lib/seo';
import { contestTotalPrize } from '@/lib/prize';

/**
 * 결과가 발표된 공모전이 생기면 그 이름이 메타데이터에 자동으로 반영된다.
 * 아직 발표된 공모전이 없으면 일반적인 소개 문구를 쓴다.
 */
export async function generateMetadata(): Promise<Metadata> {
  /* 화면이 렌더하는 것과 같은 목록을 쓴다 — 결과 발표된 공모전만 담긴다 */
  const published = await getCompletedContests().catch(() => []);

  const title = '수상작 갤러리 — AI 영상 공모전 수상작';
  const description =
    published.length > 0
      ? `${published.map((c) => c.title).slice(0, 3).join(', ')}의 수상작을 감상하세요. AI를 활용한 뛰어난 영상 작품들을 확인할 수 있습니다.`
      : 'AI꿈 공모전의 수상작을 감상하세요. AI를 활용한 뛰어난 영상 작품들을 확인할 수 있습니다.';

  return {
    title,
    description,
    keywords: ['수상작', 'AI 영상 수상작', '공모전 수상작', ...keywordsFromContests(published)],
    alternates: { canonical: '/gallery/awards' },
    openGraph: { title, description, url: '/gallery/awards', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/**
 * 수상작 갤러리 메인 페이지
 * 결과발표된 공모전을 포스터 카드로 표시, 클릭 시 해당 공모전 수상작 상세
 */
export default async function GalleryAwardsPage() {
  const [completedContests, awarded] = await Promise.all([
    getCompletedContests().catch((e) => {
      console.error('[GalleryAwardsPage] getCompletedContests 실패:', e);
      return [] as Awaited<ReturnType<typeof getCompletedContests>>;
    }),
    getAwardedSubmissions().catch((e) => {
      console.error('[GalleryAwardsPage] getAwardedSubmissions 실패:', e);
      return [] as Awaited<ReturnType<typeof getAwardedSubmissions>>;
    }),
  ]);

  /* 등수 높은 순으로 앞에 세운다 — 이 페이지의 주인공은 공모전이 아니라 수상작이다 */
  const topAwarded = [...awarded]
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .slice(0, 8);

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 — 색은 globals.css .page-glow 가 테마 토큰으로 결정 */}
      <div className="page-glow" />

      <PageHeader
        title="Awards Gallery"
        description={
          awarded.length > 0 ? (
            <>
              <span className="font-semibold text-foreground">{completedContests.length}</span>개 공모전에서
              선정된 <span className="font-semibold text-foreground">{awarded.length}</span>편의 수상작
            </>
          ) : (
            <>공모전 수상 작품들을 감상하세요</>
          )
        }
        tight
      />

      {/* ── 수상작 ── 포스터가 아니라 실제 수상 작품으로 시작한다 */}
      {topAwarded.length > 0 && (
        <section className="px-4 pt-10 pb-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="mb-6 text-xl font-bold tracking-tight sm:text-2xl">수상작</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {topAwarded.map((work) => (
                <Link
                  key={work.id}
                  href={`/gallery/${work.id}` as Route}
                  className="group relative isolate overflow-hidden rounded-2xl border border-border bg-neutral-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-video">
                    {work.thumbnailUrl && (
                      <Image
                        src={work.thumbnailUrl}
                        alt={work.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                    {work.prizeLabel && (
                      <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-status-completed px-2.5 py-1 text-xs font-bold text-white opacity-95 backdrop-blur-md">
                        <Trophy className="h-3 w-3" />
                        {work.prizeLabel}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 p-4">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-brand">
                      {work.title}
                    </h3>
                    <p className="truncate text-xs text-white/60">{work.creatorName}</p>
                    <p className="truncate text-[11px] text-white/40">{work.contestTitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 공모전 포스터 카드 그리드 */}
      <section className="pt-12 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">공모전별로 보기</h2>
            <p className="text-sm text-muted-foreground">
              총 <span className="font-semibold text-brand">{completedContests.length}</span>개
            </p>
          </div>

          {completedContests.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {completedContests.map((contest) => (
                <Link key={contest.id} href={`/gallery/awards/${contest.id}` as Route} className="group relative block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">

                    {/* Left Accent Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top z-20" />

                    {/* 포스터 이미지 — next/image로 Vercel CDN 캐싱 + WebP 자동 변환 */}
                    {contest.posterUrl && (
                      <Image
                        src={contest.posterUrl}
                        alt={contest.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* 결과발표 뱃지 */}
                    <div className="absolute top-[18px] right-3 z-10">
                      <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg bg-status-completed text-white opacity-95">
                        <Trophy className="inline h-3.5 w-3.5 mr-1" />
                        결과발표
                      </span>
                    </div>

                    {/* 하단 그라데이션 오버레이 + 텍스트 */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 flex flex-col justify-end">
                      <div className="absolute inset-0 bg-gradient-to-t from-black from-50% to-transparent" />
                      <div className="relative pb-14 px-4 flex flex-col gap-4">
                        <AutoFitTitle
                          className="font-bold text-white break-keep group-hover:text-brand transition-colors leading-snug"
                          maxFontSize={18}
                          minFontSize={13}
                          maxLines={2}
                        >
                          {contest.title}
                        </AutoFitTitle>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white/90"><Award className="inline h-3.5 w-3.5 mr-1" />총상금 {contestTotalPrize(contest.prizeAmount, contest.awardTiers) ?? '미정'}</span>
                          <span className="text-sm text-white/60">
                            발표 {formatDate(contest.resultAnnouncedAt, { month: '2-digit', day: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <Trophy className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold mb-2">결과발표된 공모전이 없습니다</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                아직 결과가 발표된 공모전이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
