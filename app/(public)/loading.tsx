/**
 * 공개 페이지 로딩 스켈레톤
 * 페이지 전환 시 즉각 표시되어 사용자 체감 속도 개선
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">로딩 중...</p>
      </div>
    </div>
  );
}
