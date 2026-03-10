'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function PopupForm({ mode, popupId }: PopupFormProps) {
  const router = useRouter();

  const now = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(now.getTime() + 24 * 60 * 60 * 1000), [now]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_self');
  const [status, setStatus] = useState<PopupStatus>('draft');
  const [displayStartAt, setDisplayStartAt] = useState(toDateTimeLocalValue(now.toISOString()));
  const [displayEndAt, setDisplayEndAt] = useState(toDateTimeLocalValue(tomorrow.toISOString()));
  const [sortOrder, setSortOrder] = useState(0);

  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
              <Label htmlFor="popup-title">제목 *</Label>
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="popup-image-url">이미지 URL</Label>
                <Input
                  id="popup-image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://example.com/popup.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-link-url">링크 URL</Label>
                <Input
                  id="popup-link-url"
                  type="url"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>링크 타겟</Label>
                <Select value={linkTarget} onValueChange={setLinkTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder="링크 타겟 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">현재 창 (_self)</SelectItem>
                    <SelectItem value="_blank">새 창 (_blank)</SelectItem>
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
              <Label htmlFor="popup-display-start">노출 시작일 *</Label>
              <Input
                id="popup-display-start"
                type="datetime-local"
                value={displayStartAt}
                onChange={(event) => setDisplayStartAt(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="popup-display-end">노출 종료일 *</Label>
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

        {imageUrl.trim() && (
          <Card>
            <CardHeader>
              <CardTitle>이미지 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="팝업 이미지 미리보기" className="max-h-[240px] rounded-md border object-contain" />
            </CardContent>
          </Card>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/popups')} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : mode === 'create' ? '팝업 생성' : '팝업 저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
