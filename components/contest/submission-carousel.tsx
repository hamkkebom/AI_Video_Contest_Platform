'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Submission, User } from '@/lib/types';

interface SubmissionCarouselProps {
  submissions: Submission[];
  /** 직렬화된 creatorMap (서버 컴포넌트에서 전달) */
  creators: Record<string, User>;
}

export function SubmissionCarousel({ submissions, creators }: SubmissionCarouselProps) {
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

  if (submissions.length === 0) return null;

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
          {submissions.map((submission, index) => {
            const creator = creators[submission.userId];
            return (
              <CarouselItem
                key={submission.id}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Card className="border border-border overflow-hidden h-full">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={`/images/contest-${(index % 5) + 1}.jpg`}
                      alt={submission.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {creator?.nickname ?? creator?.name ?? '익명 참가자'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {submission.views.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {submission.likeCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
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
