'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyPageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-2xl">&#x26A0;&#xFE0F;</span>
      </div>
      <h2 className="text-xl font-bold">페이지를 불러올 수 없습니다</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
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
