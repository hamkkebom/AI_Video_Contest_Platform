'use client';

import type { Route } from 'next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Settings, FileVideo, ImageIcon, X,
  ChevronDown, AlertCircle, CheckCircle2, Loader2, Shield,
} from 'lucide-react';
import { AiToolChips } from '@/components/common/ai-tool-chips';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CHAT_AI_TOOLS, IMAGE_AI_TOOLS, VIDEO_AI_TOOLS } from '@/config/constants';
import type { Contest } from '@/lib/types';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { refreshAccessToken } from '@/lib/supabase/refresh-token';

const MAX_THUMBNAIL_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PROOF_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024;

/* 회원 검색 API 응답 타입 */
type SearchUser = {
  id: string;
  email: string;
  name: string;
  nickname: string | null;
  roles: string[];
  status: string;
};

/** 가산점 인증 상태 (bonusConfigId별) */
type BonusFormEntry = {
  snsUrl: string;
  proofImageFile: File | null;
  proofImagePreview: string | null;
};

type AdminCreateSubmissionPayload = {
  contestId: string;
  userId: string;
  submitterName?: string;
  submitterPhone?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  submittedAt: string;
  aiTools?: string;
  productionProcess: string;
  tags: string[];
  bonusEntries?: Array<{ bonusConfigId: string; snsUrl?: string; proofImageUrl?: string }>;
  termsAgreed?: boolean;
};

function toDateTimeLocalValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 관리자 수동 출품작 등록 페이지
 * 기존 참가자 출품 폼(contests/[id]/submit)의 폼 구조를 그대로 사용하며,
 * 상단에 관리자 전용 필드(공모전 선택, 회원 검색, 출품일시)를 추가
 */
