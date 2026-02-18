import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getContests, getArticles } from '@/lib/mock';
import { HeroCarousel, type HeroSlide } from '@/components/landing/hero-carousel';
import { ContestCarousel } from '@/components/landing/contest-carousel';
import { Trophy, GraduationCap, Users, Award, Lightbulb, Clapperboard, ArrowRight } from 'lucide-react';

/**
 * 랜딩 페이지 v2
 * 히어로 캐러셀 → 공모전 캐러셀 → 갤러리 배너 → 교육 대형 → 대행 CTA
 */
export default async function LandingPage() {
  const [contests, articles] = await Promise.all([getContests(), getArticles()]);
  const openContests = contests.filter(c => c.status === 'open').slice(0, 8);

  // 히어로 슬라이드: 공모전 + 기사 혼합, 최신순 정렬
  const contestSlides: HeroSlide[] = openContests.slice(0, 3).map(c => ({
    id: c.id,
    type: 'contest',
    title: c.title,
    description: c.description,
    date: c.startAt,
    href: `/contests/${c.id}`,
    ctaLabel: '자세히 보기',
  }));
  const articleSlides: HeroSlide[] = articles.slice(0, 3).map(a => ({
    id: a.id,
    type: a.type as HeroSlide['type'],
    title: a.title,
    description: a.excerpt,
    date: a.publishedAt,
    href: `/news/${a.slug}`,
    ctaLabel: '자세히 보기',
  }));
  const heroSlides = [...contestSlides, ...articleSlides]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="w-full">
      {/* ① 히어로 캐러셀 */}
      <HeroCarousel slides={heroSlides} />

      {/* ② 공모전 캐러셀 */}
      <ContestCarousel contests={openContests} />

      {/* ③ 수상작 갤러리 배너 — 공모전과 간격 줄이고, 가운데 모아 정렬 */}
      <section className="pt-0 pb-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl flex justify-center">
          <div className="flex flex-col md:flex-row items-center gap-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EA580C]/10 flex items-center justify-center shrink-0">
                <Trophy className="h-6 w-6 text-[#EA580C]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">수상작 갤러리</h3>
                <p className="text-sm text-muted-foreground">
                  역대 공모전 수상작들을 감상해 보세요
                </p>
              </div>
            </div>
            <Link href="/gallery">
              <Button className="cursor-pointer gap-2">
                갤러리 보기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ④ 교육 대형 섹션 — 인디고+보라+보색 그라데이션 */}
      <section className="py-24 px-4 bg-gradient-to-br from-amber-950 via-orange-900/80 to-rose-950 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <p className="text-sm font-medium tracking-widest uppercase text-[#EA580C]">
              Education Program
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">AI 영상 제작 교육</h2>
            <p className="text-orange-200/80 max-w-2xl mx-auto text-lg">
              전문가 강사진과 함께 AI 영상 제작 기초부터 심화까지 배워보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: GraduationCap,
                title: '체계적인 커리큘럼',
                description: 'AI 영상 제작의 기초부터 고급 기법까지 단계별로 학습합니다',
              },
              {
                icon: Users,
                title: '전문 강사진',
                description: '현업 AI 영상 크리에이터들이 직접 노하우를 전수합니다',
              },
              {
                icon: Award,
                title: '수료 인증',
                description: '과정 수료 시 인증서를 발급하여 역량을 증명할 수 있습니다',
              },
              {
                icon: Lightbulb,
                title: '실습 중심',
                description: '이론보다 실습 위주의 교육으로 즉시 활용 가능한 기술을 습득합니다',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-6 space-y-4 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-400/20 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-orange-300" />
                </div>
                <h3 className="font-semibold text-base text-white">{feature.title}</h3>
                <p className="text-sm text-orange-200/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href={"#" as any}>
              <Button size="lg" className="bg-white text-amber-950 hover:bg-white/90 cursor-pointer gap-2 font-semibold">
                교육 프로그램 보기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ⑤ 영상 제작 대행 CTA — max-w-6xl로 캐러셀과 너비 통일 */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-foreground to-foreground/90 p-12 md:p-16 text-background">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA580C]/30 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/30 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#EA580C]/20 flex items-center justify-center">
                    <Clapperboard className="h-5 w-5 text-[#EA580C]" />
                  </div>
                  <span className="text-xs font-medium tracking-wider uppercase text-background/50">
                    Agency Service
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  AI 영상 제작 의뢰 서비스
                </h3>
                <p className="text-background/70 leading-relaxed">
                  기업 홍보, 제품 소개, 교육 콘텐츠 등 다양한 AI 영상 제작을 전문 크리에이터에게 맡겨보세요.
                  합리적인 비용으로 고품질 결과물을 받아보실 수 있습니다.
                </p>
              </div>
              <div className="shrink-0">
                <Link href={"#" as any}>
                  <Button
                    size="lg"
                    className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white cursor-pointer font-semibold gap-2"
                  >
                    제작 의뢰하기
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
