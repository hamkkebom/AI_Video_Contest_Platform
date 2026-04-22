'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Check, Clock, ImageIcon, ImagePlus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { refreshAccessToken } from '@/lib/supabase/refresh-token';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AdminSubmissionActionsProps {
  submissionId: string;
  submissionTitle: string;
  contestId: string;
  /** 현재 출품작 상태 */
  currentStatus?: string;
  /** 현재 출품작 데이터 (수정 폼 pre-fill용) */
  currentData: {
    title: string;
    description: string;
    aiTools?: string;
    productionProcess?: string;
    submitterName?: string;
    submitterPhone?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    submittedAt?: string;
  };
}

const SUBMISSION_STATUS_OPTIONS = [
  { value: 'pending_review', label: '검수대기' },
  { value: 'approved', label: '검수승인' },
  { value: 'rejected', label: '반려' },
  { value: 'needs_resubmission', label: '재제출 필요' },
  { value: 'judging', label: '심사중' },
  { value: 'judged', label: '심사완료' },
] as const;

interface FormState {
  title: string;
  description: string;
  aiTools: string;
  productionProcess: string;
  submitterName: string;
  submitterPhone: string;
  videoUrl: string;
  thumbnailUrl: string;
  submittedAt: string;
  status: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  videoMode: 'file' | 'url';
  thumbnailMode: 'file' | 'url';
}

function toLocalDatetime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function toFormState(data: AdminSubmissionActionsProps['currentData'], status?: string): FormState {
  return {
    title: data.title,
    description: data.description,
    aiTools: data.aiTools ?? '',
    productionProcess: data.productionProcess ?? '',
    submitterName: data.submitterName ?? '',
    submitterPhone: data.submitterPhone ?? '',
    videoUrl: data.videoUrl ?? '',
    thumbnailUrl: data.thumbnailUrl ?? '',
    submittedAt: toLocalDatetime(data.submittedAt),
    status: status ?? 'pending_review',
    videoFile: null,
    thumbnailFile: null,
    videoMode: 'url',
    thumbnailMode: 'url',
  };
}

