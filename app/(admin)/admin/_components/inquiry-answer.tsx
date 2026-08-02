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
  /** 저장은 됐지만 메일이 못 나간 경우 — 관리자가 직접 회신해야 하므로 닫지 않고 남긴다 */
  const [deliveryWarning, setDeliveryWarning] = useState<string | null>(null);

  const save = async () => {
    if (pending || !text.trim()) return;
    setPending(true);
    setError(null);
    setDeliveryWarning(null);
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
      /* 답변은 저장됐다. 다만 비회원인데 메일이 못 나갔으면 그 사실을 반드시 알린다 */
      if (data.delivery === 'failed') {
        setDeliveryWarning(
          data.deliveryReason === 'not_configured'
            ? '답변은 저장했지만 메일 발송이 아직 설정되지 않아 보내지 못했습니다. 직접 회신해 주세요.'
            : `답변은 저장했지만 메일 발송에 실패했습니다 (${data.deliveryMessage ?? '원인 불명'}). 직접 회신해 주세요.`,
        );
        router.refresh();
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
          비회원 문의입니다. 저장하면{' '}
          <span className="font-medium text-foreground">{guestEmail}</span> 로 답변 메일이 발송됩니다.
        </p>
      )}
      {deliveryWarning && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          {deliveryWarning}
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
