/** 스토리 상세 로딩 스켈레톤 */
export default function StoryDetailLoading() {
  return (
    <div className="w-full">
      <div className="pt-4 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <article className="py-8 px-4">
        <div className="container mx-auto max-w-3xl space-y-6">
          {/* 썸네일 */}
          <div className="aspect-[2/1] bg-muted rounded-xl animate-pulse" />

          {/* 카테고리 + 제목 */}
          <div className="space-y-3">
            <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
            <div className="h-9 w-4/5 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          </div>

          {/* 본문 */}
          <div className="space-y-3 pt-4 border-t">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
