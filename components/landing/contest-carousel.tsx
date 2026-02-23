'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Film, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Contest } from '@/lib/types';



interface ContestCarouselProps {
  contests: Contest[];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function ContestCarousel({ contests }: ContestCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
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

  if (contests.length === 0) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center py-12">
          <Film className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">현재 진행 중인 공모전이 없습니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-20 pb-0 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold">진행 중인 공모전</h2>
          <Link
            href={"/contests?status=open" as any}
            className="text-base text-muted-foreground hover:text-[#EA580C] hover:font-bold transition-all"
          >
            전체보기 →
          </Link>
        </div>

        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{
              align: 'start',
              loop: false,
              slidesToScroll: 'auto',
              containScroll: 'trimSnaps',
              watchSlides: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 py-2">
              {contests.map((contest, index) => (
                <CarouselItem
                  key={contest.id}
                  className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <Link href={`/contests/${contest.id}` as any}>
                    <div className="group border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-border/80 transition-all duration-200 cursor-pointer h-full will-change-[shadow] flex flex-col">
                      <div className="h-56 rounded-t-xl overflow-hidden relative">
                        <img
                          src={`/images/contest-${(index % 5) + 1}.jpg`}
                          alt={contest.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* D-day 뱃지 */}
                        {contest.status === 'open' && (() => {
                          const diff = Math.ceil((new Date(contest.submissionEndAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return diff >= 0 ? (
                            <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg ${diff <= 7 ? 'bg-red-500' : diff <= 14 ? 'bg-orange-500' : 'bg-violet-500'}`}>
                              {diff === 0 ? 'D-Day' : `D-${diff}`}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <div className="p-5 space-y-3 flex flex-col flex-1">
                        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-[#EA580C] transition-colors">
                          {contest.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {contest.description}
                        </p>
                        <div className="flex justify-between items-center pt-4 mt-auto">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${contest.status === 'open' ? 'bg-accent text-accent-foreground' :
                            contest.status === 'judging' ? 'bg-pink-500/10 text-pink-600' :
                              'bg-gray-500/10 text-gray-500'
                            }`}>
                            {contest.status === 'open' ? '접수중' : contest.status === 'judging' ? '심사중' : '결과발표'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ~{formatDate(contest.submissionEndAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* 좌우 화살표 — 첫줄이면 왼쪽 숨김, 마지막줄이면 오른쪽 숨김 */}
          {canScrollPrev && (
            <button
              onClick={() => api?.scrollPrev()}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:shadow-lg transition-all cursor-pointer hidden md:flex"
              aria-label="이전"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          {canScrollNext && (
            <button
              onClick={() => api?.scrollNext()}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:shadow-lg transition-all cursor-pointer hidden md:flex"
              aria-label="다음"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
