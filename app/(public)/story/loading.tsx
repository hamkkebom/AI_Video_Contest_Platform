/**
 * 스토리 페이지 로딩 UI
 * 서버 데이터 페칭 중 즉시 표시되어 체감 속도 개선
 */
export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* 헤더 스켈레톤 */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl space-y-4">
            <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
            <div className="h-5 w-72 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </section>

      {/* 필터 바 스켈레톤 */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-background/70 p-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* 카드 그리드 스켈레톤 */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="h-5 w-32 rounded bg-muted animate-pulse mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-background/50 overflow-hidden">
                <div className="h-52 bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
