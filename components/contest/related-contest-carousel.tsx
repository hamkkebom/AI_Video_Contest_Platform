'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import type { Contest } from '@/lib/types';

interface RelatedContestCarouselProps {
  contests: Contest[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getStatusMeta(status: string) {
  if (status === 'open') {
    return { label: '접수중', className: 'bg-accent text-accent-foreground' };
  }
  if (status === 'judging') {
    return { label: '심사중', className: 'bg-primary text-primary-foreground' };
  }
  return { label: '결과발표', className: 'bg-muted text-muted-foreground' };
}

export function RelatedContestCarousel({ contests }: RelatedContestCarouselProps) {
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

  if (contests.length === 0) return null;

  return (
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
          {contests.map((contest, index) => {
            const statusMeta = getStatusMeta(contest.status);
            // 접수중 → 제출마감일, 심사중/결과발표 → 결과발표일
            const dateLabel = contest.status === 'open' ? '마감' : '발표';
            const dateValue = contest.status === 'open'
              ? formatDate(contest.submissionEndAt)
              : formatDate(contest.resultAnnouncedAt);

            return (
              <CarouselItem
                key={contest.id}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <Link href={`/contests/${contest.id}` as any} className="group block h-full">
                  <Card className="border border-border overflow-hidden h-full hover:border-accent-foreground/40 hover:shadow-lg transition-all flex flex-col">
                    {/* 썸네일 */}
                    <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                      <img
                        src={`/images/contest-${(index % 5) + 1}.jpg`}
                        alt={contest.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                      </div>
                    </div>

                    {/* 카드 본문 */}
                    <div className="p-4 space-y-3 flex flex-col flex-1">
                      <h3 className="font-bold line-clamp-2 group-hover:text-accent-foreground transition-colors">
                        {contest.title}
                      </h3>
                      {/* 설명 2줄 고정 레이아웃 */}
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {contest.description}
                      </p>

                      {/* 하단: 상금 + 날짜 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mt-auto">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Trophy className="h-3.5 w-3.5" />
                          {contest.prizeAmount ?? '상금 미정'}
                        </span>
                        <span>{dateLabel} {dateValue}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* 좌우 화살표 */}
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
  );
}
