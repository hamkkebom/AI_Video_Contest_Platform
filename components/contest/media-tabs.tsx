'use client';

import { useState } from 'react';
import { Image, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaTabsProps {
    posterUrl?: string;
    promotionVideoUrls?: string[];
    title: string;
    defaultTab?: 'poster' | 'video';
}

export function MediaTabs({ posterUrl, promotionVideoUrls, title, defaultTab }: MediaTabsProps) {
    const hasPoster = Boolean(posterUrl);
    const hasVideo = Boolean(promotionVideoUrls?.length);
    const [videoIndex, setVideoIndex] = useState(0);

    type TabType = 'poster' | 'video';
    const [activeTab, setActiveTab] = useState<TabType>(defaultTab === 'video' && hasVideo ? 'video' : hasPoster ? 'poster' : 'video');

    if (!hasPoster && !hasVideo) {
        return (
            <div className="rounded-lg bg-muted/50 border border-dashed border-border p-8 text-center">
                <Image className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">포스터 및 홍보 자료가 준비 중입니다</p>
            </div>
        );
    }

    const tabs: Array<{ key: TabType; label: string; icon: typeof Image; available: boolean }> = [
        { key: 'poster', label: '포스터', icon: Image, available: hasPoster },
        { key: 'video', label: `홍보영상${promotionVideoUrls && promotionVideoUrls.length > 1 ? ` (${promotionVideoUrls.length})` : ''}`, icon: Play, available: hasVideo },
    ];

    const availableTabs = tabs.filter((tab) => tab.available);

    return (
        <div>
            {/* 탭 버튼 */}
            {availableTabs.length > 1 && (
                <div className="flex gap-1 mb-4">
                    {availableTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isActive
                                    ? 'bg-foreground text-background'
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* 탭 콘텐츠 */}
            {activeTab === 'poster' && hasPoster && (
                <div className="flex justify-center">
                    <div className="overflow-hidden rounded-lg bg-muted aspect-[3/4] max-w-sm w-full">
                        <img
                            src={posterUrl}
                            alt={`${title} 포스터`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'video' && hasVideo && (
                <div className="overflow-hidden rounded-lg bg-muted">
                    <div className="aspect-video relative">
                        <iframe
                            src={promotionVideoUrls![videoIndex]}
                            title={`${title} 홍보영상`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        {/* 비디오 네비게이션 */}
                        {promotionVideoUrls!.length > 1 && (
                            <>
                                {/* 이전 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => setVideoIndex((prev) => (prev === 0 ? promotionVideoUrls!.length - 1 : prev - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                    aria-label="이전 영상"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>

                                {/* 다음 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => setVideoIndex((prev) => (prev === promotionVideoUrls!.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                    aria-label="다음 영상"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>

                                {/* 인디케이터 */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {videoIndex + 1}/{promotionVideoUrls!.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
