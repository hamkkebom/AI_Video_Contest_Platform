/** 갤러리 목록 로딩 스켈레톤 — 페이지 전환 시 즉시 표시 */
export default function GalleryLoading() {
  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="h-10 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-72 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* 추천 작품 캐러셀 영역 */}
      <div className="px-4 mb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="h-7 w-56 bg-muted rounded animate-pulse mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-64 shrink-0 rounded-xl bg-muted animate-pulse aspect-[4/3]" />
            ))}
          </div>
        </div>
      </div>

      {/* 정렬/검색 바 + 작품 그리드 */}
      <div className="px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-9 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-5 w-32 bg-muted rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-card border">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="flex gap-3">
                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
