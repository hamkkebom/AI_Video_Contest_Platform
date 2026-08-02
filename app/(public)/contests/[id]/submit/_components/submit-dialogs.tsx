'use client';

import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  FileVideo,
  ImageIcon,
  Loader2,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** 업로드 진행 단계 — 진행 표시와 handleSubmit 이 같은 값을 공유한다 */
export type UploadStep = 'preparing' | 'video' | 'thumbnail' | 'proof-images' | 'submission' | null;

/** 실패 종류 — 종류마다 사용자에게 줄 다음 행동이 다르다 */
export type SubmitErrorType =
  | 'duplicate'
  | 'contest_closed'
  | 'deadline_passed'
  | 'auth_expired'
  | 'general'
  | null;

const STEPS = ['preparing', 'video', 'thumbnail', 'proof-images', 'submission'] as const;

interface SubmitDialogsProps {
  contestId: string;
  /* 유효성 검사 실패 팝업 */
  showValidationPopup: boolean;
  onValidationPopupChange: (open: boolean) => void;
  fieldErrors: Record<string, string>;
  /* 진행 / 결과 */
  uploadStep: UploadStep;
  uploadProgress: number;
  submitted: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  errorType: SubmitErrorType;
  videoFile: File | null;
  thumbnailFile: File | null;
  /* 성공 문구 분기 */
  isEditMode: boolean;
  isBonusOnly: boolean;
  hasBonusConfigs: boolean;
  submissionTitle: string;
  /* 상태 초기화는 페이지가 소유한다 — 여기서는 언제 부를지만 안다 */
  onSuccessConfirm: () => void;
  onErrorDismiss: () => void;
  /* 제출 한도 초과 */
  alreadySubmitted: boolean;
  maxSubmissionsPerUser: number;
}

/**
 * 제출 화면의 다이얼로그 묶음 — 유효성 검사 실패, 업로드 진행/성공/실패, 제출 한도 초과.
 *
 * page.tsx 에서 분리했다. 이 세 다이얼로그는 폼 입력과 무관하게 "제출 결과"만 다루므로
 * 폼 상태를 통째로 받을 필요가 없고, 초기화 동작은 콜백 두 개로 페이지에 남겨 둔다.
 */
