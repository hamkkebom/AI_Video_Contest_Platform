'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquareReply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface InquiryAnswerProps {
  inquiryId: string;
  answer?: string;
  /** 비회원 문의는 플랫폼에서 답변을 보여줄 수 없다 — 회신 이메일을 함께 띄운다 */
  guestEmail?: string;
}

/**
 * 문의 답변 작성.
 *
 * 예전에는 답변을 담을 컬럼조차 없어서(053 이전) 답변이 전화·카톡 등 플랫폼 밖으로
 * 나갔고, 문의자는 자기 문의가 어떻게 처리됐는지 볼 수 없었다.
 * 회원 문의는 저장하면 /my/inquiries 에서 바로 읽힌다.
 */
export function InquiryAnswer({ inquiryId, answer, guestEmail }: InquiryAnswerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(answer ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (pending || !text.trim()) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? '답변 저장에 실패했습니다.');
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError('네트워크 오류');
    } finally {
      setPending(false);
    }
  };

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-7 cursor-pointer gap-1 px-2 text-xs"
        onClick={() => setOpen(true)}
      >
        <MessageSquareReply className="h-3 w-3" />
        {answer ? '답변 수정' : '답변'}
      </Button>
    );
  }

  return (
    <div className="w-full max-w-md space-y-2 text-left">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="문의자에게 전달할 답변을 작성하세요."
        className="text-sm"
      />
      {guestEmail && (
        <p className="text-xs text-muted-foreground">
          비회원 문의입니다. 저장해도 문의자 화면에는 뜨지 않으니{' '}
          <span className="font-medium text-foreground">{guestEmail}</span> 로 별도 회신이 필요합니다.
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" className="cursor-pointer" disabled={pending || !text.trim()} onClick={save}>
          {pending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          저장
        </Button>
        <Button size="sm" variant="ghost" className="cursor-pointer" disabled={pending} onClick={() => setOpen(false)}>
          취소
        </Button>
      </div>
    </div>
  );
}
