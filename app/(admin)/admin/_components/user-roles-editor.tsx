'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** admin 은 없다 — 관리자 승격은 UI 경로로 만들지 않는다 (마이그레이션 052) */
const ROLE_OPTIONS = [
  { value: 'participant', label: '참가자' },
  { value: 'host', label: '주최자' },
  { value: 'judge', label: '심사위원' },
];

interface UserRolesEditorProps {
  userId: string;
  roles: string[];
}

/**
 * 회원 역할 편집.
 * 주최자가 심사위원을 지정하고 운영자가 host 를 부여하는 경로다 — 멀티테넌트에 필요하다.
 * admin 은 목록에 없고 서버 RPC 도 거부한다. 관리자 계정과 본인 계정은 대상이 될 수 없다.
 */
export function UserRolesEditor({ userId, roles }: UserRolesEditorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(roles.filter((r) => r !== 'admin'));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isAdmin = roles.includes('admin');
  const dirty =
    selected.length !== roles.filter((r) => r !== 'admin').length ||
    selected.some((r) => !roles.includes(r));

  const toggle = (value: string) => {
    setSaved(false);
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value],
    );
  };

  const save = async () => {
    if (pending || selected.length === 0) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '역할 변경에 실패했습니다.');
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('네트워크 오류');
    } finally {
      setPending(false);
    }
  };

  if (isAdmin) {
    return (
      <p className="text-sm text-muted-foreground">
        관리자 계정입니다. 역할 변경은 이 화면에서 제공하지 않습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ROLE_OPTIONS.map((opt) => {
          const on = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                on
                  ? 'border-primary/40 bg-primary/10 font-medium text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {on && <Check className="h-3.5 w-3.5" />}
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" className="cursor-pointer" disabled={!dirty || pending || selected.length === 0} onClick={save}>
          {pending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
          역할 저장
        </Button>
        {selected.length === 0 && (
          <span className="text-xs text-muted-foreground">역할은 하나 이상이어야 합니다.</span>
        )}
        {saved && !dirty && <span className="text-xs text-primary">저장되었습니다.</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}
