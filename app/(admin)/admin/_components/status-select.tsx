'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface StatusOption {
  value: string;
  label: string;
}

interface StatusSelectProps {
  /** PATCH 대상 — 예: /api/admin/agency-requests/12 */
  endpoint: string;
  current: string;
  options: StatusOption[];
}

/**
 * 관리자 목록의 상태 변경 드롭다운.
 *
 * 이 화면들은 서버 컴포넌트라 onClick 을 달 수 없었고, 그래서 "상태 변경" 버튼이
 * 아무 동작 없는 장식으로 남아 있었다. 실제 처리는 이 클라이언트 조각이 맡는다.
 */
export function StatusSelect({ endpoint, current, options }: StatusSelectProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLabel = options.find((o) => o.value === current)?.label ?? current;

  const change = async (next: string) => {
    if (pending || next === current) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '변경 실패');
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
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 cursor-pointer gap-1 px-2 text-xs" disabled={pending}>
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {currentLabel}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              className="cursor-pointer text-sm"
              onClick={() => change(opt.value)}
            >
              <span className="flex-1">{opt.label}</span>
              {opt.value === current && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
