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

/* ─── IP 추출 / 해시 유틸 (부정사용 방지) ─── */

/**
 * Vercel 환경에서 클라이언트 IP 추출
 * x-forwarded-for(첫 번째 IP) → x-real-ip 순서로 시도
 */
export function extractClientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // 첫 번째 IP만 사용 (프록시 체인에서 원본)
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') ?? null;
}

/**
 * IP/UA를 SHA-256 해시로 변환 (개인정보 보호: 원본 미저장)
 * 서버 시크릿을 HMAC 키로 사용하여 레인보우 테이블 공격 방지
 */
export async function hashForAntiAbuse(value: string): Promise<string> {
  const secret = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'fallback-secret';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(value);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}