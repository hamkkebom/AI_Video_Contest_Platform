/** 갤러리 상세 로딩 스켈레톤 — 영상 플레이어 + 메타 정보 레이아웃 */
export default function GalleryDetailLoading() {
  return (
    <div className="w-full">
      {/* 뒤로가기 */}
      <div className="pt-4 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <section className="py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* 영상 플레이어 영역 */}
          <div className="aspect-video bg-muted rounded-xl animate-pulse" />

          {/* 제목 + 메타 */}
          <div className="space-y-3">
            <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
            <div className="flex flex-wrap gap-4">
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
              <div className="h-5 w-28 bg-muted rounded animate-pulse" />
              <div className="h-5 w-16 bg-muted rounded animate-pulse" />
              <div className="h-5 w-12 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/5 bg-muted rounded animate-pulse" />
          </div>

          {/* 출품 공모전 */}
          <div className="pt-4 border-t space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-5 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}
