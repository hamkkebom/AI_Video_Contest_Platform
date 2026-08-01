'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleRowActionsProps {
  articleId: string;
  isPublished: boolean;
  title: string;
}

/**
 * 아티클 행 액션 — 발행 토글 / 삭제.
 * 예전에는 보기·수정·삭제 버튼이 있었지만 셋 다 아무 동작이 없었고,
 * DB 에도 관리자 쓰기 정책이 없어 애초에 불가능했다. (마이그레이션 050 이 그 경로를 연다)
 */
export function ArticleRowActions({ articleId, isPublished, title }: ArticleRowActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<'publish' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = async (kind: 'publish' | 'delete') => {
    if (pending) return;
    if (kind === 'delete' && !window.confirm(`"${title}" 아티클을 삭제할까요?\n되돌릴 수 없습니다.`)) return;

    setPending(kind);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: kind === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        ...(kind === 'publish'
          ? { body: JSON.stringify({ isPublished: !isPublished }) }
          : {}),
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
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 cursor-pointer gap-1 px-2 text-xs"
          disabled={pending !== null}
          onClick={() => call('publish')}
        >
          {pending === 'publish' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : isPublished ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
          {isPublished ? '비공개' : '발행'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 cursor-pointer gap-1 px-2 text-xs text-destructive hover:text-destructive"
          disabled={pending !== null}
          onClick={() => call('delete')}
        >
          {pending === 'delete' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          삭제
        </Button>
      </div>
      {error && <span className="text-right text-xs text-destructive">{error}</span>}
    </div>
  );
}
