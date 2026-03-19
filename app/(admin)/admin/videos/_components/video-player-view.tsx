'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  Film, Eye, Heart, Clock, Inbox, PlayCircle, Pause, Play,
  SkipBack, SkipForward, Repeat, Maximize, Minimize,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatDateTime } from '@/lib/utils';
import type { Contest, Submission, SubmissionStatus, User } from '@/lib/types';

/** 상태별 뱃지 스타일 */
const statusBadgeMap: Record<SubmissionStatus, { label: string; className: string }> = {
  pending_review: { label: '검수대기', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  approved: { label: '검수완료', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: '반려', className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
  auto_rejected: { label: '자동반려', className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
  judging: { label: '심사중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  judged: { label: '심사완료', className: 'bg-violet-500/10 text-violet-700 dark:text-violet-300' },
};

/** 초를 MM:SS 형태로 변환 */
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Cloudflare Stream SDK 타입 (최소) */
interface StreamPlayer {
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
  play: () => void;
  pause: () => void;
  currentTime: number;
}
declare global {
  interface Window {
    Stream?: (iframe: HTMLIFrameElement) => StreamPlayer;
  }
}

interface VideoPlayerViewProps {
  contests: Contest[];
  submissions: Submission[];
  currentContestId: string;
  usersMap: Record<string, User>;
}

export function VideoPlayerView({ contests, submissions, currentContestId, usersMap }: VideoPlayerViewProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    submissions.length > 0 ? submissions[0].id : null,
  );
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  /* refs */
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isAutoPlayRef = useRef(isAutoPlay);
  const selectedIdRef = useRef(selectedId);

  /* ref 동기화 — 이벤트 핸들러 내 stale closure 방지 */
  useEffect(() => { isAutoPlayRef.current = isAutoPlay; }, [isAutoPlay]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  const selected = submissions.find((s) => s.id === selectedId) ?? null;
  const currentIndex = submissions.findIndex((s) => s.id === selectedId);

  /** 다음 영상으로 이동 (루프) */
  const advanceToNext = useCallback(() => {
    const idx = submissions.findIndex((s) => s.id === selectedIdRef.current);
    if (idx < 0 || submissions.length === 0) return;
    const nextIdx = (idx + 1) % submissions.length;
    setSelectedId(submissions[nextIdx].id);
  }, [submissions]);

  /** 이전 영상으로 이동 */
  const advanceToPrev = useCallback(() => {
    const idx = submissions.findIndex((s) => s.id === selectedIdRef.current);
    if (idx < 0 || submissions.length === 0) return;
    const prevIdx = (idx - 1 + submissions.length) % submissions.length;
    setSelectedId(submissions[prevIdx].id);
  }, [submissions]);

  /** Cloudflare Stream SDK 로드 (1회) */
  useEffect(() => {
    if (typeof window.Stream === 'function') return;
    if (document.querySelector('script[src*="embed/sdk.latest.js"]')) return;
    const script = document.createElement('script');
    script.src = 'https://embed.videodelivery.net/embed/sdk.latest.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  /** iframe에 Stream SDK 연결 — ended 이벤트로 자동 다음 영상 */
  useEffect(() => {
    if (!selected?.videoUrl || !iframeRef.current) return;

    let player: StreamPlayer | null = null;
    let cancelled = false;

    const handleEnded = () => {
      if (!isAutoPlayRef.current) return;
      advanceToNext();
    };

    const tryAttach = async () => {
      /* SDK 로드 대기 (최대 5초) */
      for (let i = 0; i < 25; i++) {
        if (cancelled) return;
        if (typeof window.Stream === 'function') break;
        await new Promise((r) => setTimeout(r, 200));
      }
      if (cancelled || !iframeRef.current || typeof window.Stream !== 'function') return;

      /* iframe 렌더 대기 */
      await new Promise((r) => setTimeout(r, 600));
      if (cancelled || !iframeRef.current) return;

      try {
        player = window.Stream(iframeRef.current);
        player.addEventListener('ended', handleEnded);
      } catch {
        /* SDK 연결 실패 — 치명적이지 않음, 수동 재생은 동작 */
      }
    };

    tryAttach();

    return () => {
      cancelled = true;
      if (player) {
        try { player.removeEventListener('ended', handleEnded); } catch { /* noop */ }
      }
    };
  }, [selected?.videoUrl, advanceToNext]);

  /** 전체화면 토글 */
  const toggleFullScreen = useCallback(async () => {
    if (!playerContainerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await playerContainerRef.current.requestFullscreen();
      }
    } catch { /* 전체화면 미지원 환경 */ }
  }, []);

  /** 전체화면 변경 감지 */
  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /** 공모전 변경 */
  const handleContestChange = (contestId: string) => {
    router.push(`/admin/videos?contestId=${contestId}` as Route);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 히어로 헤더 */}
      <section className="relative -mx-4 overflow-hidden rounded-xl bg-gradient-to-b from-primary/8 via-primary/3 to-background border border-border px-6 py-8 sm:px-8 sm:py-10">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PlayCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">관리자</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">영상 플레이어</h1>
            </div>
          </div>

          {/* 공모전 선택 */}
          <Select value={currentContestId} onValueChange={handleContestChange}>
            <SelectTrigger className="w-full sm:w-72 bg-card">
              <SelectValue placeholder="공모전 선택" />
            </SelectTrigger>
            <SelectContent>
              {contests.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Split View */}
      {submissions.length === 0 ? (
        <Card className="border-border">
          <CardContent className="space-y-3 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-semibold text-foreground">승인된 영상이 없습니다</p>
              <p className="text-sm text-muted-foreground mt-1">이 공모전에 승인된 출품 영상이 아직 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          {/* 좌측: 영상 목록 */}
          <Card className="border-border overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-bold text-foreground">
                영상 목록 <span className="text-primary">{submissions.length}</span>건
              </p>
            </div>
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              {submissions.map((sub, idx) => {
                const isActive = sub.id === selectedId;
                const statusInfo = statusBadgeMap[sub.status];
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedId(sub.id)}
                    className={cn(
                      'flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50',
                      isActive && 'bg-primary/5 border-l-2 border-l-primary',
                    )}
                  >
                    {/* 순번 */}
                    <span className={cn(
                      'mt-1 shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}>
                      {idx + 1}
                    </span>
                    {/* 썸네일 */}
                    <div className="relative shrink-0">
                      <img
                        src={sub.thumbnailUrl}
                        alt={sub.title}
                        className="h-[50px] w-[88px] rounded-md border border-border object-cover"
                      />
                      {sub.videoDuration > 0 && (
                        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white">
                          {formatDuration(sub.videoDuration)}
                        </span>
                      )}
                    </div>
                    {/* 정보 */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className={cn('truncate text-sm font-semibold', isActive ? 'text-primary' : 'text-foreground')}>
                        {sub.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {sub.submitterName || usersMap[sub.userId]?.name || '알 수 없음'}
                      </p>
                      <Badge className={cn('text-[10px] px-1.5 py-0', statusInfo.className)}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 우측: 영상 플레이어 */}
          <div
            ref={playerContainerRef}
            className={cn(
              'space-y-4',
              isFullScreen && 'bg-black flex flex-col items-center justify-center p-4',
            )}
          >
            {selected ? (
              <>
                {/* 상단: 영상 제목 + 창작자 (일반/전체화면 공통) */}
                <div className={cn(
                  'px-1 text-center',
                  isFullScreen && 'max-w-[90vw] w-full',
                )}>
                  <p className={cn('font-bold truncate', isFullScreen ? 'text-white text-xl' : 'text-foreground text-lg')}>{selected.title}</p>
                  <p className={cn('mt-0.5', isFullScreen ? 'text-white/60 text-sm' : 'text-muted-foreground text-sm')}>
                    {selected.submitterName || usersMap[selected.userId]?.name || '알 수 없음'}
                  </p>
                  {!isFullScreen && (
                    <div className="mt-1.5">
                      <Badge className={cn('inline-flex', statusBadgeMap[selected.status].className)}>
                        {statusBadgeMap[selected.status].label}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* 플레이어 */}
                <div className={cn(
                  'aspect-video bg-black rounded-xl overflow-hidden shadow-lg',
                  isFullScreen && 'w-full max-w-[100vw] max-h-[90vh] rounded-none',
                )}>
                  {selected.videoUrl ? (
                    <iframe
                      ref={iframeRef}
                      key={selected.id}
                      src={`https://iframe.videodelivery.net/${selected.videoUrl}?poster=${encodeURIComponent(selected.thumbnailUrl || '')}&autoplay=true`}
                      title={selected.title}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Film className="h-12 w-12" />
                    </div>
                  )}
                </div>

                {/* 재생 컨트롤 바 */}
                {isFullScreen ? (
                  /* 전체화면: 해제 버튼만 표시 */
                  <div className="max-w-[90vw] w-full flex justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleFullScreen}>
                      <Minimize className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
                  {/* 좌: 이전/다음 + 위치 */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={advanceToPrev}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <span className={cn(
                      'text-sm font-bold tabular-nums min-w-[3rem] text-center',
                      isFullScreen ? 'text-white' : 'text-foreground',
                    )}>
                      {currentIndex + 1} / {submissions.length}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={advanceToNext}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 우: 자동재생 + 전체화면 */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isAutoPlay ? 'default' : 'outline'}
                      size="sm"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => setIsAutoPlay((prev) => !prev)}
                    >
                      <Repeat className="h-3.5 w-3.5" />
                      자동재생 {isAutoPlay ? 'ON' : 'OFF'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullScreen}>
                      {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                )}

                {/* 영상 정보 (전체화면에서는 숨김 — 제목/창작자는 상단에 표시) */}
                {!isFullScreen && (
                  <Card className="border-border">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-bold text-foreground leading-snug">{selected.title}</h2>
                        <Badge className={cn('shrink-0', statusBadgeMap[selected.status].className)}>
                          {statusBadgeMap[selected.status].label}
                        </Badge>
                      </div>

                      {selected.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{selected.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {selected.submitterName || usersMap[selected.userId]?.name || '알 수 없음'}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span>{formatDateTime(selected.submittedAt)}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium text-foreground">{selected.views}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Heart className="h-4 w-4" />
                          <span className="font-medium text-foreground">{selected.likeCount}</span>
                        </span>
                        {selected.videoDuration > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-foreground">{formatDuration(selected.videoDuration)}</span>
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-border">
                <CardContent className="py-24 text-center">
                  <Film className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">좌측 목록에서 영상을 선택해 주세요.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
