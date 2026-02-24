import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/* ─── 한국시간(KST) 날짜 포맷 유틸 ─── */

const KST: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Seoul' };

/**
 * 날짜만 표시 (예: 2026. 2. 24.)
 * options를 넘기면 KST timezone이 자동 병합됨
 */
export function formatDate(
  dateStr: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', { ...KST, ...options });
}

/**
 * 날짜+시간 표시 (예: 2026. 2. 24. 오후 4:17:32)
 * options를 넘기면 KST timezone이 자동 병합됨
 */
export function formatDateTime(
  dateStr: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(dateStr).toLocaleString('ko-KR', { ...KST, ...options });
}

/**
 * 날짜 컴팩트 표시 (예: 2026.02.24)
 * KST 기준으로 YYYY.MM.DD 포맷 반환
 */
export function formatDateCompact(dateStr: string | Date): string {
  const d = new Date(new Date(dateStr).toLocaleString('en-US', KST));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}