export function AdminSubmissionActions({ submissionId, submissionTitle, contestId, currentStatus, currentData }: AdminSubmissionActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => toFormState(currentData, currentStatus));
  const [bonusConfigs, setBonusConfigs] = useState<Array<{ id: string; label: string; description?: string }>>([]);
  const [bonusForms, setBonusForms] = useState<Record<string, { snsUrl: string; proofImageFile: File | null; proofImagePreview: string | null }>>({});
  const [submitterAccount, setSubmitterAccount] = useState<{ name: string; email: string } | null>(null);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  /* 출품자가 Storage에 업로드한 proof-images 목록 (관리자가 수동 매칭용) */
  const [availableProofImages, setAvailableProofImages] = useState<Array<{
    name: string;
    createdAt: string;
    publicUrl: string;
  }>>([]);
  const [availableProofLoading, setAvailableProofLoading] = useState(false);
  const [availableProofError, setAvailableProofError] = useState<string | null>(null);
  /* 현재 이미지 picker 모달을 연 bonus_config_id (null이면 닫힘) */
  const [imagePickerConfigId, setImagePickerConfigId] = useState<string | null>(null);
  /* 확대 이미지 URL */
  const [pickerZoomUrl, setPickerZoomUrl] = useState<string | null>(null);
  /* Portal 마운트 확인 (SSR hydration 안전) */
  const [pickerMounted, setPickerMounted] = useState(false);
  useEffect(() => { setPickerMounted(true); }, []);

  useEffect(() => {
    if (editOpen) {
      setForm(toFormState(currentData, currentStatus));
      setAvailableProofError(null);
      Promise.all([
        fetch(`/api/submissions/${submissionId}`).then((r) => r.json()),
        fetch(`/api/contests/${contestId}`).then((r) => r.json()),
      ])
        .then(([submissionData, contestData]) => {
          const configs = contestData.bonusConfigs || [];
          setBonusConfigs(configs);
          /* 제출자 계정 정보 */
          const userId = submissionData.submission?.userId;
          if (userId) {
            fetch(`/api/admin/users/search?q=${userId}`).then(r => r.json()).then(users => {
              const u = Array.isArray(users) ? users[0] : null;
              if (u) setSubmitterAccount({ name: u.name || u.nickname || '알 수 없음', email: u.email || '' });
            }).catch(() => {});
          }
          const entries: Array<{ bonusConfigId: string; snsUrl?: string; proofImageUrl?: string }> =
            submissionData.submission?.bonusEntries || [];
          const forms: Record<string, { snsUrl: string; proofImageFile: File | null; proofImagePreview: string | null }> = {};
          for (const entry of entries) {
            forms[entry.bonusConfigId] = {
              snsUrl: entry.snsUrl || '',
              proofImageFile: null,
              proofImagePreview: entry.proofImageUrl || null,
            };
          }
          setBonusForms(forms);
        })
        .catch(() => {
          // 실패 시 무시 — 가산점 없이 수정 가능
        });

      /* 해당 유저가 Storage에 업로드한 proof-images 목록 조회 */
      setAvailableProofLoading(true);
      fetch(`/api/admin/submissions/${submissionId}/proof-images`)
        .then((r) => r.json())
        .then((data: { images?: Array<{ name: string; createdAt: string; publicUrl: string }>; error?: string }) => {
          if (data.images) {
            setAvailableProofImages(data.images);
          } else {
            setAvailableProofImages([]);
            setAvailableProofError(data.error ?? '이미지 목록을 불러오지 못했습니다.');
          }
        })
        .catch((err) => {
          setAvailableProofImages([]);
          setAvailableProofError(err instanceof Error ? err.message : '이미지 목록 조회 실패');
        })
        .finally(() => setAvailableProofLoading(false));
    }
  }, [editOpen, currentData, submissionId, contestId, currentStatus]);

  useEffect(() => {
    if (!form.videoFile) {
      setVideoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(form.videoFile);
    setVideoPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.videoFile]);

  useEffect(() => {
    if (!form.thumbnailFile) {
      setThumbnailPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(form.thumbnailFile);
    setThumbnailPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.thumbnailFile]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? '삭제에 실패했습니다.');
      }

      setDeleteOpen(false);
      router.push('/admin/submissions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = async () => {
    setEditLoading(true);
    setError(null);
    setUploadStep('');
    setUploadProgress(0);

    const shouldUploadVideo = form.videoMode === 'file' && !!form.videoFile;
    const shouldUploadThumbnail = form.thumbnailMode === 'file' && !!form.thumbnailFile;

    if (shouldUploadVideo || shouldUploadThumbnail) {
      setUploading(true);
    }

    try {
      let videoUrlToSubmit = form.videoUrl.trim();
      let thumbnailUrlToSubmit = form.thumbnailUrl.trim();

      if (shouldUploadVideo) {
        setUploadStep('영상 업로드 중...');
        setUploadProgress(0);

        /* 업로드 URL 요청 (60초 타임아웃 + 1회 재시도) */
        const fetchUploadUrl = async (): Promise<Response> => {
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
          uploadUrlResponse = await fetchUploadUrl();
        } catch {
          await new Promise((r) => setTimeout(r, 2000));
          uploadUrlResponse = await fetchUploadUrl();
        }

        const uploadUrlResult = (await uploadUrlResponse.json()) as {
          uploadURL?: string;
          uid?: string;
          error?: string;
        };

        if (!uploadUrlResponse.ok || !uploadUrlResult.uploadURL || !uploadUrlResult.uid) {
          throw new Error(uploadUrlResult.error ?? '영상 업로드 URL을 생성하지 못했습니다.');
        }

        /* Cloudflare 상태 확인 (error 상태 체크 + 15초 타임아웃) */
        const checkCfStatus = async (): Promise<boolean | 'error'> => {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15_000);
            const res = await fetch(`/api/stream/status?uid=${uploadUrlResult.uid}`, { signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok) return false;
            try {
              const data = await res.json();
              if (data.status?.state === 'error') return 'error';
            } catch {}
            return true;
          } catch { return false; }
        };

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
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

          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
            }
          };
          /* 전송 완료 → 즉시 1회 + 30초마다 폴링 */
          xhr.upload.onload = () => {
            setUploadProgress(100);
            const doPoll = async () => {
              const result = await checkCfStatus();
              if (result === 'error') {
                clearAllTimers(); xhr.abort();
                settle(() => reject(new Error('영상 파일을 처리할 수 없습니다. 다른 형식으로 다시 시도해 주세요.')));
                return;
              }
              if (result === true) {
                clearAllTimers(); xhr.abort();
                settle(() => resolve());
              }
            };
            doPoll();
            pollTimer = setInterval(doPoll, 30_000);
            hardDeadline = setTimeout(async () => {
              if (pollTimer) clearInterval(pollTimer);
              const result = await checkCfStatus();
              if (result === true) { xhr.abort(); settle(() => resolve()); }
              else { xhr.abort(); settle(() => reject(new Error('영상 업로드 시간이 초과되었습니다.'))); }
            }, 10 * 60 * 1000);
          };
          xhr.onload = async () => {
            clearAllTimers();
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadProgress(100);
              settle(() => resolve());
            } else {
              const result = await checkCfStatus();
              if (result === true) { setUploadProgress(100); settle(() => resolve()); }
              else settle(() => reject(new Error(`영상 업로드 실패 (${xhr.status})`)));
            }
          };
          xhr.onerror = async () => {
            const result = await checkCfStatus();
            if (result === true) { clearAllTimers(); setUploadProgress(100); settle(() => resolve()); }
            else { clearAllTimers(); settle(() => reject(new Error('네트워크 오류'))); }
          };
          xhr.ontimeout = () => { clearAllTimers(); settle(() => reject(new Error('시간 초과'))); };
          xhr.onabort = () => { clearAllTimers(); settle(() => {}); };
          const fd = new FormData();
          fd.append('file', form.videoFile!);
          xhr.send(fd);
        });

        videoUrlToSubmit = uploadUrlResult.uid;
      }

      if (shouldUploadThumbnail) {
        setUploadStep('썸네일 업로드 중...');
        setUploadProgress(0);

        const supabase = createBrowserClient()!;
        const tokenResult = await refreshAccessToken(supabase, {
          timeoutMs: 10000,
          currentToken: null,
          log: (msg) => console.log(`[출품작 수정] ${msg}`),
        });
        if (!tokenResult.ok) {
          throw new Error('인증 세션이 만료되었습니다. 페이지를 새로고침해 주세요.');
        }
        const accessToken = tokenResult.accessToken;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const safeName = form.thumbnailFile!.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const thumbnailPath = `admin/${crypto.randomUUID()}-${safeName}`;

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${supabaseUrl}/storage/v1/object/thumbnails/${thumbnailPath}`);
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
          xhr.setRequestHeader('x-upsert', 'false');
          xhr.setRequestHeader('apikey', anonKey);
          xhr.setRequestHeader('Content-Type', form.thumbnailFile!.type || 'application/octet-stream');
          xhr.timeout = 60_000;
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadProgress(100);
              resolve();
            } else {
              reject(new Error(`썸네일 업로드 실패 (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error('네트워크 오류'));
          xhr.ontimeout = () => reject(new Error('시간 초과'));
          xhr.send(form.thumbnailFile);
        });

        const { data: publicData } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);
        thumbnailUrlToSubmit = publicData.publicUrl;
      }

      // Upload any new bonus proof images
      const bonusFormsToSubmit: typeof bonusForms = {};
      for (const [configId, entry] of Object.entries(bonusForms)) {
        if (entry.proofImageFile) {
          setUploadStep('가산점 증빙 이미지 업로드 중...');
          setUploadProgress(0);
          setUploading(true);

          // refreshAccessToken 유틸리티 사용 (navigator.locks 충돌 방지)
          const supabaseClient = createBrowserClient()!;
          const proofTokenResult = await refreshAccessToken(supabaseClient, {
            timeoutMs: 10000,
            currentToken: null,
            log: (msg) => console.log(`[가산점 이미지] ${msg}`),
          });
          if (!proofTokenResult.ok) {
            throw new Error('인증 세션이 만료되었습니다. 페이지를 새로고침해 주세요.');
          }
          const proofAccessToken = proofTokenResult.accessToken;

          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
          const safeName = entry.proofImageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const proofPath = `admin/${crypto.randomUUID()}-${safeName}`;

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${supabaseUrl}/storage/v1/object/proof-images/${proofPath}`);
            xhr.setRequestHeader('Authorization', `Bearer ${proofAccessToken}`);
            xhr.setRequestHeader('x-upsert', 'false');
            xhr.setRequestHeader('apikey', anonKey);
            xhr.setRequestHeader('Content-Type', entry.proofImageFile!.type || 'application/octet-stream');
            xhr.timeout = 60_000;
            xhr.upload.onprogress = (ev) => {
              if (ev.lengthComputable) {
                setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setUploadProgress(100);
                resolve();
              } else {
                reject(new Error(`가산점 이미지 업로드 실패 (${xhr.status})`));
              }
            };
            xhr.onerror = () => reject(new Error('네트워크 오류'));
            xhr.ontimeout = () => reject(new Error('시간 초과'));
            xhr.send(entry.proofImageFile);
          });

          const { data: proofPublicData } = supabaseClient.storage.from('proof-images').getPublicUrl(proofPath);
          bonusFormsToSubmit[configId] = { ...entry, proofImagePreview: proofPublicData.publicUrl };
        } else {
          bonusFormsToSubmit[configId] = entry;
        }
      }

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          aiTools: form.aiTools,
          productionProcess: form.productionProcess,
          submitterName: form.submitterName,
          submitterPhone: form.submitterPhone,
          videoUrl: videoUrlToSubmit,
          thumbnailUrl: thumbnailUrlToSubmit,
          status: form.status,
          submittedAt: form.submittedAt ? new Date(form.submittedAt).toISOString() : undefined,
          bonusEntries: bonusConfigs.length > 0
            ? Object.entries(bonusFormsToSubmit)
                .map(([configId, entry]) => ({
                  bonusConfigId: configId,
                  snsUrl: entry.snsUrl?.trim() || undefined,
                  proofImageUrl: entry.proofImagePreview || undefined,
                }))
            : undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? '수정에 실패했습니다.');
      }

      setSaveSuccessMessage(
        shouldUploadVideo
          ? '출품작이 수정되었습니다. 영상 인코딩 처리에 수 분이 소요될 수 있습니다.'
          : '출품작이 수정되었습니다.'
      );
      setEditOpen(false);
      setSaveSuccessOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setEditLoading(false);
      setUploading(false);
      setUploadStep('');
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          type="button"
          className="cursor-pointer"
          onClick={() => {
            setError(null);
            setEditOpen(true);
          }}
        >
          <Pencil className="mr-1.5 h-4 w-4" />
          수정
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          className={cn('cursor-pointer text-destructive hover:text-destructive', 'border-destructive/30 hover:bg-destructive/10')}
          onClick={() => {
            setError(null);
            setDeleteOpen(true);
          }}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          삭제
        </Button>
      </div>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleteLoading) {
            setDeleteOpen(open);
            if (!open) setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>출품작을 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              &quot;{submissionTitle}&quot; 출품작을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => {
                setDeleteOpen(false);
                setError(null);
              }}
              disabled={deleteLoading}
            >
              취소
            </Button>
            <Button
              className="flex-1 cursor-pointer bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!editLoading && !uploading) {
            setEditOpen(open);
            if (!open) setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>출품작 수정</DialogTitle>
            <DialogDescription>
              관리자는 공모전 상태와 소유권에 관계없이 수정할 수 있습니다. (공모전 ID: {contestId})
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {submitterAccount && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">제출자 계정: </span>
                <span className="font-medium">{submitterAccount.name}</span>
                <span className="text-muted-foreground ml-1.5">({submitterAccount.email})</span>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="admin-submission-status">출품 상태</Label>
              <select
                id="admin-submission-status"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SUBMISSION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-submission-title">제목</Label>
              <Input
                id="admin-submission-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-submission-description">작품 설명</Label>
              <Textarea
                id="admin-submission-description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-submission-ai-tools">AI 도구</Label>
              <Input
                id="admin-submission-ai-tools"
                value={form.aiTools}
                onChange={(event) => setForm((prev) => ({ ...prev, aiTools: event.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-submission-production-process">제작 과정</Label>
              <Textarea
                id="admin-submission-production-process"
                value={form.productionProcess}
                onChange={(event) => setForm((prev) => ({ ...prev, productionProcess: event.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="admin-submission-submitter-name">제출자 이름</Label>
                <Input
                  id="admin-submission-submitter-name"
                  value={form.submitterName}
                  onChange={(event) => setForm((prev) => ({ ...prev, submitterName: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-submission-submitter-phone">제출자 연락처</Label>
                <Input
                  id="admin-submission-submitter-phone"
                  value={form.submitterPhone}
                  onChange={(event) => setForm((prev) => ({ ...prev, submitterPhone: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-submission-submitted-at">출품 시간</Label>
              <Input
                id="admin-submission-submitted-at"
                type="datetime-local"
                value={form.submittedAt}
                onChange={(event) => setForm((prev) => ({ ...prev, submittedAt: event.target.value }))}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>영상</Label>
                  <div className="flex gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, videoMode: 'file' }))}
                      className={cn('rounded px-2 py-0.5', form.videoMode === 'file' ? 'bg-primary text-primary-foreground' : 'bg-muted')}
                    >
                      파일
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, videoMode: 'url' }))}
                      className={cn('rounded px-2 py-0.5', form.videoMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted')}
                    >
                      URL
                    </button>
                  </div>
                </div>
                {form.videoMode === 'url' ? (
                  <Input
                    id="admin-submission-video-url"
                    value={form.videoUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                    placeholder="영상 URL"
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setForm((prev) => ({ ...prev, videoFile: file }));
                        }}
                      />
                      {form.videoFile ? (
                        <span className="text-sm text-muted-foreground">
                          {form.videoFile.name} ({(form.videoFile.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">클릭하여 영상 파일 선택</span>
                      )}
                    </label>
                    {videoPreviewUrl && (
                      <div className="space-y-2">
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="w-full max-h-48 rounded border bg-black"
                        />
                        <div className="rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-700">
                          ✅ 영상이 정상적으로 선택되었습니다. 저장 시 업로드됩니다.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>썸네일</Label>
                  <div className="flex gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, thumbnailMode: 'file' }))}
                      className={cn(
                        'rounded px-2 py-0.5',
                        form.thumbnailMode === 'file' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      )}
                    >
                      파일
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, thumbnailMode: 'url' }))}
                      className={cn(
                        'rounded px-2 py-0.5',
                        form.thumbnailMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      )}
                    >
                      URL
                    </button>
                  </div>
                </div>
                {form.thumbnailMode === 'url' ? (
                  <Input
                    id="admin-submission-thumbnail-url"
                    value={form.thumbnailUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
                    placeholder="썸네일 URL"
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setForm((prev) => ({ ...prev, thumbnailFile: file }));
                        }}
                      />
                      {form.thumbnailFile ? (
                        <span className="text-sm text-muted-foreground">
                          {form.thumbnailFile.name} ({(form.thumbnailFile.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">클릭하여 썸네일 파일 선택</span>
                      )}
                    </label>
                    {thumbnailPreviewUrl && (
                      <div
                        role="img"
                        className="h-16 w-16 rounded border bg-cover bg-center"
                        style={{ backgroundImage: `url(${thumbnailPreviewUrl})` }}
                        aria-label="썸네일 미리보기"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {bonusConfigs.length > 0 && (
            <div className="grid gap-3">
              <Label className="text-base font-semibold">가산점 항목</Label>
              {bonusConfigs.map((config) => {
                const entry = bonusForms[config.id] ?? { snsUrl: '', proofImageFile: null, proofImagePreview: null };
                return (
                  <div key={config.id} className="rounded-lg border p-3 grid gap-2">
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      {config.description && (
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      )}
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor={`bonus-sns-${config.id}`} className="text-xs">SNS URL</Label>
                      <Input
                        id={`bonus-sns-${config.id}`}
                        value={entry.snsUrl}
                        placeholder="https://..."
                        onChange={(ev) => {
                          const value = ev.target.value;
                          setBonusForms((prev) => {
                            const prevEntry = prev[config.id] ?? { snsUrl: '', proofImageFile: null, proofImagePreview: null };
                            return { ...prev, [config.id]: { ...prevEntry, snsUrl: value } };
                          });
                        }}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">증빙 이미지</Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(ev) => {
                              const file = ev.target.files?.[0] ?? null;
                              setBonusForms((prev) => {
                                const prevEntry = prev[config.id] ?? { snsUrl: '', proofImageFile: null, proofImagePreview: null };
                                const preview = file ? URL.createObjectURL(file) : prevEntry.proofImagePreview;
                                return { ...prev, [config.id]: { ...prevEntry, proofImageFile: file, proofImagePreview: preview } };
                              });
                            }}
                          />
                          {entry.proofImageFile ? (
                            <span className="text-xs text-muted-foreground">
                              {entry.proofImageFile.name} ({(entry.proofImageFile.size / 1024 / 1024).toFixed(1)}MB)
                            </span>
                          ) : (
                            <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                              새 이미지 업로드
                            </span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setImagePickerConfigId(config.id)}
                          className="flex h-20 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary cursor-pointer bg-primary/5"
                        >
                          <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                            <ImagePlus className="h-4 w-4" />
                            업로드된 이미지에서 선택
                            {availableProofImages.length > 0 && (
                              <span className="text-[10px] text-primary">
                                ({availableProofImages.length}장 업로드됨)
                              </span>
                            )}
                          </span>
                        </button>
                      </div>
                      {(entry.proofImagePreview) && (
                        <div className="flex items-start gap-2 mt-1">
                          <div
                            role="img"
                            className="h-16 w-16 rounded border bg-cover bg-center shrink-0 cursor-zoom-in"
                            style={{ backgroundImage: `url(${entry.proofImagePreview})` }}
                            aria-label="증빙 이미지 미리보기"
                            onClick={() => setPickerZoomUrl(entry.proofImagePreview)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setBonusForms((prev) => {
                                const prevEntry = prev[config.id] ?? { snsUrl: '', proofImageFile: null, proofImagePreview: null };
                                return { ...prev, [config.id]: { ...prevEntry, proofImageFile: null, proofImagePreview: null } };
                              });
                            }}
                            className="text-xs text-destructive hover:underline"
                          >
                            이미지 제거
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{uploadStep}</p>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => {
                setEditOpen(false);
                setError(null);
              }}
              disabled={editLoading || uploading}
            >
              취소
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={handleEdit} disabled={editLoading || uploading}>
              {editLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 업로드된 이미지에서 선택 — 픽커 모달 */}
      <Dialog
        open={imagePickerConfigId !== null}
        onOpenChange={(open) => {
          if (!open) setImagePickerConfigId(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>업로드된 가산점 증빙 이미지에서 선택</DialogTitle>
            <DialogDescription>
              {imagePickerConfigId && bonusConfigs.find((c) => c.id === imagePickerConfigId)?.label
                ? `"${bonusConfigs.find((c) => c.id === imagePickerConfigId)?.label}" 항목에 매칭할 이미지를 선택하세요.`
                : '매칭할 이미지를 선택하세요.'}
              {' '}제출자가 이 공모전에 업로드한 모든 증빙 이미지 목록입니다. 이미지 클릭 시 크게 보기.
            </DialogDescription>
          </DialogHeader>

          {availableProofLoading && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              이미지 목록을 불러오는 중...
            </div>
          )}

          {availableProofError && !availableProofLoading && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {availableProofError}
            </div>
          )}

          {!availableProofLoading && !availableProofError && availableProofImages.length === 0 && (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">이 제출자가 업로드한 이미지가 없습니다.</p>
            </div>
          )}

          {!availableProofLoading && availableProofImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-2">
              {availableProofImages.map((img) => {
                /* 다른 config에 이미 매칭된 이미지인지 표시 */
                const usedByConfigId = Object.entries(bonusForms).find(
                  ([, e]) => e.proofImagePreview === img.publicUrl,
                )?.[0];
                const usedByLabel = usedByConfigId
                  ? bonusConfigs.find((c) => c.id === usedByConfigId)?.label
                  : null;
                const isCurrent = imagePickerConfigId && usedByConfigId === imagePickerConfigId;

                return (
                  <div
                    key={img.name}
                    className={cn(
                      'relative group rounded-lg border-2 overflow-hidden cursor-pointer transition-all',
                      isCurrent
                        ? 'border-primary ring-2 ring-primary/30'
                        : usedByConfigId
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border hover:border-primary/50',
                    )}
                  >
                    <div
                      className="aspect-square bg-cover bg-center"
                      style={{ backgroundImage: `url(${img.publicUrl})` }}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!imagePickerConfigId) return;
                        setBonusForms((prev) => {
                          const prevEntry = prev[imagePickerConfigId] ?? {
                            snsUrl: '',
                            proofImageFile: null,
                            proofImagePreview: null,
                          };
                          return {
                            ...prev,
                            [imagePickerConfigId]: {
                              ...prevEntry,
                              proofImageFile: null,
                              proofImagePreview: img.publicUrl,
                            },
                          };
                        });
                        setImagePickerConfigId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          (e.currentTarget as HTMLElement).click();
                        }
                      }}
                    />
                    <div className="p-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {new Date(img.createdAt).toLocaleString('ko-KR', {
                            year: '2-digit',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {usedByLabel && (
                        <div className={cn(
                          'mt-1 text-[10px] font-medium truncate',
                          isCurrent ? 'text-primary' : 'text-amber-700 dark:text-amber-400',
                        )}>
                          {isCurrent ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" /> 현재 선택됨
                            </span>
                          ) : (
                            `→ ${usedByLabel}`
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPickerZoomUrl(img.publicUrl);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white transition-opacity"
                    >
                      크게 보기
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setImagePickerConfigId(null)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 이미지 확대 보기 오버레이 (픽커용) — Portal로 document.body에 렌더링 */}
      {pickerMounted && pickerZoomUrl && createPortal(
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 sm:p-8 cursor-zoom-out animate-in fade-in"
          role="dialog"
          aria-label="증빙 이미지 크게 보기"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setPickerZoomUrl(null);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <img
            src={pickerZoomUrl}
            alt="증빙 이미지 크게 보기"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70">
            이미지 밖을 클릭하면 닫힙니다
          </p>
        </div>,
        document.body,
      )}

      {/* 저장 성공 알림 모달 */}
      <Dialog
        open={saveSuccessOpen}
        onOpenChange={(open) => {
          setSaveSuccessOpen(open);
          if (!open) {
            /* 모달 닫을 때 부모 리스트 새로고침 */
            router.refresh();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>수정 완료</DialogTitle>
            <DialogDescription>{saveSuccessMessage || '출품작이 수정되었습니다.'}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setSaveSuccessOpen(false);
                router.refresh();
              }}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
