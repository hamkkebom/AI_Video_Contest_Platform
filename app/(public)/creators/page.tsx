import { PageHeader } from '@/components/layout/page-header';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublicCreators, getGallerySubmissions } from '@/lib/data';
import Image from 'next/image';
import type { Route } from 'next';

export const metadata: Metadata = {
  title: '크리에이터 — AI 영상 크리에이터 모아보기',
  description: 'AI꿈에서 활동하는 AI 영상 크리에이터들을 만나보세요. 다양한 창작자들의 프로필과 작품을 확인할 수 있습니다.',
  keywords: ['AI 크리에이터', 'AI 영상 제작자', 'AI꿈 크리에이터'],
  robots: { index: false, follow: false },
  alternates: { canonical: '/creators' },
  openGraph: {
    title: '크리에이터 — AI 영상 크리에이터 모아보기',
    description: 'AI꿈에서 활동하는 AI 영상 크리에이터들을 만나보세요. 다양한 창작자들의 프로필과 작품을 확인할 수 있습니다.',
    url: '/creators',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '크리에이터 — AI 영상 크리에이터 모아보기',
    description: 'AI꿈에서 활동하는 AI 영상 크리에이터들을 만나보세요. 다양한 창작자들의 프로필과 작품을 확인할 수 있습니다.',
  },
};

/**
 * 크리에이터 프로필 목록 페이지
 * 공모전 페이지 디자인 통일
 */
export default async function CreatorsPage() {
  const [users, submissions] = await Promise.all([
    getPublicCreators(),
    getGallerySubmissions().catch(() => []),
  ]);

  /* 크리에이터별 실제 성과 — 예전에는 작품·좋아요·팔로워가 전부 0 으로 하드코딩돼 있었다 */
  const statsByUser = new Map<string, { works: number; likes: number }>();
  for (const s of submissions) {
    const key = String(s.userId);
    const cur = statsByUser.get(key) ?? { works: 0, likes: 0 };
    cur.works += 1;
    cur.likes += s.likeCount ?? 0;
    statsByUser.set(key, cur);
  }

  /* 작품이 많은 순으로 — 아무 기준 없이 나열하면 목록이 의미를 갖지 못한다 */
  const creators = users
    .filter((u) => u.roles.includes('participant'))
    .map((u) => ({ ...u, stats: statsByUser.get(String(u.id)) ?? { works: 0, likes: 0 } }))
    .sort((a, b) => b.stats.works - a.stats.works || b.stats.likes - a.stats.likes)
    .slice(0, 24);

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 — 색은 globals.css .page-glow 가 테마 토큰으로 결정 */}
      <div className="page-glow" />

      <PageHeader
        title="Creators"
        description={
          <>
<span className="text-primary font-bold">{creators.length}</span>명의 크리에이터를 만나보세요
          </>
        }
      />

      {/* 크리에이터 그리드
          정렬 탭이 있었지만 onClick 이 없는 죽은 버튼이었고, 팔로우 기능 자체가 없다.
          동작하지 않는 컨트롤을 두느니 "작품 많은 순"이라는 기준을 명시한다. */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-base text-muted-foreground">
              <span className="font-semibold text-brand">{creators.length}</span>명의 크리에이터
            </p>
            <p className="text-sm text-muted-foreground">작품 많은 순</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/creators/${creator.id}` as Route}>
                <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  {/* 배경 */}
                  <div className="relative h-20 bg-gradient-to-r from-brand/20 to-primary/20" />

                  {/* 프로필 */}
                  <div className="space-y-3 p-4 text-center">
                    {/* 아바타 — 등록한 사진이 있으면 그것을, 없으면 이니셜 */}
                    <div className="-mt-12 mb-2 flex justify-center">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-card shadow-lg">
                        {creator.avatarUrl ? (
                          <Image
                            src={creator.avatarUrl}
                            alt={creator.nickname || creator.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-primary text-2xl font-bold text-white">
                            {creator.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 정보 */}
                    <div className="space-y-0.5">
                      <h3 className="truncate text-lg font-bold transition-colors group-hover:text-primary">
                        {creator.nickname || creator.name}
                      </h3>
                      {creator.region && (
                        <p className="text-xs text-muted-foreground">{creator.region}</p>
                      )}
                    </div>

                    {/* 통계 — 갤러리에서 집계한 실제 수치 */}
                    <div className="flex justify-center gap-6 border-t border-border pt-3 text-sm">
                      <div>
                        <div className="font-semibold tabular-nums text-brand">
                          {creator.stats.works.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">작품</div>
                      </div>
                      <div>
                        <div className="font-semibold tabular-nums text-primary">
                          {creator.stats.likes.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">좋아요</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
