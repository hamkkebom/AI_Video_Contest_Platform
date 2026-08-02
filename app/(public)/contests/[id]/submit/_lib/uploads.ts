/**
 * 출품 제출 업로드 원시 함수들.
 *
 * 분리 이유: page.tsx 의 handleSubmit 이 685줄이었고, 그 안에 영상·썸네일·인증이미지
 * 업로드가 **경로(신규/수정/재제출)마다 복붙**돼 있었다. 복붙은 단순한 중복이 아니라
 * 실제 동작 차이를 만들었다 — 재제출 경로의 영상 업로드에는 Cloudflare 폴링도,
 * CORS 로 응답이 잘렸을 때의 구제 로직도 없어서 **신규 제출은 되는데 재제출은 실패**했다.
 * 여기로 모아 세 경로가 같은 코드를 쓰게 한다.
 *
 * 상태(useState)를 다루지 않는다 — 진행률은 콜백으로 넘긴다.
 */

/** 업로드 진행률 콜백 (0~100) */
type ProgressFn = (percent: number) => void;

/** 사용자 친화적 에러 메시지 생성 */
export function userFriendlyError(code: string): string {
  const guides: Record<string, string> = {
    'AUTH-EXPIRED': '로그인 세션이 만료되었습니다.\n\n페이지를 새로고침 후 다시 로그인해 주세요.',
    'VIDEO-URL': '영상 업로드 준비에 실패했습니다.\n\n페이지를 새로고침 후 다시 시도해 주세요.',
    'VIDEO-NETWORK': '영상 전송 중 네트워크 오류가 발생했습니다.\n\n인터넷 연결을 확인하고 다시 시도해 주세요.',
    'VIDEO-TIMEOUT': '영상 업로드 시간이 초과되었습니다.\n\n파일 크기가 크면 Wi-Fi 환경에서 다시 시도해 주세요.',
    'VIDEO-STATUS': '영상 업로드 중 문제가 발생했습니다.\n\n페이지를 새로고침 후 다시 시도해 주세요.',
    'VIDEO-PROCESS': '영상 파일을 처리할 수 없습니다.\n\n다른 형식의 파일로 다시 시도해 주세요.',
    'THUMB-AUTH': '썸네일 업로드 권한 오류가 발생했습니다.\n\n페이지를 새로고침 후 다시 로그인해 주세요.',
    'THUMB-NETWORK': '썸네일 전송 중 네트워크 오류가 발생했습니다.\n\n인터넷 연결을 확인하고 다시 시도해 주세요.',
    'THUMB-TIMEOUT': '썸네일 업로드 시간이 초과되었습니다.\n\n이미지 크기를 줄이거나 다시 시도해 주세요.',
    'THUMB-STATUS': '썸네일 업로드에 실패했습니다.\n\n다른 이미지로 변경하거나 다시 시도해 주세요.',
    'THUMB-URL': '썸네일 처리 중 오류가 발생했습니다.\n\n다시 시도해 주세요.',
    'PROOF-NETWORK': '인증 이미지 전송 중 네트워크 오류가 발생했습니다.\n\n인터넷 연결을 확인하고 다시 시도해 주세요.',
    'PROOF-TIMEOUT': '인증 이미지 업로드 시간이 초과되었습니다.\n\n이미지 크기를 줄이거나 다시 시도해 주세요.',
    'PROOF-STATUS': '인증 이미지 업로드에 실패했습니다.\n\n다시 시도해 주세요.',
    'SUBMIT-FAIL': '출품작 저장에 실패했습니다.\n\n페이지를 새로고침 후 다시 시도해 주세요.',
  };
  const msg = guides[code] || '업로드 중 문제가 발생했습니다.\n\n페이지를 새로고침 후 다시 시도해 주세요.';
  return `${msg}\n\n계속 실패할 경우 페이지를 새로고침(Ctrl+Shift+R) 후 다시 시도해 주세요.\n문제가 지속되면 문의해 주세요. (오류 코드: ${code})`;
}

