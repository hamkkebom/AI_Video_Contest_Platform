import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getContests, getFeaturedSubmissions, getSiteSettings, getPublicCompanies } from '@/lib/data';
import { HeroCarousel, type HeroSlide } from '@/components/landing/hero-carousel';
import { FeaturedWorksCarousel } from '@/components/landing/featured-works-carousel';
import { ContestCountdown } from '@/components/contest/contest-countdown';
import { AuthSubmitButton } from '@/components/contest/auth-submit-button';
import { Clapperboard, ArrowRight, Trophy } from 'lucide-react';
import { contestTotalPrize } from '@/lib/prize';
import { formatDate, safeJsonLd } from '@/lib/utils';
import { SitePopup } from '@/components/popup/site-popup';
import { ContestStatusBadge } from '@/components/contest/contest-status-badge';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

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

  const siteSettings = await getSiteSettings();
  const showFeaturedCarousel = siteSettings['landing.featured_carousel'] ?? false;
  const featuredSubmissions = showFeaturedCarousel ? await getFeaturedSubmissions(12) : [];
  /* 주최자 표기용 — 승인된 기업만 담긴 공개 뷰 (뷰 미배포 환경에선 빈 배열) */
  const companies = await getPublicCompanies().catch(() => []);
  const companyNameById = new Map(companies.map((c) => [c.id, c.name]));
  const openContests = contests.filter(c => c.status === 'open').slice(0, 8);
  /* 접수 중 공모전이 없을 때 홈 폴백용 — 심사중/결과발표 공모전 최신순 (IA.md §1-4: 첫 화면은 빈 껍데기가 아니어야 한다) */
  const fallbackContests = openContests.length === 0
    ? contests
        .filter((c) => ['judging', 'closed', 'completed'].includes(c.status))
        .sort((a, b) => new Date(b.resultAnnouncedAt).getTime() - new Date(a.resultAnnouncedAt).getTime())
        .slice(0, 4)
    : [];

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

  /** "2026. 03. 28(토)" 형식 — null/invalid는 "미정" (epoch 렌더 방지, result_announced_at은 nullable) */
  const formatDateWithDay = (dateStr: string) => {
    const d = new Date(dateStr);
    if (!dateStr || isNaN(d.getTime())) return '미정';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}(${days[d.getDay()]})`;
  };

  /* 접수전 판별 */
  const nowMs = Date.now();
  const isBeforeStart = (c: typeof openContests[number]) =>
    c.status === 'open' && new Date(c.submissionStartAt).getTime() > nowMs;

  /* JSON-LD 구조화 데이터 — WebSite + Organization 스키마 */
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'AI꿈',
        alternateName: 'AI꿈허브',
        url: SITE_URL,
        description: 'AI 영상 공모전 전문 플랫폼',
        inLanguage: 'ko',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?query={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'AI꿈',
        url: SITE_URL,
        logo: `${SITE_URL}/icon`,
        description: 'AI를 활용한 영상 공모전을 개최하는 플랫폼',
      },
    ],
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
    />
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
      {/* 3개 이상이면 컴팩트 그리드 — 전폭 카드를 N개 쌓으면 홈이 스크롤 지옥이 된다 (멀티 공모전 대응) */}
      {openContests.length >= 3 && (
        <section className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="text-2xl font-bold">진행 중인 공모전</h2>
              <Link href="/contests" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {openContests.map((contest, index) => {
                const beforeStart = isBeforeStart(contest);
                const totalPrize = contestTotalPrize(contest.prizeAmount, contest.awardTiers);
                const hostName = companyNameById.get(contest.hostCompanyId);
                return (
                  <Link key={contest.id} href={`/contests/${contest.id}` as Route} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted">
                      <Image
                        src={contest.posterUrl || `/images/contest-${(index % 5) + 1}.jpg`}
                        alt={contest.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* 상태 뱃지 */}
                      <ContestStatusBadge
                        status={beforeStart ? 'draft' : 'open'}
                        variant="overlay"
                        className="absolute top-3 left-3 z-10"
                      />
                      {/* 하단 정보 오버레이 */}
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 pt-10 space-y-1">
                        {hostName && (
                          <p className="truncate text-[11px] font-medium text-white/70">{hostName}</p>
                        )}
                        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white break-keep">
                          {contest.title}
                        </h3>
                        <p className="text-xs text-white/70">~ {formatDateWithDay(contest.submissionEndAt)}</p>
                        {totalPrize && <p className="text-xs font-semibold text-orange-300">총 상금 {totalPrize}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 1~2개일 땐 기존 전폭 카드 — 정보 밀도가 높은 리치 카드 유지 */}
      {openContests.length > 0 && openContests.length < 3 && (
        <section className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-10">진행 중인 공모전</h2>

            <div className="space-y-6">
              {openContests.map((contest, index) => {
                const totalPrize = contestTotalPrize(contest.prizeAmount, contest.awardTiers);
                const beforeStart = isBeforeStart(contest);

                return (
                  <div
                    key={contest.id}
                    className="group bg-neutral-900 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* 왼쪽: 포스터 이미지 */}
                      <Link href={`/contests/${contest.id}` as Route} className="block w-full md:w-[340px] lg:w-[400px] shrink-0">
                        <div className="relative h-60 md:h-full min-h-[240px]">
                          <Image
                            src={contest.posterUrl || `/images/contest-${(index % 5) + 1}.jpg`}
                            alt={contest.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 340px, 400px"
                            className="object-cover"
                            priority
                          />
                          {/* 상태 뱃지 */}
                          <div className="absolute top-4 left-4">
                            <ContestStatusBadge status={beforeStart ? 'draft' : 'open'} variant="overlay" className="text-sm" />
                          </div>
                        </div>
                      </Link>

                      {/* 오른쪽: 콘텐츠 */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-w-0">
                        <div className="space-y-3">
                          {/* 주최자 (등록 기업이 있을 때만) */}
                          {companyNameById.get(contest.hostCompanyId) && (
                            <p className="text-xs font-medium tracking-wide text-neutral-400">
                              주최 · {companyNameById.get(contest.hostCompanyId)}
                            </p>
                          )}
                          {/* 제목 */}
                          <Link href={`/contests/${contest.id}` as Route}>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-brand transition-colors break-keep">
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
                          <Link href={`/contests/${contest.id}` as Route} className="group/btn2">
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


      {/* ══ 폴백: 접수 중 공모전이 없을 때 — 진행 현황 + 갤러리 입구 (IA.md §1-4) ══
          특정 작품은 노출하지 않는다 (심사 공정성 — 추천 캐러셀 비활성화와 같은 사유) */}
      {!contestsFetchError && openContests.length === 0 && (
        <section className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl space-y-12">
            {fallbackContests.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-8">공모전 진행 현황</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {fallbackContests.map((contest) => {
                    /* closed(마감·심사 전)도 결과가 아직이므로 "예정" 문구를 쓴다 */
                    const resultPending = contest.status === 'judging' || contest.status === 'closed';
                    const resultDate = formatDateWithDay(contest.resultAnnouncedAt);
                    return (
                      <Link
                        key={contest.id}
                        href={`/contests/${contest.id}` as Route}
                        className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 space-y-2">
                            <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors break-keep">
                              {contest.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {resultDate === '미정'
                                ? '결과 발표 일정 미정'
                                : resultPending
                                  ? `결과 발표 예정 ${resultDate}`
                                  : `결과 발표 ${resultDate}`}
                            </p>
                          </div>
                          <ContestStatusBadge status={contest.status} variant="soft" className="shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {/* 갤러리 입구 — 작품 462+편이 있는 곳으로 안내 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/gallery/all"
                className="group rounded-2xl border border-border bg-card p-8 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clapperboard className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">갤러리 둘러보기</h3>
                  <p className="text-sm text-muted-foreground">공모전에 출품된 AI 영상 작품을 감상하세요</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/gallery/awards"
                className="group rounded-2xl border border-border bg-card p-8 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Trophy className="h-6 w-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">수상작 보기</h3>
                  <p className="text-sm text-muted-foreground">역대 공모전 수상 작품을 확인하세요</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ 추천 작품 캐러셀 — 심사 공정성 위해 비활성화 ══ */}
      {/* {showFeaturedCarousel && featuredSubmissions.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <FeaturedWorksCarousel submissions={featuredSubmissions} />
          </div>
        </section>
      )} */}

      {/* ══ 영상 제작 대행 CTA ══ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-foreground to-foreground/90 p-12 md:p-16 text-background">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/30 rounded-full -translate-y-1/2 translate-x-1/2" />
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
                {/* 자체 접수 파이프라인 사용 (D-011로 검증) — 외부 폼으로 유출하지 않는다 (IA.md §5) */}
                <Link href="/support/agency">
                  <Button
                    size="lg"
                    className="bg-brand hover:bg-brand-hover text-white cursor-pointer font-semibold gap-2"
                  >
                    제작 의뢰하기
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
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
