'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { JUDGING_TYPES, VIDEO_EXTENSIONS, CONTEST_TAGS, RESULT_FORMATS } from '@/config/constants';
import type { Contest } from '@/lib/types';
import { CheckCircle2, Plus, Search, Trophy, X, Star, Upload, ImagePlus } from 'lucide-react';

type ContestFormMode = 'create' | 'edit';

type AwardTierForm = {
  id: string;
  label: string;
  type: 'grand' | 'excellence' | 'merit' | 'encouragement' | 'special' | 'custom';
  countStr: string;
  prizeAmount: string;
};

/** 가산점 항목 폼 */
type BonusConfigForm = {
  id: string;
  label: string;
  description: string;
  score: number;
  requiresUrl: boolean;
  requiresImage: boolean;
};

type ContestFormProps = {
  mode: ContestFormMode;
  contestId?: string;
};

type ContestMutationPayload = {
  title: string;
  description: string;
  region: string;
  tags: string[];
  status: Contest['status'];
  submissionStartAt: string;
  submissionEndAt: string;
  judgingStartAt: string;
  judgingEndAt: string;
  resultAnnouncedAt: string;
  judgingType: Contest['judgingType'];
  reviewPolicy: Contest['reviewPolicy'];
  maxSubmissionsPerUser: number;
  allowedVideoExtensions: string[];
  prizeAmount?: string;
  posterUrl?: string;
  promotionVideoUrl?: string;
  hasLandingPage: boolean;
  resultFormat: string;
  bonusMaxScore?: number;
  awardTiers: Array<{ label: string; count: number; prizeAmount?: string }>;
  bonusConfigs: Array<{ label: string; description?: string; score: number; requiresUrl: boolean; requiresImage: boolean }>;
  landingPageUrl?: string;
  detailContent?: string;
  detailImageUrls?: string[];
};

/** 수상 등급/유형 옵션 */
const AWARD_TYPE_OPTIONS = [
  { value: 'grand', label: '대상' },
  { value: 'excellence', label: '최우수상' },
  { value: 'merit', label: '우수상' },
  { value: 'encouragement', label: '장려상' },
  { value: 'special', label: '특별상' },
  { value: 'custom', label: '직접 입력' },
] as const;

function toDateInputValue(iso: string): string {
  return iso.split('T')[0] ?? '';
}

function toIsoDate(date: string): string {
  return `${date}T00:00:00.000Z`;
}

function createAwardTier(label: string, count: number, prizeAmount = '', type: AwardTierForm['type'] = 'custom'): AwardTierForm {
  return {
    id: globalThis.crypto.randomUUID(),
    label,
    type,
    countStr: String(count),
    prizeAmount,
  };
}

function createBonusConfig(label = '', description = '', score = 1): BonusConfigForm {
  return {
    id: globalThis.crypto.randomUUID(),
    label,
    description,
    score,
    requiresUrl: false,
    requiresImage: false,
  };
}

/** 상금 쉼표 포매팅 */
function formatPrize(value: string): string {
  const num = value.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('ko-KR');
}

