/**
 * 가산점 증빙 이미지(proof-images 버킷) 접근 URL 처리 유틸
 *
 * proof-images 는 비공개 버킷이라 공개 URL로는 접근할 수 없다.
 * DB(bonus_entries.proof_image_url)에는 과거 공개 URL 전체가 저장돼 있으므로,
 * 읽는 시점에 버킷명 뒤 경로만 추출해 서명 URL로 변환한다. (데이터 마이그레이션 불필요)
 */
import type { SupabaseClient } from '@supabase/supabase-js';

/** 증빙 이미지 전용 Storage 버킷명 */
const PROOF_IMAGE_BUCKET = 'proof-images';

/** 공개 URL / 서명 URL에서 객체 경로가 시작되는 지점을 찾는 마커 */
const BUCKET_PATH_MARKER = `/${PROOF_IMAGE_BUCKET}/`;

/** 기존 저장 형식(공개 URL) 판별 마커 — 저장 형식을 그대로 유지하기 위해 사용 */
const PUBLIC_URL_MARKER = `/object/public/${PROOF_IMAGE_BUCKET}/`;

/** 서명 URL 유효 시간 — 관리자가 다이얼로그를 열어두는 시간을 감안해 1시간 */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** 쿼리스트링(서명 토큰)·해시를 떼고 URL 인코딩을 해제한다. */
function decodeObjectPath(rawPath: string): string {
  const withoutQuery = rawPath.split(/[?#]/)[0] ?? '';
  try {
    return decodeURIComponent(withoutQuery);
  } catch {
    /* 인코딩이 깨져 있으면 원본 문자열을 그대로 사용 */
    return withoutQuery;
  }
}

/**
 * 저장된 URL에서 proof-images 버킷 내부 객체 경로를 추출한다.
 * `/proof-images/` 마커를 찾지 못하면 null (버킷 URL이 아니라는 뜻).
 * 공개 URL·서명 URL 모두 동일한 경로를 반환하므로 URL 비교 대신 경로 비교에 쓸 수 있다.
 */
export function extractProofImagePath(storedUrl: string | null | undefined): string | null {
  if (!storedUrl) return null;
  const markerIndex = storedUrl.indexOf(BUCKET_PATH_MARKER);
  if (markerIndex === -1) return null;
  return decodeObjectPath(storedUrl.slice(markerIndex + BUCKET_PATH_MARKER.length)) || null;
}

/**
 * 서명에 사용할 객체 경로를 확정한다.
 * 마커가 없으면 입력 전체를 경로로 간주한다 (경로만 저장하는 향후 형식 대응).
 */
function resolveObjectPath(storedUrl: string): string | null {
  return extractProofImagePath(storedUrl) ?? (decodeObjectPath(storedUrl) || null);
}

/**
 * 증빙 이미지 URL을 서명 URL로 변환한다.
 * 실패해도 throw하지 않고 null을 반환한다 (이미지 한 장 때문에 페이지가 죽지 않도록).
 */
export async function signProofImageUrl(
  supabase: SupabaseClient,
  storedUrl: string | null | undefined,
): Promise<string | null> {
  if (!storedUrl) return null;
  const path = resolveObjectPath(storedUrl);
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(PROOF_IMAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error('[proof-image] 서명 URL 생성 실패:', path, error?.message);
    return null;
  }
  return data.signedUrl;
}

/**
 * 여러 건을 한 번에 서명한다.
 * Storage 일괄 서명 API를 사용해 요청 1회로 처리하고, 입력과 같은 순서/길이로 반환한다.
 * 실패한 항목은 null이 들어간다.
 */
export async function signProofImageUrls(
  supabase: SupabaseClient,
  storedUrls: Array<string | null | undefined>,
): Promise<Array<string | null>> {
  const paths = storedUrls.map((url) => (url ? resolveObjectPath(url) : null));
  const uniquePaths = [...new Set(paths.filter((path): path is string => path !== null))];
  if (uniquePaths.length === 0) return paths.map(() => null);

  const { data, error } = await supabase.storage
    .from(PROOF_IMAGE_BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    console.error('[proof-image] 서명 URL 일괄 생성 실패:', error?.message);
    return paths.map(() => null);
  }

  /* 응답 순서에 의존하지 않도록 path 기준으로 매핑 */
  const signedByPath = new Map<string, string>();
  for (const item of data) {
    if (!item.error && item.path && item.signedUrl) signedByPath.set(item.path, item.signedUrl);
  }
  return paths.map((path) => (path ? signedByPath.get(path) ?? null : null));
}

/**
 * 클라이언트가 되돌려준 URL을 DB 저장 형식(공개 URL)으로 정규화한다.
 *
 * 수정 화면은 서명 URL을 미리보기로 받아 그대로 다시 PUT으로 보내므로,
 * 정규화 없이 저장하면 유효기간이 있는 서명 URL이 DB에 남는다.
 * 기존 574건과 형식이 갈리지 않도록 항상 공개 URL 형식으로 되돌린다.
 */
export function toStoredProofImageUrl(
  supabase: SupabaseClient,
  incomingUrl: string | null | undefined,
): string | null {
  if (!incomingUrl) return null;
  /* 이미 저장 형식이면 문자열을 그대로 유지 (불필요한 UPDATE 방지) */
  if (incomingUrl.includes(PUBLIC_URL_MARKER)) return incomingUrl;

  const path = extractProofImagePath(incomingUrl);
  /* proof-images 버킷 URL이 아니면 판단하지 않고 그대로 둔다 */
  if (!path) return incomingUrl;

  const { data } = supabase.storage.from(PROOF_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
