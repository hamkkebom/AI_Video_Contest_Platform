'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyStatusActionsProps {
  companyId: string;
  status: string;
}

/**
 * 기업 승인/반려 버튼 — PATCH /api/admin/companies/[id]
 * 승인 시 서버 RPC가 owner 에게 host 역할을 함께 부여한다. (D-015)
 */
export function CompanyStatusActions({ companyId, status }: CompanyStatusActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStatus = async (next: 'approved' | 'rejected') => {
    if (pending) return;
    const label = next === 'approved' ? '승인' : '반려';
    if (!window.confirm(`이 기업을 ${label} 처리할까요?${next === 'approved' ? '\n승인 시 owner에게 주최자 권한이 부여됩니다.' : ''}`)) return;
    setPending(next);
    setError(null);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '처리에 실패했습니다.');
        return;
      }
      router.refresh();
    } catch {
      setError('네트워크 오류');
    } finally {
      setPending(null);
    }
  };

  if (status === 'approved') {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs cursor-pointer text-destructive hover:text-destructive"
        disabled={pending !== null}
        onClick={() => setStatus('rejected')}
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />} 승인 취소
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button
        size="sm"
        className="h-7 px-2 text-xs cursor-pointer gap-1"
        disabled={pending !== null}
        onClick={() => setStatus('approved')}
      >
        {pending === 'approved' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} 승인
      </Button>
      {status !== 'rejected' && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs cursor-pointer gap-1 text-destructive hover:text-destructive"
          disabled={pending !== null}
          onClick={() => setStatus('rejected')}
        >
          {pending === 'rejected' ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />} 반려
        </Button>
      )}
    </div>
  );
}
