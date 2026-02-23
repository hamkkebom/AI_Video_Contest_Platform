import Link from 'next/link';
import { Trophy, Award, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutoFitTitle } from '@/components/ui/auto-fit-title';
import { getContests } from '@/lib/mock';
import { SortSelect } from '@/components/ui/sort-select';
import { SearchInput } from '@/components/ui/search-input';

/**
 * 공모전 목록 페이지
 * 필터, 정렬, 검색, 50개+ 공모전 카드 그리드
 */
export default async function ContestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; page?: string; search?: string }>;
}) {
  const { status, sort, page, search } = await searchParams;
  const contests = await getContests({ search });
  const currentStatus = status || 'open';
  const currentSort = sort || 'deadline';
  const currentPage = Math.max(1, Number(page) || 1);
  const ITEMS_PER_PAGE = 16;

  // KST(UTC+9) 기준 D-day 계산
  const calcDDay = (deadlineStr: string) => {
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const nowKSTDay = Math.floor((Date.now() + KST_OFFSET) / MS_PER_DAY);
    const deadlineKSTDay = Math.floor((new Date(deadlineStr).getTime() + KST_OFFSET) / MS_PER_DAY);
    return deadlineKSTDay - nowKSTDay;
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

  // 페이지네이션 (16개씩)
  const displayedContests = sortedContests.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = sortedContests.length > displayedContests.length;
  const remainingCount = sortedContests.length - displayedContests.length;

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 (모던한 그라데이션 복구) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 (기존 스타일 복구) */}
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

      {/* 필터 & 정렬 & 검색 (Glassmorphism Sticky - 기존 스타일 복구) */}
      <section className="sticky top-16 z-40 px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 pr-4 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* 상태 필터 */}
            <div className="flex gap-1">
              {[
                { id: 'open', label: '접수중' },
                { id: 'judging', label: '심사중' },
                { id: 'completed', label: '종료' }
              ].map((tab) => {
                const params = new URLSearchParams();
                params.set('status', tab.id);
                params.set('sort', currentSort);
                if (search) params.set('search', search);
                return (
                  <Link key={tab.id} href={`/contests?${params.toString()}`} scroll={false}>
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
                );
              })}
            </div>

            {/* 정렬 옵션 & 검색 입력 (오른쪽 정렬) */}
            <div className="flex items-center gap-3">
              <SortSelect />
              <SearchInput basePath="/contests" currentSearch={search} extraParams={{ status: currentStatus, sort: currentSort }} placeholder="공모전 검색..." />
            </div>
          </div>
        </div>
      </section>

       {/* 공모전 그리드 */}
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
                  '<span className="text-foreground font-semibold">{search}</span>' 검색 결과
                </p>
              )}
            </div>
          </div>
          {displayedContests.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedContests.map((contest, index) => (
                <Link key={contest.id} href={`/contests/${contest.id}` as any} className="group relative block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">

                    {/* Left Accent Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EA580C] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top z-20" />

                    {/* 포스터 이미지 (전체 배경) */}
                    <img
                      src={`/images/contest-${(index % 5) + 1}.jpg`}
                      alt={contest.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* 상태 뱃지 */}
                    <div className="absolute top-[18px] right-3 z-10">
                      {contest.status === 'open' ? (() => {
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black from-50% to-transparent" />
                      <div className="relative pb-7 px-4 flex flex-col gap-4">
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
                            {contest.status === 'open'
                              ? `마감 ${new Date(contest.submissionEndAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
                              : `발표 ${new Date(contest.resultAnnouncedAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
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
                              <span className="relative z-10 group-hover/btn:text-white transition-colors">작품 제출</span>
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
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
                const params = new URLSearchParams();
                params.set('status', currentStatus);
                params.set('sort', currentSort);
                params.set('page', String(currentPage + 1));
                if (search) params.set('search', search);
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
