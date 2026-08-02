'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JudgeRemoveProps {
  judgeId: string;
  judgeName: string;
}

/**
 * 심사위원 해제.
 * 이미 채점한 심사위원은 서버(RPC)가 409 로 거부한다 — 점수를 고아로 만들지 않기 위해서다.
 */
export function JudgeRemove({ judgeId, judgeName }: JudgeRemoveProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (pending) return;
    if (!window.confirm(`${judgeName} 님을 심사위원에서 해제할까요?`)) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/judges?judgeId=${judgeId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '해제에 실패했습니다.');
        return;
      }
      router.refresh();
    } catch {
      setError('네트워크 오류');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        type="button"
        className="cursor-pointer gap-1 text-destructive hover:text-destructive"
        disabled={pending}
        onClick={remove}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-3.5 w-3.5" />}
        해제
      </Button>
      {error && <span className="max-w-[16rem] text-right text-xs text-destructive">{error}</span>}
    </div>
  );
}
