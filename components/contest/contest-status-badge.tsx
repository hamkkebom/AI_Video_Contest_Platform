import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { publicContestStatusLabel } from '@/config/constants';

/** 상태별 배경색 — 색 값 자체는 app/globals.css 의 --status-* 토큰이 단일 소스 */
const STATUS_BG: Record<string, string> = {
  draft: 'bg-status-draft',
  open: 'bg-status-open',
  closed: 'bg-status-closed',
  judging: 'bg-status-judging',
  completed: 'bg-status-completed',
};

const STATUS_SOFT: Record<string, string> = {
  draft: 'bg-status-draft/10 text-status-draft',
  open: 'bg-status-open/10 text-status-open',
  closed: 'bg-status-closed/10 text-status-closed',
  judging: 'bg-status-judging/10 text-status-judging',
  completed: 'bg-status-completed/10 text-status-completed',
};

interface ContestStatusBadgeProps {
  /** 내부 상태값 (draft/open/closed/judging/completed) */
  status: string;
  /**
   * solid   — 흰 글자 + 진한 상태색. 일반 배경 위
   * soft    — 연한 상태색 배경 + 상태색 글자. 카드 안쪽
   * overlay — 반투명 + backdrop blur. 포스터 이미지 위
   */
  variant?: 'solid' | 'soft' | 'overlay';
  /** 결과발표에 트로피 아이콘을 붙일지 */
  withIcon?: boolean;
  className?: string;
}

/**
 * 공모전 상태 뱃지 — 라벨은 config/constants.ts, 색은 globals.css 토큰.
 * 예전에는 홈·목록·주최자·상세가 각자 하드코딩한 팔레트 색으로 뱃지를 그려
 * 같은 상태가 화면마다 다른 색으로 보일 수 있었다.
 */
export function ContestStatusBadge({
  status,
  variant = 'solid',
  withIcon = false,
  className,
}: ContestStatusBadgeProps) {
  const label = publicContestStatusLabel(status);
  const showIcon = withIcon && status === 'completed';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full text-xs font-bold whitespace-nowrap',
        variant === 'overlay'
          ? cn('px-3 py-1.5 text-white border border-white/20 shadow-lg backdrop-blur-md', STATUS_BG[status] ?? STATUS_BG.completed, 'opacity-90')
          : variant === 'soft'
            ? cn('px-2.5 py-1', STATUS_SOFT[status] ?? STATUS_SOFT.completed)
            : cn('px-2.5 py-1 text-white', STATUS_BG[status] ?? STATUS_BG.completed),
        className,
      )}
    >
      {showIcon && <Trophy className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
