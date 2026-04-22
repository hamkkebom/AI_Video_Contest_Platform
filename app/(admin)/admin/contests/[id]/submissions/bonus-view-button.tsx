'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, ExternalLink, Image as ImageIcon, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react';
import type { BonusConfig } from '@/lib/types';

interface BonusEntry {
  id: string;
  bonusConfigId: string;
  snsUrl?: string;
  proofImageUrl?: string;
  submittedAt: string;
  status?: string;
  rejectionReason?: string;
  reviewedAt?: string;
}

interface BonusViewButtonProps {
  submissionTitle: string;
  bonusEntries: BonusEntry[];
  bonusConfigs: BonusConfig[];
}

export function BonusViewButton({ submissionTitle, bonusEntries: initialEntries, bonusConfigs }: BonusViewButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<BonusEntry[]>(initialEntries);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionInput, setRejectionInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const configMap = new Map(bonusConfigs.map((c) => [c.id, c]));

  /* 가산점 개수 (통계) */
  const approvedCount = entries.filter((e) => e.status === 'approved').length;
  const rejectedCount = entries.filter((e) => e.status === 'rejected').length;
  const pendingCount = entries.filter((e) => !e.status || e.status === 'pending').length;

  const handleReview = async (entryId: string, status: 'approved' | 'rejected' | 'pending', reason?: string) => {
    setProcessingId(entryId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bonus-entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '처리에 실패했습니다.');
      }
      /* 로컬 상태 업데이트 */
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? {
                ...e,
                status,
                rejectionReason: status === 'rejected' ? reason : undefined,
                reviewedAt: status === 'pending' ? undefined : new Date().toISOString(),
              }
            : e
        )
      );
      setRejectingId(null);
      setRejectionInput('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-700 hover:bg-yellow-500/20 hover:border-yellow-500/60 transition-colors whitespace-nowrap dark:text-yellow-300 shadow-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Star className="h-3.5 w-3.5" />
        <span>가산점 확인 ({entries.length})</span>
        {pendingCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {pendingCount}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-xl"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => {
            /* 확대 이미지 오버레이 위 클릭이면 모달 유지 (확대만 닫힘) */
            const target = e.target as HTMLElement | null;
            if (target?.closest('[data-bonus-zoom-overlay]')) {
              e.preventDefault();
              return;
            }
            /* 배경 클릭 시 모달만 닫고 상위 Link 네비게이션 방지 */
            const originalEvent = (e as unknown as { detail?: { originalEvent?: Event } }).detail?.originalEvent;
            if (originalEvent) {
              originalEvent.stopPropagation();
              originalEvent.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('[data-bonus-zoom-overlay]')) {
              e.preventDefault();
              return;
            }
            const originalEvent = (e as unknown as { detail?: { originalEvent?: Event } }).detail?.originalEvent;
            if (originalEvent) {
              originalEvent.stopPropagation();
              originalEvent.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              가산점 인증 내역
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{submissionTitle}</p>
            <div className="flex items-center gap-3 text-xs mt-2">
              <span className="flex items-center gap-1">
                <span className="font-medium text-emerald-600">인정 {approvedCount}</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1">
                <span className="font-medium text-rose-600">거절 {rejectedCount}</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1">
                <span className="font-medium text-amber-600">대기 {pendingCount}</span>
              </span>
            </div>
          </DialogHeader>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {entries.map((entry, index) => {
              const config = configMap.get(entry.bonusConfigId);
              const isProcessing = processingId === entry.id;
              const isRejecting = rejectingId === entry.id;
              const status = entry.status ?? 'pending';

              return (
                <div
                  key={entry.id}
                  className={`rounded-lg border p-4 space-y-2 ${
                    status === 'approved'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : status === 'rejected'
                        ? 'border-rose-500/30 bg-rose-500/5'
                        : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{config?.label ?? `가산점 항목 ${index + 1}`}</p>
                      {config?.description && (
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {config?.score != null && (
                        <span className="text-xs font-medium text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                          +{config.score}점
                        </span>
                      )}
                      {status === 'approved' && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> 인정
                        </span>
                      )}
                      {status === 'rejected' && (
                        <span className="text-xs font-medium text-rose-700 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> 거절
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="text-xs font-medium text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          대기
                        </span>
                      )}
                    </div>
                  </div>

                  {entry.snsUrl && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <a
                        href={entry.snsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {entry.snsUrl}
                      </a>
                    </div>
                  )}

                  {entry.proofImageUrl && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ImageIcon className="h-3.5 w-3.5" />
                        인증 이미지 <span className="text-[10px] text-muted-foreground/70">(클릭하면 크게 보기)</span>
                      </div>
                      <img
                        src={entry.proofImageUrl}
                        alt="가산점 인증"
                        className="w-full max-h-48 rounded-lg border border-border object-contain bg-muted/30 cursor-zoom-in transition-opacity hover:opacity-90"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setZoomedImageUrl(entry.proofImageUrl!);
                        }}
                      />
                    </div>
                  )}

                  {!entry.snsUrl && !entry.proofImageUrl && (
                    <p className="text-xs text-muted-foreground">등록된 인증 자료가 없습니다.</p>
                  )}

                  {status === 'rejected' && entry.rejectionReason && (
                    <div className="rounded-md bg-rose-500/5 border border-rose-500/20 px-3 py-2">
                      <p className="text-xs font-medium text-rose-700">거절 사유</p>
                      <p className="text-xs text-rose-600 mt-0.5">{entry.rejectionReason}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    제출: {new Date(entry.submittedAt).toLocaleString('ko-KR')}
                    {entry.reviewedAt && (
                      <span className="ml-2">· 심사: {new Date(entry.reviewedAt).toLocaleString('ko-KR')}</span>
                    )}
                  </p>

                  {/* 거절 사유 입력 */}
                  {isRejecting && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <textarea
                        value={rejectionInput}
                        onChange={(e) => setRejectionInput(e.target.value)}
                        placeholder="거절 사유 (선택)"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[60px] resize-none"
                        maxLength={300}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionInput('');
                          }}
                          disabled={isProcessing}
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          className="bg-rose-600 hover:bg-rose-700 text-white"
                          onClick={() => handleReview(entry.id, 'rejected', rejectionInput)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '거절 확정'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  {!isRejecting && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      {status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 border-rose-300 hover:bg-rose-50"
                            onClick={() => {
                              setRejectingId(entry.id);
                              setRejectionInput('');
                            }}
                            disabled={isProcessing}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            거절
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleReview(entry.id, 'approved')}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                인정
                              </>
                            )}
                          </Button>
                        </>
                      )}
                      {(status === 'approved' || status === 'rejected') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-muted-foreground"
                          onClick={() => handleReview(entry.id, 'pending')}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              대기로 되돌리기
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 이미지 확대 보기 오버레이 — Portal + 모든 이벤트 핸들러에서 전파 차단
       * React synthetic event가 포털 밖으로 버블링되어 Link까지 도달하는 것 방지.
       * mousedown/pointerdown/touchstart까지 광범위 차단. */}
      {isMounted && zoomedImageUrl && createPortal(
        <div
          data-bonus-zoom-overlay
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 cursor-zoom-out animate-in fade-in"
          role="dialog"
          aria-label="가산점 인증 이미지 크게 보기"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setZoomedImageUrl(null);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-bonus-zoom-overlay
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setZoomedImageUrl(null);
            }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="닫기"
          >
            <XCircle className="h-6 w-6" />
          </button>
          <img
            src={zoomedImageUrl}
            alt="가산점 인증 크게 보기"
            data-bonus-zoom-overlay
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <p data-bonus-zoom-overlay className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70">
            이미지 밖을 클릭하면 닫힙니다
          </p>
        </div>,
        document.body,
      )}
    </>
  );
}
