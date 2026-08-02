'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MailPlus, Search, UserPlus } from 'lucide-react';
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
 * 심사위원 배정·초대.
 *
 * 예전 이 자리에는 onClick 도 없는 "초대 보내기" 버튼과 "데모 모드입니다" 안내가 있었다.
 * 메일 발송이 없던 동안에는 가입 회원 직접 배정만 남겼고(D-018), 발송이 실제로
 * 동작하게 되면서(D-021) 미가입자 초대를 되살렸다.
 *
 * 어느 쪽이든 **이메일 정확 일치**로만 사람을 찾는다 — 주최자에게 회원 명부를 열어 줄 수 없다.
 * 조회 결과가 회원이면 즉시 배정, 아니면 초대 메일로 갈라진다.
 */
export function JudgeAssign({ contestId }: JudgeAssignProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isExternal, setIsExternal] = useState(false);
  const [found, setFound] = useState<FoundMember | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** 가입하지 않은 주소 — 배정 대신 초대 메일을 보낼 수 있다 (마이그레이션 055) */
  const [invitable, setInvitable] = useState<string | null>(null);

  const reset = () => {
    setFound(null);
    setError(null);
    setNotice(null);
    setInvitable(null);
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
        /* 미가입자는 막다른 길이 아니다 — 초대 메일로 이어진다 */
        if (data.code === 'NOT_A_MEMBER') {
          setInvitable(email.trim());
          return;
        }
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

  const invite = async () => {
    if (pending || !invitable) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/judges/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invitable, contestId, isExternal: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '초대 발송에 실패했습니다.');
        return;
      }
      setNotice(`${invitable} 로 초대 메일을 보냈습니다. 수락하면 심사위원 목록에 나타납니다.`);
      setInvitable(null);
      setEmail('');
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

      {invitable && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-300">아직 가입하지 않은 주소입니다</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {invitable} 로 초대 메일을 보내면, 가입 후 수락하는 즉시 심사위원이 됩니다.
            </p>
          </div>
          <Button type="button" className="cursor-pointer gap-1.5" disabled={pending} onClick={invite}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailPlus className="h-4 w-4" />}
            초대 메일 보내기
          </Button>
        </div>
      )}

      {notice && <p className="text-xs text-primary">{notice}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        가입한 회원은 즉시 배정되고, 가입하지 않은 사람에게는 초대 메일이 나갑니다. 초대는 14일간
        유효하며 초대받은 주소로 가입·로그인해야 수락할 수 있습니다.
      </p>
    </div>
  );
}
