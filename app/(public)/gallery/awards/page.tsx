import Link from 'next/link';
import { Trophy, Award } from 'lucide-react';
import { AutoFitTitle } from '@/components/ui/auto-fit-title';
import { getCompletedContests } from '@/lib/data';
import { formatDate } from '@/lib/utils';

/**
 * 수상작 갤러리 메인 페이지
 * 결과발표된 공모전을 포스터 카드로 표시, 클릭 시 해당 공모전 수상작 상세
 */
export default async function GalleryAwardsPage() {
  const completedContests = await getCompletedContests();

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
              Awards Gallery
            </h1>
            <p className="text-lg text-muted-foreground">
              공모전 수상 작품들을 감상하세요
            </p>
          </div>
        </div>
      </section>

      {/* 공모전 포스터 카드 그리드 */}
      <section className="pt-16 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-5">
            <p className="text-base text-muted-foreground">
              총 <span className="text-[#EA580C] font-semibold">{completedContests.length}</span>개의 공모전
            </p>
          </div>

          {completedContests.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {completedContests.map((contest, index) => (
                <Link key={contest.id} href={`/gallery/awards/${contest.id}` as any} className="group relative block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">

                    {/* Left Accent Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EA580C] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top z-20" />

                    {/* 포스터 이미지 */}
                    <img
                      src={`/images/contest-${(index % 5) + 1}.jpg`}
                      alt={contest.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

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
                          className="font-bold text-white break-keep group-hover:text-[#EA580C] transition-colors leading-snug"
                          maxFontSize={18}
                          minFontSize={13}
                          maxLines={2}
                        >
                          {contest.title}
                        </AutoFitTitle>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white/90"><Award className="inline h-3.5 w-3.5 mr-1" />총상금 {contest.prizeAmount ?? '미정'}</span>
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
