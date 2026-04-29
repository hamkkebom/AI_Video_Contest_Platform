'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface VisibilityToggleProps {
  submissionId: string;
  initialIsPublic: boolean;
}

/**
 * 출품작 갤러리 공개/비공개 토글
 * 관리자 출품작 목록에서 사용
 * 클릭 시 PATCH /api/admin/submissions/[id]/visibility 호출 → 캐시 무효화 후 router.refresh
 */
export function VisibilityToggle({ submissionId, initialIsPublic }: VisibilityToggleProps) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const handleToggle = async (event: React.MouseEvent) => {
    /* 카드 전체가 Link로 감싸져 있어 이벤트 전파를 차단 */
    event.preventDefault();
    event.stopPropagation();

    if (submitting) return;

    const nextValue = !isPublic;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: nextValue }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? '공개 여부 변경에 실패했습니다.');
      }

      setIsPublic(nextValue);
      /* 페이지 SSR 데이터 갱신 (다른 행의 카운트 등 동기화) */
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      alert(error instanceof Error ? error.message : '공개 여부 변경에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const label = isPublic ? '공개' : '비공개';
  const Icon = isPublic ? Eye : EyeOff;
  const className = isPublic
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500 hover:text-white dark:text-emerald-300 dark:hover:text-white'
    : 'border-slate-400/40 bg-slate-400/10 text-slate-600 hover:bg-slate-500 hover:text-white dark:text-slate-300 dark:hover:text-white';

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={submitting}
      title={isPublic ? '클릭하면 갤러리에서 숨김' : '클릭하면 갤러리에 노출'}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {submitting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {label}
    </button>
  );
}
