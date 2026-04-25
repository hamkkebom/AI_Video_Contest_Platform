'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ARTICLE_TYPES } from '@/config/constants';
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
import type { Article, ArticleMutationInput, ArticleType } from '@/lib/types';

type ArticleFormMode = 'create';

type ArticleFormProps = {
  mode: ArticleFormMode;
};

export default function ArticleForm({ mode }: ArticleFormProps) {
  const router = useRouter();

  const [type, setType] = useState<ArticleType>('notice');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('제목은 필수입니다.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('본문은 필수입니다.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const payload: ArticleMutationInput = {
      type,
      title: title.trim(),
      excerpt: excerpt.trim() || undefined,
      content,
      tags,
      isPublished,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { article?: Article; error?: string };
      if (!response.ok || !data.article) {
        throw new Error(data.error ?? '요청 처리에 실패했습니다.');
      }

      router.push('/admin/articles');
      router.refresh();
    } catch (error) {
      console.error('Failed to submit article form:', error);
      setErrorMessage(error instanceof Error ? error.message : '요청 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {mode === 'create' ? '새 아티클 작성' : '아티클 수정'}
        </h1>
        <p className="text-sm text-muted-foreground">
          유형/제목/본문을 입력하고 발행 여부를 선택하세요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>필수 항목을 먼저 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>유형 <span className="text-red-500">*</span></Label>
                <Select value={type} onValueChange={(value) => setType(value as ArticleType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTICLE_TYPES.map((articleType) => (
                      <SelectItem key={articleType.value} value={articleType.value}>
                        {articleType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>발행 상태</Label>
                <Select
                  value={isPublished ? 'published' : 'draft'}
                  onValueChange={(value) => setIsPublished(value === 'published')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="발행 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">비공개 (저장만)</SelectItem>
                    <SelectItem value="published">발행</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-title">제목 <span className="text-red-500">*</span></Label>
              <Input
                id="article-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="아티클 제목을 입력하세요"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-excerpt">요약</Label>
              <Textarea
                id="article-excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                placeholder="목록에서 보여줄 한 줄 요약 (선택)"
                rows={2}
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-content">본문 <span className="text-red-500">*</span></Label>
              <Textarea
                id="article-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="본문 내용을 입력하세요. (마크다운 또는 HTML)"
                rows={14}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="article-tags">태그</Label>
                <Input
                  id="article-tags"
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                  placeholder="쉼표로 구분 (예: 공지,2026)"
                />
                <p className="text-xs text-muted-foreground">쉼표(,)로 구분해 입력하세요.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="article-thumbnail">썸네일 URL</Label>
                <Input
                  id="article-thumbnail"
                  type="url"
                  value={thumbnailUrl}
                  onChange={(event) => setThumbnailUrl(event.target.value)}
                  placeholder="https://..."
                />
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
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/articles')}
            disabled={submitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? '저장 중...' : mode === 'create' ? '아티클 생성' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
