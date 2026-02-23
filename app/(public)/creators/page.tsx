import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/lib/mock';

/**
 * 크리에이터 프로필 목록 페이지
 * 공모전 페이지 디자인 통일
 */
export default async function CreatorsPage() {
  const users = await getUsers();
  const creators = users.filter(u => u.role === 'participant').slice(0, 24);

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-500/80 to-foreground/70">
              Creators
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              <span className="text-primary font-bold">{creators.length}</span>명의 크리에이터를 만나보세요
            </p>
          </div>
        </div>
      </section>

      {/* 필터 (Glassmorphism) */}
      <section className="sticky top-16 z-40 px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="backdrop-blur-xl bg-background/70 border border-white/10 dark:border-white/5 shadow-sm rounded-2xl p-2 pr-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-1">
              {[
                { id: 'all', label: '전체' },
                { id: 'follow', label: '팔로우순' },
                { id: 'works', label: '작품순' },
                { id: 'popular', label: '인기순' },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={`px-5 py-2.5 rounded-lg text-base tracking-tight transition-all cursor-pointer ${tab.id === 'all'
                    ? 'text-violet-500 font-bold'
                    : 'text-muted-foreground font-medium hover:text-foreground'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 크리에이터 그리드 */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-5">
            <p className="text-base text-muted-foreground">
              <span className="text-[#EA580C] font-semibold">{creators.length}</span>명의 크리에이터
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/creators/${creator.id}` as any}>
                <div className="group rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur border border-white/10">
                  {/* 배경 */}
                  <div className="bg-gradient-to-r from-accent-foreground/20 to-primary/20 h-24 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-foreground transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                  </div>

                  {/* 프로필 */}
                  <div className="p-4 text-center space-y-3">
                    {/* 아바타 */}
                    <div className="flex justify-center -mt-12 mb-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-foreground to-primary flex items-center justify-center text-white text-2xl font-bold border-4 border-background shadow-lg">
                        {creator.name.charAt(0)}
                      </div>
                    </div>

                    {/* 정보 */}
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-accent-foreground transition-colors">{creator.nickname || creator.name}</h3>
                      <p className="text-xs text-muted-foreground">{creator.region}</p>
                    </div>

                    {/* 통계 */}
                    <div className="flex justify-around text-sm">
                      <div>
                        <div className="font-semibold text-orange-400">{Math.floor(Math.random() * 20) + 1}</div>
                        <div className="text-xs text-muted-foreground">작품</div>
                      </div>
                      <div>
                        <div className="font-semibold text-violet-400">{Math.floor(Math.random() * 500) + 50}</div>
                        <div className="text-xs text-muted-foreground">좋아요</div>
                      </div>
                      <div>
                        <div className="font-semibold text-amber-400">{Math.floor(Math.random() * 100) + 10}</div>
                        <div className="text-xs text-muted-foreground">팔로워</div>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <Button className="w-full bg-violet-500 hover:bg-violet-600 rounded-lg" size="sm">
                      프로필 보기
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 더보기 */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <button type="button" className="group relative px-10 py-2.5 rounded-full border-2 border-violet-500 text-violet-500 font-semibold text-base overflow-hidden transition-all duration-300 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer">
              <span className="absolute inset-0 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <span className="relative z-10">더 많은 크리에이터 보기</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
