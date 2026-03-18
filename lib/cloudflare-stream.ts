/**
 * Cloudflare Stream 유틸리티
 * - 영상 UID 추출, 다운로드 생성/삭제/조회
 */

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

/** Cloudflare Stream API 기본 URL */
function cfStreamUrl(videoUid: string, path = '') {
  return `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/${videoUid}${path}`;
}

/** 공통 헤더 */
function cfHeaders() {
  return {
    Authorization: `Bearer ${CF_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Cloudflare Stream URL에서 비디오 UID 추출
 *
 * 지원 형식:
 * - https://customer-{code}.cloudflarestream.com/{UID}/iframe
 * - https://iframe.videodelivery.net/{UID}
 * - https://iframe.videodelivery.net/{UID}?poster=...
 * - 32자 hex UID 직접 입력
 */
export function extractStreamVideoUid(url: string): string | null {
  if (!url) return null;

  // 32자 hex UID 직접 입력 (URL이 아닌 경우)
  if (/^[a-f0-9]{32}$/i.test(url.trim())) {
    return url.trim();
  }

  try {
    const urlObj = new URL(url);

    // iframe.videodelivery.net/{UID}
    if (urlObj.hostname.includes('videodelivery.net')) {
      const uid = urlObj.pathname.split('/').filter(Boolean)[0];
      if (uid && /^[a-f0-9]{32}$/i.test(uid)) return uid;
    }

    // customer-{code}.cloudflarestream.com/{UID}/iframe
    if (urlObj.hostname.includes('cloudflarestream.com')) {
      const uid = urlObj.pathname.split('/').filter(Boolean)[0];
      if (uid && /^[a-f0-9]{32}$/i.test(uid)) return uid;
    }
  } catch {
    // URL 파싱 실패 — CF Stream URL이 아님
  }

  return null;
}

/** CF Stream 영상 상세 정보 (에러 진단용) */
export interface StreamVideoInfo {
  name: string | null;
  readyToStream: boolean;
  status: {
    state: 'uploading' | 'inprogress' | 'ready' | 'error';
    pctComplete?: number;
    errorReasonCode?: string;
    errorReasonText?: string;
  } | null;
  errorReasonCode: string | null;
  errorReasonText: string | null;
}

/**
 * CF Stream 영상 상세 정보 조회 (원본 파일명, 인코딩 상태 등)
 */
export async function getStreamVideoInfo(videoUid: string): Promise<StreamVideoInfo | null> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return null;

  try {
    const res = await fetch(cfStreamUrl(videoUid, ''), {
      method: 'GET',
      headers: cfHeaders(),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const r = data.result;
    const state = r?.status?.state;
    const normalizedState =
      state === 'uploading' || state === 'inprogress' || state === 'ready' || state === 'error'
        ? state
        : null;

    return {
      name: r?.meta?.name ?? null,
      readyToStream: r?.readyToStream ?? false,
      status: normalizedState
        ? {
            state: normalizedState,
            pctComplete:
              typeof r?.status?.pctComplete === 'number' ? Math.min(100, Math.max(0, r.status.pctComplete)) : undefined,
            errorReasonCode: r?.status?.errorReasonCode ?? undefined,
            errorReasonText: r?.status?.errorReasonText ?? undefined,
          }
        : null,
      errorReasonCode: r?.status?.errorReasonCode ?? null,
      errorReasonText: r?.status?.errorReasonText ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * 비디오의 다운로드 삭제 (플레이어에서 다운로드 버튼 비활성화)
 */
export async function deleteStreamDownloads(videoUid: string): Promise<boolean> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error('Cloudflare 환경변수 미설정');
    return false;
  }

  try {
    const res = await fetch(cfStreamUrl(videoUid, '/downloads'), {
      method: 'DELETE',
      headers: cfHeaders(),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`CF Stream 다운로드 삭제 실패 (${videoUid}):`, text);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`CF Stream 다운로드 삭제 오류 (${videoUid}):`, err);
    return false;
  }
}

/**
 * 비디오의 MP4 다운로드 생성
 * @returns 다운로드 URL (생성 중이면 status와 함께 반환)
 */
export async function createStreamDownload(
  videoUid: string,
): Promise<{ url: string; status: string; percentComplete: number } | { error: string } | null> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error('Cloudflare 환경변수 미설정');
    return null;
  }

  try {
    const res = await fetch(cfStreamUrl(videoUid, '/downloads'), {
      method: 'POST',
      headers: cfHeaders(),
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`CF Stream 다운로드 생성 실패 (${videoUid}):`, text);

      /* 영상 상세 정보 조회 — 원본 파일명, 에러 사유 포함 */
      const info = await getStreamVideoInfo(videoUid);
      const fileName = info?.name ?? null;
      const errorReason = info?.errorReasonText ?? info?.errorReasonCode ?? null;

      /* 에러 메시지 조합: 상황 설명 + 파일 정보 + 안내 */
      const parts: string[] = [];
      if (!info?.readyToStream) {
        parts.push('정상적인 동영상 파일이 아니어서 다운로드할 수 없습니다.');
        if (fileName) parts.push(`파일: ${fileName}`);
        if (errorReason) parts.push(`사유: ${errorReason}`);
        parts.push('해당 제출물을 반려 처리하고 참가자에게 올바른 영상 파일로 다시 제출하도록 안내해 주세요.');
      } else {
        parts.push('다운로드 생성에 실패했습니다.');
        if (fileName) parts.push(`파일: ${fileName}`);
        parts.push('잠시 후 다시 시도해 주세요.');
      }

      return { error: parts.join(' ') };
    }

    const data = await res.json();
    const result = data.result?.default ?? data.result;
    return {
      url: result?.url ?? '',
      status: result?.status ?? 'unknown',
      percentComplete: result?.percentComplete ?? 0,
    };
  } catch (err) {
    console.error(`CF Stream 다운로드 생성 오류 (${videoUid}):`, err);
    return null;
  }
}

/**
 * 비디오의 다운로드 상태 조회
 */
export async function getStreamDownloads(
  videoUid: string,
): Promise<{ url: string; status: string; percentComplete: number } | null> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return null;

  try {
    const res = await fetch(cfStreamUrl(videoUid, '/downloads'), {
      method: 'GET',
      headers: cfHeaders(),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data.result?.default;
    if (!result) return null;

    return {
      url: result.url ?? '',
      status: result.status ?? 'unknown',
      percentComplete: result.percentComplete ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * 여러 URL에서 CF Stream 비디오의 다운로드를 일괄 삭제
 * @returns 삭제 성공한 UID 목록
 */
export async function deleteDownloadsForUrls(urls: string[]): Promise<string[]> {
  const deleted: string[] = [];

  for (const url of urls) {
    const uid = extractStreamVideoUid(url);
    if (!uid) continue;

    const success = await deleteStreamDownloads(uid);
    if (success) deleted.push(uid);
  }

  return deleted;
}
