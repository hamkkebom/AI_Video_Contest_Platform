'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';
import { Eye, Heart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { Submission } from '@/lib/types';

/** 갤러리 서브미션 (creatorName 포함) */
interface GallerySubmission extends Submission {
    creatorName?: string;
}

interface FeaturedWorksCarouselProps {
    submissions: GallerySubmission[];
    /** 갤러리 보기 링크 표시 여부 (기본 true — 메인용, false — 갤러리 페이지용) */
    showGalleryLink?: boolean;
}

export function FeaturedWorksCarousel({ submissions, showGalleryLink = true }: FeaturedWorksCarouselProps) {
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

    if (submissions.length === 0) {
        return (
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl text-center py-12">
                    <Sparkles className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">주목할 작품이 아직 없습니다</p>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-16 pb-0 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-bold">🌟 주목할 작품 TOP 12</h2>
                    {showGalleryLink && (
                        <Link
                            href="/gallery/all"
                            className="text-base text-muted-foreground hover:text-[#EA580C] hover:font-bold transition-all"
                        >
                            갤러리 보기 →
                        </Link>
                    )}
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
                            {submissions.map((sub, index) => (
                                <CarouselItem
                                    key={sub.id}
                                    className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                                >
                                    <Link href={`/gallery/${sub.id}` as any}>
                                        <div className="group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer bg-background border border-border hover:border-border/80">
                                            {/* 썸네일 */}
                                            <div className="aspect-video overflow-hidden">
                                                <img
                                                    src={`/images/contest-${(index % 5) + 1}.jpg`}
                                                    alt={sub.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            {/* 정보 */}
                                            <div className="p-4 space-y-2">
                                                <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-accent-foreground transition-colors">
                                                    {sub.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {sub.creatorName ?? '크리에이터'}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3.5 w-3.5" />
                                                        {sub.views.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="h-3.5 w-3.5" />
                                                        {sub.likeCount.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    {/* 좌우 화살표 */}
                    {canScrollPrev && (
                        <button
                            type="button"
                            onClick={() => api?.scrollPrev()}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:shadow-lg transition-all cursor-pointer hidden md:flex"
                            aria-label="이전"
                        >
                            <ChevronLeft className="h-5 w-5 text-foreground" />
                        </button>
                    )}
                    {canScrollNext && (
                        <button
                            type="button"
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
