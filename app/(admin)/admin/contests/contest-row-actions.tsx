'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

type ContestRowActionsProps = {
  contestId: string;
};

export default function ContestRowActions({ contestId }: ContestRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  /* 삭제 확인 다이얼로그 */
  const [confirmOpen, setConfirmOpen] = useState(false);
  /* 삭제 완료 다이얼로그 */
  const [doneOpen, setDoneOpen] = useState(false);

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/contests/${contestId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? '공모전 삭제에 실패했습니다.');
        }

        // 삭제 확인 닫고 → 완료 팝업 열기
        setConfirmOpen(false);
        setDoneOpen(true);
      } catch (deleteError) {
        console.error('Failed to delete contest:', deleteError);
        setError(deleteError instanceof Error ? deleteError.message : '공모전 삭제에 실패했습니다.');
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <div className="flex justify-end gap-2">
          <Link href={`/admin/contests/${contestId}` as Route}>
            <Button size="sm" variant="outline">상세</Button>
          </Link>
          <Link href={`/admin/contests/${contestId}/edit` as Route}>
            <Button size="sm" variant="outline">수정</Button>
          </Link>
          <Link href={`/admin/contests/${contestId}/submissions` as Route}>
            <Button size="sm" variant="outline">영상 관리</Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="text-destructive"
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
          >
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">공모전을 삭제하시겠습니까?</DialogTitle>
            <DialogDescription className="text-center">
              삭제된 공모전은 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 완료 다이얼로그 */}
      <Dialog open={doneOpen} onOpenChange={(open) => {
        setDoneOpen(open);
        if (!open) router.refresh();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">삭제되었습니다</DialogTitle>
            <DialogDescription className="text-center">
              공모전이 정상적으로 삭제되었습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => {
              setDoneOpen(false);
              router.refresh();
            }}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
