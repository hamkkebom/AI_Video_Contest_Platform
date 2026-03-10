'use client';

import { use, useState } from 'react';
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
import PopupForm from '../_components/popup-form';

type AdminPopupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminPopupDetailPage({ params }: AdminPopupDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/popups/${id}`, {
        method: 'DELETE',
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? '팝업 삭제에 실패했습니다.');
      }

      setConfirmOpen(false);
      router.replace('/admin/popups');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete popup:', error);
      setErrorMessage(error instanceof Error ? error.message : '팝업 삭제에 실패했습니다.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => setConfirmOpen(true)}
        >
          삭제
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <PopupForm mode="edit" popupId={id} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>팝업을 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>삭제된 팝업은 복구할 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              취소
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
