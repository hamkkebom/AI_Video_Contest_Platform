'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * 심사위원 초대 페이지 에러 바운더리
 */
export default function InviteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[invite/[token]] 에러:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold">초대 페이지를 불러올 수 없습니다</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        초대 정보를 불러오는 중 오류가 발생했습니다. 초대 링크가 올바른지 확인해주세요.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          다시 시도
        </Button>
        <Link href="/">
          <Button>홈으로</Button>
        </Link>
      </div>
    </div>
  );
}
