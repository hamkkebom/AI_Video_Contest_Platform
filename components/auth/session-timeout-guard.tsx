'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LogOut } from 'lucide-react';
import { SESSION_MAX_AGE } from '@/lib/supabase/client';

/** 세션 타임아웃 (ms) */
const SESSION_TIMEOUT_MS = SESSION_MAX_AGE * 1000;
/** 만료 체크 주기 (30초) */
const CHECK_INTERVAL_MS = 30_000;
/** 활동 감지 쓰로틀 (10초) */
const ACTIVITY_THROTTLE_MS = 10_000;
/** 리다이렉트 카운트다운 (초) */
const REDIRECT_SECONDS = 10;
/** localStorage 키 — 크로스탭 활동 공유 */
const STORAGE_KEY = 'ggumple_last_activity';

/** 추적할 사용자 활동 이벤트 */
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;

/** localStorage에서 마지막 활동 시간 읽기 */
function getLastActivity(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : Date.now();
  } catch {
    return Date.now();
  }
}

/** localStorage에 마지막 활동 시간 쓰기 */
function setLastActivity(time: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(time));
  } catch {
    /* 접근 불가 시 무시 */
  }
}

/**
 * 세션 타임아웃 가드
 * - 로그인 상태에서 1시간 방치 시 자동 로그아웃
 * - 팝업 표시 후 10초 카운트다운 → 홈으로 이동
 * - localStorage로 크로스탭 활동 시간 공유 (다른 탭이 활발하면 만료 안 됨)
 */
export function SessionTimeoutGuard({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const lastThrottleRef = useRef(Date.now());
  const hasTriggeredRef = useRef(false);

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  /* 활동 감지 (쓰로틀링 + localStorage 동기화) */
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastThrottleRef.current > ACTIVITY_THROTTLE_MS) {
      setLastActivity(now);
      lastThrottleRef.current = now;
    }
  }, []);

  /* 세션 만료 체크 타이머 */
  useEffect(() => {
    if (!user) {
      /* 로그아웃 상태면 타이머 초기화 */
      hasTriggeredRef.current = false;
      return;
    }

    /* 로그인 시 활동 시간 초기화 */
    setLastActivity(Date.now());
    hasTriggeredRef.current = false;

    /* 활동 이벤트 리스너 등록 */
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    /* 주기적 만료 체크 (localStorage에서 읽어 크로스탭 반영) */
    const interval = setInterval(() => {
      if (hasTriggeredRef.current) return;

      const elapsed = Date.now() - getLastActivity();
      if (elapsed >= SESSION_TIMEOUT_MS) {
        hasTriggeredRef.current = true;
        signOut();
        setShowModal(true);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
      clearInterval(interval);
    };
  }, [user, handleActivity, signOut]);

  /* 카운트다운 + 리다이렉트 */
  useEffect(() => {
    if (!showModal) return;

    setCountdown(REDIRECT_SECONDS);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowModal(false);
          router.push('/contests/3/landing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showModal, router]);

  return (
    <>
      {children}
      <Dialog open={showModal} onOpenChange={() => { /* 닫기 불가 */ }}>
        <DialogContent
          className="max-w-sm [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="items-center text-center">
            <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
              <LogOut className="h-7 w-7 text-orange-500" />
            </div>
            <DialogTitle className="text-lg">세션이 만료되었습니다</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              장시간 활동이 없어 자동으로 로그아웃되었습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center mt-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/5 border-2 border-orange-500/20">
              <span className="text-3xl font-bold text-orange-500 tabular-nums">{countdown}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">랜딩 페이지로 이동합니다</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
