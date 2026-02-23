'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type HeroSlide = {
  id: string;
  type: 'contest' | 'article';
  title: string;
  description: string;
  date: string;
  href: string;
  ctaLabel: string;
};

const typeLabels: Record<string, string> = {
  contest: '공모전',
  notice: '공지',
  program: '프로그램',
  insight: '인사이트',
  article: '스토리',
};

interface HeroCarouselProps {
  slides: HeroSlide[];
}

function FallbackHero() {
  return (
    <section className="relative w-full py-24 md:py-32 px-4 bg-foreground text-background">
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        <p className="text-sm font-medium tracking-widest uppercase text-background/60">
          꿈트리
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          창의적인 AI 영상<br />제작자들의 무대
        </h1>
        <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto">
          공모전에 참여하고, 수상작을 감상하고, AI 영상 제작의 새로운 가능성을 발견하세요.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/contests?status=open">
            <Button size="lg" className="bg-accent-foreground hover:bg-accent-foreground/90 text-white cursor-pointer">
              공모전 둘러보기
            </Button>
          </Link>
          <Link href="/gallery">
            <Button size="lg" className="bg-background/20 hover:bg-background/30 text-background border border-background/30 cursor-pointer">
              수상작 갤러리
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // 오토플레이 플러그인 인스턴스 (ref로 유지하여 reset 호출 가능)
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, onSelect]);

  // 화살표 클릭 핸들러 — 오토플레이 타이머 리셋 포함
  const handlePrev = useCallback(() => {
    api?.scrollPrev();
    autoplayPlugin.current.reset();
  }, [api]);

  const handleNext = useCallback(() => {
    api?.scrollNext();
    autoplayPlugin.current.reset();
  }, [api]);

  // 도트 클릭 핸들러 — 오토플레이 타이머 리셋 포함
  const handleDotClick = useCallback(
    (index: number) => {
      api?.scrollTo(index);
      autoplayPlugin.current.reset();
    },
    [api]
  );

  if (slides.length === 0) {
    return <FallbackHero />;
  }

  return (
    <section className="relative w-full group/hero">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[autoplayPlugin.current]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
                {/* 히어로 배경 이미지 (Ken Burns 영상 효과) */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={`/images/hero-${(index % 6) + 1}.jpg`}
                    alt=""
                    fill
                    className="object-cover"
                    priority={index === 0}
                    style={{
                      animation: `kenburns-${(index % 3) + 1} 20s ease-in-out infinite alternate`,
                    }}
                  />
                </div>
                {/* 다크 오버레이 */}
                <div className="absolute inset-0 bg-black/40" />
                {/* 슬라이드 컨텐츠 — 수직 가운데 정렬 */}
                <div className="relative z-10 h-full flex items-center justify-center px-4">
                  <div className="max-w-4xl text-center space-y-6 text-white">
                    <span className="inline-block text-sm font-medium tracking-wider uppercase px-4 py-1.5 rounded-full bg-white/15 text-white/80">
                      {typeLabels[slide.type] || slide.type}
                    </span>
                    <h1
                      className="keep-all-title text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                      style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                    >
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto line-clamp-2">
                      {slide.description}
                    </p>
                    <p className="text-base text-white/60 font-medium">
                      {slide.type === 'contest' ? `~${formatDate(slide.date)}` : formatDate(slide.date)}
                    </p>
                    <div className="flex gap-4 justify-center pt-2">
                      <Link href={slide.href as any}>
                        <Button size="lg" className="bg-accent-foreground text-white hover:bg-accent-foreground/90 cursor-pointer font-semibold">
                          {slide.ctaLabel}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

      </Carousel>

      {/* 화살표 — max-w-6xl 컨테이너 기준 양쪽 정렬 */}
      {count > 1 && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="max-w-6xl mx-auto relative h-full">
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-auto text-white/40 hover:text-white transition-colors cursor-pointer"
              aria-label="이전 슬라이드"
            >
              <ChevronLeft className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-auto text-white/40 hover:text-white transition-colors cursor-pointer"
              aria-label="다음 슬라이드"
            >
              <ChevronRight className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* 도트 인디케이터 */}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${index === current
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/60'
                }`}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
