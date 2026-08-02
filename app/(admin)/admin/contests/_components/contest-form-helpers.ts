'use client';

/**
 * 공모전 폼의 순수 헬퍼와 폼 타입.
 *
 * contest-form.tsx 가 2,463줄이라 열기만 해도 어디가 상태이고 어디가 계산인지 구분이
 * 안 됐다. 여기 있는 것들은 컴포넌트 상태를 전혀 건드리지 않는다 — 폼 타입, 초기값
 * 팩토리, 숫자·날짜 포맷, 스토리지 업로드, 영상 썸네일 추출.
 *
 * 업로드가 출품 제출(`contests/[id]/submit/_lib/uploads.ts`)과 닮았지만 합치지 않았다.
 * 이쪽은 x-upsert=true, 10분 타임아웃, 서버 원문 오류 노출이 필요하고(관리자가 본다),
 * 저쪽은 upsert 금지에 사용자 친화 문구가 필요하다 — 같은 코드가 아니다.
 */

import type { Contest } from '@/lib/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { refreshAccessToken } from '@/lib/supabase/refresh-token';

export type ContestFormMode = 'create' | 'edit';

export type AwardTierForm = {
  id: string;
  label: string;
  type: 'grand' | 'excellence' | 'merit' | 'encouragement' | 'special' | 'custom';
  countStr: string;
  prizeAmount: string;
};

/** 가산점 항목 폼 */
export type BonusConfigForm = {
  id: string;
  label: string;
  description: string;
  score: number;
  requiresUrl: boolean;
  requiresImage: boolean;
};

/** 심사기준 항목 폼 */
export type JudgingCriteriaForm = {
  id: string;
  label: string;
  maxScore: number;
  description: string;
};

/** 심사 단계 폼 */
export type JudgingStageForm = {
  id: string;
  stageNumber: number;
  name: string;
  method: 'simple' | 'scored';
  criteria: JudgingCriteriaForm[];
};

export function createJudgingStage(stageNumber: number): JudgingStageForm {
  return {
    id: globalThis.crypto.randomUUID(),
    stageNumber,
    name: `${stageNumber}차 심사`,
    method: stageNumber === 1 ? 'simple' : 'scored',
    criteria: stageNumber === 1 ? [] : [
      createJudgingCriteria('기술력', 0, 'AI 활용 수준'),
      createJudgingCriteria('스토리', 0, '전달력'),
      createJudgingCriteria('완성도', 0, '연출 및 편집'),
    ],
  };
}

export type ContestFormProps = {
  mode: ContestFormMode;
  contestId?: string;
};

export type ContestMutationPayload = {
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
  heroImageUrl?: string;
  promotionVideoUrls?: string[];
  hasLandingPage: boolean;
  resultFormat: string;
  bonusMaxScore?: number;
  bonusDeadlineAt?: string;
  bonusPercentage?: number;
  judgeWeightPercent?: number;
  onlineVoteWeightPercent?: number;
  onlineVoteType?: 'likes' | 'views' | 'likes_and_views';
  voteLikesPercent?: number;
  voteViewsPercent?: number;
  awardTiers: Array<{ label: string; count: number; prizeAmount?: string }>;
  bonusConfigs: Array<{ label: string; description?: string; score: number; requiresUrl: boolean; requiresImage: boolean }>;
  judgingCriteria: Array<{ label: string; maxScore: number; description?: string }>;
  judgingStages?: Array<{
    stageNumber: number;
    name: string;
    method: 'simple' | 'scored';
    criteria?: Array<{ label: string; maxScore: number; description?: string }>;
  }>;
  landingPageUrl?: string;
  detailContent?: string;
  detailImageUrls?: string[];
  guidelines?: string;
  notes?: string;
};

/** 수상 등급/유형 옵션 */
export const AWARD_TYPE_OPTIONS = [
  { value: 'grand', label: '대상' },
  { value: 'excellence', label: '최우수상' },
  { value: 'merit', label: '우수상' },
  { value: 'encouragement', label: '장려상' },
  { value: 'special', label: '특별상' },
  { value: 'custom', label: '직접 입력' },
] as const;

export function toDateInputValue(iso: string): string {
  return iso.split('T')[0] ?? '';
}

