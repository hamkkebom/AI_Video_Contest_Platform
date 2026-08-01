'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldBan, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserStatusActionsProps {
  userId: string;
  status: string;
  name: string;
}

/**
 * 회원 정지 / 정지 해제.
 * profiles 는 "본인만 수정" 정책뿐이라 관리자가 직접 UPDATE 할 수 없고,
 * status 한 컬럼만 바꾸는 RPC 를 거친다 — roles 를 못 건드리게 하기 위해서다. (마이그레이션 050)
 */
export function UserStatusActions({ userId, status, name }: UserStatusActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suspended = status === 'suspended';
  const next = suspended ? 'active' : 'suspended';

  const change = async () => {
    if (pending) return;
    const label = suspended ? '정지 해제' : '정지';
    if (!window.confirm(`${name} 계정을 ${label} 처리할까요?`)) return;

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '처리에 실패했습니다.');
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
        variant="ghost"
        className={`h-7 cursor-pointer gap-1 px-2 text-xs ${
          suspended ? 'text-primary hover:text-primary' : 'text-destructive hover:text-destructive'
        }`}
        disabled={pending}
        onClick={change}
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : suspended ? (
          <ShieldCheck className="h-3 w-3" />
        ) : (
          <ShieldBan className="h-3 w-3" />
        )}
        {suspended ? '정지 해제' : '정지'}
      </Button>
      {error && <span className="text-right text-xs text-destructive">{error}</span>}
    </div>
  );
}
