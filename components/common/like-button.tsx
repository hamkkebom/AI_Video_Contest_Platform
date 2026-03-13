"use client";

import { Heart } from "lucide-react";
import { useState, useCallback } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useRouter, usePathname } from "next/navigation";

type LikeButtonProps = {
  submissionId: string;
  liked?: boolean;
  initialCount?: number;
};

/**
 * 좋아요 버튼 — API 연동 버전
 * - 비로그인: 클릭 시 로그인 페이지로 리다이렉트
 * - 로그인: POST /api/submissions/[id]/like → RPC(rpc_toggle_like) 호출
 * - Optimistic UI: 즉시 토글 후 서버 응답으로 보정
 */
export function LikeButton({ submissionId, liked = false, initialCount = 0 }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = useCallback(async () => {
    // 비로그인 시 로그인 유도
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    // Optimistic UI
    const prevLiked = isLiked;
    const prevCount = count;
    setIsLiked(!prevLiked);
    setCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await fetch(`/api/submissions/${submissionId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        // 롤백
        setIsLiked(prevLiked);
        setCount(prevCount);

        if (res.status === 429) {
          // Rate limited — 조용히 무시 (사용자에게 불필요한 알림 방지)
          return;
        }
        return;
      }

      const data = await res.json() as { liked: boolean; totalLikes: number };
      // 서버 응답으로 보정
      setIsLiked(data.liked);
      setCount(data.totalLikes);
    } catch {
      // 네트워크 에러 시 롤백
      setIsLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, isLiked, count, submissionId, router, pathname]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-pressed={isLiked}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition-colors ${
        isLiked
          ? 'bg-red-50 dark:bg-red-950 text-red-600 border-red-200 dark:border-red-800'
          : 'bg-background text-foreground border-border hover:bg-muted'
      } ${isLoading ? 'opacity-60' : ''}`}
    >
      <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
      <span>{count.toLocaleString()}</span>
    </button>
  );
}
