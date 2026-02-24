import Link from 'next/link';
import { Trophy, Award, Upload, Search, LayoutList, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutoFitTitle } from '@/components/ui/auto-fit-title';
import { getContests } from '@/lib/data';
import { SortSelect } from '@/components/ui/sort-select';
import { SearchInput } from '@/components/ui/search-input';
import { ContestCountdown } from '@/components/contest/contest-countdown';
import type { AwardTier } from '@/lib/types';
import { formatDate } from '@/lib/utils';

/**
 * 공모전 목록 페이지
 * 리스트/카드 뷰 전환, 필터, 정렬, 검색, 페이지네이션
 */
export default async function ContestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; page?: string; search?: string; view?: string }>;
}) {
  const { status, sort, page, search, view } = await searchParams;
  const contests = await getContests({ search });
  const currentStatus = status || 'open';
  const currentSort = sort || 'deadline';
  const currentView = view || 'list';
  const currentPage = Math.max(1, Number(page) || 1);
  const ITEMS_PER_PAGE = currentView === 'list' ? 8 : 16;

  // KST(UTC+9) 기준 D-day 계산
  const calcDDay = (deadlineStr: string) => {
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const nowKSTDay = Math.floor((Date.now() + KST_OFFSET) / MS_PER_DAY);
    const deadlineKSTDay = Math.floor((new Date(deadlineStr).getTime() + KST_OFFSET) / MS_PER_DAY);
    return deadlineKSTDay - nowKSTDay;
  };

  /** 날짜를 "2026. 01. 30(금)" 형식으로 포맷 */
  const formatDateWithDay = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}(${days[d.getDay()]})`;
  };

  /** 상금 문자열("300만원", "1,000만원" 등)을 숫자(원)로 변환 */
  const parsePrizeAmount = (amount: string): number => {
    const cleaned = amount.replace(/[,\s]/g, '');
    const match = cleaned.match(/(\d+)/);
    if (!match) return 0;
    const num = parseInt(match[1], 10);
    if (cleaned.includes('만')) return num * 10000;
    if (cleaned.includes('억')) return num * 100000000;
    return num;
  };

  /** awardTiers에서 총 상금 계산 (인원 × 개인 상금 합산) */
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

  /** 공통 URL 파라미터 생성 (view, sort, search 보존) */
  const buildParams = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    const merged = { status: currentStatus, sort: currentSort, view: currentView, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    if (search && !overrides.search) params.set('search', search);
    return params;
  };

  // 필터링
  const filteredContests = contests.filter((c) => {
    if (currentStatus === 'completed') return c.status === 'completed' || c.status === 'closed';
    return c.status === currentStatus;
  });

  // 정렬 (접수중: 마감일순, 심사중/종료: 결과발표일순)
  const sortedContests = [...filteredContests].sort((a, b) => {
    switch (currentSort) {
      case 'deadline': {
        if (currentStatus === 'open') {
          const da = new Date(a.submissionEndAt).getTime();
          const db = new Date(b.submissionEndAt).getTime();
          if (da !== db) return da - db;
          return new Date(a.resultAnnouncedAt).getTime() - new Date(b.resultAnnouncedAt).getTime();
        }
        // 심사중/종료: 결과발표일 기준 내림차순
        return new Date(b.resultAnnouncedAt).getTime() - new Date(a.resultAnnouncedAt).getTime();
      }
      case 'latest':
        return new Date(b.submissionStartAt).getTime() - new Date(a.submissionStartAt).getTime();
      default:
        return 0;
    }
  });

  // 접수중 공모전 수 (헤더 고정 표시용)
  const openContestsCount = contests.filter((c) => c.status === 'open').length;

  // 페이지네이션
  const displayedContests = sortedContests.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = sortedContests.length > displayedContests.length;
  const remainingCount = sortedContests.length - displayedContests.length;

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 (모던한 그라데이션) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-500/80 to-foreground/70">
              Explore Contests
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              총 <span className="text-[#EA580C] font-bold">{openContestsCount}</span>개의 공모전이 당신의 도전을 기다리고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 필터 & 정렬 & 검색 (Glassmorphism Sticky) */}
      <section className="sticky top-16 z-40 px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 pr-4 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* 상태 필터 */}
            <div className="flex gap-1">
              {[
                { id: 'draft', label: '접수전' },
                { id: 'open', label: '접수중' },
                { id: 'judging', label: '심사중' },
                { id: 'completed', label: '종료' }
              ].map((tab) => (
                <Link key={tab.id} href={`/contests?${buildParams({ status: tab.id }).toString()}`} scroll={false}>
                  <button
                    type="button"
                    className={`px-5 py-2.5 rounded-lg text-base tracking-tight transition-all cursor-pointer ${currentStatus === tab.id
                      ? 'text-violet-500 font-bold bg-violet-500/10'
                      : 'text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    {tab.label}
                  </button>
                </Link>
              ))}
            </div>

            {/* 뷰 토글 + 정렬 + 검색 */}
            <div className="flex items-center gap-3">
              {/* 리스트/카드 뷰 토글 */}
              <div className="flex items-center rounded-lg border border-white/10 overflow-hidden">
                {[
                  { id: 'list', icon: LayoutList, label: '리스트' },
                  { id: 'card', icon: LayoutGrid, label: '카드' },
                ].map(({ id, icon: Icon, label }) => (
                  <Link key={id} href={`/contests?${buildParams({ view: id }).toString()}`} scroll={false}>
                    <button
                      type="button"
                      className={`p-2 transition-all cursor-pointer ${currentView === id
                        ? 'bg-violet-500/15 text-violet-500'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  </Link>
                ))}
              </div>
              <SortSelect />
              <SearchInput basePath="/contests" currentSearch={search} extraParams={{ status: currentStatus, sort: currentSort, view: currentView }} placeholder="공모전 검색..." />
            </div>
          </div>
        </div>
      </section>

       {/* 공모전 목록 */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* 필터 결과 건수 & 검색어 표시 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col gap-1">
              <p className="text-base text-muted-foreground">
                총 <span className="text-[#EA580C] font-semibold">{sortedContests.length}</span>개의 공모전
              </p>
              {search && (
                <p className="text-sm text-muted-foreground">
                  &apos;<span className="text-foreground font-semibold">{search}</span>&apos; 검색 결과
                </p>
              )}
            </div>
          </div>

          {displayedContests.length > 0 ? (
            currentView === 'list' ? (
              /* ────────────── 리스트 뷰 ────────────── */
              <div className="space-y-6">
                {displayedContests.map((contest, index) => {
                  const totalPrize = contest.prizeAmount || calculateTotalPrize(contest.awardTiers);

                  return (
                    <div key={contest.id} className="group bg-neutral-900 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-0.5">
                      <div className="flex flex-col md:flex-row">
                        {/* 왼쪽: 콘텐츠 */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-w-0">
                          <div className="space-y-3">
                            {/* 제목 */}
                            <Link href={`/contests/${contest.id}` as any}>
                              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-[#EA580C] transition-colors break-keep">
                                {contest.title}
                              </h2>
                            </Link>
                            {/* 설명 */}
                            {contest.description && (
                              <p className="text-neutral-400 text-sm line-clamp-2">
                                {contest.description}
                              </p>
                            )}

                            {/* 접수중: 기간 왼쪽 크게 + 상금 오른쪽 끝 */}
                            {contest.status === 'open' ? (
                              <>
                                <div className="flex items-center justify-between gap-4 pt-1">
                                  <p className="text-orange-500 font-bold text-base md:text-lg">
                                    {formatDateWithDay(contest.submissionStartAt)} ~ {formatDateWithDay(contest.submissionEndAt)}
                                  </p>
                                  {totalPrize && (
                                    <p className="text-white font-bold text-lg md:text-xl whitespace-nowrap">
                                      총 상금 {totalPrize}
                                    </p>
                                  )}
                                </div>
                                <ContestCountdown deadline={contest.submissionEndAt} />
                              </>
                            ) : (
                              <>
                                <p className="text-orange-500 font-semibold text-sm">
                                  기간 : {formatDateWithDay(contest.submissionStartAt)} ~ {formatDateWithDay(contest.submissionEndAt)}
                                </p>
                                <p className="text-white font-bold text-lg pt-1">
                                  총 상금 {totalPrize ?? '미정'}
                                </p>
                              </>
                            )}
                          </div>

                          {/* 하단: 구분선 + 버튼 */}
                          <div className="mt-6 pt-4 border-t border-neutral-700 flex flex-wrap justify-center gap-3">
                            {/* 접수중일 때만 제출 버튼 표시 */}
                            {contest.status === 'open' && (
                              <Link href={`/contests/${contest.id}/submit` as any} className="group/btn">
                                <span className="relative inline-flex items-center gap-2 px-6 py-2 rounded-lg border-2 border-orange-500 text-orange-500 text-sm font-semibold overflow-hidden transition-all duration-300 cursor-pointer">
                                  <span className="absolute inset-0 bg-orange-500 scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />
                                  <Upload className="relative z-10 h-3.5 w-3.5 group-hover/btn:text-white transition-colors" />
                                  <span className="relative z-10 group-hover/btn:text-white transition-colors">영상 제출하기</span>
                                </span>
                              </Link>
                            )}
                            {/* 상세보기 버튼 */}
                            <Link href={`/contests/${contest.id}` as any} className="group/btn2">
                              <span className="relative inline-flex items-center gap-2 px-6 py-2 rounded-lg border-2 border-neutral-600 text-neutral-300 text-sm font-semibold overflow-hidden transition-all duration-300 cursor-pointer">
                                <span className="absolute inset-0 bg-neutral-600 scale-x-0 group-hover/btn2:scale-x-100 transition-transform duration-300 origin-left" />
                                <span className="relative z-10 group-hover/btn2:text-white transition-colors">상세안내 확인하기</span>
                              </span>
                            </Link>
                          </div>
                        </div>
                        {/* 오른쪽: 포스터 이미지 */}
                        <Link href={`/contests/${contest.id}` as any} className="block w-full md:w-[340px] lg:w-[400px] shrink-0">
                          <div className="relative h-60 md:h-full min-h-[240px]">
                            <img
                              src={contest.posterUrl || `/images/contest-${(index % 5) + 1}.jpg`}
                              alt={contest.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* 상태 뱃지: 접수전=초록, 접수중=주황 */}
                            <div className="absolute top-4 right-4">
                              {contest.status === 'draft' && (
                                <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white bg-emerald-500/70">접수전</span>
                              )}
                              {contest.status === 'open' && (
                                <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white bg-orange-500/70">접수중</span>
                              )}
                              {contest.status === 'judging' && (
                                <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white bg-pink-500/70">심사중</span>
                              )}
                              {(contest.status === 'completed' || contest.status === 'closed') && (
                                <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white bg-amber-500/70">종료</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ────────────── 카드 뷰 (기존) ────────────── */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedContests.map((contest, index) => (
                  <Link key={contest.id} href={`/contests/${contest.id}` as any} className="group relative block">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">

                      {/* Left Accent Bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EA580C] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top z-20" />

                      {/* 포스터 이미지 (전체 배경) */}
                      <img
                        src={contest.posterUrl || `/images/contest-${(index % 5) + 1}.jpg`}
                        alt={contest.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* 상태 뱃지 */}
                      <div className="absolute top-[18px] right-3 z-10">
                        {contest.status === 'draft' ? (
                          <span className="px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white bg-emerald-500/70">접수전</span>
                        ) : contest.status === 'open' ? (() => {
                          const dday = calcDDay(contest.submissionEndAt);
                          const colorClass = dday <= 7 ? 'bg-red-500/70' : dday <= 14 ? 'bg-orange-500/70' : 'bg-violet-500/70';
                          return (
                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white ${colorClass}`}>
                              {dday === 0 ? 'D-Day' : `D-${dday}`}
                            </span>
                          );
                        })() : (
                          <span className={`px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg text-white ${contest.status === 'judging' ? 'bg-pink-500/70' : 'bg-amber-500/70'
                            }`}>
                            {contest.status === 'judging' ? '심사중' : (<><Trophy className="inline h-3.5 w-3.5 mr-1" />결과발표</>)}
                          </span>
                        )}
                      </div>

                      {/* 하단 그라데이션 오버레이 + 텍스트 */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 flex flex-col justify-end">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 from-40% via-black/40 to-transparent" />
                        <div className="relative pb-7 px-4 flex flex-col gap-2.5">
                          <AutoFitTitle
                            className="font-bold text-white break-keep group-hover:text-[#EA580C] transition-colors leading-snug"
                            maxFontSize={18}
                            minFontSize={13}
                            maxLines={2}
                          >
                            {contest.title}
                          </AutoFitTitle>
                          {/* 공모전 소개 (2줄) */}
                          {contest.description && (
                            <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                              {contest.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white/90"><Award className="inline h-3.5 w-3.5 mr-1" />총상금 {contest.prizeAmount || calculateTotalPrize(contest.awardTiers) || '미정'}</span>
                            <span className="text-sm text-white/60">
                              {contest.status === 'draft'
                                ? `접수시작 ${formatDate(contest.submissionStartAt, { month: '2-digit', day: '2-digit' })}`
                                : contest.status === 'open'
                                  ? `마감 ${formatDate(contest.submissionEndAt, { month: '2-digit', day: '2-digit' })}`
                                  : `발표 ${formatDate(contest.resultAnnouncedAt, { month: '2-digit', day: '2-digit' })}`
                              }
                            </span>
                          </div>
                          {/* 접수중 공모전: 제출 버튼 */}
                          {contest.status === 'open' && (
                            <Link
                              href={`/contests/${contest.id}/submit` as any}
                              className="block group/btn"
                            >
                              <span className="relative w-full py-2 rounded-lg border-2 border-orange-500 text-orange-500 text-sm font-semibold flex items-center justify-center gap-1.5 overflow-hidden transition-all duration-300 cursor-pointer">
                                <span className="absolute inset-0 bg-orange-500 scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />
                                <Upload className="relative z-10 h-3.5 w-3.5 group-hover/btn:text-white transition-colors" />
                                <span className="relative z-10 group-hover/btn:text-white transition-colors">영상 제출</span>
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold mb-2">조건에 맞는 공모전이 없어요</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                필터 조건을 변경하거나, 새로운 공모전이 등록될 때까지 잠시만 기다려주세요.
              </p>
              <Link href="/contests?status=open">
                <Button variant="outline" className="rounded-full px-8">부활시키기 (전체보기)</Button>
              </Link>
            </div>
          )}

          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="mt-10 flex flex-col items-center gap-3">
              {(() => {
                const params = buildParams({ page: String(currentPage + 1) });
                return (
                  <Link href={`/contests?${params.toString()}`} scroll={false}>
                    <button type="button" className="group relative px-10 py-2.5 rounded-full border-2 border-violet-500 text-violet-500 font-semibold text-base overflow-hidden transition-all duration-300 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer">
                      <span className="absolute inset-0 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      <span className="relative z-10 flex items-center gap-2">
                        더보기
                        <span className="text-sm opacity-70">+{remainingCount}</span>
                      </span>
                    </button>
                  </Link>
                );
              })()}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
