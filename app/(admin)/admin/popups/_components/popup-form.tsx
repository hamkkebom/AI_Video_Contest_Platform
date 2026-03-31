'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Popup, PopupMutationInput, PopupStatus } from '@/lib/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { refreshAccessToken } from '@/lib/supabase/refresh-token';
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type PopupFormMode = 'create' | 'edit';

type PopupFormProps = {
  mode: PopupFormMode;
  popupId?: string;
};

function toDateTimeLocalValue(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function toIsoString(value: string): string {
  return new Date(value).toISOString();
}

/** 팝업 이미지 업로드 — XHR 기반 Supabase Storage 직접 업로드 (진행률 지원) */
async function uploadPopupImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const supabase = createBrowserClient();
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.');

  /* refreshAccessToken으로 토큰 갱신 (getSession만으로는 만료 토큰 반환 가능) */
  /* 현재 세션에서 토큰 가져오기 (SDK 호출 없이) */
  const existingToken = typeof window !== 'undefined'
    ? document.cookie.split(';').find(c => c.trim().startsWith('sb-'))?.split('=')[1] ?? null
    : null;
  const tokenResult = await refreshAccessToken(supabase, {
    timeoutMs: 10000,
    currentToken: existingToken,
    log: (msg) => console.log(`[팝업 이미지] ${msg}`),
  });
  if (!tokenResult.ok) throw new Error('인증이 필요합니다. 페이지를 새로고침해 주세요.');
  const accessToken = tokenResult.accessToken;

  /* 이미지 검증: 10MB 제한, JPEG/PNG/WebP/GIF */
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (file.size > 10 * 1024 * 1024) throw new Error('이미지 파일은 10MB 이하여야 합니다.');
  if (!imageTypes.includes(file.type)) throw new Error('지원하지 않는 이미지 형식입니다. (JPG, PNG, WebP, GIF)');

  /* contest-assets 버킷, popup-image/ 접두어로 분리 */
  const bucket = 'contest-assets';
  const ext = file.name.split('.').pop() || 'bin';
  const filePath = `popup-image/${crypto.randomUUID()}/${Date.now()}.${ext}`;

  /* XHR로 Supabase Storage에 직접 업로드 — 실시간 progress 지원 */
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.timeout = 60 * 1000; /* 1분 타임아웃 */

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && onProgress) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        let errMsg = '업로드 실패';
        try { const body = JSON.parse(xhr.responseText); errMsg = body.message || body.error || errMsg; } catch { /* 파싱 실패 무시 */ }
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => reject(new Error('네트워크 오류로 업로드에 실패했습니다.'));
    xhr.ontimeout = () => reject(new Error('업로드 시간이 초과되었습니다.'));
    xhr.send(file);
  });

  /* 공개 URL 생성 */
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl.publicUrl;
}

