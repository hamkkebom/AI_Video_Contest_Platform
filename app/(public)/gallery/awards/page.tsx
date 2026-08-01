import { PageHeader } from '@/components/layout/page-header';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Trophy, Award } from 'lucide-react';
import { AutoFitTitle } from '@/components/ui/auto-fit-title';
import { getCompletedContests } from '@/lib/data';
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
  let completedContests: Awaited<ReturnType<typeof getCompletedContests>> = [];
  try {
    completedContests = await getCompletedContests();
  } catch (e) {
    console.error('[GalleryAwardsPage] getCompletedContests 실패:', e);
  }

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 — 색은 globals.css .page-glow 가 테마 토큰으로 결정 */}
      <div className="page-glow" />

      <PageHeader
        title="Awards Gallery"
        description={
          <>
공모전 수상 작품들을 감상하세요
          </>
        }
        tight
      />

      {/* 공모전 포스터 카드 그리드 */}
      <section className="pt-16 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-5">
            <p className="text-base text-muted-foreground">
              총 <span className="text-brand font-semibold">{completedContests.length}</span>개의 공모전
            </p>
          </div>

          {completedContests.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {completedContests.map((contest) => (
                <Link key={contest.id} href={`/gallery/awards/${contest.id}` as any} className="group relative block">
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
                      <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg bg-amber-500/90 text-white">
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
