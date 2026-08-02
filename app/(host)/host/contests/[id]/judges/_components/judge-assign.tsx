'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JudgeAssignProps {
  contestId: string;
}

interface FoundMember {
  id: string;
  name: string;
  email: string;
}

/**
 * 심사위원 배정.
 *
 * 예전 이 자리에는 onClick 도 없는 "초대 보내기" 버튼과 "데모 모드입니다" 안내가 있었다.
 * 이메일 발송을 도입하지 않기로 했으므로(D-017) 초대 대신 **가입한 회원을 직접 배정**한다.
 * 이메일 정확 일치로만 사람을 찾는다 — 주최자에게 회원 명부를 열어 줄 수는 없다.
 */
export function JudgeAssign({ contestId }: JudgeAssignProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isExternal, setIsExternal] = useState(false);
  const [found, setFound] = useState<FoundMember | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reset = () => {
    setFound(null);
    setError(null);
    setNotice(null);
  };

  const lookup = async () => {
    if (pending || !email.trim()) return;
    setPending(true);
    reset();
    try {
      const res = await fetch('/api/judges/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '회원 조회에 실패했습니다.');
        return;
      }
      setFound({ id: data.member.id, name: data.member.name, email: email.trim() });
    } catch {
      setError('네트워크 오류');
    } finally {
      setPending(false);
    }
  };

  const assign = async () => {
    if (pending || !found) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/judges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: found.id, contestId, isExternal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '심사위원 배정에 실패했습니다.');
        return;
      }
      setNotice(`${found.name} 님을 심사위원으로 배정했습니다.`);
      setFound(null);
      setEmail('');
      setIsExternal(false);
      router.refresh();
    } catch {
      setError('네트워크 오류');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="judge-assign-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            reset();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void lookup();
            }
          }}
          placeholder="judge@example.com"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer gap-1.5 sm:w-auto"
          disabled={pending || !email.trim()}
          onClick={lookup}
        >
          {pending && !found ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          회원 확인
        </Button>
      </div>

      {found && (
        <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-medium">{found.name}</p>
            <p className="text-xs text-muted-foreground">{found.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={isExternal}
                onChange={(e) => setIsExternal(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer accent-primary"
              />
              외부 심사위원
            </Label>
            <Button type="button" className="cursor-pointer gap-1.5" disabled={pending} onClick={assign}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              배정
            </Button>
          </div>
        </div>
      )}

      {notice && <p className="text-xs text-primary">{notice}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        배정 즉시 해당 회원에게 심사 권한이 부여되고 심사 화면이 열립니다. 아직 가입하지 않은 사람은
        배정할 수 없으니 먼저 회원가입을 안내해주세요.
      </p>
    </div>
  );
}
