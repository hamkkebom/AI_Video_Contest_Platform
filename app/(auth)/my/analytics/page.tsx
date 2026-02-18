import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSubmissions } from '@/lib/mock';

/**
 * 참가자 분석 페이지
 * 사용자의 작품 성과를 표시합니다 (데모: user-1)
 * 무료: 조회수, 좋아요, 평균 조회수
 * 유료: 상세 분석 (잠금)
 */
export default async function ParticipantAnalyticsPage() {
  try {
    const DEMO_USER_ID = 'user-1';
    const allSubmissions = await getSubmissions();
    const userSubmissions = allSubmissions.filter((sub) => sub.userId === DEMO_USER_ID);

    // 통계 계산
    const totalViews = userSubmissions.reduce((sum, sub) => sum + sub.views, 0);
    const totalLikes = userSubmissions.reduce((sum, sub) => sum + sub.likeCount, 0);
    const avgViews = userSubmissions.length > 0 ? Math.round(totalViews / userSubmissions.length) : 0;

    const freeStats = [
      { label: '총 조회수', value: totalViews, icon: '👁️', accent: 'border-l-[#EA580C]' },
      { label: '총 좋아요', value: totalLikes, icon: '❤️', accent: 'border-l-[#F59E0B]' },
      { label: '평균 조회수', value: avgViews, icon: '📊', accent: 'border-l-[#8B5CF6]' },
    ];

    const paidStats = [
      { label: '카테고리 경쟁률', value: '분석 중...', icon: '🏆', locked: true },
      { label: 'AI 도구 트렌드', value: '분석 중...', icon: '🤖', locked: true },
      { label: '상세 분석', value: '분석 중...', icon: '📈', locked: true },
    ];

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl font-bold mb-2">내 분석</h1>
            <p className="text-muted-foreground">
              작품 성과를 분석하고 인사이트를 얻으세요
            </p>
          </div>
        </section>

        {/* 무료 섹션 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">무료 분석</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {freeStats.map((stat) => (
                  <Card
                    key={stat.label}
                    className={`p-6 border border-border border-l-4 ${stat.accent} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* 작품 목록 */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">작품별 성과</h3>
              {userSubmissions.length === 0 ? (
                <Card className="p-8 text-center border border-border">
                  <p className="text-muted-foreground mb-4">아직 출품작이 없습니다</p>
                  <Button className="bg-[#EA580C] hover:bg-[#C2540A]">
                    첫 작품 출품하기
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {userSubmissions.slice(0, 5).map((submission) => (
                    <Card key={submission.id} className="p-4 border border-border hover:border-[#EA580C]/40 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold hover:text-[#EA580C] cursor-pointer">{submission.title}</h4>
                          <p className="text-sm text-muted-foreground">{submission.description}</p>
                        </div>
                        <div className="flex gap-6 text-sm text-muted-foreground shrink-0">
                          <div className="text-center">
                            <p className="font-bold text-foreground">{submission.views}</p>
                            <p className="text-xs">조회</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-foreground">{submission.likeCount}</p>
                            <p className="text-xs">좋아요</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 유료 섹션 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-6">프리미엄 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paidStats.map((stat) => (
                <Card
                  key={stat.label}
                  className="p-6 border border-border border-l-4 border-l-[#8B5CF6] hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent pointer-events-none" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-muted-foreground">{stat.value}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-lg">🔒</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 프리미엄 CTA */}
            <Card className="mt-8 p-8 border border-[#8B5CF6]/30 bg-gradient-to-r from-[#8B5CF6]/5 to-[#EA580C]/5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">프리미엄 분석으로 더 깊이 있는 인사이트를 얻으세요</h3>
                  <p className="text-muted-foreground">
                    카테고리 경쟁률, AI 도구 트렌드, 상세 분석 등 프리미엄 기능을 이용할 수 있습니다.
                  </p>
                </div>
                <Button className="bg-[#8B5CF6] hover:bg-[#7C4DCC] text-white font-semibold shrink-0">
                  출시 시 알림 받기
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load analytics:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">분석 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
