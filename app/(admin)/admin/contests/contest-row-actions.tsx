'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

type ContestRowActionsProps = {
  contestId: string;
};

export default function ContestRowActions({ contestId }: ContestRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    const confirmed = window.confirm('정말 이 공모전을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.');
    if (!confirmed) return;

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

        // 팝업 알림 후 리스트 갱신
        window.alert('공모전이 삭제되었습니다.');
        router.refresh();
      } catch (deleteError) {
        console.error('Failed to delete contest:', deleteError);
        setError(deleteError instanceof Error ? deleteError.message : '공모전 삭제에 실패했습니다.');
      }
    });
  };

  return (
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
          onClick={handleDelete}
        >
          {isPending ? '삭제 중...' : '삭제'}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
