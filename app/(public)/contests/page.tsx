import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getContests } from '@/lib/mock';

/**
 * 공모전 목록 페이지
 * 필터, 정렬, 50개+ 공모전 카드 그리드
 */
export default async function ContestsPage() {
  const contests = await getContests();

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">공모전</h1>
          <p className="text-muted-foreground">
            {contests.length}개의 공모전이 진행 중입니다
          </p>
        </div>
      </section>

      {/* 필터 & 정렬 */}
      <section className="py-6 px-4 bg-background border-b border-border sticky top-16 z-40">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="border-[#EA580C] text-[#EA580C]">
                전체
              </Button>
              <Button variant="ghost" size="sm">
                접수중
              </Button>
              <Button variant="ghost" size="sm">
                심사중
              </Button>
              <Button variant="ghost" size="sm">
                결과발표
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                최신순
              </Button>
              <Button variant="ghost" size="sm">
                마감순
              </Button>
              <Button variant="ghost" size="sm">
                상금순
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 공모전 그리드 */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest) => (
              <Link key={contest.id} href={`/contests/${contest.id}` as any}>
                <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-[#EA580C] cursor-pointer h-full flex flex-col">
                  {/* 썸네일 */}
                  <div className="bg-gradient-to-br from-[#EA580C] to-[#F59E0B] h-40 flex items-center justify-center relative overflow-hidden">
                    <span className="text-5xl">🎬</span>
                    <div className="absolute top-2 right-2 bg-[#8B5CF6] text-white text-xs px-2 py-1 rounded">
                      {contest.status === 'open' ? '접수중' : contest.status === 'judging' ? '심사중' : '결과발표'}
                    </div>
                  </div>

                  {/* 콘텐츠 */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg line-clamp-2 mb-2">{contest.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {contest.description}
                    </p>

                    {/* 메타 정보 */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">상금</span>
                        <span className="font-semibold text-[#EA580C]">
                          {"상금 미정"}원
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">참가자</span>
                        <span className="font-semibold">
                          {Math.floor(Math.random() * 100) + 10}명
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">마감</span>
                        <span className="font-semibold">
                          {new Date(contest.endAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div className="p-4 border-t border-border">
                    <Button className="w-full bg-[#8B5CF6] hover:bg-[#7C4DCC]" size="sm">
                      상세보기
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 더보기 */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              더 많은 공모전 보기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
