import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getContests } from '@/lib/mock';
import { Film, Trophy } from 'lucide-react';

/**
 * 랜딩 페이지
 * 히어로 섹션, 하이라이트, 수상작 프리뷰, CTA
 */
export default async function LandingPage() {
  const contests = await getContests();
  const highlightContests = contests.filter(c => c.status === 'open').slice(0, 3);
  const resultContests = contests.filter(c => c.status === 'completed').slice(0, 6);

  return (
    <div className="w-full">
      {/* 히어로 섹션 */}
      <section className="relative w-full py-24 md:py-32 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <p className="text-sm font-medium tracking-widest uppercase text-background/60">
            AI Video Contest Platform
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            창의적인 AI 영상<br />제작자들의 무대
          </h1>
          <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto">
            공모전에 참여하고, 수상작을 감상하고, AI 영상 제작의 새로운 가능성을 발견하세요.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/contests">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
                공모전 둘러보기
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 cursor-pointer">
                수상작 갤러리
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 하이라이트 공모전 */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold">진행 중인 공모전</h2>
            <Link href="/contests" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlightContests.map((contest) => (
              <Link key={contest.id} href={`/contests/${contest.id}` as any}>
                <div className="group border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-border/80 transition-all cursor-pointer">
                  <div className="bg-muted h-40 flex items-center justify-center">
                    <Film className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">{contest.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{contest.description}</p>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                        {contest.status === 'open' ? '접수중' : '마감'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 수상작 프리뷰 */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold">수상작 갤러리</h2>
            <Link href="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultContests.slice(0, 6).map((contest) => (
              <Link key={contest.id} href={`/gallery?contest=${contest.id}`}>
                <div className="group bg-background rounded-xl border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{contest.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5">수상작 {Math.floor(Math.random() * 10) + 1}개</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 교육 배너 */}
      <section className="py-16 px-4 bg-primary/5 border-y border-border">
        <div className="container mx-auto max-w-3xl text-center space-y-4">
          <h3 className="text-xl font-bold">AI 영상 제작 배우기</h3>
          <p className="text-muted-foreground">전문가 강사진과 함께 AI 영상 제작 기초부터 심화까지 배워보세요</p>
          <Link href="#">
            <Button variant="outline" className="cursor-pointer mt-2">교육 프로그램 보기</Button>
          </Link>
        </div>
      </section>

      {/* 대행 의뢰 CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border p-10 text-center space-y-4">
            <h3 className="text-xl font-bold">AI 영상 제작 대행 서비스</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              전문 크리에이터에게 AI 영상 제작을 의뢰하세요.
            </p>
            <Link href="#">
              <Button className="cursor-pointer mt-2">대행 의뢰하기</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
