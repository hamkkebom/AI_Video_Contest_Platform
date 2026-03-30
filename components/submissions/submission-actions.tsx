'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

type ActionType = 'approve' | 'reject' | 'allow_resubmission';

interface SubmissionActionsProps {
  /** 제출물 ID */
  submissionId: string;
  /** 제출물 제목 (모달 표시용) */
  submissionTitle: string;
  /** 다음 제출물 ID (관리자 검수 연속 처리용) */
  nextSubmissionId?: string;
  /** 현재 제출물 상태 */
  submissionStatus?: string;
}

const ACTION_CONFIG: Record<ActionType, {
  label: string;
  modalTitle: string;
  modalDescription: (title: string) => string;
  confirmLabel: string;
  status: string;
  icon: typeof CheckCircle2;
  iconColor: string;
}> = {
  approve: {
    label: '승인',
    modalTitle: '제출물을 승인하시겠습니까?',
    modalDescription: (title) => `"${title}" 제출물을 승인합니다. 승인된 제출물은 공모전 출품작 목록에 표시됩니다.`,
    confirmLabel: '승인',
    status: 'approved',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
  },
  reject: {
    label: '거절',
    modalTitle: '제출물을 거절하시겠습니까?',
    modalDescription: (title) => `"${title}" 제출물을 거절합니다. 거절된 제출물은 출품작 목록에서 제외됩니다.`,
    confirmLabel: '거절',
    status: 'rejected',
    icon: XCircle,
    iconColor: 'text-destructive',
  },
  allow_resubmission: {
    label: '재제출 허용',
    modalTitle: '재제출을 허용하시겠습니까?',
    modalDescription: (title) => `"${title}" 출품작의 영상을 다시 제출할 수 있도록 허용합니다. 참가자에게 재제출 버튼이 표시됩니다.`,
    confirmLabel: '재제출 허용',
    status: 'allow_resubmission',
    icon: RefreshCw,
    iconColor: 'text-orange-500',
  },
};

/**
 * 제출물 승인/거절 액션 버튼 + 확인 모달
 * 서버 컴포넌트 페이지에서 사용하는 클라이언트 컴포넌트
 */
export function SubmissionActions({ submissionId, submissionTitle, nextSubmissionId, submissionStatus }: SubmissionActionsProps) {
  const router = useRouter();
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!currentAction) return;
    const config = ACTION_CONFIG[currentAction];
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: config.status,
          ...(currentAction === 'reject' && rejectionReason.trim() ? { rejectionReason: rejectionReason.trim() } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? '요청 처리에 실패했습니다.');
      }

      setCurrentAction(null);
      setRejectionReason('');
      if (nextSubmissionId) {
        router.push(`/gallery/${nextSubmissionId}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const config = currentAction ? ACTION_CONFIG[currentAction] : null;
  const Icon = config?.icon;

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        type="button"
        className="w-full text-destructive cursor-pointer text-base font-bold py-3"
        onClick={() => setCurrentAction('reject')}
      >
        <XCircle className="h-5 w-5 mr-1.5" />
        거절
      </Button>
      <Button
        size="lg"
        type="button"
        className="w-full cursor-pointer text-base font-bold py-3"
        onClick={() => setCurrentAction('approve')}
      >
        <CheckCircle2 className="h-5 w-5 mr-1.5" />
        승인
      </Button>
      {(submissionStatus === 'rejected' || submissionStatus === 'pending_review') && (
        <Button
          size="lg"
          variant="outline"
          type="button"
          className="w-full col-span-2 text-orange-600 border-orange-300 hover:bg-orange-50 cursor-pointer text-base font-bold py-3"
          onClick={() => setCurrentAction('allow_resubmission')}
        >
          <RefreshCw className="h-5 w-5 mr-1.5" />
          재제출 허용
        </Button>
      )}

      <Dialog open={currentAction !== null} onOpenChange={(open) => { if (!open && !loading) { setCurrentAction(null); setError(null); setRejectionReason(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            {Icon && (
              <div className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full ${currentAction === 'approve' ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                <Icon className={`h-7 w-7 ${config?.iconColor}`} />
              </div>
            )}
            <DialogTitle className="text-center">{config?.modalTitle}</DialogTitle>
            <DialogDescription className="text-center">
              {config?.modalDescription(submissionTitle)}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {currentAction === 'reject' && (
            <div className="space-y-2 pt-2">
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                거절 사유 <span className="text-muted-foreground">(선택)</span>
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="거절 사유를 입력하세요 (내부 관리용)"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{rejectionReason.length}/500</p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => { setCurrentAction(null); setError(null); setRejectionReason(''); }}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              className={`flex-1 cursor-pointer ${currentAction === 'reject' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                config?.confirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
