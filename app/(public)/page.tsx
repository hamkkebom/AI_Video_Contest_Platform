import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getContests, getPublicCompanies, getGallerySubmissions } from '@/lib/data';
import { HeroMosaic, type MosaicTile } from '@/components/landing/hero-mosaic';
import { ContestCountdown } from '@/components/contest/contest-countdown';
import { AuthSubmitButton } from '@/components/contest/auth-submit-button';
import { Clapperboard, ArrowRight, Trophy, Building2 } from 'lucide-react';
import { contestTotalPrize, contestTotalPrizeAmount, formatKrw } from '@/lib/prize';
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

  /* ── 히어로 배경 타일 ──
     결과 발표가 끝난 공모전의 작품만 쓴다. 심사가 진행 중인 작품을 홈에 띄우면
     조회수·좋아요에 유리해져 공정성을 해친다 (추천 캐러셀을 끈 것과 같은 이유). */
  const settledContestIds = new Set(
    contests.filter((c) => c.status === 'completed' || c.status === 'closed').map((c) => String(c.id)),
  );
  const gallerySubmissions = await getGallerySubmissions().catch(() => []);
  const heroTiles: MosaicTile[] = gallerySubmissions
    .filter((s) => s.thumbnailUrl && settledContestIds.has(String(s.contestId)))
    .slice(0, 36)
    .map((s) => ({ id: String(s.id), title: s.title, thumbnailUrl: s.thumbnailUrl as string }));

  /* 히어로 지표 — 문구 대신 실제 숫자로 */
  const publicContests = contests.filter((c) => c.status !== 'draft');
  const totalPrizeAmount = publicContests.reduce(
    (sum, c) => sum + contestTotalPrizeAmount(c.prizeAmount, c.awardTiers),
    0,
  );
  const heroStats = {
    works: gallerySubmissions.length,
    contests: publicContests.length,
    prize: totalPrizeAmount > 0 ? formatKrw(totalPrizeAmount) : null,
  };
  const heroPrimary = openContests[0]
    ? { href: `/contests/${openContests[0].id}` as Route, label: '공모전 참여하기' }
    : { href: '/contests' as Route, label: '공모전 둘러보기' };
  const heroEyebrow = openContests.length > 0
    ? `${openContests.length}개 공모전 접수 중`
    : gallerySubmissions.length > 0
      ? `${gallerySubmissions.length.toLocaleString()}편의 작품이 기다립니다`
      : 'AI 영상 공모전 플랫폼';

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
      {/* ══ 히어로 — 실제 출품작으로 만든 배경 위에 한 문장 ══ */}
      <HeroMosaic
        tiles={heroTiles}
        stats={heroStats}
        primaryHref={heroPrimary.href}
        primaryLabel={heroPrimary.label}
        eyebrow={heroEyebrow}
      />

      {/* ══ 진행 중인 공모전 — 리스트뷰 ══ */}
      {contestsFetchError && openContests.length === 0 && (
        <section className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-7xl text-center py-16">
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
          <div className="container mx-auto max-w-7xl">
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
                        {totalPrize && <p className="text-xs font-semibold text-brand">총 상금 {totalPrize}</p>}
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
          <div className="container mx-auto max-w-7xl">
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
                          <p className="text-brand font-bold text-sm sm:text-base md:text-lg">
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
          <div className="container mx-auto max-w-7xl space-y-12">
            {fallbackContests.length > 0 && (
              <div>
                <div className="mb-8 flex items-end justify-between">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">공모전 진행 현황</h2>
                  <Link href="/contests" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    전체 보기 →
                  </Link>
                </div>
                {/* 히어로가 이미지로 말하므로 여기서도 포스터를 전면에 쓴다 — 흰 카드로 떨어지면 격차가 생긴다.
                    1개뿐이면 반쪽짜리 카드가 덩그러니 남으므로 전폭으로 채운다 */}
                <div className={fallbackContests.length === 1 ? 'grid gap-5' : 'grid gap-5 sm:grid-cols-2'}>
                  {fallbackContests.map((contest, index) => {
                    /* closed(마감·심사 전)도 결과가 아직이므로 "예정" 문구를 쓴다 */
                    const resultPending = contest.status === 'judging' || contest.status === 'closed';
                    const resultDate = formatDateWithDay(contest.resultAnnouncedAt);
                    const prize = contestTotalPrize(contest.prizeAmount, contest.awardTiers);
                    const hostName = companyNameById.get(contest.hostCompanyId);
                    return (
                      <Link
                        key={contest.id}
                        href={`/contests/${contest.id}` as Route}
                        className="group relative isolate overflow-hidden rounded-3xl border border-border bg-neutral-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
                      >
                        <div className={fallbackContests.length === 1 ? 'relative aspect-[21/9]' : 'relative aspect-[16/10]'}>
                          <Image
                            src={contest.posterUrl || `/images/contest-${(index % 5) + 1}.jpg`}
                            alt={contest.title}
                            fill
                            sizes={fallbackContests.length === 1 ? '(max-width: 1280px) 100vw, 1280px' : '(max-width: 640px) 100vw, 640px'}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/10" />

                          <ContestStatusBadge
                            status={contest.status}
                            variant="overlay"
                            className="absolute left-5 top-5 z-10"
                          />

                          <div className="absolute inset-x-0 bottom-0 z-10 space-y-2 p-6">
                            {hostName && (
                              <p className="truncate text-xs font-medium text-white/60">주최 · {hostName}</p>
                            )}
                            <h3 className="text-balance text-xl font-bold leading-snug text-white transition-colors group-hover:text-brand">
                              {contest.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
                              <span>
                                {resultDate === '미정'
                                  ? '결과 발표 일정 미정'
                                  : resultPending
                                    ? `결과 발표 예정 ${resultDate}`
                                    : `결과 발표 ${resultDate}`}
                              </span>
                              {prize && <span className="font-semibold text-brand">총 상금 {prize}</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {/* 갤러리 입구 — 작품이 있는 곳으로 안내 */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Link
                href="/gallery/all"
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/20" />
                <div className="relative space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Clapperboard className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold transition-colors group-hover:text-primary">갤러리 둘러보기</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      공모전에 출품된 {heroStats.works.toLocaleString()}편의 AI 영상 작품을 감상하세요
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    작품 보러 가기
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
              <Link
                href="/gallery/awards"
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-status-completed/40 hover:shadow-xl"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-status-completed/10 blur-2xl transition-all duration-500 group-hover:bg-status-completed/20" />
                <div className="relative space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-status-completed/10 text-status-completed">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold transition-colors group-hover:text-status-completed">수상작 보기</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      역대 공모전에서 상을 받은 작품만 모아 확인하세요
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-status-completed">
                    수상작 보러 가기
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ 두 갈래 CTA — 만드는 사람(개최)과 맡기는 사람(대행) ══
          홈의 마지막 화면이므로 히어로와 같은 어두운 톤으로 닫는다 */}
      <section className="px-4 pb-24 pt-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* 공모전을 열고 싶은 사람 — 멀티테넌트 온보딩 입구 */}
            <div className="relative isolate overflow-hidden rounded-3xl bg-neutral-950 p-10 md:p-12">
              <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/70">
                    <Building2 className="h-3.5 w-3.5" />
                    공모전 개최
                  </div>
                  <h3 className="text-balance text-2xl font-bold leading-snug text-white md:text-3xl">
                    우리 브랜드의 공모전을
                    <br />
                    직접 열어보세요
                  </h3>
                  <p className="max-w-md leading-relaxed text-white/60">
                    기업 등록 후 승인되면 접수·심사·결과 발표까지 한 곳에서 운영할 수 있습니다.
                  </p>
                </div>
                <Link href="/hosts/apply" className="group/cta w-fit">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-neutral-950 transition-all hover:bg-white/90">
                    개최 신청하기
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>

            {/* 영상 제작을 맡기고 싶은 사람 */}
            <div className="relative isolate overflow-hidden rounded-3xl bg-neutral-950 p-10 md:p-12">
              <div className="absolute -bottom-16 -left-16 -z-10 h-64 w-64 rounded-full bg-brand/25 blur-3xl" />
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/70">
                    <Clapperboard className="h-3.5 w-3.5" />
                    제작 대행
                  </div>
                  <h3 className="text-balance text-2xl font-bold leading-snug text-white md:text-3xl">
                    영상 제작을
                    <br />
                    전문가에게 맡기세요
                  </h3>
                  <p className="max-w-md leading-relaxed text-white/60">
                    기업 홍보, 제품 소개, 교육 콘텐츠까지. 합리적인 비용으로 AI 영상 크리에이터와 연결해 드립니다.
                  </p>
                </div>
                {/* 자체 접수 파이프라인 사용 (D-011로 검증) — 외부 폼으로 유출하지 않는다 (IA.md §5) */}
                <Link href="/support/agency" className="group/cta w-fit">
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:bg-brand-hover">
                    제작 의뢰하기
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                  </span>
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
