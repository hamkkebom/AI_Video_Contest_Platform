/**
 * 공모전 상세 페이지 로딩 스켈레톤
 * 서버 컴포넌트 데이터 페칭 중 즉시 표시되어 체감 속도 개선
 */
export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-background">
      {/* 헤더 스켈레톤 */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-primary/8 via-primary/3 to-background border-b border-border">
        <div className="container mx-auto max-w-6xl space-y-6">
          <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-10 w-3/4 rounded-lg bg-muted animate-pulse" />
            <div className="h-5 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </section>

      {/* 지표 카드 스켈레톤 */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-border">
                <div className="h-4 w-16 rounded bg-muted animate-pulse mb-2" />
                <div className="h-5 w-28 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 본문 스켈레톤 */}
      <section className="pb-10 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl border border-border">
              <div className="aspect-video rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="p-6 rounded-xl border border-border space-y-4">
              <div className="h-7 w-32 rounded bg-muted animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${85 - i * 10}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border space-y-3">
              <div className="h-6 w-24 rounded bg-muted animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