export default function PopupForm({ mode, popupId }: PopupFormProps) {
  const router = useRouter();

  const now = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(now.getTime() + 24 * 60 * 60 * 1000), [now]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_blank');
  const [status, setStatus] = useState<PopupStatus>('draft');
  const [displayStartAt, setDisplayStartAt] = useState(toDateTimeLocalValue(now.toISOString()));
  const [displayEndAt, setDisplayEndAt] = useState(toDateTimeLocalValue(tomorrow.toISOString()));
  const [sortOrder, setSortOrder] = useState(0);

  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* 이미지 업로드 관련 상태 */
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== 'edit' || !popupId) return;

    const loadPopup = async () => {
      try {
        const response = await fetch(`/api/admin/popups/${popupId}`);
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error('팝업 정보를 불러오지 못했습니다.');
        }

        const data = (await response.json()) as { popup: Popup };
        const popup = data.popup;

        setTitle(popup.title);
        setContent(popup.content ?? '');
        setImageUrl(popup.imageUrl ?? '');
        if (popup.imageUrl) setImagePreview(popup.imageUrl);
        setLinkUrl(popup.linkUrl ?? '');
        setLinkTarget(popup.linkTarget ?? '_self');
        setStatus(popup.status);
        setDisplayStartAt(toDateTimeLocalValue(popup.displayStartAt));
        setDisplayEndAt(toDateTimeLocalValue(popup.displayEndAt));
        setSortOrder(popup.sortOrder);
      } catch (error) {
        console.error('Failed to load popup:', error);
        setErrorMessage('팝업 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPopup();
  }, [mode, popupId]);

  /** 파일 선택 시 미리보기 생성 + Storage 업로드 (모달로 진행률 표시) */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    /* 미리보기 즉시 표시 */
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    /* 모달 열기 + 상태 초기화 */
    setUploadFileName(file.name);
    setUploadError(null);
    setUploadProgress(0);
    setUploading(true);
    setUploadModalOpen(true);
    setErrorMessage(null);

    try {
      const url = await uploadPopupImage(file, setUploadProgress);
      setImageUrl(url);
      setUploading(false);
    } catch (error) {
      console.error('팝업 이미지 업로드 실패:', error);
      const msg = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      setUploadError(msg);
      setUploading(false);
      setImagePreview(null);
      setImageUrl('');
    } finally {
      /* input 초기화 — 같은 파일 재선택 허용 */
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /** 이미지 제거 */
  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('제목은 필수입니다.');
      return;
    }
    if (!displayStartAt || !displayEndAt) {
      setErrorMessage('노출 시작/종료일을 입력해주세요.');
      return;
    }
    if (!content.trim() && !imageUrl.trim()) {
      setErrorMessage('내용 또는 이미지 중 하나는 필수입니다.');
      return;
    }

    const payload: PopupMutationInput = {
      title: title.trim(),
      content: content.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      linkUrl: linkUrl.trim() || undefined,
      linkTarget,
      status,
      displayStartAt: toIsoString(displayStartAt),
      displayEndAt: toIsoString(displayEndAt),
      sortOrder,
    };

    setSubmitting(true);

    try {
      const url = mode === 'create' ? '/api/admin/popups' : `/api/admin/popups/${popupId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { popup?: Popup; error?: string };
      if (!response.ok || !data.popup) {
        throw new Error(data.error ?? '요청 처리에 실패했습니다.');
      }

      router.push('/admin/popups');
      router.refresh();
    } catch (error) {
      console.error('Failed to submit popup form:', error);
      setErrorMessage(error instanceof Error ? error.message : '요청 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-muted-foreground">팝업 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">팝업을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* 이미지 업로드 진행 모달 */}
      <Dialog open={uploadModalOpen} onOpenChange={(open) => { if (!uploading) setUploadModalOpen(open); }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => { if (uploading) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle className="text-center text-lg">
              {uploadError ? '업로드 실패' : uploading ? '이미지 업로드 중' : '업로드 완료'}
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              {uploadError
                ? '파일 업로드 중 오류가 발생했습니다.'
                : uploading
                  ? '창을 닫지 마세요. 파일 크기에 따라 시간이 걸릴 수 있습니다.'
                  : '이미지가 정상적으로 업로드되었습니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 진행 상태 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                uploadError ? 'bg-red-500/10 text-red-500'
                : uploading ? 'bg-primary/10 text-primary'
                : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {uploadError ? <AlertCircle className="h-5 w-5" />
                  : uploading ? <Loader2 className="h-5 w-5 animate-spin" />
                    : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {uploading ? '업로드 중...' : uploadError ? '오류 발생' : '완료'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{uploadFileName}</p>
              </div>
              {uploading && uploadProgress > 0 && (
                <span className="text-sm font-mono font-semibold text-primary tabular-nums">{uploadProgress}%</span>
              )}
            </div>
            {/* 프로그레스 바 */}
            {uploading && (
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {/* 에러 메시지 */}
            {uploadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-400 break-all">{uploadError}</p>
                </div>
              </div>
            )}
          </div>
          {!uploading && (
            <DialogFooter>
              <Button className="w-full cursor-pointer" onClick={() => setUploadModalOpen(false)}>
                확인
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {mode === 'create' ? '팝업 생성' : '팝업 수정'}
        </h1>
        <p className="text-sm text-muted-foreground">노출 조건과 콘텐츠를 입력해 팝업을 관리합니다.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>필수 항목을 먼저 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="popup-title">제목 <span className="text-red-500">*</span></Label>
              <Input
                id="popup-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: 서비스 점검 안내"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="popup-content">내용</Label>
              <Textarea
                id="popup-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="팝업 본문 내용을 입력하세요."
                rows={5}
              />
            </div>

            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <Label>팝업 이미지</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                id="popup-image-file"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="팝업 이미지 미리보기"
                    className="max-h-[200px] rounded-md border object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploading}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
                      <div className="flex flex-col items-center gap-1 text-white">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-xs font-medium">{uploadProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted"
                >
                  {uploading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /><span>업로드 중... {uploadProgress}%</span></>
                  ) : (
                    <><Upload className="h-5 w-5" /><span>이미지를 선택하세요 (JPG, PNG, WebP, GIF / 최대 10MB)</span></>
                  )}
                </button>
              )}
            </div>

            {/* 링크 URL */}
            <div className="space-y-2">
              <Label htmlFor="popup-link-url">링크 URL</Label>
              <Input
                id="popup-link-url"
                type="url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://example.com"
              />
              <p className="text-xs text-muted-foreground">팝업 이미지 클릭 시 이동할 URL입니다.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>링크 타겟</Label>
                <Select value={linkTarget} onValueChange={setLinkTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder="링크 타겟 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_blank">새 창</SelectItem>
                    <SelectItem value="_self">현재 창</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>상태</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as PopupStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">초안</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-sort-order">정렬 순서</Label>
                <Input
                  id="popup-sort-order"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>노출 기간</CardTitle>
            <CardDescription>기간 내에서만 사용자에게 표시됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="popup-display-start">노출 시작일 <span className="text-red-500">*</span></Label>
              <Input
                id="popup-display-start"
                type="datetime-local"
                value={displayStartAt}
                onChange={(event) => setDisplayStartAt(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="popup-display-end">노출 종료일 <span className="text-red-500">*</span></Label>
              <Input
                id="popup-display-end"
                type="datetime-local"
                value={displayEndAt}
                onChange={(event) => setDisplayEndAt(event.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 팝업 미리보기 */}
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
            <CardDescription>사용자에게 실제로 표시되는 모습입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-w-md rounded-lg border bg-background shadow-lg overflow-hidden">
              {/* 제목 헤더 + 닫기 */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <p className="text-lg font-semibold leading-none tracking-tight">
                  {title || <span className="text-muted-foreground italic">제목을 입력하세요</span>}
                </p>
                <div className="rounded-sm opacity-70">
                  <X className="h-4 w-4" />
                </div>
              </div>

              {/* 이미지 (linkUrl이 있으면 클릭 시 이동) */}
              {imagePreview ? (
                linkUrl ? (
                  <a
                    href={linkUrl}
                    target={linkTarget === '_blank' ? '_blank' : '_self'}
                    rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
                    className="block overflow-hidden cursor-pointer"
                    onClick={(e) => e.preventDefault()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt={title || '팝업 이미지'} className="h-auto w-full object-cover transition-opacity hover:opacity-90" />
                  </a>
                ) : (
                  <div className="overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt={title || '팝업 이미지'} className="h-auto w-full object-cover" />
                  </div>
                )
              ) : null}

              {/* 본문 */}
              <div className="space-y-4 p-6 pt-5">
                {content ? (
                  <div
                    className="max-h-[260px] overflow-y-auto text-sm leading-relaxed text-foreground/90"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground italic">내용을 입력하면 여기에 표시됩니다.</p>
                )}


                {/* 하단 버튼 (미리보기 전용 — 비활성) */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" size="sm" disabled>오늘 하루 안보기</Button>
                  <Button type="button" size="sm" disabled>닫기</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/popups')} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" disabled={submitting || uploading || !title.trim() || !displayStartAt || !displayEndAt || (!content.trim() && !imageUrl.trim())}>
            {submitting ? '저장 중...' : mode === 'create' ? '팝업 생성' : '팝업 저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
