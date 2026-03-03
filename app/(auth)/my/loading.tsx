/**
 * 참가자 마이페이지 로딩 UI
 * 서버 데이터 페칭 중 즉시 표시되어 체감 속도 개선
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      {/* 페이지 제목 스켈레톤 */}
      <div className="space-y-2">
        <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded bg-muted animate-pulse" />
      </div>

      {/* 통계 카드 스켈레톤 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-5 space-y-3">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-7 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* 콘텐츠 리스트 스켈레톤 */}
      <div className="rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-4 w-4 rounded bg-muted animate-pulse" />
              <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
