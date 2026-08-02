'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/supabase/auth-context';

interface AcceptInviteProps {
  token: string;
  contestTitle: string;
  /** 초대받은 주소 (가려진 형태) — 어느 계정으로 로그인해야 하는지 알려준다 */
  maskedEmail: string;
}

/**
 * 심사위원 초대 수락.
 *
 * 예전 `/invite/[token]` 은 수락 버튼이 아무것도 저장하지 않으면서 "등록되었습니다"라고
 * 표시하던 목업이었고, 그래서 삭제했다(D-018). 이번에는 실제로 저장한다 —
 * 서버가 토큰과 계정 이메일이 함께 맞는지 확인한 뒤에만 심사위원으로 등록한다.
 */
export function AcceptInvite({ token, contestTitle, maskedEmail }: AcceptInviteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const invitePath = `/judge-invite/${token}`;

  const accept = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/judges/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '수락에 실패했습니다.');
        return;
      }
      setAccepted(true);
      router.refresh();
    } catch {
      setError('네트워크 오류');
    } finally {
      setPending(false);
    }
  };

  if (accepted) {
    return (
      <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <div className="space-y-1">
          <p className="font-semibold">심사위원으로 등록되었습니다</p>
          <p className="text-sm text-muted-foreground">
            {contestTitle} 의 출품작을 심사 화면에서 확인할 수 있습니다.
          </p>
        </div>
        <Link href="/judging">
          <Button className="cursor-pointer">심사 화면으로</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        확인 중…
      </div>
    );
  }

  /* 아직 계정이 없거나 로그아웃 상태 — 가입·로그인 후 이 화면으로 돌아온다 */
  if (!user) {
    return (
      <div className="space-y-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">먼저 로그인해 주세요</p>
          <p className="text-sm text-muted-foreground">
            초대받으신 <span className="font-medium text-foreground">{maskedEmail}</span> 주소로
            가입·로그인해야 수락할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/login?redirectTo=${encodeURIComponent(invitePath)}` as Route}>
            <Button className="cursor-pointer">로그인</Button>
          </Link>
          <Link href={`/signup?redirectTo=${encodeURIComponent(invitePath)}` as Route}>
            <Button variant="outline" className="cursor-pointer">회원가입</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full cursor-pointer" disabled={pending} onClick={accept}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        초대 수락하기
      </Button>
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground">
        수락하면 심사위원 권한이 부여되고 배정된 출품작을 심사할 수 있습니다.
      </p>
    </div>
  );
}
