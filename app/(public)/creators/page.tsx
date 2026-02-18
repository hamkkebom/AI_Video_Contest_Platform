import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/lib/mock';

/**
 * 크리에이터 프로필 목록 페이지
 */
export default async function CreatorsPage() {
  const users = await getUsers();
  const creators = users.filter(u => u.role === 'participant').slice(0, 24);

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">크리에이터</h1>
          <p className="text-muted-foreground">
            {creators.length}명의 크리에이터를 만나보세요
          </p>
        </div>
      </section>

      {/* 검색 & 필터 */}
      <section className="py-6 px-4 bg-background border-b border-border sticky top-16 z-40">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="border-[#EA580C] text-[#EA580C]">
              전체
            </Button>
            <Button variant="ghost" size="sm">
              팔로우순
            </Button>
            <Button variant="ghost" size="sm">
              작품순
            </Button>
            <Button variant="ghost" size="sm">
              인기순
            </Button>
          </div>
        </div>
      </section>

      {/* 크리에이터 그리드 */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/creators/${creator.id}` as any}>
                <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-[#EA580C] cursor-pointer">
                  {/* 배경 */}
                  <div className="bg-gradient-to-r from-[#EA580C]/20 to-[#8B5CF6]/20 h-24" />

                  {/* 프로필 */}
                  <div className="p-4 text-center space-y-3">
                    {/* 아바타 */}
                    <div className="flex justify-center -mt-12 mb-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EA580C] to-[#8B5CF6] flex items-center justify-center text-white text-2xl border-4 border-background">
                        {creator.name.charAt(0)}
                      </div>
                    </div>

                    {/* 정보 */}
                    <div>
                      <h3 className="font-bold text-lg">{creator.nickname || creator.name}</h3>
                      <p className="text-xs text-muted-foreground">{creator.region}</p>
                    </div>

                    {/* 통계 */}
                    <div className="flex justify-around text-sm">
                      <div>
                        <div className="font-semibold text-[#EA580C]">{Math.floor(Math.random() * 20) + 1}</div>
                        <div className="text-xs text-muted-foreground">작품</div>
                      </div>
                      <div>
                        <div className="font-semibold text-[#8B5CF6]">{Math.floor(Math.random() * 500) + 50}</div>
                        <div className="text-xs text-muted-foreground">좋아요</div>
                      </div>
                      <div>
                        <div className="font-semibold text-[#F59E0B]">{Math.floor(Math.random() * 100) + 10}</div>
                        <div className="text-xs text-muted-foreground">팔로워</div>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <Button className="w-full bg-[#8B5CF6] hover:bg-[#7C4DCC]" size="sm">
                      프로필 보기
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 더보기 */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              더 많은 크리에이터 보기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
