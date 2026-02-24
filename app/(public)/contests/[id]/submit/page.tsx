'use client';

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
} from 'lucide-react';

import type { Contest } from '@/lib/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE_BYTES = 10 * 1024 * 1024;

/** 제출 폼 상태 타입 */
interface FormState {
  title: string;
  description: string;
  aiTools: string;
  productionProcess: string;
  tags: string;
  agree: boolean;
}

/** 가산점 인증 상태 (bonusConfigId별) */
interface BonusFormEntry {
  snsUrl: string;
  hasProofImage: boolean;
}

/**
 * 공모전 작품 제출 페이지
 * ApplySection 기준으로 통합된 접수 폼
 */
export default function ContestSubmitPage() {
  const params = useParams();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  /* 제출 폼 상태 */
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    aiTools: '',
    productionProcess: '',
    tags: '',
    agree: false,
  });

  /* 파일 업로드 상태 */
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<'video' | 'thumbnail' | 'submission' | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  /* 가산점 아코디언 열림 상태 */
  const [openBonuses, setOpenBonuses] = useState<string[]>([]);
  /* 가산점 폼 데이터 (bonusConfigId → 값) */
  const [bonusForms, setBonusForms] = useState<Record<string, BonusFormEntry>>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/contests'); const contests: Contest[] = await res.json();
      const found = contests.find((c) => c.id === contestId);
      setContest(found ?? null);
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

  /* 가산점 폼 업데이트 */
  const updateBonusForm = (configId: string, field: keyof BonusFormEntry, value: string | boolean) => {
    setBonusForms((prev) => ({
      ...prev,
      [configId]: { ...prev[configId], [field]: value },
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
      const message = '영상 파일은 최대 500MB까지 업로드할 수 있습니다.';
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
      setIsSubmitting(true);

      setUploadStep('video');
      const uploadUrlResponse = await fetch('/api/upload/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      const videoUploadFormData = new FormData();
      videoUploadFormData.append('file', videoFile);

      const videoUploadResponse = await fetch(uploadUrlResult.uploadURL, {
        method: 'PUT',
        body: videoUploadFormData,
      });

      if (!videoUploadResponse.ok) {
        throw new Error('영상 파일 업로드에 실패했습니다.');
      }

      setUploadStep('thumbnail');
      const supabase = createBrowserClient();
      if (!supabase) {
        throw new Error('Supabase 설정이 필요합니다.');
      }

      const safeThumbnailName = thumbnailFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const thumbnailPath = `${contestId}/${crypto.randomUUID()}-${safeThumbnailName}`;
      const { data: thumbnailData, error: thumbnailUploadError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbnailPath, thumbnailFile, {
          contentType: thumbnailFile.type,
          upsert: false,
        });

      if (thumbnailUploadError || !thumbnailData?.path) {
        throw new Error(thumbnailUploadError?.message ?? '썸네일 업로드에 실패했습니다.');
      }

      const { data: thumbnailPublicData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbnailData.path);

      if (!thumbnailPublicData.publicUrl) {
        throw new Error('썸네일 공개 URL 생성에 실패했습니다.');
      }

      setUploadStep('submission');
      const tags = form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

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
          tags,
          aiTools: form.aiTools,
          productionProcess: form.productionProcess,
        }),
      });

      const submissionResult = (await submissionResponse.json()) as {
        error?: string;
      };

      if (!submissionResponse.ok) {
        throw new Error(submissionResult.error ?? '출품작 저장에 실패했습니다.');
      }

      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '작품 제출 중 오류가 발생했습니다.';
      setSubmitError(message);
      alert(message);
    } finally {
      setUploadStep(null);
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
              이 공모전은 현재 {contest.status === 'judging' ? '심사중' : '종료'}입니다.
            </p>
            <Link href={`/contests/${contestId}`}>
              <Button variant="outline">공모전 상세로 돌아가기</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  /* 제출 완료 상태 */
  if (submitted) {
    return (
      <div className="w-full min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3">작품이 제출되었습니다!</h1>
            <p className="text-muted-foreground mb-2">
              &quot;{form.title}&quot; 작품이 성공적으로 접수되었습니다.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              검수 완료 후 공모전 출품작 목록에 표시됩니다.
              {hasBonusConfigs && ' 가산점 인증은 마이페이지에서 추후 수정할 수 있습니다.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href={`/contests/${contestId}`}>
                <Button variant="outline" className="cursor-pointer">공모전 상세</Button>
              </Link>
              <Link href="/my/submissions">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer">
                  내 출품작
                </Button>
              </Link>
            </div>
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
      <section className="relative pt-24 pb-6 px-4">
        <div className="container mx-auto max-w-3xl relative z-10">
          <Link
            href={`/contests/${contestId}`}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-sm text-muted-foreground hover:bg-muted hover:text-violet-500 transition-all mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            공모전 상세로
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            작품 제출하기
          </h1>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{contest.title}</span>에 참가할 작품을 제출해 주세요.
          </p>
        </div>
      </section>
      {/* 제출 폼 */}
      <section className="relative px-4 pb-24">
        <div className="container mx-auto max-w-3xl relative z-10">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* 공모전 정보 요약 배너 */}
            <Card className="p-5 border border-border bg-gradient-to-r from-violet-500/5 to-orange-500/5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Info className="h-4.5 w-4.5 text-violet-500" />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-foreground">{contest.title}</p>
                  <p className="text-muted-foreground">
                    마감: {new Date(contest.submissionEndAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' \u00B7 '}
                    허용 형식: {contest.allowedVideoExtensions.map((e) => e.toUpperCase()).join(', ')}
                    {' \u00B7 '}
                    최대 {contest.maxSubmissionsPerUser}작품 제출 가능
                  </p>
                </div>
              </div>
            </Card>

            {/* ===== STEP 1: 작품 정보 ===== */}
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <h2 className="text-lg font-bold">작품 정보</h2>
                  <p className="text-xs text-muted-foreground">작품의 기본 정보를 입력해 주세요</p>
                </div>
              </div>
              <div className="space-y-5">
                {/* 작품 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    작품 제목 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    required
                    maxLength={100}
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="작품 제목을 입력하세요 (최대 100자)"
                    className="bg-background/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground text-right">{form.title.length}/100</p>
                </div>
            {/* 작품 설명 */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    작품 설명 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    required
                    maxLength={1000}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="작품에 대한 설명을 입력하세요. 제작 의도, 주제 해석 등을 포함해 주세요."
                    className="min-h-32 bg-background/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {form.description.length}/1000
                  </p>
                </div>
            {/* 사용한 AI 도구 */}
                <div className="space-y-2">
                  <Label htmlFor="aiTools" className="text-sm font-semibold">
                    사용한 AI 도구 <span className="text-xs text-muted-foreground font-normal">(선택)</span>
                  </Label>
                  <Input
                    id="aiTools"
                    type="text"
                    value={form.aiTools}
                    onChange={(e) => updateField('aiTools', e.target.value)}
                    placeholder="예: Sora, Runway, Midjourney 등"
                    className="bg-background/50 border-border"
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
                    placeholder="작품의 기획 \u2192 제작 \u2192 편집 과정을 상세히 설명해 주세요. 어떤 AI 도구를 어떤 단계에서 활용했는지, 제작 기간, 특별한 기법 등을 포함하면 좋습니다."
                    className="min-h-48 bg-background/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {form.productionProcess.length}/3000
                  </p>
                </div>
            {/* 태그 */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-semibold">
                    태그 <span className="text-xs text-muted-foreground font-normal">(선택)</span>
                  </Label>
                  <Input
                    id="tags"
                    type="text"
                    value={form.tags}
                    onChange={(e) => updateField('tags', e.target.value)}
                    placeholder="쉴표로 구분 (예: AI영상, 단편, 실험적)"
                    className="bg-background/50 border-border"
                  />
                  {form.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                            #{tag}
                          </Badge>
                        ))}
                    </div>
                  )}
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
                  <p className="text-xs text-muted-foreground">JPG, PNG 형식, 권장 1920\u00D71080px</p>
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
                      className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer"
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
                    {contest.allowedVideoExtensions.map((e) => e.toUpperCase()).join(', ')} 형식, 최대 500MB
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
                      className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer"
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
                    const entry = bonusForms[config.id] || { snsUrl: '', hasProofImage: false };
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
                          className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            {config.description && (
                              <p className="text-xs text-muted-foreground">{config.description}</p>
                            )}
                            {/* SNS URL 입력 */}
                            {config.requiresUrl && (
                              <Input
                                type="url"
                                value={entry.snsUrl}
                                onChange={(e) => updateBonusForm(config.id, 'snsUrl', e.target.value)}
                                placeholder="SNS 게시물 URL (예: https://instagram.com/p/...)"
                                className="bg-background/50 border-border text-sm"
                              />
                            )}
                            {/* 인증 이미지 업로드 (목업) */}
                            {config.requiresImage && (
                              <button
                                type="button"
                                onClick={() => updateBonusForm(config.id, 'hasProofImage', !entry.hasProofImage)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border hover:border-violet-500/50 cursor-pointer transition-colors text-left"
                              >
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {entry.hasProofImage ? '\u2713 캕처 이미지 선택됨 (클릭하여 제거)' : '캕처 이미지 업로드'}
                                </span>
                              </button>
                            )}
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
                  <p className="text-xs text-muted-foreground">안내사항을 확인하고 작품을 제출해 주세요</p>
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
                  <li>가산점 인증, 작품 설명, 제작과정 등은 마감 전까지 수정 가능합니다.</li>
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
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>유의사항 및 저작권 안내</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">공모전 참가 전 반드시 확인해 주세요.</DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {contest?.notes || '유의사항 정보가 아직 등록되지 않았습니다. 공모전 주최자에게 문의해 주세요.'}
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
                  {uploadStep === 'video' && '영상 업로드 중...'}
                  {uploadStep === 'thumbnail' && '썸네일 업로드 중...'}
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
                  {isSubmitting ? '업로드 중...' : '작품 제출하기'}
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </section>
    </div>
  );
}
