import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSubmissions } from '@/lib/mock';

/**
 * 내 출품작 페이지
 * 사용자의 출품작 목록을 그리드로 표시 (데모: user-1)
 */
export default async function MySubmissionsPage() {
  try {
    const allSubmissions = await getSubmissions();
    // Demo: user-1의 출품작만 필터링
    const userSubmissions = allSubmissions.filter((sub) => sub.userId === 'user-1');

    // 상태별 색상 매핑
    const statusColorMap: Record<string, { bg: string; text: string; label: string }> = {
      pending_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '검토 중' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: '승인됨' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '거절됨' },
      auto_rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '자동 거절' },
      judging: { bg: 'bg-blue-100', text: 'text-blue-800', label: '심사 중' },
      judged: { bg: 'bg-purple-100', text: 'text-purple-800', label: '심사 완료' }
    };

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl font-bold mb-2">내 출품작</h1>
            <p className="text-muted-foreground">
              {userSubmissions.length}개의 출품작을 관리하세요
            </p>
          </div>
        </section>

        {/* 출품작 그리드 */}
        <section className="py-12 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            {userSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">출품작이 없습니다</p>
                <Button className="bg-[#EA580C] hover:bg-[#C2540A]">
                  새 출품작 등록
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userSubmissions.map((submission) => {
                  const statusInfo = statusColorMap[submission.status] || {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    label: submission.status
                  };

                  return (
                    <Card
                      key={submission.id}
                      className="overflow-hidden hover:shadow-lg transition-all border border-border"
                    >
                      {/* 썸네일 */}
                      <div className="relative w-full h-40 bg-gradient-to-br from-[#EA580C]/20 to-[#8B5CF6]/20 overflow-hidden">
                        <img
                          src={submission.thumbnailUrl}
                          alt={submission.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        {/* 상태 배지 */}
                        <div className="absolute top-2 right-2">
                          <Badge className={`${statusInfo.bg} ${statusInfo.text} border-0`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      {/* 정보 */}
                      <div className="p-4 space-y-3">
                        {/* 제목 */}
                        <h3 className="font-bold text-lg line-clamp-2 hover:text-[#EA580C] cursor-pointer">
                          {submission.title}
                        </h3>

                        {/* 설명 */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {submission.description}
                        </p>

                        {/* 통계 */}
                        <div className="flex gap-4 text-sm pt-2 border-t border-border">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">👁️</span>
                            <span className="font-semibold">{submission.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">❤️</span>
                            <span className="font-semibold">{submission.likeCount}</span>
                          </div>
                        </div>

                        {/* 태그 */}
                        <div className="flex flex-wrap gap-1">
                          {submission.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-[#EA580C] text-[#EA580C]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10"
                          >
                            보기
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                          >
                            수정
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load submissions:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">출품작을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
