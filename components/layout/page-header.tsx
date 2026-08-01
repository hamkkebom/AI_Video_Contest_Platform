import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** 영문 디스플레이 제목 (Gallery, Contests …) */
  title: string;
  /** 한국어 설명 — 이 화면이 무엇인지 한 줄로 */
  description?: ReactNode;
  /** 제목 우측 영역 (액션 버튼 등) */
  action?: ReactNode;
  /** 아래 컨트롤 바가 바로 붙는 화면은 여백을 줄인다 */
  tight?: boolean;
  className?: string;
}

/**
 * 공개 페이지 상단 헤더.
 * 예전에는 같은 헤더가 8가지 변형(pb-1/pb-2/없음, sm: 유무)으로 복붙돼 있어
 * 페이지를 옮길 때마다 제목 위치가 미세하게 흔들렸다.
 */
export function PageHeader({ title, description, action, tight = false, className }: PageHeaderProps) {
  return (
    <section className={cn('relative px-4', tight ? 'pt-20 pb-4' : 'pt-20 pb-10', className)}>
      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="bg-gradient-to-r from-foreground via-primary/80 to-foreground/70 bg-clip-text pb-1 text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="text-base text-muted-foreground sm:text-lg">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </section>
  );
}
