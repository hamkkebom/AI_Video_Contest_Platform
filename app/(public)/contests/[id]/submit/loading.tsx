/**
 * 영상 제출 페이지 로딩 스켈레톤
 * 미들웨어 인증 체크 + 페이지 번들 로딩 중 즉시 표시
 */
export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      <section className="relative pt-24 pb-10 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* 뒤로가기 스켈레톤 */}
          <div className="mb-6 h-5 w-40 rounded bg-muted animate-pulse" />

          {/* 헤더 카드 스켈레톤 */}
          <div className="rounded-2xl sm:rounded-[2rem] bg-zinc-950 border border-white/10 p-5 sm:p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-32 rounded-full bg-white/5 animate-pulse" />
                <div className="h-8 w-48 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-64 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 폼 카드 스켈레톤 */}
      <section className="relative px-4 pb-24">
        <div className="container mx-auto max-w-3xl space-y-8">
          {/* 공모전 정보 배너 */}
          <div className="rounded-2xl border border-border/50 p-6 bg-background/50">
            <div className="space-y-3">
              <div className="h-6 w-48 rounded bg-muted animate-pulse" />
              <div className="h-4 w-72 rounded bg-muted animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </div>

          {/* Step 1 카드 */}
          <div className="p-6 rounded-xl border border-border space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-10 rounded-lg bg-muted animate-pulse" />
              </div>
            ))}
          </div>

          {/* Step 2 카드 */}
          <div className="p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="h-5 w-28 rounded bg-muted animate-pulse" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-40 rounded-xl border-2 border-dashed border-border animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