export function SubmitDialogs({
  contestId,
  showValidationPopup,
  onValidationPopupChange,
  fieldErrors,
  uploadStep,
  uploadProgress,
  submitted,
  isSubmitting,
  submitError,
  errorType,
  videoFile,
  thumbnailFile,
  isEditMode,
  isBonusOnly,
  hasBonusConfigs,
  submissionTitle,
  onSuccessConfirm,
  onErrorDismiss,
  alreadySubmitted,
  maxSubmissionsPerUser,
}: SubmitDialogsProps) {
  const router = useRouter();

  const confirmSuccess = () => {
    onSuccessConfirm();
    router.push('/my/submissions');
  };

  return (
    <>
      {/* ===== 유효성 검사 실패 안내 팝업 ===== */}
      <Dialog open={showValidationPopup} onOpenChange={onValidationPopupChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-brand" />
            </div>
            <DialogTitle className="text-center">필수 항목을 확인해주세요</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              다음 항목이 입력되지 않았습니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {Object.values(fieldErrors).map((msg) => (
              <div key={msg} className="flex items-center gap-2 text-sm text-destructive dark:text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full cursor-pointer" onClick={() => onValidationPopupChange(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 업로드 진행 / 성공 / 실패 통합 Dialog ===== */}
      <Dialog
        open={uploadStep !== null || submitted}
        onOpenChange={(open) => {
          /* 업로드 중에는 닫히지 않는다 — 창을 닫으면 업로드가 끊긴다 */
          if (open || isSubmitting) return;
          if (submitted) confirmSuccess();
          else onErrorDismiss();
        }}
      >
        <DialogContent
          className={cn('sm:max-w-md', isSubmitting && '[&>button]:hidden')}
          onPointerDownOutside={(e) => { if (isSubmitting) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (isSubmitting) e.preventDefault(); }}
        >
          {submitted ? (
            <>
              <DialogHeader>
                <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <DialogTitle className="text-center">
                  {isBonusOnly ? '가산점 인증이 저장되었습니다!' : isEditMode ? '수정이 완료되었습니다!' : '영상이 제출되었습니다!'}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {isBonusOnly
                    ? '가산점 인증 정보가 성공적으로 수정되었습니다.'
                    : isEditMode
                    ? `"${submissionTitle}" 출품작이 성공적으로 수정되었습니다.`
                    : `"${submissionTitle}" 영상이 성공적으로 접수되었습니다. 검수 완료 후 공모전 출품작 목록에 표시됩니다.`}
                  {!isBonusOnly && hasBonusConfigs && ' 가산점 인증은 마이페이지에서 추후 수정할 수 있습니다.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                {(isEditMode
                  ? ['출품작 정보 수정']
                  : ['영상 업로드', '썸네일 업로드', '출품작 등록']
                ).map((label) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{label} 완료</span>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer w-full" onClick={confirmSuccess}>확인</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-lg">
                  {submitError ? '제출 실패' : '영상 제출 중'}
                </DialogTitle>
                <DialogDescription className="text-center text-sm text-muted-foreground">
                  {submitError ? '아래 단계에서 오류가 발생했습니다.' : '창을 닫지 마세요. 영상 크기에 따라 수 분이 걸릴 수 있습니다.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {([
                  { key: 'preparing', label: '업로드 준비', icon: Loader2, showProgress: false, file: null },
                  { key: 'video', label: '영상 업로드', icon: FileVideo, showProgress: true, file: videoFile },
                  { key: 'thumbnail', label: '썸네일 업로드', icon: ImageIcon, showProgress: true, file: thumbnailFile },
                  { key: 'proof-images', label: '인증 이미지 업로드', icon: Shield, showProgress: false, file: null },
                  { key: 'submission', label: '출품작 등록', icon: CheckCircle2, showProgress: false, file: null },
                ] as const).map((step) => {
                  const currentIdx = uploadStep ? STEPS.indexOf(uploadStep) : -1;
                  const stepIdx = STEPS.indexOf(step.key);
                  const isActive = uploadStep === step.key;
                  const isCompleted = currentIdx > stepIdx;
                  const isPending = currentIdx < stepIdx;
                  const isFailed = isActive && !!submitError;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                          isCompleted && 'bg-green-500/10 text-green-500',
                          isActive && !isFailed && 'bg-primary/10 text-primary',
                          isFailed && 'bg-destructive/10 text-destructive',
                          isPending && 'bg-muted text-muted-foreground',
                        )}>
                          {isCompleted ? <CheckCircle2 className="h-5 w-5" />
                            : isFailed ? <AlertCircle className="h-5 w-5" />
                              : isActive ? <Loader2 className="h-5 w-5 animate-spin" />
                                : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium transition-colors',
                            isCompleted && 'text-green-600 dark:text-green-400',
                            isActive && !isFailed && 'text-foreground',
                            isFailed && 'text-destructive dark:text-destructive',
                            isPending && 'text-muted-foreground',
                          )}>
                            {step.label}{isCompleted && ' ✓'}{isFailed && ' ✕'}
                          </p>
                          {isActive && step.file && !isFailed && (
                            <p className="text-xs text-muted-foreground truncate">
                              {step.file.name} ({(step.file.size / 1024 / 1024).toFixed(1)}MB)
                            </p>
                          )}
                          {isActive && step.key === 'video' && uploadProgress >= 100 && !isFailed && (
                            <p className="text-xs text-brand animate-pulse">서버에서 처리 중입니다. 잠시 기다려주세요...</p>
                          )}
                        </div>
                        {isActive && step.showProgress && !isFailed && (
                          <span className="text-sm font-mono font-semibold text-primary dark:text-primary tabular-nums">{uploadProgress}%</span>
                        )}
                      </div>
                      {isActive && step.showProgress && !isFailed && (
                        <div className="ml-11 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {submitError && (
                <>
                  {errorType === 'duplicate' ? (
                    /* 중복 제출 */
                    <>
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-brand" />
                      </div>
                      <p className="text-center font-semibold">이미 제출한 공모전입니다</p>
                      <p className="text-center text-sm text-muted-foreground">이 공모전에는 이미 영상을 제출하셨습니다. 추가 제출은 불가합니다.</p>
                      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
                        <Button variant="outline" className="cursor-pointer flex-1" onClick={() => router.push(`/contests/${contestId}`)}>확인</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer flex-1" onClick={() => router.push('/my/submissions')}>내 출품작 보기</Button>
                      </DialogFooter>
                    </>
                  ) : errorType === 'contest_closed' ? (
                    /* 공모전 취소/종료 */
                    <>
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      </div>
                      <p className="text-center font-semibold">공모전이 종료되었습니다</p>
                      <p className="text-center text-sm text-muted-foreground">이 공모전은 현재 접수 기간이 아닙니다.</p>
                      <DialogFooter>
                        <Button variant="outline" className="cursor-pointer w-full" onClick={() => router.push(`/contests/${contestId}`)}>공모전으로 돌아가기</Button>
                      </DialogFooter>
                    </>
                  ) : errorType === 'deadline_passed' ? (
                    /* 마감 초과 */
                    <>
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      </div>
                      <p className="text-center font-semibold">접수 마감일이 지났습니다</p>
                      <p className="text-center text-sm text-muted-foreground">공모전 접수 마감일이 지나 제출이 완료되지 않았습니다.</p>
                      <DialogFooter>
                        <Button variant="outline" className="cursor-pointer w-full" onClick={() => router.push(`/contests/${contestId}`)}>공모전으로 돌아가기</Button>
                      </DialogFooter>
                    </>
                  ) : errorType === 'auth_expired' ? (
                    /* 세션 만료 */
                    <>
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-brand" />
                      </div>
                      <p className="text-center font-semibold">로그인이 필요합니다</p>
                      <p className="text-center text-sm text-muted-foreground">세션이 만료되었습니다. 다시 로그인해 주세요.</p>
                      <DialogFooter>
                        <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer w-full" onClick={() => router.push(`/login?redirectTo=/contests/${contestId}/submit`)}>로그인하기</Button>
                      </DialogFooter>
                    </>
                  ) : (
                    /* 일반 오류 — 사용자 친화적 안내 */
                    <>
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-line leading-relaxed">
                        {submitError}
                      </div>
                      <DialogFooter className="flex-col gap-2">
                        <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer w-full" onClick={() => window.location.reload()}>페이지 새로고침</Button>
                        <Button variant="outline" className="cursor-pointer w-full" onClick={onErrorDismiss}>닫기</Button>
                      </DialogFooter>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 이미 제출한 경우 안내 Dialog */}
      <Dialog open={alreadySubmitted} onOpenChange={(open) => { if (!open) router.push(`/contests/${contestId}`); }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-brand" />
            </div>
            <DialogTitle className="text-center">이미 제출한 공모전입니다</DialogTitle>
            <DialogDescription className="text-center">
              이 공모전의 최대 출품 가능 수({maxSubmissionsPerUser}개)를 초과하여
              더 이상 제출할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button variant="outline" className="cursor-pointer flex-1" onClick={() => router.push(`/contests/${contestId}`)}>확인</Button>
            <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer flex-1" onClick={() => router.push('/my/submissions')}>내 출품작 보기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
