/**
 * 제출 폼의 공유 타입과 상한값.
 *
 * page.tsx 안에 있던 것을 뺐다 — STEP 컴포넌트들이 같은 타입을 참조해야 하는데
 * 페이지에서 가져오면 순환 참조가 된다.
 */

export const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024;
export const MAX_THUMBNAIL_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_PROOF_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** 확장자 → MIME type 매핑 (영상 파일 형식 검증용) */
export const EXT_TO_MIME: Record<string, string[]> = {
  mp4: ['video/mp4'],
  webm: ['video/webm'],
  mov: ['video/quicktime'],
  avi: ['video/x-msvideo', 'video/avi'],
  mkv: ['video/x-matroska'],
  wmv: ['video/x-ms-wmv'],
  flv: ['video/x-flv'],
};

/** 제출 폼 상태 타입 */
export interface FormState {
  submitterName: string;
  submitterPhone: string;
  title: string;
  description: string;
  chatAi: string[];
  imageAi: string[];
  videoAi: string[];
  productionProcess: string;
  agree: boolean;
}

/** 가산점 인증 상태 (bonusConfigId별) */
export interface BonusFormEntry {
  snsUrl: string;
  proofImageFile: File | null;
  proofImagePreview: string | null;
}
