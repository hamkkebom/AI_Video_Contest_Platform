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
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type ActionType = 'approve' | 'reject';

interface SubmissionActionsProps {
  /** 제출물 ID */
  submissionId: string;
  /** 제출물 제목 (모달 표시용) */
  submissionTitle: string;
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
};

/**
 * 제출물 승인/거절 액션 버튼 + 확인 모달
 * 서버 컴포넌트 페이지에서 사용하는 클라이언트 컴포넌트
 */
export function SubmissionActions({ submissionId, submissionTitle }: SubmissionActionsProps) {
  const router = useRouter();
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
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
        body: JSON.stringify({ status: config.status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? '요청 처리에 실패했습니다.');
      }

      setCurrentAction(null);
      router.refresh();
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
        size="sm"
        type="button"
        className="cursor-pointer"
        onClick={() => setCurrentAction('approve')}
      >
        승인
      </Button>
      <Button
        size="sm"
        variant="outline"
        type="button"
        className="text-destructive cursor-pointer"
        onClick={() => setCurrentAction('reject')}
      >
        거절
      </Button>

      <Dialog open={currentAction !== null} onOpenChange={(open) => { if (!open && !loading) { setCurrentAction(null); setError(null); } }}>
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

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => { setCurrentAction(null); setError(null); }}
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
