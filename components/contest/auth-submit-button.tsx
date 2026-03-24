'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { useSubmissionStatus } from '@/hooks/useSubmissionStatus';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthSubmitButtonProps {
  contestId: string;
  /** 버튼 크기 변형: default(상세페이지), sm(목록 리스트뷰), card(목록 카드뷰) */
  variant?: 'default' | 'sm' | 'card' | 'hero';
}

/**
 * 로그인 여부 + 제출 여부 확인 후 접수 페이지 또는 로그인 페이지로 이동
 * 이미 제출한 경우 Dialog 팝업으로 안내
 */
export function AuthSubmitButton({ contestId, variant = 'default' }: AuthSubmitButtonProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { hasSubmitted, loading: statusLoading } = useSubmissionStatus(contestId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  /* 상태 조회 완료 시 보류 중인 클릭 처리 */
  useEffect(() => {
    if (pendingSubmit && !statusLoading) {
      setPendingSubmit(false);
      if (hasSubmitted) {
        setDialogOpen(true);
      } else {
        router.push(`/contests/${contestId}/submit`);
      }
    }
  }, [pendingSubmit, statusLoading, hasSubmitted, contestId, router]);

  /* 확인 중 3초 초과 시 제출 페이지로 바로 이동 (hang 방지) */
  useEffect(() => {
    if (!pendingSubmit) return;
    const fallback = setTimeout(() => {
      setPendingSubmit(false);
      router.push(`/contests/${contestId}/submit`);
    }, 3000);
    return () => clearTimeout(fallback);
  }, [pendingSubmit, contestId, router]);

  const handleClick = () => {
    /* 인증 로딩 중이면 무시 */
    if (loading) return;

    if (!user) {
      /* 미로그인 → 로그인 페이지 (접수 페이지로 리다이렉트) */
      router.push(`/login?redirectTo=/contests/${contestId}/submit`);
      return;
    }

    /* 제출 여부 쿼리 완료 + 이미 제출 → Dialog 표시 */
    if (!statusLoading && hasSubmitted) {
      setDialogOpen(true);
      return;
    }

    /* 쿼리 완료 + 미제출 → 바로 이동 */
    if (!statusLoading && !hasSubmitted) {
      router.push(`/contests/${contestId}/submit`);
      return;
    }

    /* 쿼리 미완료 → 대기 (3초 후 자동 이동) */
    setPendingSubmit(true);
  };

  /* variant별 스타일 */
  const buttonClass = {
    default: 'group/btn inline-flex items-center gap-2 px-8 py-2.5 rounded-lg border-2 border-orange-500 text-orange-500 font-semibold overflow-hidden transition-all duration-300 cursor-pointer relative',
    sm: 'group/btn relative inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-lg border-2 border-orange-500 text-orange-500 text-xs sm:text-sm font-semibold overflow-hidden transition-all duration-300 cursor-pointer',
    card: 'group/btn relative w-full py-2 rounded-lg border-2 border-orange-500 text-orange-500 text-sm font-semibold flex items-center justify-center gap-1.5 overflow-hidden transition-all duration-300 cursor-pointer',
    hero: 'group/btn relative w-full py-3.5 rounded-xl bg-orange-500 text-white text-lg font-bold flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 cursor-pointer hover:bg-orange-600 hover:scale-[1.02] shadow-lg hover:shadow-orange-500/30 hover:shadow-xl active:scale-[0.98]',
  }[variant];

  const iconClass = {
    default: 'relative z-10 h-4 w-4 group-hover/btn:text-white transition-colors',
    sm: 'relative z-10 h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover/btn:text-white transition-colors',
    card: 'relative z-10 h-3.5 w-3.5 group-hover/btn:text-white transition-colors',
    hero: 'relative z-10 h-5 w-5',
  }[variant];

  const label = variant === 'card' ? '영상 제출' : '영상 제출하기';

  return (
    <>
      <button type="button" onClick={handleClick} disabled={pendingSubmit} className={buttonClass}>
        {variant !== 'hero' && <span className="absolute inset-0 bg-orange-500 scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />}
        {pendingSubmit ? (
          <Loader2 className={`${iconClass} animate-spin`} />
        ) : (
          <Upload className={iconClass} />
        )}
        <span className="relative z-10 group-hover/btn:text-white transition-colors">
          {pendingSubmit ? '확인 중...' : label}
        </span>
      </button>

      {/* 이미 제출한 경우 안내 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            <DialogTitle className="text-center">이미 제출한 공모전입니다</DialogTitle>
            <DialogDescription className="text-center">
              이 공모전에는 이미 영상을 제출하셨습니다. 추가 제출은 불가합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="cursor-pointer flex-1"
              onClick={() => setDialogOpen(false)}
            >
              확인
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer flex-1"
              onClick={() => { setDialogOpen(false); router.push('/my/submissions'); }}
            >
              내 출품작 보기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
