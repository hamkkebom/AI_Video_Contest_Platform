import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * JSON-LD를 <script> 태그에 안전하게 삽입하기 위한 직렬화
 * - `</script>` 패턴 방지 (XSS 및 파싱 에러 방지)
 * - 특수 유니코드 문자 이스케이프
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
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

/**
 * Supabase Storage URL → Image Transformation URL 변환
 *
 * 기존에 저장된 이미지를 재업로드 없이 WebP로 서빙한다.
 * Supabase Pro 플랜에 포함된 기능으로, 변환 결과는 CDN에 캐시된다.
 *
 * - Supabase URL이 아닌 경우(Cloudflare, 외부 URL 등)는 원본 그대로 반환
 * - null/undefined 입력은 null 반환
 *
 * @example
 * getOptimizedImageUrl('https://xxx.supabase.co/storage/v1/object/public/thumbnails/a.jpg', { width: 640 })
 * // → 'https://xxx.supabase.co/storage/v1/render/image/public/thumbnails/a.jpg?width=640&quality=75&format=webp'
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: number } = {},
): string | null {
  if (!url) return null;

  // Supabase Storage public URL 판별
  // 형식: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
  if (!url.includes('.supabase.co/storage/v1/object/public/')) {
    return url; // Supabase URL이 아니면 원본 반환
  }

  const { width = 1280, quality = 75 } = options;

  // /object/public/ → /render/image/public/ 로 경로 변경
  const base = url
    .split('?')[0] // 기존 ?t= 등 쿼리 제거
    .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');

  const params = new URLSearchParams({
    width: String(width),
    quality: String(quality),
    format: 'webp',
  });

  return `${base}?${params.toString()}`;
}