'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

/**
 * 현재 유저의 특정 공모전 제출 여부를 조회하는 hook
 * 로그인 상태에서만 DB 조회 수행, 비로그인 시 hasSubmitted=false
 */
export function useSubmissionStatus(contestId: string) {
  const { user, loading: authLoading } = useAuth();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* 인증 로딩 중이면 대기 */
    if (authLoading) return;

    /* 비로그인 → 제출 여부 체크 불필요 */
    if (!user) {
      setHasSubmitted(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      try {
        const supabase = createBrowserClient();
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { count } = await supabase
          .from('submissions')
          .select('id', { count: 'exact', head: true })
          .eq('contest_id', contestId)
          .eq('user_id', user.id);

        /* maxSubmissionsPerUser는 현재 1로 고정된 공모전이므로 1개 이상이면 제출 완료 */
        setHasSubmitted((count ?? 0) >= 1);
      } catch {
        /* 조회 실패 시 안전하게 false 유지 — submit 페이지/API에서 이중 검증 */
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [contestId, user, authLoading]);

  return { hasSubmitted, loading: loading || authLoading, user };
}