/** 쉼표 제거된 숫자 문자열 */
function unformatPrize(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/** 숫자만 허용하는 문자열 필터 */
function numericOnly(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/** select 공통 스타일 */
const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const textareaClass = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/** 파일 업로드 헬퍼 */
async function uploadContestAsset(file: File, type: 'poster' | 'promo-video' | 'detail-image'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await fetch('/api/upload/contest-asset', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? '파일 업로드에 실패했습니다.');
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export default function ContestForm({ mode, contestId }: ContestFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(mode === 'edit');
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState('');
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** 필드별 에러 메시지 */
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /* 기본 정보 */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Contest['status']>('draft');
  const [posterUrl, setPosterUrl] = useState('');
  const [promotionVideoUrl, setPromotionVideoUrl] = useState('');
  const [resultFormat, setResultFormat] = useState('website');

  /* 포스터/홍보영상: URL or 파일 업로드 */
  const [posterInputMode, setPosterInputMode] = useState<'url' | 'file'>('url');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUploading, setPosterUploading] = useState(false);
  const [promoInputMode, setPromoInputMode] = useState<'url' | 'file'>('url');
  const [promoFile, setPromoFile] = useState<File | null>(null);
  const [promoUploading, setPromoUploading] = useState(false);
  const posterFileRef = useRef<HTMLInputElement>(null);
  const promoFileRef = useRef<HTMLInputElement>(null);

  /* 상세 안내 (신규) */
  const [detailContent, setDetailContent] = useState('');
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>([]);
  const [detailImageUploading, setDetailImageUploading] = useState(false);
  const detailImageRef = useRef<HTMLInputElement>(null);

  /* 랜딩페이지 URL (토글 제거, URL 직접 입력) */
  const [landingPageUrl, setLandingPageUrl] = useState('');

  /* 태그: 프리디파인드 칩 + 커스텀 추가 */
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  /* 일정 */
  const [submissionStartDate, setSubmissionStartDate] = useState('');
  const [submissionEndDate, setSubmissionEndDate] = useState('');
  const [judgingStartDate, setJudgingStartDate] = useState('');
  const [judgingEndDate, setJudgingEndDate] = useState('');
  const [resultDate, setResultDate] = useState('');

  /* 심사 정책 — maxSubmissions를 문자열로 관리 (스피너 문제 해결) */
  const [judgingType, setJudgingType] = useState<Contest['judgingType']>('internal');
  const [reviewPolicy, setReviewPolicy] = useState<Contest['reviewPolicy']>('manual');
  const [maxSubmissionsStr, setMaxSubmissionsStr] = useState('3');

  /* 허용 영상 형식 — 기본 미선택 */
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  const [customExtInput, setCustomExtInput] = useState('');
  const [customExtensions, setCustomExtensions] = useState<string[]>([]);

  /* 수상 설정 */
  const [awardTiers, setAwardTiers] = useState<AwardTierForm[]>([
    createAwardTier('대상', 1, '', 'grand'),
    createAwardTier('최우수상', 2, '', 'excellence'),
    createAwardTier('우수상', 3, '', 'merit'),
  ]);

  /* 가산점 항목 */
  const [bonusConfigs, setBonusConfigs] = useState<BonusConfigForm[]>([]);

  /* ===== 편집 모드: 기존 데이터 로드 ===== */
  useEffect(() => {
    if (mode !== 'edit' || !contestId) return;

    const loadContest = async () => {
      try {
        const response = await fetch(`/api/admin/contests/${contestId}`);
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error('공모전 정보를 불러오지 못했습니다.');
        }

        const data = (await response.json()) as { contest: Contest };
        const contest = data.contest;

        setTitle(contest.title);
        setDescription(contest.description ?? '');
        setSelectedTags(contest.tags);
        setStatus(contest.status);
        setPosterUrl(contest.posterUrl ?? '');
        setPromotionVideoUrl(contest.promotionVideoUrl ?? '');
        setResultFormat(contest.resultFormat ?? 'website');
        setLandingPageUrl(contest.landingPageUrl ?? '');
        setDetailContent(contest.detailContent ?? '');
        setDetailImageUrls(contest.detailImageUrls ?? []);
        setSubmissionStartDate(toDateInputValue(contest.submissionStartAt));
        setSubmissionEndDate(toDateInputValue(contest.submissionEndAt));
        setJudgingStartDate(toDateInputValue(contest.judgingStartAt));
        setJudgingEndDate(toDateInputValue(contest.judgingEndAt));
        setResultDate(toDateInputValue(contest.resultAnnouncedAt));
        setJudgingType(contest.judgingType);
        setReviewPolicy(contest.reviewPolicy);
        setMaxSubmissionsStr(String(contest.maxSubmissionsPerUser));
        setSelectedExtensions(contest.allowedVideoExtensions);
        setAwardTiers(
          contest.awardTiers.length > 0
            ? contest.awardTiers.map((tier) => ({
                id: globalThis.crypto.randomUUID(),
                label: tier.label,
                type: 'custom' as const,
                countStr: String(tier.count),
                prizeAmount: tier.prizeAmount ?? '',
              }))
            : [createAwardTier('대상', 1, '', 'grand')],
        );
        if (contest.bonusConfigs && contest.bonusConfigs.length > 0) {
          setBonusConfigs(
            contest.bonusConfigs.map((bc) => ({
              id: bc.id,
              label: bc.label,
              description: bc.description ?? '',
              score: bc.score,
              requiresUrl: bc.requiresUrl,
              requiresImage: bc.requiresImage,
            })),
          );
        }
      } catch (error) {
        console.error('Failed to load contest:', error);
        setErrorMessage('공모전 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [contestId, mode]);

  /* ===== 파생 값 ===== */
  const parsedAwardCounts = useMemo(() => awardTiers.map((t) => {
    const n = parseInt(t.countStr, 10);
    return Number.isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
  }), [awardTiers]);

  const totalAwardCount = useMemo(() => parsedAwardCounts.reduce((s, c) => s + c, 0), [parsedAwardCounts]);

  /** 총 상금 자동 계산 */
  const totalPrize = useMemo(() => {
    return awardTiers.reduce((sum, tier, i) => {
      const amount = Number(unformatPrize(tier.prizeAmount)) || 0;
      return sum + amount * parsedAwardCounts[i];
    }, 0);
  }, [awardTiers, parsedAwardCounts]);

  /** maxSubmissions 파싱 */
  const parsedMaxSubmissions = useMemo(() => {
    const n = parseInt(maxSubmissionsStr, 10);
    return Number.isNaN(n) ? 3 : Math.max(1, Math.min(10, n));
  }, [maxSubmissionsStr]);

  /** 포스터가 준비되었는지 (URL이든 파일 업로드 완료든) */
  const hasPoster = !!(posterUrl.trim());

  /** 폼 유효성 */
  const isFormValid = useMemo(() => {
    return !!(
      title.trim() &&
      description.trim() &&
      hasPoster &&
      selectedTags.length > 0 &&
      resultFormat &&
      submissionStartDate &&
      submissionEndDate &&
      judgingStartDate &&
      judgingEndDate &&
      resultDate &&
      selectedExtensions.length > 0 &&
      awardTiers.every((t, i) => {
        const count = parsedAwardCounts[i];
        return t.label.trim() && t.prizeAmount.trim() && t.type !== undefined && count >= 1;
      })
    );
  }, [title, description, hasPoster, selectedTags, resultFormat, submissionStartDate, submissionEndDate, judgingStartDate, judgingEndDate, resultDate, selectedExtensions, awardTiers, parsedAwardCounts]);

  /* ===== 파일 업로드 핸들러 ===== */
  const handlePosterFileSelect = async (file: File) => {
    setPosterFile(file);
    setPosterUploading(true);
    try {
      const url = await uploadContestAsset(file, 'poster');
      setPosterUrl(url);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '포스터 업로드 실패');
    } finally {
      setPosterUploading(false);
    }
  };

  const handlePromoFileSelect = async (file: File) => {
    setPromoFile(file);
    setPromoUploading(true);
    try {
      const url = await uploadContestAsset(file, 'promo-video');
      setPromotionVideoUrl(url);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '홍보영상 업로드 실패');
    } finally {
      setPromoUploading(false);
    }
  };

  const handleDetailImageUpload = async (files: FileList) => {
    setDetailImageUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadContestAsset(file, 'detail-image');
        urls.push(url);
      }
      setDetailImageUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '이미지 업로드 실패');
    } finally {
      setDetailImageUploading(false);
    }
  };

  /* ===== 태그 ===== */
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
      setCustomTagInput('');
    }
  };

  /* ===== 영상 형식 ===== */
  const toggleExtension = (value: string) => {
    setSelectedExtensions((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const addCustomExtension = () => {
    const ext = customExtInput.trim().toLowerCase().replace(/^\./, '');
    if (ext && !selectedExtensions.includes(ext) && !customExtensions.includes(ext)) {
      setCustomExtensions((prev) => [...prev, ext]);
      setSelectedExtensions((prev) => [...prev, ext]);
      setCustomExtInput('');
    }
  };

  /* ===== 수상 유형 변경 ===== */
  const handleAwardTypeChange = (index: number, typeValue: AwardTierForm['type']) => {
    const next = [...awardTiers];
    const option = AWARD_TYPE_OPTIONS.find((o) => o.value === typeValue);
    next[index] = {
      ...next[index],
      type: typeValue,
      /* 유형 변경 시 자동 채움하되, 사용자가 이미 입력한 값이 있으면 덮어씀 (사양: 유형 선택 시 자동 채움) */
      label: typeValue === 'custom' ? '' : (option?.label ?? ''),
    };
    setAwardTiers(next);
  };

  /* ===== 필드 유효성 검사 ===== */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = '공모전 제목을 입력해주세요.';
    if (!description.trim()) errors.description = '공모전 설명을 입력해주세요.';
    if (!hasPoster) errors.posterUrl = '포스터를 등록해주세요. (URL 입력 또는 파일 업로드)';
    if (selectedTags.length === 0) errors.tags = '최소 1개의 태그를 선택해주세요.';
    if (!resultFormat) errors.resultFormat = '결과 발표 형태를 선택해주세요.';
    if (!submissionStartDate) errors.submissionStartDate = '제출 시작일을 선택해주세요.';
    if (!submissionEndDate) errors.submissionEndDate = '제출 마감일을 선택해주세요.';
    if (!judgingStartDate) errors.judgingStartDate = '심사 시작일을 선택해주세요.';
    if (!judgingEndDate) errors.judgingEndDate = '심사 종료일을 선택해주세요.';
    if (!resultDate) errors.resultDate = '결과 발표일을 선택해주세요.';
    if (selectedExtensions.length === 0) errors.extensions = '최소 1개의 영상 형식을 선택해주세요.';
    awardTiers.forEach((tier, i) => {
      if (!tier.type) errors[`award_type_${i}`] = '유형을 선택해주세요.';
      if (!tier.label.trim()) errors[`award_label_${i}`] = '상 이름을 입력해주세요.';
      const count = parsedAwardCounts[i];
      if (count < 1) errors[`award_count_${i}`] = '인원은 1명 이상이어야 합니다.';
      if (!tier.prizeAmount.trim()) errors[`award_prize_${i}`] = '상금을 입력해주세요.';
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ===== 페이로드 빌드 ===== */
  const buildPayload = (): ContestMutationPayload => {
    return {
      title: title.trim(),
      description: description.trim(),
      region: '',
      tags: selectedTags,
      status,
      submissionStartAt: toIsoDate(submissionStartDate),
      submissionEndAt: toIsoDate(submissionEndDate),
      judgingStartAt: toIsoDate(judgingStartDate),
      judgingEndAt: toIsoDate(judgingEndDate),
      resultAnnouncedAt: toIsoDate(resultDate),
      judgingType,
      reviewPolicy,
      maxSubmissionsPerUser: parsedMaxSubmissions,
      allowedVideoExtensions: selectedExtensions,
      posterUrl: posterUrl.trim() || undefined,
      promotionVideoUrl: promotionVideoUrl.trim() || undefined,
      hasLandingPage: !!landingPageUrl.trim(),
      resultFormat,
      landingPageUrl: landingPageUrl.trim() || undefined,
      detailContent: detailContent.trim() || undefined,
      detailImageUrls: detailImageUrls.length > 0 ? detailImageUrls : undefined,
      awardTiers: awardTiers
        .map((tier, i) => ({
          label: tier.label.trim(),
          count: Math.max(1, parsedAwardCounts[i]),
          prizeAmount: unformatPrize(tier.prizeAmount) || undefined,
        }))
        .filter((tier) => tier.label.length > 0),
      bonusConfigs: bonusConfigs
        .filter((bc) => bc.label.trim())
        .map((bc) => ({
          label: bc.label.trim(),
          description: bc.description.trim() || undefined,
          score: bc.score,
          requiresUrl: bc.requiresUrl,
          requiresImage: bc.requiresImage,
        })),
    };
  };

  /* ===== 제출 ===== */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = buildPayload();
      const url = mode === 'create' ? '/api/admin/contests' : `/api/admin/contests/${contestId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { contest?: Contest; error?: string };

      if (!response.ok || !data.contest) {
        throw new Error(data.error ?? '요청 처리에 실패했습니다.');
      }

      setSubmittedTitle(data.contest.title);
      setSaved(true);
      router.refresh();
    } catch (error) {
      console.error('Failed to submit contest form:', error);
      setErrorMessage(error instanceof Error ? error.message : '요청 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ===== 로딩/미발견/저장완료 UI ===== */
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-muted-foreground">공모전 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (notFound && contestId) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <Search className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-semibold tracking-tight">공모전을 찾을 수 없습니다</h1>
        <p className="text-sm text-muted-foreground">ID: {contestId}</p>
        <Link href={'/admin/contests' as Route}>
          <Button size="sm">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (saved) {
    const detailPath = mode === 'edit' && contestId ? (`/admin/contests/${contestId}` as Route) : ('/admin/contests' as Route);

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">저장이 완료되었습니다</h1>
          <p className="text-sm text-muted-foreground">입력한 정보가 정상적으로 저장되었습니다.</p>
        </header>

        <Card className="border-border">
          <CardContent className="space-y-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-foreground">{submittedTitle || title}</p>
              <p className="text-sm text-muted-foreground">공모전 정보 저장이 완료되었습니다.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href={detailPath}>
                <Button>{mode === 'create' ? '목록으로' : '상세 보기'}</Button>
              </Link>
              <Link href={'/admin/contests' as Route}>
                <Button variant="outline">목록으로 이동</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ===== 탭 버튼 (URL / 파일 업로드) ===== */
  const renderInputModeTab = (
    currentMode: 'url' | 'file',
    setMode: (m: 'url' | 'file') => void,
  ) => (
    <div className="flex gap-1 rounded-md border border-border p-0.5">
      <button
        type="button"
        onClick={() => setMode('url')}
        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${currentMode === 'url' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        URL 입력
      </button>
      <button
        type="button"
        onClick={() => setMode('file')}
        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${currentMode === 'file' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        파일 업로드
      </button>
    </div>
  );

  /* ===== 메인 폼 ===== */
  return (
    <div className="space-y-6 pb-10">
      {/* 헤더 */}
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {mode === 'create' ? '공모전 등록' : title || '공모전 수정'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === 'create' ? '공모전 정보를 입력하여 등록합니다.' : '공모전 설정을 수정합니다.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ===== 카드 1: 공모전 정보 ===== */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>공모전 정보</CardTitle>
            <CardDescription>공모전 소개와 기본 분류 정보를 입력합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 제목 + 상태 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="admin-contest-title" className="text-sm font-medium">
                  공모전 제목 <span className="text-destructive">*</span>
                </label>
                <Input
                  id="admin-contest-title"
                  type="text"
                  placeholder="예: 2026 AI 영상 공모전"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: '' })); }}
                />
                {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-contest-status" className="text-sm font-medium">
                  상태 <span className="text-destructive">*</span>
                </label>
                <select
                  id="admin-contest-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Contest['status'])}
                  className={selectClass}
                >
                  <option value="draft">초안</option>
                  <option value="open">접수중</option>
                  <option value="closed">마감</option>
                  <option value="judging">심사중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>

            {/* 공모전 설명 (필수) */}
            <div className="space-y-2">
              <label htmlFor="admin-contest-description" className="text-sm font-medium">
                공모전 설명 <span className="text-destructive">*</span>
              </label>
              <textarea
                id="admin-contest-description"
                placeholder="목적, 주제, 참가 대상을 입력하세요"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setFieldErrors((p) => ({ ...p, description: '' })); }}
                rows={4}
                className={textareaClass}
              />
              {fieldErrors.description && <p className="text-xs text-destructive">{fieldErrors.description}</p>}
            </div>

            {/* 포스터 (필수) — URL 입력 / 파일 업로드 탭 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  포스터 <span className="text-destructive">*</span>
                </label>
                {renderInputModeTab(posterInputMode, setPosterInputMode)}
              </div>
              {posterInputMode === 'url' ? (
                <Input
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  value={posterUrl}
                  onChange={(e) => { setPosterUrl(e.target.value); setFieldErrors((p) => ({ ...p, posterUrl: '' })); }}
                />
              ) : (
                <div className="space-y-2">
                  <input
                    ref={posterFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePosterFileSelect(f);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={posterUploading}
                    onClick={() => posterFileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {posterUploading ? '업로드 중...' : posterFile ? posterFile.name : '이미지 선택 (JPG, PNG, WebP, GIF)'}
                  </Button>
                  {posterUrl && posterInputMode === 'file' && (
                    <p className="text-xs text-emerald-600">업로드 완료</p>
                  )}
                </div>
              )}
              {fieldErrors.posterUrl && <p className="text-xs text-destructive">{fieldErrors.posterUrl}</p>}
            </div>

            {/* 홍보영상 — URL 입력 / 파일 업로드 탭 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">홍보영상</label>
                {renderInputModeTab(promoInputMode, setPromoInputMode)}
              </div>
              {promoInputMode === 'url' ? (
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={promotionVideoUrl}
                  onChange={(e) => setPromotionVideoUrl(e.target.value)}
                />
              ) : (
                <div className="space-y-2">
                  <input
                    ref={promoFileRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePromoFileSelect(f);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={promoUploading}
                    onClick={() => promoFileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {promoUploading ? '업로드 중...' : promoFile ? promoFile.name : '영상 선택 (MP4, WebM, MOV, AVI)'}
                  </Button>
                  {promotionVideoUrl && promoInputMode === 'file' && (
                    <p className="text-xs text-emerald-600">업로드 완료</p>
                  )}
                </div>
              )}
            </div>

            {/* 태그 (필수) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                태그 <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTEST_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => { toggleTag(tag); setFieldErrors((p) => ({ ...p, tags: '' })); }}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {/* 커스텀 태그 */}
                {selectedTags.filter((t) => !CONTEST_TAGS.includes(t as typeof CONTEST_TAGS[number])).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  placeholder="커스텀 태그 입력"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                  className="max-w-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomTag}>추가</Button>
              </div>
              {fieldErrors.tags && <p className="text-xs text-destructive">{fieldErrors.tags}</p>}
            </div>
          </CardContent>
        </Card>

        {/* ===== 카드 2: 상세 안내 (신규) ===== */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>상세 안내</CardTitle>
            <CardDescription>공모전 상세 안내 텍스트와 이미지를 등록합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-contest-detail-content" className="text-sm font-medium">상세 안내 텍스트</label>
              <textarea
                id="admin-contest-detail-content"
                placeholder="참가 방법, 시상 내역, 유의사항 등 상세한 안내를 작성하세요"
                value={detailContent}
                onChange={(e) => setDetailContent(e.target.value)}
                rows={6}
                className={textareaClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">상세 안내 이미지</label>
              <input
                ref={detailImageRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) handleDetailImageUpload(e.target.files);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={detailImageUploading}
                onClick={() => detailImageRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                {detailImageUploading ? '업로드 중...' : '이미지 추가 (JPG, PNG, WebP, GIF)'}
              </Button>
              {detailImageUrls.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {detailImageUrls.map((url, i) => (
                    <div key={url} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`상세 안내 이미지 ${i + 1}`} className="h-24 w-24 rounded-md border border-border object-cover" />
                      <button
                        type="button"
                        onClick={() => setDetailImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ===== 카드 3: 일정 설정 ===== */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>일정 설정</CardTitle>
            <CardDescription>제출 기간, 심사 기간, 결과 발표일을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 제출 기간 */}
            <div>
              <p className="mb-3 text-sm font-semibold">제출 기간 <span className="text-destructive">*</span></p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="admin-contest-submission-start" className="text-sm font-medium">시작일</label>
                  <Input id="admin-contest-submission-start" type="date" value={submissionStartDate} onChange={(e) => { setSubmissionStartDate(e.target.value); setFieldErrors((p) => ({ ...p, submissionStartDate: '' })); }} />
                  {fieldErrors.submissionStartDate && <p className="text-xs text-destructive">{fieldErrors.submissionStartDate}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-contest-submission-end" className="text-sm font-medium">마감일</label>
                  <Input id="admin-contest-submission-end" type="date" value={submissionEndDate} onChange={(e) => { setSubmissionEndDate(e.target.value); setFieldErrors((p) => ({ ...p, submissionEndDate: '' })); }} />
                  {fieldErrors.submissionEndDate && <p className="text-xs text-destructive">{fieldErrors.submissionEndDate}</p>}
                </div>
              </div>
            </div>
            {/* 심사 기간 */}
            <div>
              <p className="mb-3 text-sm font-semibold">심사 기간 <span className="text-destructive">*</span></p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="admin-contest-judging-start" className="text-sm font-medium">시작일</label>
                  <Input id="admin-contest-judging-start" type="date" value={judgingStartDate} onChange={(e) => { setJudgingStartDate(e.target.value); setFieldErrors((p) => ({ ...p, judgingStartDate: '' })); }} />
                  {fieldErrors.judgingStartDate && <p className="text-xs text-destructive">{fieldErrors.judgingStartDate}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-contest-judging-end" className="text-sm font-medium">종료일</label>
                  <Input id="admin-contest-judging-end" type="date" value={judgingEndDate} onChange={(e) => { setJudgingEndDate(e.target.value); setFieldErrors((p) => ({ ...p, judgingEndDate: '' })); }} />
                  {fieldErrors.judgingEndDate && <p className="text-xs text-destructive">{fieldErrors.judgingEndDate}</p>}
                </div>
              </div>
            </div>
            {/* 결과 발표: 발표일 + 결과발표형태 + 랜딩페이지 URL (3col 한 줄) */}
            <div>
              <p className="mb-3 text-sm font-semibold">결과 발표 <span className="text-destructive">*</span></p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="admin-contest-result-date" className="text-sm font-medium">
                    발표일 <span className="text-destructive">*</span>
                  </label>
                  <Input id="admin-contest-result-date" type="date" value={resultDate} onChange={(e) => { setResultDate(e.target.value); setFieldErrors((p) => ({ ...p, resultDate: '' })); }} />
                  {fieldErrors.resultDate && <p className="text-xs text-destructive">{fieldErrors.resultDate}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-contest-result-format" className="text-sm font-medium">
                    결과발표 형태 <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="admin-contest-result-format"
                    value={resultFormat}
                    onChange={(e) => { setResultFormat(e.target.value); setFieldErrors((p) => ({ ...p, resultFormat: '' })); }}
                    className={selectClass}
                  >
                    {RESULT_FORMATS.map((rf) => (
                      <option key={rf.value} value={rf.value}>{rf.label}</option>
                    ))}
                  </select>
                  {fieldErrors.resultFormat && <p className="text-xs text-destructive">{fieldErrors.resultFormat}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-contest-landing-url" className="text-sm font-medium">랜딩페이지 URL</label>
                  <Input
                    id="admin-contest-landing-url"
                    type="url"
                    placeholder="https://example.com/result"
                    value={landingPageUrl}
                    onChange={(e) => setLandingPageUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== 카드 4: 심사 정책 ===== */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>심사 정책</CardTitle>
            <CardDescription>심사 유형과 검수 정책을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="admin-contest-judging-type" className="text-sm font-medium">
                심사 유형 <span className="text-destructive">*</span>
              </label>
              <select
                id="admin-contest-judging-type"
                value={judgingType}
                onChange={(e) => setJudgingType(e.target.value as Contest['judgingType'])}
                className={selectClass}
              >
                {JUDGING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-contest-review-policy" className="text-sm font-medium">
                출품작 검수 방식 <span className="text-destructive">*</span>
              </label>
              <select
                id="admin-contest-review-policy"
                value={reviewPolicy}
                onChange={(e) => setReviewPolicy(e.target.value as Contest['reviewPolicy'])}
                className={selectClass}
              >
                <option value="manual">수동 검수 (관리자가 직접 승인/반려)</option>
                <option value="auto_then_manual">자동 검수 후 수동 (AI 사전 필터링 + 관리자 최종 확인)</option>
              </select>
            </div>

            {/* 인당 최대 출품 수 — type="text" + inputMode="numeric" (스피너 문제 해결) */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="admin-contest-max-submissions" className="text-sm font-medium">
                인당 최대 출품 수 <span className="text-destructive">*</span>
              </label>
              <Input
                id="admin-contest-max-submissions"
                type="text"
                inputMode="numeric"
                placeholder="3"
                value={maxSubmissionsStr}
                onChange={(e) => setMaxSubmissionsStr(numericOnly(e.target.value))}
                onBlur={() => {
                  const n = parseInt(maxSubmissionsStr, 10);
                  if (Number.isNaN(n) || n < 1) setMaxSubmissionsStr('1');
                  else if (n > 10) setMaxSubmissionsStr('10');
                  else setMaxSubmissionsStr(String(n));
                }}
                className="max-w-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* ===== 카드 5: 수상 설정 ===== */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              수상 설정
            </CardTitle>
            <CardDescription>상 종류, 인원, 상금을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 헤더 라벨 (항상 표시) */}
            <div className="flex items-end gap-3">
              <div className="w-28"><span className="text-xs font-medium text-muted-foreground">유형 <span className="text-destructive">*</span></span></div>
              <div className="flex-1"><span className="text-xs font-medium text-muted-foreground">상 이름 <span className="text-destructive">*</span></span></div>
              <div className="w-16"><span className="text-xs font-medium text-muted-foreground">인원 <span className="text-destructive">*</span></span></div>
              <div className="w-36"><span className="text-xs font-medium text-muted-foreground">상금 (원) <span className="text-destructive">*</span></span></div>
              <div className="w-9 shrink-0" />
            </div>

            {awardTiers.map((tier, index) => (
              <div key={tier.id} className="flex items-start gap-3">
                {/* 유형 (필수) */}
                <div className="w-28 space-y-1">
                  <select
                    value={tier.type}
                    onChange={(e) => handleAwardTypeChange(index, e.target.value as AwardTierForm['type'])}
                    className={selectClass}
                  >
                    {AWARD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {fieldErrors[`award_type_${index}`] && <p className="text-xs text-destructive">{fieldErrors[`award_type_${index}`]}</p>}
                </div>

                {/* 상 이름 — 항상 편집 가능 (readOnly 제거) */}
                <div className="flex-1 space-y-1">
                  <Input
                    type="text"
                    placeholder="상 이름 입력"
                    value={tier.label}
                    onChange={(e) => {
                      const next = [...awardTiers];
                      next[index] = { ...tier, label: e.target.value };
                      setAwardTiers(next);
                      setFieldErrors((p) => ({ ...p, [`award_label_${index}`]: '' }));
                    }}
                  />
                  {fieldErrors[`award_label_${index}`] && <p className="text-xs text-destructive">{fieldErrors[`award_label_${index}`]}</p>}
                </div>

                {/* 인원 (필수) — w-16, type="text" inputMode="numeric" */}
                <div className="w-16 space-y-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="1"
                    value={tier.countStr}
                    onChange={(e) => {
                      const next = [...awardTiers];
                      next[index] = { ...tier, countStr: numericOnly(e.target.value) };
                      setAwardTiers(next);
                      setFieldErrors((p) => ({ ...p, [`award_count_${index}`]: '' }));
                    }}
                    onBlur={() => {
                      const n = parseInt(tier.countStr, 10);
                      if (Number.isNaN(n) || n < 1) {
                        const next = [...awardTiers];
                        next[index] = { ...tier, countStr: '1' };
                        setAwardTiers(next);
                      } else if (n > 100) {
                        const next = [...awardTiers];
                        next[index] = { ...tier, countStr: '100' };
                        setAwardTiers(next);
                      }
                    }}
                  />
                  {fieldErrors[`award_count_${index}`] && <p className="text-xs text-destructive">{fieldErrors[`award_count_${index}`]}</p>}
                </div>

                {/* 상금 (필수) */}
                <div className="w-36 space-y-1">
                  <Input
                    type="text"
                    placeholder="1,000,000"
                    value={tier.prizeAmount}
                    onChange={(e) => {
                      const next = [...awardTiers];
                      next[index] = { ...tier, prizeAmount: formatPrize(e.target.value) };
                      setAwardTiers(next);
                      setFieldErrors((p) => ({ ...p, [`award_prize_${index}`]: '' }));
                    }}
                  />
                  {fieldErrors[`award_prize_${index}`] && <p className="text-xs text-destructive">{fieldErrors[`award_prize_${index}`]}</p>}
                </div>

                {awardTiers.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setAwardTiers(awardTiers.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : <div className="w-9 shrink-0" />}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5"
              onClick={() => setAwardTiers([...awardTiers, createAwardTier('', 1)])}
            >
              <Plus className="h-4 w-4" />
              수상 항목 추가
            </Button>

            {/* 총 수상 인원 + 총 상금 */}
            <div className="flex flex-wrap gap-6 border-t border-border pt-3 text-sm text-muted-foreground">
              <div>총 수상 인원: <span className="font-semibold text-foreground">{totalAwardCount}명</span></div>
              <div>총 상금: <span className="font-semibold text-foreground">{totalPrize.toLocaleString('ko-KR')}원</span></div>
            </div>
          </CardContent>
        </Card>

        {/* ===== 카드 6: 가산점 항목 ===== */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              가산점 항목
            </CardTitle>
            <CardDescription>참가자가 추가 점수를 받을 수 있는 가산점 항목을 설정합니다. (선택)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bonusConfigs.map((bc, index) => (
              <div key={bc.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">항목명</label>
                      <Input
                        type="text"
                        placeholder="예: 공식포스터 SNS 공유"
                        value={bc.label}
                        onChange={(e) => {
                          const next = [...bonusConfigs];
                          next[index] = { ...bc, label: e.target.value };
                          setBonusConfigs(next);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">설명 (선택)</label>
                      <Input
                        type="text"
                        placeholder="참가자에게 보여질 안내"
                        value={bc.description}
                        onChange={(e) => {
                          const next = [...bonusConfigs];
                          next[index] = { ...bc, description: e.target.value };
                          setBonusConfigs(next);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">점수</label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={bc.score}
                        onChange={(e) => {
                          const next = [...bonusConfigs];
                          next[index] = { ...bc, score: Math.max(1, Math.min(10, Number(e.target.value) || 1)) };
                          setBonusConfigs(next);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={bc.requiresUrl}
                        onChange={(e) => {
                          const next = [...bonusConfigs];
                          next[index] = { ...bc, requiresUrl: e.target.checked };
                          setBonusConfigs(next);
                        }}
                        className="rounded"
                      />
                      URL 제출 필요
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={bc.requiresImage}
                        onChange={(e) => {
                          const next = [...bonusConfigs];
                          next[index] = { ...bc, requiresImage: e.target.checked };
                          setBonusConfigs(next);
                        }}
                        className="rounded"
                      />
                      이미지 제출 필요
                    </label>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive mt-5"
                  onClick={() => setBonusConfigs(bonusConfigs.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setBonusConfigs([...bonusConfigs, createBonusConfig()])}
            >
              <Plus className="h-4 w-4" />
              가산점 항목 추가
            </Button>
          </CardContent>
        </Card>

        {/* ===== 카드 7: 허용 영상 형식 ===== */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>허용 영상 형식 <span className="text-destructive">*</span></CardTitle>
            <CardDescription>업로드 가능한 확장자를 선택합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {VIDEO_EXTENSIONS.map((extension) => {
                const selected = selectedExtensions.includes(extension.value);
                return (
                  <button
                    key={extension.value}
                    type="button"
                    onClick={() => toggleExtension(extension.value)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    .{extension.label}
                  </button>
                );
              })}
              {/* 커스텀 확장자 */}
              {customExtensions.map((ext) => {
                const selected = selectedExtensions.includes(ext);
                return (
                  <button
                    key={ext}
                    type="button"
                    onClick={() => toggleExtension(ext)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    .{ext}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="커스텀 확장자 (예: mkv)"
                value={customExtInput}
                onChange={(e) => setCustomExtInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomExtension(); } }}
                className="max-w-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomExtension}>추가</Button>
            </div>
            {fieldErrors.extensions && <p className="text-xs text-destructive">{fieldErrors.extensions}</p>}
          </CardContent>
        </Card>

        {/* 에러 메시지 */}
        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        {/* 제출 버튼 */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href={'/admin/contests' as Route}>
            <Button type="button" variant="outline">취소</Button>
          </Link>
          <Button type="submit" disabled={submitting || !isFormValid}>
            {submitting ? '저장 중...' : mode === 'create' ? '공모전 등록' : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
