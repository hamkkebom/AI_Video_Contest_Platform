'use client';

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AiToolChips } from '@/components/common/ai-tool-chips';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Upload,
  Film,
  FileVideo,
  ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  Shield,
  Loader2,
} from 'lucide-react';

import type { Contest } from '@/lib/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { CHAT_AI_TOOLS, IMAGE_AI_TOOLS, VIDEO_AI_TOOLS } from '@/config/constants';
import { formatDate, cn } from '@/lib/utils';

const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PROOF_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** 제출 폼 상태 타입 */
interface FormState {
  title: string;
  description: string;
  chatAi: string[];
  imageAi: string[];
  videoAi: string[];
  productionProcess: string;
  agree: boolean;
}

/** 가산점 인증 상태 (bonusConfigId별) */
interface BonusFormEntry {
  snsUrl: string;
  proofImageFile: File | null;
  proofImagePreview: string | null;
}

/**
 * 공모전 영상 제출 페이지
 * ApplySection 기준으로 통합된 접수 폼
 */
export default function ContestSubmitPage() {
  const params = useParams();
  const contestId = params.id as string;
  const router = useRouter();

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [errorType, setErrorType] = useState<'duplicate' | 'contest_closed' | 'deadline_passed' | 'auth_expired' | 'general' | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  /* 제출 폼 상태 */
  const [form, setForm] = useState<FormState>({
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
  const [uploadStep, setUploadStep] = useState<'preparing' | 'video' | 'thumbnail' | 'proof-images' | 'submission' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  /* 가산점 아코디언 열림 상태 */
  const [openBonuses, setOpenBonuses] = useState<string[]>([]);
  /* 가산점 폼 데이터 (bonusConfigId → 값) */
  const [bonusForms, setBonusForms] = useState<Record<string, BonusFormEntry>>({});

  useEffect(() => {
    const load = async () => {
      /* 공모전 정보 조회 */
      const res = await fetch('/api/contests'); const contests: Contest[] = await res.json();
      const found = contests.find((c) => c.id === contestId);
      setContest(found ?? null);
      /* 기존 출품 수 확인 — 최대 출품 수 초과 시 폼 비활성화 */
      if (found) {
        try {
          const supabase = createBrowserClient();
          if (supabase) {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              const { count } = await supabase
                .from('submissions')
                .select('id', { count: 'exact', head: true })
                .eq('contest_id', contestId)
                .eq('user_id', currentUser.id);
              const maxSub = found.maxSubmissionsPerUser ?? 1;
              if ((count ?? 0) >= maxSub) {
                setAlreadySubmitted(true);
              }
            }
          }
        } catch {
          /* 조회 실패는 무시 — 서버 API에서도 검증함 */
        }
      }
      setLoading(false);
    };
    load();
  }, [contestId]);

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
    if (!form.agree) return;

    if (!videoFile || !thumbnailFile) {
      const message = '영상 파일과 썸네일 파일을 모두 선택해 주세요.';
      setSubmitError(message);
      alert(message);
      return;
    }

    try {
      setSubmitError(null);
      setErrorType(null);
      setIsSubmitting(true);
      setUploadStep('preparing');
      setUploadProgress(0);

      /* 세션 갱신 - 3초 타임아웃 (hang 방지) */
      try {
        const supabaseForRefresh = createBrowserClient();
        if (supabaseForRefresh) {
          await Promise.race([
            supabaseForRefresh.auth.refreshSession(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('refresh timeout')), 3000)),
          ]);
        }
      } catch {
        /* 갱신 실패/타임아웃 무시 - 이후 단계에서 재시도 */
      }

      /* Cloudflare Stream 업로드 URL 발급 */
      const uploadUrlResponse = await fetch('/api/upload/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDurationSeconds: 600 }),
      });

      const uploadUrlResult = (await uploadUrlResponse.json()) as {
        uploadURL?: string;
        uid?: string;
        error?: string;
      };

      if (!uploadUrlResponse.ok || !uploadUrlResult.uploadURL || !uploadUrlResult.uid) {
        throw new Error(uploadUrlResult.error ?? '영상 업로드 URL을 생성하지 못했습니다.');
      }

      /* 영상 업로드 — XMLHttpRequest로 진행률 추적 */
      setUploadStep('video');
      setUploadProgress(0);
      console.log('[제출] 영상 업로드 시작:', videoFile.name, videoFile.size, 'bytes');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrlResult.uploadURL!);
        /* 5분 타임아웃 (200MB 기준 느린 네트워크 고려) */
        xhr.timeout = 5 * 60 * 1000;
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            console.log(`[제출] 영상 업로드 진행: ${pct}% (${ev.loaded}/${ev.total})`);
            setUploadProgress(pct);
          }
        };
        xhr.onload = () => {
          console.log('[제출] 영상 업로드 완료, status:', xhr.status);
          if (xhr.status >= 200 && xhr.status < 300) { setUploadProgress(100); resolve(); }
          else {
            console.error('[제출] 영상 업로드 실패:', xhr.status, xhr.responseText);
            reject(new Error(`영상 파일 업로드에 실패했습니다. (${xhr.status})`));
          }
        };
        xhr.onerror = () => {
          console.error('[제출] 영상 업로드 네트워크 오류');
          reject(new Error('네트워크 오류로 영상 업로드에 실패했습니다.'));
        };
        xhr.ontimeout = () => {
          console.error('[제출] 영상 업로드 타임아웃');
          reject(new Error('영상 업로드 시간이 초과되었습니다.'));
        };
        const fd = new FormData(); fd.append('file', videoFile); xhr.send(fd);
      });

      setUploadStep('thumbnail');
      setUploadProgress(0);
      console.log('[제출] 썸네일 업로드 시작');
      const supabase = createBrowserClient();
      if (!supabase) {
        throw new Error('Supabase 설정이 필요합니다.');
      }

      /* 세션 유효성 확인 — 영상 업로드에 시간이 걸렸을 수 있으므로 토큰 갱신 */
      console.log('[제출] 세션 갱신 시도...');
      const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
      if (refreshErr) {
        console.warn('[제출] 세션 갱신 실패 (계속 시도):', refreshErr.message);
      } else if (refreshData.session) {
        console.log('[제출] 세션 갱신 성공, 만료:', new Date(refreshData.session.expires_at! * 1000).toISOString());
      }

      console.log('[제출] 세션 확인 중...');
      const { data: { user: currentUser }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !currentUser) {
        console.error('[제출] 세션 만료:', authErr);
        throw new Error('로그인 세션이 만료되었습니다. 페이지를 새로고침 후 다시 로그인해 주세요.');
      }
      console.log('[제출] 세션 유효:', currentUser.id);

      const safeThumbnailName = thumbnailFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const thumbnailPath = `${contestId}/${crypto.randomUUID()}-${safeThumbnailName}`;
      console.log('[제출] 썸네일 경로:', thumbnailPath, '파일크기:', thumbnailFile.size, 'bytes', '타입:', thumbnailFile.type);

      /* 썸네일 업로드 (30초 타임아웃) */
      const thumbnailUploadPromise = supabase.storage
        .from('thumbnails')
        .upload(thumbnailPath, thumbnailFile, {
          contentType: thumbnailFile.type,
          upsert: false,
        })
        .then((result) => {
          console.log('[제출] 썸네일 Storage 응답:', JSON.stringify({ data: result.data, error: result.error?.message }));
          return result;
        });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
          console.error('[제출] 썸네일 업로드 30초 타임아웃!');
          reject(new Error('썸네일 업로드 시간이 초과되었습니다(30초). 파일 크기를 줄이거나 네트워크 상태를 확인해 주세요.'));
        }, 30_000),
      );

      const { data: thumbnailData, error: thumbnailUploadError } = await Promise.race([
        thumbnailUploadPromise,
        timeoutPromise,
      ]);
      if (thumbnailUploadError || !thumbnailData?.path) {
        const errMsg = thumbnailUploadError?.message ?? '썸네일 업로드에 실패했습니다.';
        console.error('[제출] 썸네일 업로드 실패:', JSON.stringify(thumbnailUploadError));
        // RLS 정책 위반 가능성 안내
        if (errMsg.includes('security') || errMsg.includes('403') || errMsg.includes('Unauthorized')) {
          throw new Error('썸네일 업로드 권한이 없습니다. 세션이 만료되었을 수 있으니 페이지를 새로고침 후 다시 시도해 주세요.');
        }
        throw new Error(errMsg);
      }
      console.log('[제출] 썸네일 업로드 성공:', thumbnailData.path);

      const { data: thumbnailPublicData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbnailData.path);

      if (!thumbnailPublicData.publicUrl) {
        throw new Error('썸네일 공개 URL 생성에 실패했습니다.');
      }

      /* 가산점 인증 이미지 업로드 */
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
            const safeFileName = entry.proofImageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const proofPath = `${contestId}/${currentUser.id}/${crypto.randomUUID()}-${safeFileName}`;
            const { data: proofData, error: proofError } = await supabase.storage
              .from('proof-images')
              .upload(proofPath, entry.proofImageFile, {
                contentType: entry.proofImageFile.type,
                upsert: false,
              });
            if (proofError) {
              console.error('인증 이미지 업로드 실패:', proofError);
              throw new Error(`인증 이미지 업로드에 실패했습니다: ${proofError.message}`);
            }
            const { data: proofPublicData } = supabase.storage.from('proof-images').getPublicUrl(proofData.path);
            proofImageUrl = proofPublicData.publicUrl;
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
          videoUrl: uploadUrlResult.uid,
          thumbnailUrl: thumbnailPublicData.publicUrl,
          tags: [],
          aiTools: aiToolsList.join(', '),
          productionProcess: form.productionProcess,
          bonusEntries: bonusEntries.length > 0 ? bonusEntries : undefined,
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
        throw new Error(serverError);
      }

      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '영상 제출 중 오류가 발생했습니다.';
      setSubmitError(message);
      setErrorType('general');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* 가산점 존재 여부 */
  const hasBonusConfigs = contest?.bonusConfigs && contest.bonusConfigs.length > 0;

  /* 제출 가능 여부 */
  const canSubmit =
    form.title.trim() &&
    form.description.trim() &&
    form.productionProcess.trim() &&
    videoFile &&
    thumbnailFile &&
    form.agree &&
    !isSubmitting;

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

  /* 접수중이 아닌 경우 */
  if (contest.status !== 'open') {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">제출 기간이 아닙니다</h1>
            <p className="text-muted-foreground mb-6">
              이 공모전은 현재 {contest.status === 'draft' ? '접수 준비중' : contest.status === 'judging' ? '심사중' : '종료'}입니다.
            </p>
            <Link href={`/contests/${contestId}/landing`}>
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
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">접수 시작 전입니다</h1>
            <p className="text-muted-foreground mb-6">
              이 공모전의 접수는 {formatDate(contest.submissionStartAt, { year: 'numeric', month: 'long', day: 'numeric' })}부터 시작됩니다.
            </p>
            <Link href={`/contests/${contestId}/landing`}>
              <Button variant="outline">공모전 상세로 돌아가기</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
      <section className="relative pt-24 pb-10 px-4">
        <div className="container mx-auto max-w-3xl relative z-10">
          {/* Top navigation */}
          <div className="mb-6">
            <Link
              href={`/contests/${contestId}/landing`}
              className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              공모전으로 돌아가기
            </Link>
          </div>

          {/* New Header Design */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-zinc-950 border border-white/10 p-5 sm:p-8 md:p-10 shadow-2xl">
            {/* Inner background glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-violet-600/30 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 relative z-10">
              {/* Icon Container */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[1.5rem] bg-gradient-to-br from-violet-600 to-orange-500 border border-white/20 flex items-center justify-center shrink-0 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]">
                <Film className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/90 drop-shadow-md" />
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-wider uppercase mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                  </span>
                  Submit Your Vision
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm leading-tight">
                  영상 제출하기
                </h1>
                <p className="text-base md:text-[1.1rem] text-zinc-300 leading-relaxed font-light max-w-xl">
                  공모전에 참가할 당신만의 창의적인 영상을 세상에 선보여주세요.
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

            {/* 공모전 정보 요약 배너 */}
            <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-border/50 p-4 sm:p-6 md:p-8 shadow-sm backdrop-blur-xl mb-6 sm:mb-8 transition-colors">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 dark:bg-white/5 flex items-center justify-center shrink-0 border border-violet-500/20 dark:border-white/10">
                    <Info className="h-6 w-6 text-violet-500 dark:text-zinc-300" />
                  </div>
                  <div className="space-y-2.5">
                    {/* 공모전 제목과 주제 */}
                    <div>
                      <h2 className="font-bold text-foreground text-xl leading-tight mb-1">{contest.title}</h2>
                      <p className="text-[0.95rem] text-muted-foreground font-medium leading-relaxed">
                        {contest.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></span>
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
                        <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]"></span>
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

            {/* ===== STEP 1: 영상 정보 ===== */}
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <h2 className="text-lg font-bold">영상 정보</h2>
                  <p className="text-xs text-muted-foreground">영상의 기본 정보를 입력해 주세요</p>
                </div>
              </div>
              <div className="space-y-5">
                {/* 영상 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    영상 제목 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    required
                    maxLength={100}
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="영상 제목을 입력하세요 (최대 100자)"
                    className="bg-background/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground text-right">{form.title.length}/100</p>
                </div>
                {/* 영상 설명 */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    영상 설명 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    required
                    maxLength={1000}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="영상에 대한 설명을 입력하세요. 제작 의도, 주제 해석 등을 포함해 주세요."
                    className="min-h-32 bg-background/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {form.description.length}/1000
                  </p>
                </div>
                {/* 사용한 AI 도구 */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">
                    사용한 AI 도구 <span className="text-xs text-muted-foreground font-normal">(선택)</span>
                  </Label>
                  <AiToolChips
                    label="💬 채팅 AI"
                    tools={CHAT_AI_TOOLS}
                    selected={form.chatAi}
                    onChange={(v) => setForm((p) => ({ ...p, chatAi: v }))}
                    allowCustom
                  />
                  <AiToolChips
                    label="🖼️ 이미지 AI"
                    tools={IMAGE_AI_TOOLS}
                    selected={form.imageAi}
                    onChange={(v) => setForm((p) => ({ ...p, imageAi: v }))}
                    allowCustom
                  />
                  <AiToolChips
                    label="🎬 영상 AI"
                    tools={VIDEO_AI_TOOLS}
                    selected={form.videoAi}
                    onChange={(v) => setForm((p) => ({ ...p, videoAi: v }))}
                    allowCustom
                  />
                </div>
                {/* 제작과정 설명 */}
                <div className="space-y-2">
                  <Label htmlFor="productionProcess" className="text-sm font-semibold">
                    제작과정 설명 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="productionProcess"
                    required
                    maxLength={3000}
                    value={form.productionProcess}
                    onChange={(e) => updateField('productionProcess', e.target.value)}
                    placeholder="영상의 기획 → 제작 → 편집 과정을 상세히 설명해 주세요. 어떤 AI 도구를 어떤 단계에서 활용했는지, 제작 기간, 특별한 기법 등을 포함하면 좋습니다."
                    className="min-h-48 bg-background/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {form.productionProcess.length}/3000
                  </p>
                </div>
              </div>
            </Card>

            {/* ===== STEP 2: 파일 업로드 ===== */}
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <h2 className="text-lg font-bold">파일 업로드</h2>
                  <p className="text-xs text-muted-foreground">썸네일과 영상 파일을 업로드해 주세요</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {/* 썸네일 이미지 업로드 */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    썸네일 이미지 <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">JPG, PNG 형식, 최대 10MB · 권장 1920×1080px</p>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailSelect}
                  />
                  {thumbnailFile ? (
                    <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-violet-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{thumbnailFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(thumbnailFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleThumbnailRemove}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-xl p-5 sm:p-8 flex flex-col items-center gap-3 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-violet-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">썸네일 업로드</p>
                        <p className="text-xs text-muted-foreground mt-0.5">클릭하여 선택</p>
                      </div>
                    </button>
                  )}
                </div>
                {/* 영상 파일 업로드 */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    영상 파일 <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {contest.allowedVideoExtensions.map((e) => e.toUpperCase()).join(', ')} 형식, 최대 200MB
                  </p>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                  {videoFile ? (
                    <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <FileVideo className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{videoFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(videoFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleVideoRemove}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-xl p-5 sm:p-8 flex flex-col items-center gap-3 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">영상 업로드</p>
                        <p className="text-xs text-muted-foreground mt-0.5">클릭하여 선택</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {/* ===== STEP 3: 가산점 인증 (조건부) ===== */}
            {hasBonusConfigs && (
              <Card className="p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                  <div>
                    <h2 className="text-lg font-bold">가산점 인증 <span className="text-xs text-muted-foreground font-normal ml-1">(선택)</span></h2>
                    <p className="text-xs text-muted-foreground">추후 마이페이지에서도 등록 가능합니다</p>
                  </div>
                </div>
                {contest.bonusMaxScore && (
                  <p className="text-xs text-muted-foreground mb-4 pl-11">
                    항목당 1회만 인정 \u00B7 최대 {contest.bonusMaxScore}점
                  </p>
                )}
                <div className="space-y-2">
                  {contest.bonusConfigs!.map((config) => {
                    const isOpen = openBonuses.includes(config.id);
                    const entry = bonusForms[config.id] || { snsUrl: '', proofImageFile: null, proofImagePreview: null };
                    return (
                      <Card key={config.id} className="border border-border overflow-hidden">
                        {/* 아코디언 헤더 */}
                        <button
                          type="button"
                          onClick={() => toggleBonus(config.id)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <span className="flex-1 text-sm font-medium">{config.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {/* 아코디언 본문 */}
                        <div
                          className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            {config.description && (
                              <p className="text-xs text-muted-foreground">{config.description}</p>
                            )}
                            {/* SNS URL 입력 */}
                            <Input
                              type="url"
                              value={entry.snsUrl}
                              onChange={(e) => updateBonusForm(config.id, e.target.value)}
                              placeholder="SNS 게시물 URL (예: https://instagram.com/p/...)"
                              className="bg-background/50 border-border text-sm"
                            />
                            {/* 인증 이미지 업로드 */}
                            {entry.proofImageFile && entry.proofImagePreview ? (
                              <div className="rounded-lg border border-border overflow-hidden">
                                <div className="relative bg-muted/30">
                                  <img
                                    src={entry.proofImagePreview}
                                    alt="인증 이미지 미리보기"
                                    className="w-full max-h-48 object-contain"
                                  />
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 bg-muted/20">
                                  <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                                    {entry.proofImageFile.name} ({formatFileSize(entry.proofImageFile.size)})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleProofImageRemove(config.id)}
                                    className="text-xs text-red-500 hover:text-red-600 cursor-pointer font-medium shrink-0"
                                  >
                                    제거
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-dashed border-border hover:border-violet-500/50 cursor-pointer transition-colors">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">캡처 이미지 업로드 (JPG, PNG, WebP, 최대 10MB)</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleProofImageSelect(config.id, file);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </label>
                            )}
                            {/* URL + 이미지 모두 필요 안내 */}
                            <p className="text-xs text-orange-500">
                              ※ URL과 캡처 이미지를 모두 제출해야 가산점이 인정됩니다.
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* ===== STEP 최종: 안내 및 동의 ===== */}
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">확인 및 제출</h2>
                  <p className="text-xs text-muted-foreground">안내사항을 확인하고 영상을 제출해 주세요</p>
                </div>
              </div>
              {/* 안내 사항 */}
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 mb-5">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Film className="h-4 w-4 text-orange-500" />
                  제출 전 확인사항
                </h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5">
                  <li>공모전 주제에 맞는 AI 영상만 제출할 수 있습니다.</li>
                  <li>저작권/초상권 문제가 없는 콘텐츠만 허용됩니다.</li>
                  <li>제출 후 영상 파일과 썸네일은 수정이 불가합니다.</li>
                  <li>가산점 인증, 영상 설명, 제작과정 등은 마감 전까지 수정 가능합니다.</li>
                  <li>마감일 이후에는 모든 수정이 불가합니다.</li>
                </ul>
              </div>
              {/* 동의 체크박스 */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20">
                <input
                  id="agree"
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => updateField('agree', e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded cursor-pointer accent-violet-600"
                />
                <label
                  htmlFor="agree"
                  className={`text-sm cursor-pointer ${form.agree ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="underline underline-offset-2 decoration-dashed hover:text-violet-600 transition-colors cursor-pointer"
                        onClick={(e) => { e.preventDefault(); setNotesOpen(true); }}
                      >
                        유의사항 및 저작권 안내
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:z-20">
                      {/* 스타일링된 헤더 */}
                      <div className="relative overflow-hidden bg-zinc-950 px-6 pt-6 pb-5">
                        <div className="absolute -top-16 -right-16 w-52 h-52 bg-violet-600/30 rounded-full blur-[60px] pointer-events-none" />
                        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-orange-500/20 rounded-full blur-[60px] pointer-events-none" />
                        <DialogHeader className="relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-orange-500 border border-white/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]">
                              <Shield className="h-5 w-5 text-white/90" />
                            </div>
                            <div>
                              <DialogTitle className="text-white text-lg font-bold">유의사항 및 저작권 안내</DialogTitle>
                              <DialogDescription className="text-zinc-400 text-sm mt-0.5">공모전 참가 전 반드시 확인해 주세요.</DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                      </div>
                      {/* 본문 */}
                      <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
                        {contest?.notes ? (
                          <div className="space-y-4">
                            {contest.notes.split(/\n\s*\n/).map((section, sectionIndex) => {
                              const lines = section.trim().split('\n').filter((l: string) => l.trim());
                              if (lines.length === 0) return null;

                              /* 숫자로 시작하는 줄은 섹션 제목으로 처리 */
                              const isTitle = /^\d+[\.)\s]/.test(lines[0]);
                              const titleLine = isTitle ? lines[0] : null;
                              const bodyLines = isTitle ? lines.slice(1) : lines;

                              return (
                                <div key={`section-${sectionIndex}`} className={sectionIndex > 0 ? 'pt-4 border-t border-border/50' : ''}>
                                  {titleLine && (
                                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                                      {titleLine}
                                    </h3>
                                  )}
                                  <div className="space-y-1.5">
                                    {bodyLines.map((line: string) => {
                                      const isBullet = /^[\-·•※]\s/.test(line);
                                      const content = isBullet ? line.replace(/^[\-·•※]\s/, '') : line;
                                      return (
                                        <p
                                          key={`line-${line}`}
                                          className={`text-sm leading-relaxed text-muted-foreground ${isBullet
                                            ? 'pl-4 relative before:absolute before:left-1 before:top-[0.55em] before:w-1 before:h-1 before:rounded-full before:bg-muted-foreground/40'
                                            : ''
                                            }`}
                                        >
                                          {content}
                                        </p>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                              <Info className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">유의사항 정보가 아직 등록되지 않았습니다.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">공모전 주최자에게 문의해 주세요.</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  에 동의합니다 <span className="text-red-500">*</span>
                </label>
              </div>
              {/* 제출 버튼 */}
              {submitError && (
                <p className="text-sm text-red-500 mt-4">{submitError}</p>
              )}
              {isSubmitting && (
                <p className="text-sm text-muted-foreground mt-4">
                  {uploadStep === 'preparing' && '업로드 준비 중...'}
                  {uploadStep === 'video' && '영상 업로드 중...'}
                  {uploadStep === 'thumbnail' && '썸네일 업로드 중...'}
                  {uploadStep === 'proof-images' && '인증 이미지 업로드 중...'}
                  {uploadStep === 'submission' && '출품작 정보를 저장하는 중...'}
                </p>
              )}
              <div className="flex items-center gap-3 mt-5">
                <Link href={`/contests/${contestId}/landing`} className="flex-1">
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
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer"
                  disabled={!canSubmit}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isSubmitting ? '업로드 중...' : '제출하기'}
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </section>

      {/* ===== 업로드 진행 / 성공 / 실패 통합 Dialog ===== */}
      <Dialog
        open={uploadStep !== null || submitted}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setUploadStep(null);
            setSubmitError(null);
            setUploadProgress(0);
            setErrorType(null);
            if (submitted) router.push(`/contests/${contestId}`);
          }
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
                <DialogTitle className="text-center">영상이 제출되었습니다!</DialogTitle>
                <DialogDescription className="text-center">
                  &quot;{form.title}&quot; 영상이 성공적으로 접수되었습니다.
                  검수 완료 후 공모전 출품작 목록에 표시됩니다.
                  {hasBonusConfigs && ' 가산점 인증은 마이페이지에서 추후 수정할 수 있습니다.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                {['영상 업로드', '썸네일 업로드', '출품작 등록'].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{label} 완료</span>
                  </div>
                ))}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
                <Button variant="outline" className="cursor-pointer flex-1" onClick={() => router.push(`/contests/${contestId}`)}>완료</Button>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer flex-1" onClick={() => router.push('/my/submissions')}>내 출품작 보기</Button>
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
                  { key: 'thumbnail', label: '썸네일 업로드', icon: ImageIcon, showProgress: false, file: thumbnailFile },
                  { key: 'proof-images', label: '인증 이미지 업로드', icon: Shield, showProgress: false, file: null },
                  { key: 'submission', label: '출품작 등록', icon: CheckCircle2, showProgress: false, file: null },
                ] as const).map((step) => {
                  const steps = ['preparing', 'video', 'thumbnail', 'proof-images', 'submission'] as const;
                  const currentIdx = uploadStep ? steps.indexOf(uploadStep) : -1;
                  const stepIdx = steps.indexOf(step.key);
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
                          isActive && !isFailed && 'bg-violet-500/10 text-violet-500',
                          isFailed && 'bg-red-500/10 text-red-500',
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
                            isFailed && 'text-red-600 dark:text-red-400',
                            isPending && 'text-muted-foreground',
                          )}>
                            {step.label}{isCompleted && ' ✓'}{isFailed && ' ✕'}
                          </p>
                          {isActive && step.file && !isFailed && (
                            <p className="text-xs text-muted-foreground truncate">
                              {step.file.name} ({(step.file.size / 1024 / 1024).toFixed(1)}MB)
                            </p>
                          )}
                        </div>
                        {isActive && step.showProgress && !isFailed && (
                          <span className="text-sm font-mono font-semibold text-violet-600 dark:text-violet-400 tabular-nums">{uploadProgress}%</span>
                        )}
                      </div>
                      {isActive && step.showProgress && !isFailed && (
                        <div className="ml-11 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
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
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-orange-500" />
                      </div>
                      <p className="text-center font-semibold">이미 제출한 공모전입니다</p>
                      <p className="text-center text-sm text-muted-foreground">이 공모전에는 이미 영상을 제출하셨습니다. 추가 제출은 불가합니다.</p>
                      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
                        <Button variant="outline" className="cursor-pointer flex-1" onClick={() => router.push(`/contests/${contestId}`)}>확인</Button>
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer flex-1" onClick={() => router.push('/my/submissions')}>내 출품작 보기</Button>
                      </DialogFooter>
                    </>
                  ) : errorType === 'contest_closed' ? (
                    /* 공모전 취소/종료 */
                    <>
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-500" />
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
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-500" />
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
                      <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-orange-500" />
                      </div>
                      <p className="text-center font-semibold">로그인이 필요합니다</p>
                      <p className="text-center text-sm text-muted-foreground">세션이 만료되었습니다. 다시 로그인해 주세요.</p>
                      <DialogFooter>
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer w-full" onClick={() => router.push(`/login?redirectTo=/contests/${contestId}/submit`)}>로그인하기</Button>
                      </DialogFooter>
                    </>
                  ) : (
                    /* 일반 오류 (기존 동작) */
                    <>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>{submitError}</p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" className="cursor-pointer w-full" onClick={() => { setUploadStep(null); setSubmitError(null); setUploadProgress(0); setErrorType(null); }}>닫기</Button>
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
            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            <DialogTitle className="text-center">이미 제출한 공모전입니다</DialogTitle>
            <DialogDescription className="text-center">
              이 공모전의 최대 출품 가능 수({contest?.maxSubmissionsPerUser ?? 1}개)를 초과하여
              더 이상 제출할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button variant="outline" className="cursor-pointer flex-1" onClick={() => router.push(`/contests/${contestId}`)}>확인</Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer flex-1" onClick={() => router.push('/my/submissions')}>내 출품작 보기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