/** 업로드 에러를 서버에 보고 — 실패해도 제출을 막지 않는다 */
export async function reportUploadError(
  step: string,
  errorMessage: string,
  errorCode?: string,
  details?: string,
): Promise<void> {
  try {
    await fetch('/api/upload-error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step,
        errorMessage,
        errorCode,
        details,
        /* 디버깅용 추가 정보 */
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch { /* 에러 로그 전송 실패는 무시 */ }
}

interface VideoUploadTarget {
  uploadURL: string;
  uid: string;
}

/**
 * Cloudflare Stream 직접 업로드 URL 요청.
 * 60초 타임아웃, 실패 시 2초 후 1회 재시도 (콜드스타트 대비).
 */
export async function requestVideoUploadUrl(): Promise<VideoUploadTarget> {
  const attempt = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      return await fetch('/api/upload/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDurationSeconds: 600 }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  let response: Response;
  try {
    response = await attempt();
  } catch {
    console.warn('[제출] 업로드 URL 1차 실패, 2초 후 재시도...');
    await new Promise((r) => setTimeout(r, 2000));
    response = await attempt();
  }

  const result = (await response.json()) as { uploadURL?: string; uid?: string; error?: string };
  if (!response.ok || !result.uploadURL || !result.uid) {
    await reportUploadError('preparing', result.error ?? '영상 업로드 URL 생성 실패', String(response.status));
    throw new Error(userFriendlyError('VIDEO-URL'));
  }
  return { uploadURL: result.uploadURL, uid: result.uid };
}

/** Cloudflare 에 영상이 올라갔는지 + 처리 상태 확인 */
async function checkCloudflareStatus(uid: string): Promise<boolean | 'error'> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(`/api/stream/status?uid=${uid}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return false;
    try {
      const data = await res.json();
      if (data.status?.state === 'error') return 'error';
    } catch { /* JSON 파싱 실패 시 존재만 확인 */ }
    return true;
  } catch {
    return false;
  }
}

/**
 * Cloudflare Stream 으로 영상 전송.
 *
 * 단순 XHR 이 아닌 이유가 세 가지 있다 —
 *  ① 전송이 100% 돼도 Cloudflare 가 응답을 늦게 준다 → 30초 폴링으로 존재를 확인한다.
 *  ② CORS 로 응답이 잘려 onerror 가 뜨는데 실제로는 업로드가 끝난 경우가 있다
 *     → 무조건 실패로 처리하지 않고 Cloudflare 에 물어본다.
 *  ③ 처리 불가 파일은 state='error' 로 돌아온다 → 10분을 기다리지 않고 즉시 실패시킨다.
 */
export async function uploadVideoToStream(params: {
  file: File;
  target: VideoUploadTarget;
  onProgress: ProgressFn;
}): Promise<void> {
  const { file, target, onProgress } = params;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', target.uploadURL);
    xhr.timeout = 10 * 60 * 1000;

    let settled = false;
    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true;
        fn();
      }
    };

    /* 멈춤 감지 — 예전에는 React state(uploadProgress)를 클로저에서 읽어 항상 초기값과
       비교했기 때문에 조건이 성립하지 않았다. 진행률을 여기서 직접 들고 있는다. */
    let lastProgress = 0;
    let lastProgressAt = Date.now();
    let stallReported = false;
    const stallChecker = setInterval(() => {
      if (settled) {
        clearInterval(stallChecker);
        return;
      }
      if (!stallReported && Date.now() - lastProgressAt > 2 * 60 * 1000) {
        stallReported = true;
        console.error('[제출] 업로드 멈춤 감지: 2분간 진행률 변화 없음, progress:', lastProgress);
        void reportUploadError(
          'video',
          `업로드 멈춤 — ${lastProgress}%에서 2분간 변화 없음`,
          'UPLOAD_STALL',
          `fileSize: ${file.size}, fileName: ${file.name}`,
        );
      }
    }, 30_000);

    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let hardDeadline: ReturnType<typeof setTimeout> | null = null;
    const clearAllTimers = () => {
      clearInterval(stallChecker);
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (hardDeadline) { clearTimeout(hardDeadline); hardDeadline = null; }
    };

    xhr.upload.onprogress = (ev) => {
      if (!ev.lengthComputable) return;
      const pct = Math.round((ev.loaded / ev.total) * 100);
      onProgress(pct);
      lastProgress = pct;
      lastProgressAt = Date.now();
      stallReported = false;
    };

    /* 전송 100% 완료 — 즉시 1회 + 30초마다 Cloudflare 폴링, 최대 10분 */
    xhr.upload.onload = () => {
      console.log('[제출] 파일 전송 완료, Cloudflare 응답 대기 중...');
      onProgress(100);

      const doPoll = async () => {
        const result = await checkCloudflareStatus(target.uid);
        if (result === 'error') {
          clearAllTimers();
          xhr.abort();
          void reportUploadError('video', 'Cloudflare 영상 처리 실패', 'CF_ERROR');
          settle(() => reject(new Error(userFriendlyError('VIDEO-PROCESS'))));
          return;
        }
        if (result === true) {
          clearAllTimers();
          xhr.abort();
          settle(() => resolve());
        }
      };

      void doPoll();
      pollTimer = setInterval(() => void doPoll(), 30_000);

      hardDeadline = setTimeout(async () => {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = null;
        const result = await checkCloudflareStatus(target.uid);
        xhr.abort();
        if (result === true) {
          settle(() => resolve());
        } else {
          console.error('[제출] 10분 경과 후에도 영상 미확인 — 실패 처리');
          void reportUploadError('video', '10분 대기 후 미확인', 'POLL_TIMEOUT');
          settle(() => reject(new Error(userFriendlyError('VIDEO-TIMEOUT'))));
        }
      }, 10 * 60 * 1000);
    };

    xhr.onload = async () => {
      clearAllTimers();
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        settle(() => resolve());
        return;
      }
      /* 상태 코드가 이상해도 Cloudflare 에 영상이 있을 수 있다 */
      console.warn('[제출] 비정상 응답, Cloudflare 확인:', xhr.status);
      if (await checkCloudflareStatus(target.uid)) {
        onProgress(100);
        settle(() => resolve());
      } else {
        void reportUploadError('video', '영상 업로드 실패', String(xhr.status), xhr.responseText?.slice(0, 500));
        settle(() => reject(new Error(userFriendlyError('VIDEO-STATUS'))));
      }
    };

    xhr.onerror = async () => {
      /* 파일 전송은 끝났는데 CORS 로 응답이 잘린 경우가 있다 — 확인 후 판단 */
      console.warn('[제출] 영상 업로드 네트워크 오류 — Cloudflare 존재 여부 확인');
      const exists = await checkCloudflareStatus(target.uid);
      clearAllTimers();
      if (exists) {
        settle(() => resolve());
      } else {
        void reportUploadError('video', '네트워크 오류', 'NETWORK_ERROR');
        settle(() => reject(new Error(userFriendlyError('VIDEO-NETWORK'))));
      }
    };

    xhr.ontimeout = () => {
      clearAllTimers();
      void reportUploadError('video', '타임아웃', 'TIMEOUT');
      settle(() => reject(new Error(userFriendlyError('VIDEO-TIMEOUT'))));
    };

    const fd = new FormData();
    fd.append('file', file);
    xhr.send(fd);
  });
}

/**
 * Supabase Storage 직접 업로드.
 *
 * SDK 의 storage.upload() 를 쓰지 않는 이유: 내부 auth 호출이 hang 되는 사례가 있어
 * 갱신된 토큰으로 raw XHR 을 보낸다. 썸네일·가산점 인증 이미지가 같은 경로를 탄다.
 */
export async function uploadFileToStorage(params: {
  bucket: 'thumbnails' | 'proof-images';
  path: string;
  file: File;
  accessToken: string;
  /** 진행률이 필요 없는 호출(인증 이미지)은 생략한다 */
  onProgress?: ProgressFn;
  /** 오류 코드 접두사 — 사용자 메시지를 THUMB-* / PROOF-* 로 나눈다 */
  errorPrefix: 'THUMB' | 'PROOF';
}): Promise<void> {
  const { bucket, path, file, accessToken, onProgress, errorPrefix } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('서버 설정 오류가 발생했습니다. 관리자에게 문의해 주세요.');
  }

  const step = errorPrefix === 'THUMB' ? 'thumbnail' : 'proof-images';

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.timeout = 90_000;

    if (onProgress) {
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 100));
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      const body = xhr.responseText || '';
      void reportUploadError(step, `${bucket} 업로드 실패`, String(xhr.status), body.slice(0, 500));
      /* 권한 오류는 새로고침·재로그인 안내가 필요하므로 따로 구분한다 */
      if (errorPrefix === 'THUMB' && (body.includes('security') || body.includes('403') || body.includes('Unauthorized'))) {
        reject(new Error(userFriendlyError('THUMB-AUTH')));
      } else {
        reject(new Error(userFriendlyError(`${errorPrefix}-STATUS`)));
      }
    };
    xhr.onerror = () => {
      void reportUploadError(step, '네트워크 오류', 'NETWORK_ERROR');
      reject(new Error(userFriendlyError(`${errorPrefix}-NETWORK`)));
    };
    xhr.ontimeout = () => {
      void reportUploadError(step, '타임아웃', 'TIMEOUT');
      reject(new Error(userFriendlyError(`${errorPrefix}-TIMEOUT`)));
    };
    xhr.send(file);
  });
}

/** 스토리지 저장 경로 — 파일명은 신뢰하지 않고 확장자만 쓴다 */
export function buildStoragePath(contestId: string, fileName: string, userId?: string): string {
  const ext = fileName.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'png';
  const prefix = userId ? `${contestId}/${userId}` : contestId;
  return `${prefix}/${crypto.randomUUID()}.${ext}`;
}