export function toIsoDate(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export function createAwardTier(label: string, count: number | '' = '', prizeAmount = '', type: AwardTierForm['type'] = 'custom'): AwardTierForm {
  return {
    id: globalThis.crypto.randomUUID(),
    label,
    type,
    countStr: count === '' ? '' : String(count),
    prizeAmount,
  };
}

export function createBonusConfig(label = '', description = '', score = 0): BonusConfigForm {
  return {
    id: globalThis.crypto.randomUUID(),
    label,
    description,
    score,
    requiresUrl: false,
    requiresImage: false,
  };
}

export function createJudgingCriteria(label = '', maxScore = 0, description = ''): JudgingCriteriaForm {
  return {
    id: globalThis.crypto.randomUUID(),
    label,
    maxScore,
    description,
  };
}

/** 상금 쉼표 포매팅 */
export function formatPrize(value: string): string {
  const num = value.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('ko-KR');
}

/** 쉼표 제거된 숫자 문자열 */
export function unformatPrize(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/** 숫자만 허용하는 문자열 필터 */
export function numericOnly(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/** select 공통 스타일 */
export const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
export const textareaClass = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/** 파일 업로드 헬퍼 — XHR 기반 Supabase Storage 직접 업로드 (실시간 진행률 + Vercel 4.5MB 제한 우회) */
export async function uploadContestAsset(
  file: File,
  type: 'poster' | 'promo-video' | 'detail-image' | 'hero-image',
  onProgress?: (percent: number) => void,
): Promise<string> {
  const supabase = createBrowserClient();
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.');

  /* refreshAccessToken으로 확실한 토큰 갱신 */
  const existingToken = typeof window !== 'undefined'
    ? document.cookie.split(';').find(c => c.trim().startsWith('sb-'))?.split('=')[1] ?? null
    : null;
  const tokenResult = await refreshAccessToken(supabase, {
    timeoutMs: 10000,
    currentToken: existingToken,
    log: (msg) => console.log(`[공모전 에셋] ${msg}`),
  });
  if (!tokenResult.ok) throw new Error('인증이 필요합니다. 페이지를 새로고침해 주세요.');
  const accessToken = tokenResult.accessToken;

  /* 타입별 검증 */
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  if (type === 'poster' || type === 'detail-image' || type === 'hero-image') {
    if (file.size > 10 * 1024 * 1024) throw new Error('이미지 파일은 10MB 이하여야 합니다.');
    if (!imageTypes.includes(file.type)) throw new Error('지원하지 않는 이미지 형식입니다. (JPG, PNG, WebP, GIF)');
  } else if (type === 'promo-video') {
    if (file.size > 500 * 1024 * 1024) throw new Error(`영상 파일은 500MB 이하여야 합니다. (현재 ${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
    if (![...videoTypes, ...imageTypes].includes(file.type)) throw new Error('지원하지 않는 파일 형식입니다.');
  }

  /* 버킷 결정 + 파일 경로 생성 */
  const bucket = (type === 'poster' || type === 'hero-image') ? 'posters' : 'contest-assets';
  const ext = file.name.split('.').pop() || 'bin';
  const filePath = `${type}/${crypto.randomUUID()}/${Date.now()}.${ext}`;

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
    xhr.timeout = 10 * 60 * 1000; /* 10분 타임아웃 (500MB 기준) */

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
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        let errMsg = '업로드 실패';
        try { const body = JSON.parse(xhr.responseText); errMsg = body.message || body.error || errMsg; } catch { /* 파싱 실패 무시 */ }
        reject(new Error(`업로드 실패 (${file.name}, ${sizeMB}MB): ${errMsg}`));
      }
    };

    xhr.onerror = () => reject(new Error('네트워크 오류로 업로드에 실패했습니다.'));
    xhr.ontimeout = () => reject(new Error('업로드 시간이 초과되었습니다 (10분).'));
    xhr.send(file);
  });

  /* 공개 URL 생성 */
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl.publicUrl;
}

/** 비디오 파일에서 스틸 이미지 추출 (5초 타임아웃) */
export function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    /* 정리 헬퍼 — 이벤트 리스너 제거 + objectUrl 해제 */
    const cleanup = () => {
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      URL.revokeObjectURL(objectUrl);
      video.src = '';
    };

    /* 5초 안에 완료 못하면 reject — 업로드 흐름 block 방지 */
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error('썸네일 추출 타임아웃'));
      }
    }, 5000);

    const onLoaded = () => {
      /* 1초 지점으로 이동 (짧은 영상이면 0초) */
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    const onSeeked = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) { cleanup(); reject(new Error('Canvas 2D 지원 불가')); return; }
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    const onError = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      cleanup();
      reject(new Error('비디오 로드 실패'));
    };

    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
  });
}
