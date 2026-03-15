import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getContests } from '@/lib/data';
import { HeroCarousel, type HeroSlide } from '@/components/landing/hero-carousel';
import { ContestCountdown } from '@/components/contest/contest-countdown';
import { AuthSubmitButton } from '@/components/contest/auth-submit-button';
import { Clapperboard, ArrowRight } from 'lucide-react';
import type { AwardTier } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { SitePopup } from '@/components/popup/site-popup';

/**
 * 랜딩 페이지
 * 히어로 캐러셀 → 진행 중 공모전(리스트) → 대행 CTA
 */
export default async function LandingPage() {
  let contests: Awaited<ReturnType<typeof getContests>> = [];
  let contestsFetchError = false;
  try {
    contests = await getContests();
  } catch (e) {
    console.error('[LandingPage] getContests 실패:', e);
    contestsFetchError = true;
  }
  const openContests = contests.filter(c => c.status === 'open').slice(0, 8);

  /* ── 히어로 슬라이드: 공모전만 (heroImageUrl 우선, 없으면 posterUrl) ── */
  const heroSlides: HeroSlide[] = openContests.slice(0, 3).map(c => ({
    id: c.id,
    type: 'contest',
    title: c.title,
    description: c.description,
    date: c.submissionEndAt,
    href: `/contests/${c.id}`,
    ctaLabel: '자세히 보기',
    imageUrl: c.heroImageUrl || c.posterUrl,
  }));

  /* ── 상금 계산 유틸 ── */
  const parsePrizeAmount = (amount: string): number => {
    const cleaned = amount.replace(/[,\s]/g, '');
    const match = cleaned.match(/(\d+)/);
    if (!match) return 0;
    const num = parseInt(match[1], 10);
    if (cleaned.includes('만')) return num * 10000;
    if (cleaned.includes('억')) return num * 100000000;
    return num;
  };

  const calculateTotalPrize = (tiers: AwardTier[]): string | null => {
    let total = 0;
    for (const tier of tiers) {
      if (!tier.prizeAmount) continue;
      total += parsePrizeAmount(tier.prizeAmount) * tier.count;
    }
    if (total === 0) return null;
    if (total >= 100000000) {
      const eok = Math.floor(total / 100000000);
      const man = Math.floor((total % 100000000) / 10000);
      if (man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
      return `${eok}억원`;
    }
    if (total >= 10000) {
      return `${(total / 10000).toLocaleString()}만원`;
    }
    return `${total.toLocaleString()}원`;
  };

  const formatPrizeDisplay = (amount: string): string => {
    if (/[만억원]/.test(amount)) return amount;
    const num = parseInt(amount.replace(/[,\s]/g, ''), 10);
    if (isNaN(num) || num === 0) return amount;
    if (num >= 100000000) {
      const eok = Math.floor(num / 100000000);
      const man = Math.floor((num % 100000000) / 10000);
      if (man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
      return `${eok}억원`;
    }
    if (num >= 10000) {
      return `${(num / 10000).toLocaleString()}만원`;
    }
    return `${num.toLocaleString()}원`;
  };

  /** "2026. 03. 28(토)" 형식 */
  const formatDateWithDay = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}(${days[d.getDay()]})`;
  };

  /* 접수전 판별 */
  const nowMs = Date.now();
  const isBeforeStart = (c: typeof openContests[number]) =>
    c.status === 'open' && new Date(c.submissionStartAt).getTime() > nowMs;

  return (
    <>
    <div className="w-full">
      {/* ══ 히어로 캐러셀 ══ */}
      <HeroCarousel slides={heroSlides} />

      {/* ══ 진행 중인 공모전 — 리스트뷰 ══ */}
      {contestsFetchError && openContests.length === 0 && (
        <section className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl text-center py-16">
            <p className="text-muted-foreground mb-4">공모전을 불러오는 데 문제가 발생했습니다.</p>
            <Link href="/">
              <Button variant="outline">다시 시도</Button>
            </Link>
          </div>
        </section>
      )}
      {openContests.length > 0 && (
        <section className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-10">진행 중인 공모전</h2>

            <div className="space-y-6">
              {openContests.map((contest, index) => {
                const totalPrize =
                  (contest.prizeAmount ? formatPrizeDisplay(contest.prizeAmount) : null) ||
                  calculateTotalPrize(contest.awardTiers);
                const beforeStart = isBeforeStart(contest);

                return (
                  <div
                    key={contest.id}
                    className="group bg-neutral-900 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* 왼쪽: 포스터 이미지 */}
                      <Link href={`/contests/${contest.id}` as any} className="block w-full md:w-[340px] lg:w-[400px] shrink-0">
                        <div className="relative h-60 md:h-full min-h-[240px]">
                          <img
                            src={contest.posterUrl || `/images/contest-${(index % 5) + 1}.jpg`}
                            alt={contest.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {/* 상태 뱃지 */}
                          <div className="absolute top-4 left-4">
                            {beforeStart ? (
                              <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white bg-emerald-500/70">접수전</span>
                            ) : (
                              <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white bg-orange-500/70">접수중</span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* 오른쪽: 콘텐츠 */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-w-0">
                        <div className="space-y-3">
                          {/* 제목 */}
                          <Link href={`/contests/${contest.id}` as any}>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-[#EA580C] transition-colors break-keep">
                              {contest.title}
                            </h3>
                          </Link>
                          {/* 설명 */}
                          {contest.description && (
                            <p className="text-neutral-400 text-sm line-clamp-2">
                              {contest.description}
                            </p>
                          )}
                          {/* 기간 */}
                          <p className="text-orange-500 font-bold text-sm sm:text-base md:text-lg">
                            {formatDateWithDay(contest.submissionStartAt)} ~ {formatDateWithDay(contest.submissionEndAt)}
                          </p>
                          {/* 카운트다운 + 총상금 */}
                          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
                            <div>
                              {!beforeStart && (
                                <ContestCountdown
                                  deadline={contest.submissionEndAt}
                                  label="접수 마감까지 남은시간"
                                  size="lg"
                                />
                              )}
                              {beforeStart && (
                                <ContestCountdown
                                  deadline={contest.submissionStartAt}
                                  label="접수 시작까지 남은시간"
                                  expiredText="접수 시작!"
                                  size="lg"
                                />
                              )}
                            </div>
                            {totalPrize && (
                              <p className="text-white font-bold text-lg md:text-xl whitespace-nowrap">
                                총 상금 {totalPrize}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 하단: 버튼 */}
                        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-neutral-700 flex justify-center gap-2 sm:gap-3">
                          {!beforeStart && (
                            <AuthSubmitButton contestId={contest.id} variant="sm" />
                          )}
                          <Link href={`/contests/${contest.id}` as any} className="group/btn2">
                            <span className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-lg border-2 border-neutral-600 text-neutral-300 text-xs sm:text-sm font-semibold overflow-hidden transition-all duration-300 cursor-pointer">
                              <span className="absolute inset-0 bg-neutral-600 scale-x-0 group-hover/btn2:scale-x-100 transition-transform duration-300 origin-left" />
                              <span className="relative z-10 group-hover/btn2:text-white transition-colors">상세안내 확인하기</span>
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}


      {/* ══ 영상 제작 대행 CTA ══ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-foreground to-foreground/90 p-12 md:p-16 text-background">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA580C]/30 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8B5CF6]/30 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-accent-foreground/20 flex items-center justify-center">
                    <Clapperboard className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="text-xs font-medium tracking-wider uppercase text-background/50">
                    제작 대행
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  AI 영상 제작 의뢰 서비스
                </h3>
                <p className="text-background/70 leading-relaxed">
                  기업 홍보, 제품 소개, 교육 콘텐츠 등 다양한 AI 영상 제작을 전문 크리에이터에게 맡겨보세요.
                  합리적인 비용으로 고품질 결과물을 받아보실 수 있습니다.
                </p>
              </div>
              <div className="shrink-0">
                <a href="https://www.hamkkebom.com/contact" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="bg-[#EA580C] hover:bg-[#C2540A] text-white cursor-pointer font-semibold gap-2"
                  >
                    제작 의뢰하기
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <SitePopup />
    </>
  );
}
