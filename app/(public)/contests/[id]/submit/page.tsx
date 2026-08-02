'use client';

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Film, Info, Upload } from 'lucide-react';

import type { Contest } from '@/lib/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { refreshAccessToken } from '@/lib/supabase/refresh-token';
import {
  EXT_TO_MIME,
  MAX_PROOF_IMAGE_SIZE_BYTES,
  MAX_THUMBNAIL_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  type BonusFormEntry,
  type FormState,
} from './_lib/form-types';
import {
  buildStoragePath,
  reportUploadError,
  requestVideoUploadUrl,
  uploadFileToStorage,
  uploadVideoToStream,
  userFriendlyError,
} from './_lib/uploads';
import { SubmitDialogs, type SubmitErrorType, type UploadStep } from './_components/submit-dialogs';
import { StepVideoInfo } from './_components/step-video-info';
import { StepConsent } from './_components/step-consent';
import { StepBonus } from './_components/step-bonus';
import { StepFileUpload } from './_components/step-file-upload';
import { CHAT_AI_TOOLS, IMAGE_AI_TOOLS, VIDEO_AI_TOOLS } from '@/config/constants';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/supabase/auth-context';

/**
 * 공모전 영상 제출 페이지
 * ApplySection 기준으로 통합된 접수 폼
 */
