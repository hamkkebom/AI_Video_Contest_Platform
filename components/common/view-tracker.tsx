"use client";

import { useEffect, useRef } from "react";

type ViewTrackerProps = {
  submissionId: string;
};

/**
 * 조회수 추적 컴포넌트
 * 마운트 시 1회 POST /api/submissions/[id]/view 호출
 * RPC(rpc_record_view)가 30분 버킷 중복 제거 처리하므로 클라이언트는 단순 호출만
 */
export function ViewTracker({ submissionId }: ViewTrackerProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // 비동기 호출 — 실패해도 사용자 경험에 영향 없음
    fetch(`/api/submissions/${submissionId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {
      // 조회수 기록 실패는 조용히 무시
    });
  }, [submissionId]);

  return null;
}
