import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eye, Heart, Trophy, ArrowLeft } from 'lucide-react';
import { getAwardedSubmissions, getCompletedContests } from '@/lib/mock';

/**
 * 공모전별 수상작 상세 갤러리
 * 특정 공모전의 수상작만 표시
 */
export default async function ContestAwardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ contestId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { contestId } = await params;
  const { page } = await searchParams;

  const [allAwarded, completedContests] = await Promise.all([
    getAwardedSubmissions(),
    getCompletedContests(),
  ]);

  // 해당 공모전 찾기
  const contest = completedContests.find((c) => c.id === contestId);
  if (!contest) notFound();

  // 해당 공모전 수상작 필터 + rank 정렬 (대상 → 최우수상 → 우수상)
  const contestAwarded = allAwarded
    .filter((s) => s.contestId === contestId)
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  const currentPage = Math.max(1, Number(page) || 1);
  const ITEMS_PER_PAGE = 12;
  const displayedSubmissions = contestAwarded.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = contestAwarded.length > displayedSubmissions.length;
  const remainingCount = contestAwarded.length - displayedSubmissions.length;

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* 뒤로가기 */}
          <Link href="/gallery/awards" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            수상작 갤러리로 돌아가기
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-500/80 to-foreground/70">
              {contest.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{contest.prizeAmount ?? '상금 미정'}</span>
              <span>발표일 {new Date(contest.resultAnnouncedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 수상작 그리드 */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-5">
            <p className="text-base text-muted-foreground">
              총 <span className="text-[#EA580C] font-semibold">{contestAwarded.length.toLocaleString()}</span>개의 수상작
            </p>
          </div>

          {displayedSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedSubmissions.map((submission, index) => (
                <Link key={`${submission.id}-${submission.rank}`} href={`/gallery/${submission.id}` as any} className="group">
                  <div className="relative rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur border border-white/10">
                    {/* 썸네일 */}
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={`/images/contest-${(index % 5) + 1}.jpg`}
                        alt={submission.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* 수상 뱃지 */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-lg ${
                          submission.rank === 1 ? 'bg-amber-500/90 text-white' :
                          submission.rank === 2 ? 'bg-slate-400/90 text-white' :
                          'bg-orange-600/90 text-white'
                        }`}>
                          <Trophy className="inline h-3.5 w-3.5 mr-1" />
                          {submission.prizeLabel}
                        </span>
                      </div>
                    </div>

                    {/* 콘텐츠 */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent-foreground transition-colors">
                        {submission.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{submission.creatorName}</p>

                      {/* 통계 */}
                      <div className="flex gap-3 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {submission.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {submission.likeCount.toLocaleString()}
                        </span>
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
              <h3 className="text-xl font-bold mb-2">수상작이 없습니다</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                이 공모전에 수상작이 아직 등록되지 않았습니다.
              </p>
            </div>
          )}

          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link href={`/gallery/awards/${contestId}?page=${currentPage + 1}`} scroll={false}>
                <button type="button" className="group relative px-10 py-2.5 rounded-full border-2 border-violet-500 text-violet-500 font-semibold text-base overflow-hidden transition-all duration-300 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer">
                  <span className="absolute inset-0 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="relative z-10 flex items-center gap-2">
                    더보기
                    <span className="text-sm opacity-70">+{remainingCount.toLocaleString()}</span>
                  </span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
