'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 페이지 이동 추적 컴포넌트
 * usePathname 변화를 감지하여 /api/log에 page_view 기록
 *
 * - 최초 마운트 시 현재 페이지 기록
 * - 이후 pathname이 바뀔 때마다 기록
 * - 같은 경로 중복 전송 방지
 */
export function ActivityTracker() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // 같은 경로면 중복 전송 방지
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    // 비동기 전송 (실패해도 사용자 경험에 영향 없음)
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'page_view',
        metadata: { path: pathname },
      }),
    }).catch(() => {
      // 로그 기록 실패는 무시
    });
  }, [pathname]);

  return null;
}
