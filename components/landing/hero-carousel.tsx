'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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

const slideGradients = [
  'from-purple-700 to-indigo-900',
  'from-[#EA580C] to-amber-700',
  'from-teal-700 to-cyan-900',
  'from-violet-700 to-purple-900',
  'from-rose-700 to-pink-900',
  'from-indigo-700 to-blue-900',
  'from-emerald-700 to-teal-900',
];

const typeLabels: Record<string, string> = {
  contest: '공모전',
  trend_report: '트렌드',
  announcement: '교육 소식',
  press_release: '보도자료',
  article: '소식',
};

interface HeroCarouselProps {
  slides: HeroSlide[];
}

function FallbackHero() {
  return (
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

  if (slides.length === 0) {
    return <FallbackHero />;
  }

  return (
    <section className="relative w-full group/hero">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div
                className={`relative w-full py-24 md:py-32 px-4 bg-gradient-to-br ${slideGradients[index % slideGradients.length]}`}
              >
                <div className="container mx-auto max-w-4xl text-center space-y-6 text-white">
                  <span className="inline-block text-xs font-medium tracking-wider uppercase px-3 py-1 rounded-full bg-white/15 text-white/80">
                    {typeLabels[slide.type] || slide.type}
                  </span>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto line-clamp-2">
                    {slide.description}
                  </p>
                  <p className="text-sm text-white/50">
                    {formatDate(slide.date)}
                  </p>
                  <div className="flex gap-4 justify-center pt-2">
                    <Link href={slide.href as any}>
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 cursor-pointer font-semibold">
                        {slide.ctaLabel}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* 사이드 < > 화살표 — 텍스트만, 버튼 테두리 없음 */}
        {count > 1 && (
          <>
            <button
              onClick={() => api?.scrollPrev()}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 text-white/40 hover:text-white transition-colors cursor-pointer"
              aria-label="이전 슬라이드"
            >
              <ChevronLeft className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 text-white/40 hover:text-white transition-colors cursor-pointer"
              aria-label="다음 슬라이드"
            >
              <ChevronRight className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
            </button>
          </>
        )}
      </Carousel>

      {/* Dot Indicators */}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === current
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