export default function ContestSubmitPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contestId = params.id as string;
  const editSubmissionId = searchParams.get('edit'); // 수정 모드: 기존 출품작 ID
  const resubmitSubmissionId = searchParams.get('resubmit'); // 재제출 모드: 영상만 재업로드
  const isBonusOnly = searchParams.get('bonusOnly') === 'true'; // 가산점 전용 수정 모드
  const isEditMode = !!editSubmissionId;
  const isResubmitMode = !!resubmitSubmissionId;
  const router = useRouter();
  const { session: authSession } = useAuth();
  const currentUserId = authSession?.user?.id;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<{
    videoUrl: string;
    thumbnailUrl: string;
  } | null>(null);
  const [errorType, setErrorType] = useState<SubmitErrorType>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  /* 제출 폼 상태 */
  const [form, setForm] = useState<FormState>({
    submitterName: '',
    submitterPhone: '',
    title: '',
    description: '',
    chatAi: [],
    imageAi: [],
    videoAi: [],
    productionProcess: '',
    agree: false,
  });

  /* 파일 업로드 상태 */
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  /* 페이지 로드 시 자동 갱신 제거 — AuthContext와 refresh_token 충돌 방지
     토큰 갱신은 제출 버튼 클릭 시에만 수행 */

  /* #10: 업로드 중 탭 닫기 경고 */
  useEffect(() => {
    if (!isSubmitting) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isSubmitting]);

  /* 가산점 아코디언 열림 상태 */
  const [openBonuses, setOpenBonuses] = useState<string[]>([]);
  /* 가산점 폼 데이터 (bonusConfigId → 값) */
  const [bonusForms, setBonusForms] = useState<Record<string, BonusFormEntry>>({});
  /* 수정 모드: 서버에서 불러온 기존 가산점 configId 목록 */
  const [savedBonusConfigIds, setSavedBonusConfigIds] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const initialFormRef = useRef<FormState | null>(null);
  const initialBonusFormsRef = useRef<Record<string, BonusFormEntry> | null>(null);


  useEffect(() => {
    const load = async () => {
      /* 공모전 단건 조회 */
      const res = await fetch(`/api/contests/${contestId}`);
      if (!res.ok) { setContest(null); setLoading(false); return; }
      const found: Contest = await res.json();
      setContest(found);

      const loadTargetId = isEditMode ? editSubmissionId : isResubmitMode ? resubmitSubmissionId : null;
      if (loadTargetId) {
        try {
          const submissionRes = await fetch(`/api/submissions/${loadTargetId}`);
          if (!submissionRes.ok) {
            throw new Error('기존 출품작 정보를 불러오지 못했습니다.');
          }

          const submissionResult = await submissionRes.json() as {
            submission: {
              submitterName?: string;
              submitterPhone?: string;
              title: string;
              description: string;
              videoUrl: string;
              thumbnailUrl: string;
              aiTools: string | null;
              productionProcess: string;
              bonusEntries?: Array<{ bonusConfigId: string; snsUrl?: string; proofImageUrl?: string }>;
            };
          };
          const submission = submissionResult.submission;

          const parsedAiTools = (submission.aiTools ?? '')
            .split(',')
            .map((tool) => tool.trim())
            .filter(Boolean);
          const chatToolSet = new Set<string>(CHAT_AI_TOOLS);
          const imageToolSet = new Set<string>(IMAGE_AI_TOOLS);
          const videoToolSet = new Set<string>(VIDEO_AI_TOOLS);

          setForm((prev) => ({
            ...prev,
            submitterName: submission.submitterName ?? '',
            submitterPhone: submission.submitterPhone ?? '',
            title: submission.title ?? '',
            description: submission.description ?? '',
            chatAi: parsedAiTools.filter((tool) => chatToolSet.has(tool)),
            imageAi: parsedAiTools.filter((tool) => imageToolSet.has(tool)),
            videoAi: parsedAiTools.filter((tool) => videoToolSet.has(tool)),
            productionProcess: submission.productionProcess ?? '',
            agree: true,
          }));

          // 초기 폼 상태 저장 (변경 감지용)
          initialFormRef.current = {
            submitterName: submission.submitterName ?? '',
            submitterPhone: submission.submitterPhone ?? '',
            title: submission.title ?? '',
            description: submission.description ?? '',
            chatAi: parsedAiTools.filter((tool) => chatToolSet.has(tool)),
            imageAi: parsedAiTools.filter((tool) => imageToolSet.has(tool)),
            videoAi: parsedAiTools.filter((tool) => videoToolSet.has(tool)),
            productionProcess: submission.productionProcess ?? '',
            agree: true,
          };

          setExistingSubmission({
            videoUrl: submission.videoUrl,
            thumbnailUrl: submission.thumbnailUrl,
          });

          const loadedBonusEntries = submission.bonusEntries ?? [];
          const nextBonusForms = loadedBonusEntries.reduce<Record<string, BonusFormEntry>>((acc, entry) => {
            acc[entry.bonusConfigId] = {
              snsUrl: entry.snsUrl ?? '',
              proofImageFile: null,
              proofImagePreview: entry.proofImageUrl ?? null,
            };
            return acc;
          }, {});

          setBonusForms(nextBonusForms);

          // 초기 가산점 상태 저장 (변경 감지용)
          initialBonusFormsRef.current = JSON.parse(JSON.stringify(nextBonusForms));
          setOpenBonuses(loadedBonusEntries.map((entry) => entry.bonusConfigId));
          setSavedBonusConfigIds(new Set(loadedBonusEntries.filter((e) => (e.snsUrl ?? '').trim() && e.proofImageUrl).map((e) => String(e.bonusConfigId))));
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : '기존 출품작 정보를 불러오지 못했습니다.');
          setErrorType('general');
        }
        setLoading(false);
        return;
      }

      setLoading(false);

      /* 기존 출품 수 확인 — 수정 모드일 때는 제한 체크 건너뛰 */
      if (found && currentUserId && !isEditMode) {
        try {
          const supabase = createBrowserClient();
          if (supabase) {
            const { count } = await supabase
              .from('submissions')
              .select('id', { count: 'exact', head: true })
              .eq('contest_id', contestId)
              .eq('user_id', currentUserId);
            const maxSub = found.maxSubmissionsPerUser ?? 1;
            if ((count ?? 0) >= maxSub) {
              setAlreadySubmitted(true);
            }
          }
        } catch {
          /* 조회 실패은 무시 — 서버 API에서도 검증함 */
        }
      }
    };
    load();
  }, [contestId, currentUserId, isEditMode, editSubmissionId, isResubmitMode, resubmitSubmissionId]);

  /** 수정 모드: 폼 데이터가 초기 로드 시점과 달라졌는지 판별 */
  const hasFormChanges = (() => {
    if (!isEditMode || !initialFormRef.current) return true; // 신규 모드면 항상 활성화
    const init = initialFormRef.current;
    // 기본 텍스트 필드 비교
    if (form.title !== init.title) return true;
    if (form.description !== init.description) return true;
    if (form.productionProcess !== init.productionProcess) return true;
    // AI 도구 배열 비교
    const arrEq = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);
    if (!arrEq(form.chatAi, init.chatAi)) return true;
    if (!arrEq(form.imageAi, init.imageAi)) return true;
    if (!arrEq(form.videoAi, init.videoAi)) return true;
    // 파일 변경
    if (videoFile || thumbnailFile) return true;
    // 가산점 비교
    if (initialBonusFormsRef.current) {
      const initBonus = initialBonusFormsRef.current;
      const currentKeys = Object.keys(bonusForms);
      const initKeys = Object.keys(initBonus);
      if (currentKeys.length !== initKeys.length) return true;
      for (const key of currentKeys) {
        if (!initBonus[key]) return true;
        if (bonusForms[key].snsUrl !== initBonus[key].snsUrl) return true;
        if (bonusForms[key].proofImageFile) return true; // 새 파일 선택됨
        if (bonusForms[key].proofImagePreview !== initBonus[key].proofImagePreview) return true;
      }
    }
    return false;
  })();

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* 가산점 아코디언 토글 */
  const toggleBonus = (id: string) => {
    setOpenBonuses((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  /* 가산점 폼 업데이트 (SNS URL 전용) */
  const updateBonusForm = (configId: string, value: string) => {
    setBonusForms((prev) => ({
      ...prev,
      [configId]: { ...prev[configId], snsUrl: value },
    }));
  };

  /* 가산점 인증 이미지 선택 */
  const handleProofImageSelect = (configId: string, file: File) => {
    if (file.size > MAX_PROOF_IMAGE_SIZE_BYTES) {
      alert('인증 이미지는 최대 10MB까지 업로드할 수 있습니다.');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPG, PNG, WebP, GIF 형식의 이미지만 지원합니다.');
      return;
    }
    const preview = URL.createObjectURL(file);
    setBonusForms((prev) => ({
      ...prev,
      [configId]: { ...(prev[configId] || { snsUrl: '' }), proofImageFile: file, proofImagePreview: preview },
    }));
  };

  /* 가산점 인증 이미지 제거 */
  const handleProofImageRemove = (configId: string) => {
    const entry = bonusForms[configId];
    if (entry?.proofImagePreview) {
      URL.revokeObjectURL(entry.proofImagePreview);
    }
    setBonusForms((prev) => ({
      ...prev,
      [configId]: { ...(prev[configId] || { snsUrl: '' }), proofImageFile: null, proofImagePreview: null },
    }));
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleVideoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) return;

    /* 파일 형식 검증: 확장자 + MIME type */
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() ?? '';
    const allowedExts = contest?.allowedVideoExtensions?.map((e) => e.toLowerCase()) ?? ['mp4'];
    const allowedMimes = allowedExts.flatMap((e) => EXT_TO_MIME[e] ?? []);

    const isExtAllowed = allowedExts.includes(ext);
    const isMimeAllowed = allowedMimes.length === 0 || allowedMimes.includes(selectedFile.type);

    if (!isExtAllowed || !isMimeAllowed) {
      const extList = allowedExts.map((e) => e.toUpperCase()).join(', ');
      const message = `지원하지 않는 파일 형식입니다. ${extList} 형식의 영상만 업로드할 수 있습니다.`;
      setSubmitError(message);
      alert(message);
      event.target.value = '';
      return;
    }

    /* 파일 크기 검증 */
    if (selectedFile.size > MAX_VIDEO_SIZE_BYTES) {
      const message = '영상 파일은 최대 200MB까지 업로드할 수 있습니다. 파일이 큰 경우 해상도를 낮추거나 압축 후 다시 시도해 주세요.';
      setSubmitError(message);
      alert(message);
      event.target.value = '';
      return;
    }

    setSubmitError(null);
    setVideoFile(selectedFile);
  };

  const handleVideoRemove = () => {
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleThumbnailSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) return;

    /* #12: MIME 타입 검증 */
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      const message = '썸네일은 JPG, PNG, WebP, GIF 형식만 업로드할 수 있습니다.';
      setSubmitError(message);
      alert(message);
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_THUMBNAIL_SIZE_BYTES) {
      const message = '썸네일 파일은 최대 10MB까지 업로드할 수 있습니다.';
      setSubmitError(message);
      alert(message);
      event.target.value = '';
      return;
    }

    setSubmitError(null);
    setThumbnailFile(selectedFile);
  };

  const handleThumbnailRemove = () => {
    setThumbnailFile(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShowValidationPopup(true);
      return;
    }
    setFieldErrors({});

    /* ── 재제출 모드: 영상만 재업로드 후 기존 출품작 업데이트 ── */
    if (isResubmitMode && resubmitSubmissionId) {
      try {
        setSubmitError(null);
        setErrorType(null);
        setIsSubmitting(true);
        setUploadStep('preparing');
        setUploadProgress(0);

        if (!videoFile) {
          setSubmitError('영상 파일을 선택해 주세요.');
          setIsSubmitting(false);
          setUploadStep(null);
          return;
        }
        if (!thumbnailFile && !existingSubmission?.thumbnailUrl) {
          setSubmitError('썸네일 이미지를 선택해 주세요.');
          setIsSubmitting(false);
          setUploadStep(null);
          return;
        }

        const supabase = createBrowserClient()!;
        let accessToken = authSession?.access_token;
        const currentUser = authSession?.user;
        if (!accessToken || !currentUser) {
          throw new Error('로그인 세션이 만료되었습니다.');
        }

        const resubRefresh = await refreshAccessToken(supabase, { timeoutMs: 10000, currentToken: accessToken });
        if (resubRefresh.ok) accessToken = resubRefresh.accessToken;

        /* 영상 업로드 — 신규 제출과 **같은** 경로를 탄다.
           예전에는 여기만 Cloudflare 폴링도 CORS 구제도 없는 약한 버전이어서,
           신규 제출은 성공하는 상황에서 재제출만 실패하는 경우가 있었다. */
        setUploadStep('video');
        setUploadProgress(0);
        const videoTarget = await requestVideoUploadUrl();
        await uploadVideoToStream({ file: videoFile, target: videoTarget, onProgress: setUploadProgress });

        /* 토큰 갱신 */
        const tokenResult = await refreshAccessToken(supabase, { currentToken: accessToken });
        if (tokenResult.ok) accessToken = tokenResult.accessToken;

        /* 썸네일 업로드 (새 파일 선택 시) */
        let finalThumbnailUrl = existingSubmission?.thumbnailUrl || '';
        if (thumbnailFile) {
          setUploadStep('thumbnail');
          setUploadProgress(0);
          const thumbPath = buildStoragePath(contestId, thumbnailFile.name);
          await uploadFileToStorage({
            bucket: 'thumbnails',
            path: thumbPath,
            file: thumbnailFile,
            accessToken,
            onProgress: setUploadProgress,
            errorPrefix: 'THUMB',
          });
          finalThumbnailUrl = supabase.storage.from('thumbnails').getPublicUrl(thumbPath).data.publicUrl;
        }

        /* 기존 출품작 업데이트 (영상 + 썸네일만) */
        setUploadStep('submission');
        setUploadProgress(0);
        const response = await fetch(`/api/submissions/${resubmitSubmissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: videoTarget.uid,
            thumbnailUrl: finalThumbnailUrl,
            isResubmission: true,
          }),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error((errData as { error?: string }).error || '재제출에 실패했습니다.');
        }

        setSubmitted(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : '재제출 중 오류가 발생했습니다.';
        setSubmitError(message);
        setErrorType('general');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    /* ── 수정 모드 ── */
    if (isEditMode && editSubmissionId) {
      try {
        setSubmitError(null);
        setErrorType(null);
        setIsSubmitting(true);
        setUploadStep('submission');
        setUploadProgress(0);

        let accessToken = authSession?.access_token;
        const currentUser = authSession?.user;
        if (!accessToken || !currentUser) {
          throw new Error('로그인 세션이 만료되었습니다.');
        }

        /* 폼 편집 중 토큰이 만료되었을 수 있으므로 갱신 (#7: refreshAccessToken 사용) */
        const supabase = createBrowserClient()!;
        try {
          const editRefresh = await refreshAccessToken(supabase, {
            timeoutMs: 10000,
            currentToken: accessToken,
            log: (msg) => console.log(`[수정] ${msg}`),
          });
          if (editRefresh.ok) {
            accessToken = editRefresh.accessToken;
          }
        } catch { /* 갱신 실패 시 기존 토큰 유지 */ }

        /* 가산점 인증 이미지 처리 */
        const bonusEntries: Array<{ bonusConfigId: string; snsUrl?: string; proofImageUrl?: string }> = [];
        const editBonusFormEntries = Object.entries(bonusForms);

        if (editBonusFormEntries.length > 0) {
          /* 이미지 업로드 직전 토큰 한 번 더 갱신 (만료 방지) */
          try {
            const imgRefresh = await refreshAccessToken(supabase, {
              timeoutMs: 10000,
              currentToken: accessToken,
              log: (msg) => console.log(`[수정:이미지] ${msg}`),
            });
            if (imgRefresh.ok) accessToken = imgRefresh.accessToken;
          } catch { /* 갱신 실패 시 기존 토큰으로 시도 */ }

          for (const [configId, entry] of editBonusFormEntries) {
            let proofImageUrl: string | undefined;
            if (entry.proofImageFile) {
              setUploadStep('proof-images');
              const proofPath = buildStoragePath(contestId, entry.proofImageFile.name, currentUser.id);
              await uploadFileToStorage({
                bucket: 'proof-images',
                path: proofPath,
                file: entry.proofImageFile,
                accessToken,
                errorPrefix: 'PROOF',
              });
              proofImageUrl = supabase.storage.from('proof-images').getPublicUrl(proofPath).data.publicUrl;
            } else if (entry.proofImagePreview) {
              proofImageUrl = entry.proofImagePreview;
            }
            bonusEntries.push({
              bonusConfigId: configId,
              snsUrl: entry.snsUrl?.trim() || undefined,
              proofImageUrl,
            });
          }
        }

        setUploadStep('submission');
        const aiToolsList = [...form.chatAi, ...form.imageAi, ...form.videoAi];
        const putBody = isBonusOnly
          ? { bonusEntries, bonusOnly: true }
          : {
              title: form.title,
              description: form.description,
              aiTools: aiToolsList.join(', '),
              productionProcess: form.productionProcess,
              submitterName: form.submitterName,
              submitterPhone: form.submitterPhone,
              bonusEntries,
            };
        const response = await fetch(`/api/submissions/${editSubmissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(putBody),
        });

        if (!response.ok) {
          const result = await response.json();
          const serverCode = result.code;
          if (serverCode === 'CONTEST_NOT_OPEN') setErrorType('contest_closed');
          else if (serverCode === 'DEADLINE_PASSED') setErrorType('deadline_passed');
          else if (serverCode === 'AUTH_REQUIRED') setErrorType('auth_expired');
          else setErrorType('general');
          setSubmitError(result.error ?? '수정에 실패했습니다.');
          return;
        }

        setSubmitted(true);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : '수정 중 오류가 발생했습니다.');
        setErrorType('general');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!videoFile || !thumbnailFile) return;
    const selectedVideoFile = videoFile;
    const selectedThumbnailFile = thumbnailFile;

    /* 업로드 중 세션 유지 타이머 (try 외부 선언 → finally에서 정리) */
    let activityKeepAlive: ReturnType<typeof setInterval> | undefined;
    let tokenKeepAlive: ReturnType<typeof setInterval> | undefined;

    try {
      setSubmitError(null);
      setErrorType(null);
      setIsSubmitting(true);
      setUploadStep('preparing');
      setUploadProgress(0);

      /* 제출 시작 로그 — fire-and-forget (await하면 콜드스타트로 hang 가능) */
      reportUploadError('submit_start', '제출 프로세스 시작', 'SUBMIT_START').catch(() => {});

      /* ── 1단계: 토큰 확인 (JWT 7일 — 갱신 불필요, 있으면 사용) ── */
      const supabase = createBrowserClient()!;
      const accessToken = authSession?.access_token;
      const currentUser = authSession?.user;

      if (!accessToken || !currentUser) {
        setIsSubmitting(false);
        setUploadStep(null);
        setErrorType('auth_expired');
        setSubmitError('로그인이 필요합니다. 페이지를 새로고침 후 다시 시도해 주세요.');
        reportUploadError('auth', '토큰 없음', 'AUTH-NOTOKEN').catch(() => {});
        return;
      }

      /* 업로드 중 세션 유지: activity keepalive (SessionTimeoutGuard 방지) */
      activityKeepAlive = setInterval(() => {
        try { localStorage.setItem('ggumple_last_activity', String(Date.now())); } catch {}
      }, 20_000);
      /* keepalive 타이머 제거 — JWT 7일이므로 불필요, refresh_token 충돌만 유발 */

      /* 사전 검증 — 비블로킹 (쿼터/마감 체크, 실패해도 진행) */
      try {
        const preCheckRes = await Promise.race([
          fetch(`/api/submissions/pre-check?contestId=${contestId}`),
          new Promise<null>((r) => setTimeout(() => r(null), 5000)),
        ]);
        if (preCheckRes && !preCheckRes.ok) {
          const preCheckData = await preCheckRes.json().catch(() => ({}));
          const code = (preCheckData as { code?: string }).code;
          if (code === 'QUOTA_EXCEEDED') { setErrorType('duplicate'); setSubmitError(preCheckData.error); setIsSubmitting(false); setUploadStep(null); return; }
          if (code === 'CONTEST_NOT_OPEN') { setErrorType('contest_closed'); setSubmitError(preCheckData.error); setIsSubmitting(false); setUploadStep(null); return; }
          if (code === 'DEADLINE_PASSED') { setErrorType('deadline_passed'); setSubmitError(preCheckData.error); setIsSubmitting(false); setUploadStep(null); return; }
        }
      } catch { /* 사전 검증 실패는 무시 — 최종 제출 API에서 재검증됨 */ }

      /* ── 2단계: 영상 업로드 ── */
      setUploadStep('video');
      setUploadProgress(0);
      const videoTarget = await requestVideoUploadUrl();
      await uploadVideoToStream({ file: selectedVideoFile, target: videoTarget, onProgress: setUploadProgress });

      /* JWT 7일 — 업로드 후 토큰 갱신 불필요. 그대로 사용. */

      /* ── 3단계: 썸네일 업로드 ── */
      setUploadStep('thumbnail');
      setUploadProgress(0);
      const thumbnailPath = buildStoragePath(contestId, selectedThumbnailFile.name);
      await uploadFileToStorage({
        bucket: 'thumbnails',
        path: thumbnailPath,
        file: selectedThumbnailFile,
        accessToken,
        onProgress: setUploadProgress,
        errorPrefix: 'THUMB',
      });
      const { data: thumbnailPublicData } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);
      if (!thumbnailPublicData.publicUrl) {
        throw new Error(userFriendlyError('THUMB-URL'));
      }

      /* ── 4단계: 가산점 인증 이미지 업로드 ── */
      const bonusEntries: Array<{ bonusConfigId: string; snsUrl?: string; proofImageUrl?: string }> = [];
      const bonusFormEntries = Object.entries(bonusForms).filter(
        ([, entry]) => entry.snsUrl?.trim() || entry.proofImageFile,
      );

      if (bonusFormEntries.length > 0) {
        setUploadStep('proof-images');
        setUploadProgress(0);
        for (const [configId, entry] of bonusFormEntries) {
          let proofImageUrl: string | undefined;
          if (entry.proofImageFile) {
            const proofPath = buildStoragePath(contestId, entry.proofImageFile.name, currentUser.id);
            await uploadFileToStorage({
              bucket: 'proof-images',
              path: proofPath,
              file: entry.proofImageFile,
              accessToken,
              errorPrefix: 'PROOF',
            });
            proofImageUrl = supabase.storage.from('proof-images').getPublicUrl(proofPath).data.publicUrl;
          }
          bonusEntries.push({
            bonusConfigId: configId,
            snsUrl: entry.snsUrl?.trim() || undefined,
            proofImageUrl,
          });
        }
      }

      setUploadStep('submission');
      setUploadProgress(0);
      const aiToolsList = [...form.chatAi, ...form.imageAi, ...form.videoAi];
      const submissionResponse = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestId,
          title: form.title,
          description: form.description,
          videoUrl: videoTarget.uid,
          thumbnailUrl: thumbnailPublicData.publicUrl,
          tags: [],
          aiTools: aiToolsList.join(', '),
          productionProcess: form.productionProcess,
          submitterName: form.submitterName,
          submitterPhone: form.submitterPhone,
          bonusEntries: bonusEntries.length > 0 ? bonusEntries : undefined,
          termsAgreed: form.agree,
        }),
      });

      const submissionResult = (await submissionResponse.json()) as {
        error?: string;
        code?: string;
      };

      if (!submissionResponse.ok) {
        const serverError = submissionResult.error ?? '출품작 저장에 실패했습니다.';
        const serverCode = submissionResult.code;

        if (submissionResponse.status === 409 || serverCode === 'QUOTA_EXCEEDED') {
          setErrorType('duplicate');
          setSubmitError(serverError);
          return;
        }
        if (submissionResponse.status === 410 || serverCode === 'CONTEST_NOT_OPEN') {
          setErrorType('contest_closed');
          setSubmitError(serverError);
          return;
        }
        if (submissionResponse.status === 403 || serverCode === 'DEADLINE_PASSED') {
          setErrorType('deadline_passed');
          setSubmitError(serverError);
          return;
        }
        if (submissionResponse.status === 401 || serverCode === 'AUTH_REQUIRED') {
          setErrorType('auth_expired');
          setSubmitError(serverError);
          return;
        }
        throw new Error(userFriendlyError('SUBMIT-FAIL'));
      }

      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '영상 제출 중 오류가 발생했습니다.';
      reportUploadError(uploadStep ?? 'unknown', message, 'CATCH_ALL');
      setSubmitError(message);
      setErrorType('general');
    } finally {
      /* 업로드 중 세션 유지 타이머 정리 */
      if (activityKeepAlive) clearInterval(activityKeepAlive);
      if (tokenKeepAlive) clearInterval(tokenKeepAlive);
      setIsSubmitting(false);
    }
  };

  /* 가산점 존재 여부 */
  const hasBonusConfigs = contest?.bonusConfigs && contest.bonusConfigs.length > 0;

  /* 필수 필드 유효성 검사 */
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (isBonusOnly) return errors; // 가산점 전용 모드: 본문 검증 생략
    if (!form.submitterName.trim()) errors.submitterName = '이름을 입력해주세요';
    if (!form.submitterPhone.trim()) errors.submitterPhone = '전화번호를 입력해주세요';
    if (!form.title.trim()) errors.title = '영상 제목을 입력해주세요';
    if (!form.description.trim()) errors.description = '영상 설명을 입력해주세요';
    if (!form.productionProcess.trim()) errors.productionProcess = '제작과정 설명을 입력해주세요';
    if (!isEditMode && !isResubmitMode && !videoFile) errors.videoFile = '영상 파일을 업로드해주세요';
    if (!isEditMode && !isResubmitMode && !thumbnailFile && !existingSubmission?.thumbnailUrl) errors.thumbnailFile = '썸네일 이미지를 업로드해주세요';
    if (!form.agree) errors.agree = '유의사항에 동의해주세요';
    return errors;
  };

  /* 필드 변경 시 해당 에러 자동 제거 */
  useEffect(() => {
    setFieldErrors(prev => {
      const next = { ...prev };
      if (form.submitterName.trim()) delete next.submitterName;
      if (form.submitterPhone.trim()) delete next.submitterPhone;
      if (form.title.trim()) delete next.title;
      if (form.description.trim()) delete next.description;
      if (form.productionProcess.trim()) delete next.productionProcess;
      if (isEditMode || videoFile) delete next.videoFile;
      if (isEditMode || thumbnailFile) delete next.thumbnailFile;
      if (form.agree) delete next.agree;
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [form.submitterName, form.submitterPhone, form.title, form.description, form.productionProcess, videoFile, thumbnailFile, form.agree, isEditMode]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">공모전을 찾을 수 없습니다</h1>
            <p className="text-muted-foreground mb-6">
              요청하신 공모전이 존재하지 않거나 삭제되었습니다.
            </p>
            <Link href="/contests">
              <Button variant="outline">공모전 목록으로</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  /* 접수중이 아닌 경우 (단, 가산점 수정 / 재제출은 bonusDeadlineAt 전이면 허용) */
  const isBeforeBonusDeadline = contest.bonusDeadlineAt && new Date(contest.bonusDeadlineAt) >= new Date();
  const isBonusDeadlineValid = isBonusOnly && isBeforeBonusDeadline;
  const isResubmitAllowed = isResubmitMode && isBeforeBonusDeadline;
  if (contest.status !== 'open' && !isBonusDeadlineValid && !isResubmitAllowed) {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <AlertCircle className="h-12 w-12 text-brand mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">제출 기간이 아닙니다</h1>
            <p className="text-muted-foreground mb-6">
              이 공모전은 현재 {contest.status === 'draft' ? '접수 준비중' : contest.status === 'judging' ? '심사중' : '종료'}입니다.
            </p>
            <Link href={`/contests/${contestId}`}>
              <Button variant="outline">공모전 상세로 돌아가기</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }



  /* 접수중이지만 접수시작일 전인 경우 (접수전) */
  if (contest.status === 'open' && new Date(contest.submissionStartAt).getTime() > Date.now()) {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <AlertCircle className="h-12 w-12 text-brand mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">접수 시작 전입니다</h1>
            <p className="text-muted-foreground mb-6">
              이 공모전의 접수는 {formatDate(contest.submissionStartAt, { year: 'numeric', month: 'long', day: 'numeric' })}부터 시작됩니다.
            </p>
            <Link href={`/contests/${contestId}`}>
              <Button variant="outline">공모전 상세로 돌아가기</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">
      {/* 배경 장식 — 색은 globals.css .page-glow 가 테마 토큰으로 결정 */}
      <div className="page-glow" />
      <section className="relative pt-24 pb-10 px-4">
        <div className="container mx-auto max-w-3xl relative z-10">
          {/* Top navigation */}
          <div className="mb-6">
            <Link href={`/contests/${contestId}`}>
              <Button
                variant="outline"
                size="sm"
                className="group gap-1.5 rounded-full px-4 border-border/60 bg-background/60 backdrop-blur-sm shadow-sm hover:bg-accent hover:shadow-md transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                공모전으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* New Header Design */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-zinc-950 border border-white/10 p-5 sm:p-8 md:p-10 shadow-2xl">
            {/* Inner background glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/30 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 relative z-10">
              {/* Icon Container */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[1.5rem] bg-gradient-to-br from-primary to-brand border border-white/20 flex items-center justify-center shrink-0 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]">
                <Film className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/90 drop-shadow-md" />
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {isBonusOnly ? 'Bonus Points' : isEditMode ? 'Edit Your Work' : 'Submit Your Vision'}
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm leading-tight">
                  {isBonusOnly ? '가산점 인증 수정' : isEditMode ? '영상 수정하기' : '영상 제출하기'}
                </h1>
                <p className="text-base md:text-[1.1rem] text-zinc-300 leading-relaxed font-light max-w-xl">
                  {isBonusOnly
                    ? '가산점 인증 항목만 수정할 수 있습니다. 출품작 정보는 변경할 수 없습니다.'
                    : isEditMode
                    ? '출품작의 정보를 수정합니다. 영상과 썸네일은 변경할 수 없습니다.'
                    : '공모전에 참가할 당신만의 창의적인 영상을 세상에 선보여주세요.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 제출 폼 */}
      <section className="relative px-4 pb-24">
        <div className="container mx-auto max-w-3xl relative z-10">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* 업로드 오류 시 새로고침 안내 배너 — 눈에 잘 띄도록 강조 */}
            <div className="flex items-center gap-3 rounded-xl border-2 border-brand bg-brand dark:bg-brand/40 px-5 py-4 shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold text-brand dark:text-brand">
                  ⚠️ 업로드 전 필독!
                </p>
                <p className="mt-1 text-sm text-brand dark:text-brand leading-relaxed">
                  오류 발생 시{' '}
                  <kbd className="inline-flex items-center rounded border-2 border-brand bg-white dark:bg-brand px-2 py-0.5 text-xs font-mono font-bold text-brand dark:text-brand">Ctrl+Shift+R</kbd>{' '}
                  (Mac:{' '}
                  <kbd className="inline-flex items-center rounded border-2 border-brand bg-white dark:bg-brand px-2 py-0.5 text-xs font-mono font-bold text-brand dark:text-brand">⌘+Shift+R</kbd>
                  )로 <span className="font-bold underline">강력 새로고침</span> 후 다시 시도해 주세요.
                </p>
              </div>
            </div>

            {/* 공모전 정보 요약 배너 */}
            <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-border/50 p-4 sm:p-6 md:p-8 shadow-sm backdrop-blur-xl mb-6 sm:mb-8 transition-colors">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-white/5 flex items-center justify-center shrink-0 border border-primary/20 dark:border-white/10">
                    <Info className="h-6 w-6 text-primary dark:text-zinc-300" />
                  </div>
                  <div className="space-y-2.5">
                    {/* 공모전 제목과 주제 */}
                    <div>
                      <h2 className="font-bold text-foreground text-xl leading-tight mb-1">{contest.title}</h2>
                      <p className="text-[0.95rem] text-muted-foreground font-medium leading-relaxed whitespace-pre-line">
                        {contest.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(249,115,22,0.4)]"></span>
                        마감: <strong className="text-foreground font-medium">
                          {formatDate(contest.submissionEndAt, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </strong>
                      </span>
                      <span className="hidden md:inline text-border">|</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.4)]"></span>
                        형식: <strong className="text-foreground font-medium">
                          {contest.allowedVideoExtensions.map((e) => e.toUpperCase()).join(', ')}
                        </strong>
                      </span>
                      <span className="hidden md:inline text-border">|</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></span>
                        최대 <strong className="text-foreground font-medium">{contest.maxSubmissionsPerUser}편</strong> 제출
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <StepVideoInfo
              form={form}
              updateField={updateField}
              setForm={setForm}
              fieldErrors={fieldErrors}
              isBonusOnly={isBonusOnly}
            />

            <StepFileUpload
              contest={contest}
              isBonusOnly={isBonusOnly}
              isEditMode={isEditMode}
              isResubmitMode={isResubmitMode}
              existingSubmission={existingSubmission}
              videoFile={videoFile}
              thumbnailFile={thumbnailFile}
              videoInputRef={videoInputRef}
              thumbnailInputRef={thumbnailInputRef}
              handleVideoSelect={handleVideoSelect}
              handleVideoRemove={handleVideoRemove}
              handleThumbnailSelect={handleThumbnailSelect}
              handleThumbnailRemove={handleThumbnailRemove}
              formatFileSize={formatFileSize}
              fieldErrors={fieldErrors}
            />

            <StepBonus
              contest={contest}
              hasBonusConfigs={Boolean(hasBonusConfigs)}
              isEditMode={isEditMode}
              openBonuses={openBonuses}
              toggleBonus={toggleBonus}
              bonusForms={bonusForms}
              updateBonusForm={updateBonusForm}
              savedBonusConfigIds={savedBonusConfigIds}
              handleProofImageSelect={handleProofImageSelect}
              handleProofImageRemove={handleProofImageRemove}
              formatFileSize={formatFileSize}
            />

            <StepConsent
              contest={contest}
              form={form}
              updateField={updateField}
              fieldErrors={fieldErrors}
              isBonusOnly={isBonusOnly}
              notesOpen={notesOpen}
              setNotesOpen={setNotesOpen}
            />

            {/* ===== 제출/저장 버튼 (항상 표시) ===== */}
            <Card className="p-6 border border-border">
              {submitError && (
                <p className="text-sm text-destructive mb-4">{submitError}</p>
              )}
              {isSubmitting && (
                <p className="text-sm text-muted-foreground mb-4">
                  {uploadStep === 'preparing' && '업로드 준비 중...'}
                  {uploadStep === 'video' && '영상 업로드 중...'}
                  {uploadStep === 'thumbnail' && '썸네일 업로드 중...'}
                  {uploadStep === 'proof-images' && '인증 이미지 업로드 중...'}
                  {uploadStep === 'submission' && '출품작 정보를 저장하는 중...'}
                </p>
              )}
              <div className="flex items-center gap-3">
                <Link href={isBonusOnly ? '/my/submissions' : `/contests/${contestId}`} className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-brand hover:bg-brand-hover text-white font-semibold cursor-pointer"
                  disabled={isSubmitting || (isEditMode && !hasFormChanges)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isSubmitting ? (isBonusOnly ? '저장 중...' : isEditMode ? '수정 중...' : '업로드 중...') : (isBonusOnly ? '가산점 저장' : isEditMode ? '수정하기' : '제출하기')}
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </section>

      <SubmitDialogs
        contestId={contestId}
        showValidationPopup={showValidationPopup}
        onValidationPopupChange={setShowValidationPopup}
        fieldErrors={fieldErrors}
        uploadStep={uploadStep}
        uploadProgress={uploadProgress}
        submitted={submitted}
        isSubmitting={isSubmitting}
        submitError={submitError}
        errorType={errorType}
        videoFile={videoFile}
        thumbnailFile={thumbnailFile}
        isEditMode={isEditMode}
        isBonusOnly={isBonusOnly}
        hasBonusConfigs={Boolean(hasBonusConfigs)}
        submissionTitle={form.title}
        onSuccessConfirm={() => { setSubmitted(false); setUploadStep(null); }}
        onErrorDismiss={() => {
          setIsSubmitting(false);
          setUploadStep(null);
          setSubmitError(null);
          setUploadProgress(0);
          setErrorType(null);
        }}
        alreadySubmitted={alreadySubmitted}
        maxSubmissionsPerUser={contest?.maxSubmissionsPerUser ?? 1}
      />
    </div>
  );
}
