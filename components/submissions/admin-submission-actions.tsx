'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
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
  };
}

interface FormState {
  title: string;
  description: string;
  aiTools: string;
  productionProcess: string;
  submitterName: string;
  submitterPhone: string;
  videoUrl: string;
  thumbnailUrl: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  videoMode: 'file' | 'url';
  thumbnailMode: 'file' | 'url';
}

function toFormState(data: AdminSubmissionActionsProps['currentData']): FormState {
  return {
    title: data.title,
    description: data.description,
    aiTools: data.aiTools ?? '',
    productionProcess: data.productionProcess ?? '',
    submitterName: data.submitterName ?? '',
    submitterPhone: data.submitterPhone ?? '',
    videoUrl: data.videoUrl ?? '',
    thumbnailUrl: data.thumbnailUrl ?? '',
    videoFile: null,
    thumbnailFile: null,
    videoMode: 'url',
    thumbnailMode: 'url',
  };
}

export function AdminSubmissionActions({ submissionId, submissionTitle, contestId, currentData }: AdminSubmissionActionsProps) {
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
  const [form, setForm] = useState<FormState>(() => toFormState(currentData));

  useEffect(() => {
    if (editOpen) {
      setForm(toFormState(currentData));
    }
  }, [editOpen, currentData]);

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

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadUrlResult.uploadURL!);
          xhr.timeout = 10 * 60 * 1000;
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
              reject(new Error(`영상 업로드 실패 (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error('네트워크 오류'));
          xhr.ontimeout = () => reject(new Error('시간 초과'));
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) {
          throw new Error('인증 세션이 만료되었습니다.');
        }

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
          xhr.timeout = 30_000;
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
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? '수정에 실패했습니다.');
      }

      if (shouldUploadVideo) {
        alert('영상이 업로드되었습니다. 인코딩 처리에 수 분이 소요될 수 있습니다.');
      }

      setEditOpen(false);
      router.refresh();
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>출품작 수정</DialogTitle>
            <DialogDescription>
              관리자는 공모전 상태와 소유권에 관계없이 수정할 수 있습니다. (공모전 ID: {contestId})
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
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
                      <div className="rounded border bg-muted px-3 py-2 text-xs text-muted-foreground">
                        선택된 영상 파일이 업로드됩니다.
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
    </>
  );
}