export default function AdminSubmissionRegisterPage() {
  const router = useRouter();
  const { session: authSession } = useAuth();

  /* ── 공모전 목록 ── */
  const [loadingContests, setLoadingContests] = useState(true);
  const [contests, setContests] = useState<Contest[]>([]);

  /* ── 회원 검색 ── */
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<SearchUser[]>([]);

  /* ── 관리자 설정 필드 ── */
  const [contestId, setContestId] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [submittedAt, setSubmittedAt] = useState(toDateTimeLocalValue(new Date()));

  /* ── 영상 정보 (기존 출품폼과 동일) ── */
  const [submitterName, setSubmitterName] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productionProcess, setProductionProcess] = useState('');

  /* ── AI 도구 ── */
  const [chatAi, setChatAi] = useState<string[]>([]);
  const [imageAi, setImageAi] = useState<string[]>([]);
  const [videoAi, setVideoAi] = useState<string[]>([]);

  /* ── 파일 ── */
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  /* ── 가산점 ── */
  const [openBonuses, setOpenBonuses] = useState<string[]>([]);
  const [bonusForms, setBonusForms] = useState<Record<string, BonusFormEntry>>({});

  /* #10: 업로드 중 탭 닫기 경고 */
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!submitting) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [submitting]);

  /* ── 제출 상태 ── */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [uploadStep, setUploadStep] = useState<'preparing' | 'video' | 'thumbnail' | 'proof-images' | 'submission' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('ko-KR');
    setUploadLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  /* 선택된 공모전 */
  const selectedContest = useMemo(
    () => contests.find((c) => c.id === contestId) ?? null,
    [contests, contestId],
  );
  const hasBonusConfigs = selectedContest?.bonusConfigs && selectedContest.bonusConfigs.length > 0;

  /* 공모전 목록 로드 */
  useEffect(() => {
    const loadContests = async () => {
      setLoadingContests(true);
      try {
        const response = await fetch('/api/contests');
        if (!response.ok) throw new Error('공모전 목록을 불러오지 못했습니다.');
        const data = (await response.json()) as Contest[];
        setContests(data);
      } catch (error) {
        console.error('Failed to load contests:', error);
        setErrorMessage(error instanceof Error ? error.message : '공모전 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingContests(false);
      }
    };
    loadContests();
  }, []);

  /* 회원 검색 — 전용 관리자 API 사용 */
  const handleSearchUsers = async () => {
    const query = userQuery.trim();
    if (!query) { setUserResults([]); return; }
    setSearchingUsers(true);
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('회원 검색에 실패했습니다.');
      const data = (await response.json()) as { users: SearchUser[] };
      setUserResults(data.users ?? []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setErrorMessage(error instanceof Error ? error.message : '회원 검색에 실패했습니다.');
    } finally {
      setSearchingUsers(false);
    }
  };

  /* 썸네일 파일 선택 */
  /* 영상 파일 선택 */
  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setErrorMessage('영상 파일은 최대 200MB까지 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('MP4, WebM, MOV, AVI 형식의 영상만 지원합니다.');
      event.target.value = '';
      return;
    }
    setErrorMessage(null);
    setVideoFile(file);
  };

  const handleVideoRemove = () => {
    setVideoFile(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    /* #12: MIME 타입 검증 */
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('썸네일은 JPG, PNG, WebP, GIF 형식만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
      setErrorMessage('썸네일 파일은 최대 10MB까지 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }
    setErrorMessage(null);
    setThumbnailFile(file);
  };

  const handleThumbnailRemove = () => {
    setThumbnailFile(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  /* 가산점 아코디언 토글 */
  const toggleBonus = (id: string) => {
    setOpenBonuses((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  /* 가산점 SNS URL 업데이트 */
  const updateBonusForm = (configId: string, value: string) => {
    setBonusForms((prev) => ({
      ...prev,
      [configId]: { ...prev[configId], snsUrl: value },
    }));
  };

  /* 가산점 인증 이미지 선택 */
  const handleProofImageSelect = (configId: string, file: File) => {
    if (file.size > MAX_PROOF_IMAGE_SIZE_BYTES) {
      setErrorMessage('인증 이미지는 최대 10MB까지 업로드할 수 있습니다.');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('JPG, PNG, WebP, GIF 형식의 이미지만 지원합니다.');
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
    if (entry?.proofImagePreview) URL.revokeObjectURL(entry.proofImagePreview);
    setBonusForms((prev) => ({
      ...prev,
      [configId]: { ...(prev[configId] || { snsUrl: '' }), proofImageFile: null, proofImagePreview: null },
    }));
  };

  const aiToolsValue = useMemo(() => {
    return [...new Set([...chatAi, ...imageAi, ...videoAi])].join(', ');
  }, [chatAi, imageAi, videoAi]);

  /* 필수 필드 유효성 검사 */
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!contestId) errors.contestId = '공모전을 선택해주세요';
    if (!selectedUser) errors.selectedUser = '회원을 선택해주세요';
    if (!title.trim()) errors.title = '영상 제목을 입력해주세요';
    if (!description.trim()) errors.description = '영상 설명을 입력해주세요';
    if (!videoFile) errors.videoFile = '영상 파일을 업로드해주세요';
    if (!thumbnailFile) errors.thumbnailFile = '썸네일 이미지를 업로드해주세요';
    if (!productionProcess.trim()) errors.productionProcess = '제작과정 설명을 입력해주세요';
    if (!agree) errors.agree = '유의사항에 동의해주세요';
    return errors;
  };

  /* 필드 변경 시 해당 에러 자동 제거 */
  useEffect(() => {
    setFieldErrors(prev => {
      const next = { ...prev };
      if (contestId) delete next.contestId;
      if (selectedUser) delete next.selectedUser;
      if (title.trim()) delete next.title;
      if (description.trim()) delete next.description;
      if (videoFile) delete next.videoFile;
      if (thumbnailFile) delete next.thumbnailFile;
      if (productionProcess.trim()) delete next.productionProcess;
      if (agree) delete next.agree;
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [contestId, selectedUser, title, description, videoFile, thumbnailFile, productionProcess, agree]);

  /* ── 제출 ── */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShowValidationPopup(true);
      return;
    }
    setFieldErrors({});
    if (!selectedUser || !thumbnailFile || !videoFile) return;

    const parsedDate = new Date(submittedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      setErrorMessage('출품일시를 올바르게 입력해주세요.');
      return;
    }

    let accessToken = authSession?.access_token;
    if (!accessToken) {
      setErrorMessage('로그인 세션이 만료되었습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }

    setUploadLogs([]);
    addLog('제출 프로세스 시작');
    setSubmitting(true);
    setErrorMessage(null);
    setUploadStep('preparing');
    setUploadProgress(0);
    setSubmitted(false);

    /* 업로드 중 세션 유지 타이머 (try 외부 선언 → finally에서 정리) */
    let activityKeepAlive: ReturnType<typeof setInterval> | undefined;
    let tokenKeepAlive: ReturnType<typeof setInterval> | undefined;

    try {
      const supabase = createBrowserClient()!;

      /* 업로드 중 세션 유지: activity keepalive (SessionTimeoutGuard 방지) */
      activityKeepAlive = setInterval(() => {
        try { localStorage.setItem('ggumple_last_activity', String(Date.now())); } catch {}
      }, 20_000);
      /* 업로드 중 주기적 토큰 갱신 (JWT 만료 방지) */
      tokenKeepAlive = setInterval(async () => {
        try {
          const r = await refreshAccessToken(supabase, {
            maxRetries: 1,
            timeoutMs: 10000,
            log: (msg) => addLog(`[keepalive] ${msg}`),
          });
          if (r.ok) accessToken = r.accessToken;
        } catch { /* 백그라운드 갱신 실패는 무시 */ }
      }, 4 * 60 * 1000);

      /* 단계: 영상 업로드 */
      setUploadStep('video');
      setUploadProgress(0);
      addLog('영상 업로드 시작');

      /* #13: 환경변수 안전 처리 */
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) {
        throw new Error('서버 설정 오류가 발생했습니다. 관리자에게 문의해 주세요.');
      }

      /* #9: 업로드 URL 요청 (60초 타임아웃 + 1회 재시도) */
      const fetchAdminUploadUrl = async (): Promise<Response> => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 60_000);
        try {
          return await fetch('/api/upload/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maxDurationSeconds: 600 }),
            signal: ctrl.signal,
          });
        } finally { clearTimeout(t); }
      };
      let uploadUrlResponse: Response;
      try {
        uploadUrlResponse = await fetchAdminUploadUrl();
      } catch {
        addLog('업로드 URL 1차 실패, 2초 후 재시도...');
        await new Promise((r) => setTimeout(r, 2000));
        uploadUrlResponse = await fetchAdminUploadUrl();
      }

      const uploadUrlResult = (await uploadUrlResponse.json()) as {
        uploadURL?: string;
        uid?: string;
        error?: string;
      };

      if (!uploadUrlResponse.ok || !uploadUrlResult.uploadURL || !uploadUrlResult.uid) {
        throw new Error(uploadUrlResult.error ?? '영상 업로드 URL을 생성하지 못했습니다.');
      }
      addLog('Cloudflare 업로드 URL 발급 완료');

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const progressMilestones = [25, 50, 75, 100] as const;
        const loggedMilestones = new Set<number>();
        xhr.open('POST', uploadUrlResult.uploadURL!);
        xhr.timeout = 10 * 60 * 1000;
        let settled = false;
        const settle = (fn: () => void) => { if (!settled) { settled = true; fn(); } };

        let pollTimer: ReturnType<typeof setInterval> | null = null;
        let hardDeadline: ReturnType<typeof setTimeout> | null = null;
        const clearAllTimers = () => {
          if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
          if (hardDeadline) { clearTimeout(hardDeadline); hardDeadline = null; }
        };
        /* #6: error 상태 체크 + #16: 타임아웃 추가 */
        const checkCloudflareStatus = async (): Promise<boolean | 'error'> => {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15_000);
            const statusRes = await fetch(`/api/stream/status?uid=${uploadUrlResult.uid}`, { signal: controller.signal });
            clearTimeout(timeout);
            if (!statusRes.ok) return false;
            try {
              const data = await statusRes.json();
              if (data.status?.state === 'error') return 'error';
            } catch {}
            return true;
          } catch { return false; }
        };

        xhr.upload.onprogress = (ev) => {
          if (!ev.lengthComputable) return;
          const progress = Math.round((ev.loaded / ev.total) * 100);
          setUploadProgress(progress);
          for (const milestone of progressMilestones) {
            if (progress >= milestone && !loggedMilestones.has(milestone)) {
              loggedMilestones.add(milestone);
              addLog(`영상 전송 ${milestone}%`);
            }
          }
        };
        /* 전송 100% 완료 → 즉시 1회 + 30초마다 Cloudflare 폴링, 최대 10분 */
        xhr.upload.onload = () => {
          setUploadProgress(100);
          if (!loggedMilestones.has(100)) {
            loggedMilestones.add(100);
            addLog('영상 전송 100%');
          }
          addLog('파일 전송 완료, Cloudflare 응답 대기 중 (30초 간격 확인, 최대 10분)...');

          /* 폴링 공통 핸들러 (#6: error 상태 체크) */
          const doPoll = async () => {
            addLog('Cloudflare 영상 존재 확인 중...');
            const result = await checkCloudflareStatus();
            if (result === 'error') {
              addLog('Cloudflare 영상 처리 오류 — 재생 불가 영상');
              clearAllTimers(); xhr.abort();
              settle(() => reject(new Error('영상 파일을 처리할 수 없습니다. 다른 형식의 파일로 다시 시도해 주세요.')));
              return;
            }
            if (result === true) {
              addLog('Cloudflare에 영상 존재 확인 — 업로드 성공');
              clearAllTimers(); xhr.abort();
              settle(() => resolve());
            }
          };

          /* #15: 즉시 첫 폴링 */
          doPoll();
          pollTimer = setInterval(doPoll, 30_000);

          hardDeadline = setTimeout(async () => {
            if (pollTimer) clearInterval(pollTimer);
            pollTimer = null;
            addLog('10분 경과 — 최종 확인');
            const result = await checkCloudflareStatus();
            if (result === true) {
              addLog('최종 확인 성공 — 업로드 성공');
              xhr.abort();
              settle(() => resolve());
            } else {
              addLog('10분 경과 후에도 영상 미확인 — 실패');
              xhr.abort();
              settle(() => reject(new Error('영상 업로드 후 서버 확인에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.')));
            }
          }, 10 * 60 * 1000);
        };
        /* #5: onabort 핸들러 */
        xhr.onabort = () => {
          clearAllTimers();
          settle(() => {}); /* 폴링에 의한 abort는 정상 종료 */
        };
        xhr.onload = async () => {
          clearAllTimers();
          addLog(`Cloudflare 응답 수신 (${xhr.status})`);
          if (xhr.status >= 200 && xhr.status < 300) { setUploadProgress(100); settle(() => resolve()); }
          else {
            addLog('비정상 응답, Cloudflare 확인 중...');
            const existsOnCf = await checkCloudflareStatus();
            if (existsOnCf) {
              addLog('Cloudflare에 영상 존재 확인 — 업로드 성공');
              setUploadProgress(100);
              settle(() => resolve());
            } else {
              settle(() => reject(new Error(`영상 파일 업로드에 실패했습니다. (${xhr.status})`)));
            }
          }
        };
        xhr.onerror = async () => {
          addLog('네트워크 오류 — Cloudflare 확인 중...');
          const existsOnCf = await checkCloudflareStatus();
          if (existsOnCf) {
            addLog('Cloudflare에 영상 존재 확인 — 업로드 성공');
            clearAllTimers();
            settle(() => resolve());
          } else {
            clearAllTimers();
            addLog('Cloudflare에도 영상 없음 — 실제 네트워크 오류');
            settle(() => reject(new Error('네트워크 오류로 영상 업로드에 실패했습니다.')));
          }
        };
        xhr.ontimeout = () => {
          clearAllTimers();
          settle(() => reject(new Error('영상 업로드 시간이 초과되었습니다.')));
        };
        const fd = new FormData(); fd.append('file', videoFile); xhr.send(fd);
      });

      const streamUid = uploadUrlResult.uid;

      /* 영상 업로드에 수 분이 소요되어 JWT가 만료되었을 수 있으므로 토큰 갱신 (최대 3회 재시도) */
      const tokenResult = await refreshAccessToken(supabase, {
        maxRetries: 3,
        initialDelayMs: 2000,
        log: (msg) => addLog(msg),
      });
      if (tokenResult.ok) {
        accessToken = tokenResult.accessToken;
      } else {
        addLog('토큰 갱신 완전 실패 — 페이지 새로고침 필요');
        throw new Error('인증 세션이 만료되었습니다. 페이지를 새로고침 후 다시 시도해 주세요.');
      }

      /* 단계: 썸네일 업로드 */
      setUploadStep('thumbnail');
      setUploadProgress(0);
      addLog('썸네일 업로드 시작');

      /* 2) 썸네일 업로드 → Supabase Storage */
      const safeName = thumbnailFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const thumbnailPath = `${contestId}/${crypto.randomUUID()}-${safeName}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${supabaseUrl}/storage/v1/object/thumbnails/${thumbnailPath}`);
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.setRequestHeader('apikey', anonKey);
        xhr.setRequestHeader('Content-Type', thumbnailFile.type || 'application/octet-stream');
        xhr.timeout = 90_000;
        xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) { setUploadProgress(100); resolve(); }
          else {
            addLog(`썸네일 업로드 실패: ${xhr.status} ${xhr.responseText?.slice(0, 200)}`);
            reject(new Error(`썸네일 업로드 실패 (${xhr.status}). 페이지를 새로고침 후 다시 시도해 주세요.`));
          }
        };
        xhr.onerror = () => { addLog('썸네일 네트워크 오류'); reject(new Error('네트워크 오류로 썸네일 업로드에 실패했습니다.')); };
        xhr.ontimeout = () => { addLog('썸네일 타임아웃'); reject(new Error('썸네일 업로드 시간이 초과되었습니다.')); };
        xhr.send(thumbnailFile);
      });

      const { data: thumbnailPublicData } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);
      if (!thumbnailPublicData.publicUrl) throw new Error('썸네일 공개 URL 생성에 실패했습니다.');

      /* 단계: 인증 이미지 업로드 */
      setUploadStep('proof-images');
      setUploadProgress(0);

      /* 3) 가산점 인증 이미지 업로드 */
      const bonusEntries: Array<{ bonusConfigId: string; snsUrl?: string; proofImageUrl?: string }> = [];
      const bonusFormEntries = Object.entries(bonusForms).filter(
        ([, entry]) => entry.snsUrl?.trim() || entry.proofImageFile,
      );

      for (const [configId, entry] of bonusFormEntries) {
        let proofImageUrl: string | undefined;
        if (entry.proofImageFile) {
          const safeFileName = entry.proofImageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const proofPath = `${contestId}/${selectedUser.id}/${crypto.randomUUID()}-${safeFileName}`;
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${supabaseUrl}/storage/v1/object/proof-images/${proofPath}`);
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            xhr.setRequestHeader('x-upsert', 'false');
            xhr.setRequestHeader('apikey', anonKey);
            xhr.setRequestHeader('Content-Type', entry.proofImageFile!.type || 'application/octet-stream');
            xhr.timeout = 90_000;
            /* #14: 증빙이미지 진행률 표시 */
            xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100)); };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) { setUploadProgress(100); resolve(); }
              else reject(new Error(`인증 이미지 업로드 실패 (${xhr.status})`));
            };
            xhr.onerror = () => reject(new Error('네트워크 오류로 인증 이미지 업로드에 실패했습니다.'));
            xhr.ontimeout = () => reject(new Error('인증 이미지 업로드 시간이 초과되었습니다.'));
            xhr.send(entry.proofImageFile);
          });
          const { data: proofPublicData } = supabase.storage.from('proof-images').getPublicUrl(proofPath);
          proofImageUrl = proofPublicData.publicUrl;
        }
        bonusEntries.push({
          bonusConfigId: configId,
          snsUrl: entry.snsUrl?.trim() || undefined,
          proofImageUrl,
        });
      }

      /* 단계: 출품작 등록 */
      setUploadStep('submission');
      setUploadProgress(0);
      addLog('출품작 등록 API 호출');

      /* 4) 출품작 등록 API 호출 */
      const payload: AdminCreateSubmissionPayload = {
        contestId,
        userId: selectedUser.id,
        submitterName: submitterName.trim() || undefined,
        submitterPhone: submitterPhone.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        videoUrl: streamUid,
        thumbnailUrl: thumbnailPublicData.publicUrl,
        submittedAt: parsedDate.toISOString(),
        aiTools: aiToolsValue || undefined,
        productionProcess: productionProcess.trim(),
        tags: [],
        bonusEntries: bonusEntries.length > 0 ? bonusEntries : undefined,
        termsAgreed: agree,
      };

      const response = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? '출품작 등록에 실패했습니다.');

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to create admin submission:', error);
      setErrorMessage(error instanceof Error ? error.message : '출품작 등록에 실패했습니다.');
      /* uploadStep은 유지하여 실패 단계 표시 */
    } finally {
      /* 업로드 중 세션 유지 타이머 정리 */
      if (activityKeepAlive) clearInterval(activityKeepAlive);
      if (tokenKeepAlive) clearInterval(tokenKeepAlive);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">관리자가 회원 출품작을 수동으로 등록합니다</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">출품작 등록</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ===== STEP 0: 관리자 설정 ===== */}
        <Card className="p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold">관리자 설정</h2>
              <p className="text-xs text-muted-foreground">공모전, 회원, 출품일시를 먼저 지정합니다</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-submission-contest" className="text-sm font-semibold">
                  공모전 선택 <span className="text-red-500">*</span>
                </Label>
                <select
                  id="admin-submission-contest"
                  value={contestId}
                  onChange={(e) => { setContestId(e.target.value); setBonusForms({}); setOpenBonuses([]); }}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={loadingContests}
                >
                  <option value="">공모전을 선택하세요</option>
                  {contests.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {fieldErrors.contestId && <p className="text-xs text-red-500 mt-1">{fieldErrors.contestId}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-submission-submitted-at" className="text-sm font-semibold">
                  출품일시 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="admin-submission-submitted-at"
                  type="datetime-local"
                  value={submittedAt}
                  onChange={(e) => setSubmittedAt(e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>
            </div>

            {/* 회원 검색 */}
            <div className="space-y-2">
              <Label htmlFor="admin-submission-user-search" className="text-sm font-semibold">
                회원 검색 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="admin-submission-user-search"
                  placeholder="이름, 닉네임, 이메일로 검색"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSearchUsers(); } }}
                  className="bg-background/50 border-border"
                />
                <Button type="button" variant="outline" onClick={() => void handleSearchUsers()} disabled={searchingUsers}>
                  <Search className="h-4 w-4 mr-1" />
                  {searchingUsers ? '검색 중...' : '검색'}
                </Button>
              </div>

              {selectedUser && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 truncate">
                      {selectedUser.name}{selectedUser.nickname ? ` (@${selectedUser.nickname})` : ''}
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 truncate">{selectedUser.email}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedUser(null)} className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 cursor-pointer">변경</button>
                </div>
              )}

              {userResults.length > 0 && !selectedUser && (
                <div className="space-y-1 rounded-lg border border-border p-2 max-h-60 overflow-y-auto">
                  {userResults.map((user) => (
                    <button key={user.id} type="button" onClick={() => { setSelectedUser(user); setUserResults([]); }} className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-primary/5 cursor-pointer">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{user.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{user.name}{user.nickname ? ` (@${user.nickname})` : ''}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {userResults.length === 0 && userQuery.trim() && !searchingUsers && !selectedUser && (
                <p className="text-xs text-muted-foreground">검색 결과가 없습니다.</p>
              )}
              {fieldErrors.selectedUser && !selectedUser && <p className="text-xs text-red-500 mt-1">{fieldErrors.selectedUser}</p>}
            </div>
          </div>
        </Card>

        {/* ===== STEP 1: 영상 정보 (기존 출품폼과 동일) ===== */}
        <Card className="p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div>
              <h2 className="text-lg font-bold">영상 정보</h2>
              <p className="text-xs text-muted-foreground">영상의 기본 정보를 입력해 주세요</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="submitter-name" className="text-sm font-semibold">이름</Label>
              <Input
                id="submitter-name"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="bg-background/50 border-border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="submitter-phone" className="text-sm font-semibold">전화번호</Label>
              <Input
                id="submitter-phone"
                value={submitterPhone}
                onChange={(e) => setSubmitterPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="bg-background/50 border-border"
              />
            </div>

            {/* 영상 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                영상 제목 <span className="text-red-500">*</span>
              </Label>
              <Input id="title" type="text" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="영상 제목을 입력하세요 (최대 100자)" className="bg-background/50 border-border" />
              <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
              {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
            </div>

            {/* 영상 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                영상 설명 <span className="text-red-500">*</span>
              </Label>
              <Textarea id="description" maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="영상에 대한 설명을 입력하세요. 제작 의도, 주제 해석 등을 포함해 주세요." className="min-h-32 bg-background/50 border-border" />
              <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
              {fieldErrors.description && <p className="text-xs text-red-500">{fieldErrors.description}</p>}
            </div>

            {/* AI 도구 */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">
                사용한 AI 도구 <span className="text-xs text-muted-foreground font-normal">(선택)</span>
              </Label>
              <AiToolChips label="💬 채팅 AI" tools={CHAT_AI_TOOLS} selected={chatAi} onChange={setChatAi} allowCustom />
              <AiToolChips label="🖼️ 이미지 AI" tools={IMAGE_AI_TOOLS} selected={imageAi} onChange={setImageAi} allowCustom />
              <AiToolChips label="🎬 영상 AI" tools={VIDEO_AI_TOOLS} selected={videoAi} onChange={setVideoAi} allowCustom />
            </div>

            {/* 제작과정 */}
            <div className="space-y-2">
              <Label htmlFor="productionProcess" className="text-sm font-semibold">
                제작과정 설명 <span className="text-red-500">*</span>
              </Label>
              <Textarea id="productionProcess" maxLength={3000} value={productionProcess} onChange={(e) => setProductionProcess(e.target.value)} placeholder="영상의 기획 → 제작 → 편집 과정을 상세히 설명해 주세요." className="min-h-48 bg-background/50 border-border" />
              <p className="text-xs text-muted-foreground text-right">{productionProcess.length}/3000</p>
              {fieldErrors.productionProcess && <p className="text-xs text-red-500">{fieldErrors.productionProcess}</p>}
            </div>
          </div>
        </Card>

        {/* ===== STEP 2: 파일 업로드 ===== */}
        <Card className="p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <div>
              <h2 className="text-lg font-bold">파일 업로드</h2>
              <p className="text-xs text-muted-foreground">영상 파일과 썸네일 이미지를 업로드해 주세요</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {/* 썸네일 이미지 업로드 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                썸네일 이미지 <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">JPG, PNG 형식, 최대 10MB · 권장 1920×1080px</p>
              <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
              {thumbnailFile ? (
                <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{thumbnailFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(thumbnailFile.size)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleThumbnailRemove} className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-xl p-5 sm:p-8 flex flex-col items-center gap-3 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-violet-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">썸네일 업로드</p>
                    <p className="text-xs text-muted-foreground mt-0.5">클릭하여 선택</p>
                  </div>
                </button>
              )}
              {fieldErrors.thumbnailFile && <p className="text-xs text-red-500 mt-1">{fieldErrors.thumbnailFile}</p>}
            </div>

            {/* 영상 파일 업로드 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                영상 파일 <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">MP4, WebM, MOV 형식, 최대 200MB</p>
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden" onChange={handleVideoSelect} />
              {videoFile ? (
                <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <FileVideo className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(videoFile.size)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleVideoRemove} className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-xl p-5 sm:p-8 flex flex-col items-center gap-3 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <FileVideo className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">영상 업로드</p>
                    <p className="text-xs text-muted-foreground mt-0.5">클릭하여 선택</p>
                  </div>
                </button>
              )}
              {fieldErrors.videoFile && <p className="text-xs text-red-500 mt-1">{fieldErrors.videoFile}</p>}
            </div>
          </div>
        </Card>

        {/* ===== STEP 3: 가산점 인증 (조건부 — 공모전에 bonusConfigs가 있을 때만) ===== */}
        {hasBonusConfigs && (
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <div>
                <h2 className="text-lg font-bold">가산점 인증 <span className="text-xs text-muted-foreground font-normal ml-1">(선택)</span></h2>
                <p className="text-xs text-muted-foreground">추후 마이페이지에서도 등록 가능합니다</p>
              </div>
            </div>
            {selectedContest?.bonusMaxScore && (
              <p className="text-xs text-muted-foreground mb-4 pl-11">
                항목당 1회만 인정 · 최대 {selectedContest.bonusMaxScore}점
              </p>
            )}
            <div className="space-y-2">
              {selectedContest!.bonusConfigs!.map((config) => {
                const isOpen = openBonuses.includes(config.id);
                const entry = bonusForms[config.id] || { snsUrl: '', proofImageFile: null, proofImagePreview: null };
                return (
                  <Card key={config.id} className="border border-border overflow-hidden">
                    {/* 아코디언 헤더 */}
                    <button type="button" onClick={() => toggleBonus(config.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors cursor-pointer">
                      <span className="flex-1 text-sm font-medium">{config.label}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {/* 아코디언 본문 */}
                    <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        {config.description && <p className="text-xs text-muted-foreground">{config.description}</p>}
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
                              <img src={entry.proofImagePreview} alt="인증 이미지 미리보기" className="w-full max-h-48 object-contain" />
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 bg-muted/20">
                              <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                                {entry.proofImageFile.name} ({formatFileSize(entry.proofImageFile.size)})
                              </span>
                              <button type="button" onClick={() => handleProofImageRemove(config.id)} className="text-xs text-red-500 hover:text-red-600 cursor-pointer font-medium shrink-0">제거</button>
                            </div>
                          </div>
                        ) : (
                          <label className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-dashed border-border hover:border-violet-500/50 cursor-pointer transition-colors">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">캡처 이미지 업로드 (JPG, PNG, WebP, 최대 10MB)</span>
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleProofImageSelect(config.id, file); e.target.value = ''; }} className="hidden" />
                          </label>
                        )}
                        <p className="text-xs text-orange-500">※ URL과 캡처 이미지를 모두 제출해야 가산점이 인정됩니다.</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        {/* 동의 체크박스 */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20">
          <input
            id="admin-agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded cursor-pointer accent-violet-600"
          />
          <label htmlFor="admin-agree" className={`text-sm cursor-pointer ${agree ? 'text-foreground' : 'text-muted-foreground'}`}>
            유의사항 및 저작권 안내에 동의합니다 <span className="text-red-500">*</span>
          </label>
        </div>
        {fieldErrors.agree && <p className="text-xs text-red-500 mt-1 ml-8">{fieldErrors.agree}</p>}

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/submissions' as Route)} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-[120px]">
            {submitting ? '등록 중...' : '출품작 등록'}
          </Button>
        </div>
      </form>

      {/* ===== 유효성 검사 실패 안내 팝업 ===== */}
      <Dialog open={showValidationPopup} onOpenChange={setShowValidationPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            <DialogTitle className="text-center">필수 항목을 확인해주세요</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              다음 항목이 입력되지 않았습니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {Object.values(fieldErrors).map((msg) => (
              <div key={msg} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full cursor-pointer" onClick={() => setShowValidationPopup(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 업로드 진행 / 성공 / 실패 Dialog ===== */}
      <Dialog
        open={uploadStep !== null || submitted}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setUploadStep(null);
            setErrorMessage(null);
            setUploadProgress(0);
            if (submitted) {
              setSubmitted(false);
              router.push('/admin/submissions' as Route);
              router.refresh();
            }
          }
        }}
      >
        <DialogContent
          className={cn('sm:max-w-md', submitting && '[&>button]:hidden')}
          onPointerDownOutside={(e) => { if (submitting) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (submitting) e.preventDefault(); }}
        >
          {submitted ? (
            <>
              <DialogHeader>
                <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <DialogTitle className="text-center">출품작이 등록되었습니다!</DialogTitle>
                <DialogDescription className="text-center">
                  &quot;{title}&quot; 출품작이 성공적으로 등록되었습니다.
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
                <Button variant="outline" className="cursor-pointer flex-1" onClick={() => { setSubmitted(false); setUploadStep(null); router.push('/admin/submissions' as Route); router.refresh(); }}>출품작 목록</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-lg">
                  {errorMessage ? '등록 실패' : '출품작 등록 중'}
                </DialogTitle>
                <DialogDescription className="text-center text-sm text-muted-foreground">
                  {errorMessage ? '아래 단계에서 오류가 발생했습니다.' : '창을 닫지 마세요. 영상 크기에 따라 수 분이 걸릴 수 있습니다.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {([
                  { key: 'preparing', label: '업로드 준비', icon: Loader2, showProgress: false },
                  { key: 'video', label: '영상 업로드', icon: FileVideo, showProgress: true },
                  { key: 'thumbnail', label: '썸네일 업로드', icon: ImageIcon, showProgress: true },
                  { key: 'proof-images', label: '인증 이미지 업로드', icon: Shield, showProgress: false },
                  { key: 'submission', label: '출품작 등록', icon: CheckCircle2, showProgress: false },
                ] as const).map((step) => {
                  const steps = ['preparing', 'video', 'thumbnail', 'proof-images', 'submission'] as const;
                  const currentIdx = uploadStep ? steps.indexOf(uploadStep) : -1;
                  const stepIdx = steps.indexOf(step.key);
                  const isActive = uploadStep === step.key;
                  const isCompleted = currentIdx > stepIdx;
                  const isPending = currentIdx < stepIdx;
                  const isFailed = isActive && !!errorMessage;
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
                          {isActive && step.key === 'video' && uploadProgress >= 100 && !isFailed && (
                            <p className="text-xs text-orange-500 animate-pulse">서버에서 처리 중입니다. 잠시 기다려주세요...</p>
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
              {uploadLogs.length > 0 && (
                <details className="mt-4" open>
                  <summary className="text-xs text-muted-foreground cursor-pointer">업로드 상세 로그</summary>
                  <div className="mt-2 max-h-40 overflow-y-auto bg-muted/50 rounded p-2 font-mono text-xs space-y-0.5">
                    {uploadLogs.map((log) => (
                      <p key={log} className="text-muted-foreground">{log}</p>
                    ))}
                  </div>
                </details>
              )}
              {errorMessage && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-red-500">{errorMessage}</p>
                  <DialogFooter>
                    <Button variant="outline" className="cursor-pointer w-full" onClick={() => { setSubmitting(false); setUploadStep(null); setErrorMessage(null); setUploadProgress(0); }}>닫기</Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
