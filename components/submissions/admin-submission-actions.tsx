'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  };
}

export function AdminSubmissionActions({ submissionId, submissionTitle, contestId, currentData }: AdminSubmissionActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => toFormState(currentData));

  useEffect(() => {
    if (editOpen) {
      setForm(toFormState(currentData));
    }
  }, [editOpen, currentData]);

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

    try {
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
          videoUrl: form.videoUrl,
          thumbnailUrl: form.thumbnailUrl,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? '수정에 실패했습니다.');
      }

      setEditOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setEditLoading(false);
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
          if (!editLoading) {
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
                <Label htmlFor="admin-submission-video-url">영상 URL</Label>
                <Input
                  id="admin-submission-video-url"
                  value={form.videoUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-submission-thumbnail-url">썸네일 URL</Label>
                <Input
                  id="admin-submission-thumbnail-url"
                  value={form.thumbnailUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => {
                setEditOpen(false);
                setError(null);
              }}
              disabled={editLoading}
            >
              취소
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={handleEdit} disabled={editLoading}>
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
