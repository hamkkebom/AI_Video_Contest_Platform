'use client';

import type { ReactNode } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { TableRow } from '@/components/ui/table';

interface SubmissionRowProps {
  href: string;
  children: ReactNode;
}

/** 클릭하면 상세 페이지로 이동하는 테이블 행 */
export function SubmissionRow({ href, children }: SubmissionRowProps) {
  const router = useRouter();

  return (
    <TableRow
      onClick={() => router.push(href as Route)}
      className="cursor-pointer transition-colors hover:bg-muted/50"
    >
      {children}
    </TableRow>
  );
}
