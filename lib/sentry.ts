/**
 * Sentry 공통 설정
 *
 * - DSN(NEXT_PUBLIC_SENTRY_DSN)이 없으면 초기화 자체를 건너뛴다(no-op).
 *   → Sentry 계정/DSN 없이도 빌드·런타임이 정상 동작해야 하므로 필수 조건이다.
 * - client / server / edge 세 런타임이 동일한 옵션을 쓰도록 한 곳에서 관리한다.
 */
import type { ErrorEvent } from '@sentry/nextjs';

/**
 * Sentry DSN — 미설정 시 `undefined`.
 * 이 값이 falsy면 각 설정 파일에서 `Sentry.init()`을 호출하지 않는다.
 */
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

/** DSN이 설정된 경우에만 Sentry를 활성화한다. */
export const isSentryEnabled = Boolean(SENTRY_DSN);

/**
 * 마스킹 대상 키 목록 (소문자 비교).
 * 회원 이메일·전화번호 등 개인정보와 인증 토큰이 에러 컨텍스트에 실리지 않도록 한다.
 */
const SENSITIVE_KEYS = new Set([
  'email',
  'phone',
  'submitter_phone',
  'guest_email',
  'guest_phone',
  'apikey',
  'authorization',
  'token',
]);

/** 마스킹 후 대체될 문자열 */
const MASK = '[Filtered]';

/** 순환 참조·과도한 깊이 방지 상한 */
const MAX_DEPTH = 8;

/** 쿼리스트링에서 `민감키=값` 형태를 찾아내는 정규식 */
const SENSITIVE_QUERY_RE = new RegExp(
  `((?:^|[?&])(?:${[...SENSITIVE_KEYS].join('|')})=)[^&#]*`,
  'gi',
);

/** URL·쿼리스트링에 노출된 민감 값을 마스킹한다. */
function maskQueryString(value: string): string {
  return value.replace(SENSITIVE_QUERY_RE, `$1${MASK}`);
}

/**
 * 객체 트리를 순회하며 민감 키의 값을 제자리에서 마스킹한다.
 * (Sentry 이벤트는 전송 직전 평범한 직렬화 객체이므로 in-place 변경이 안전하다)
 */
function maskSensitiveKeys(target: unknown, depth = 0, seen = new WeakSet<object>()): void {
  if (depth > MAX_DEPTH || typeof target !== 'object' || target === null) return;
  if (seen.has(target)) return;
  seen.add(target);

  if (Array.isArray(target)) {
    for (const item of target) maskSensitiveKeys(item, depth + 1, seen);
    return;
  }

  const record: Record<string, unknown> = target as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      record[key] = MASK;
      continue;
    }
    maskSensitiveKeys(record[key], depth + 1, seen);
  }
}

/**
 * 전송 직전 이벤트에서 개인정보를 제거한다.
 * 1) 이벤트 전체를 순회하며 민감 키 값을 마스킹
 * 2) request.url / request.query_string 의 쿼리 파라미터를 추가 마스킹
 */
export function scrubSensitiveData(event: ErrorEvent): ErrorEvent {
  maskSensitiveKeys(event);

  const request = event.request;
  if (request) {
    if (typeof request.url === 'string') {
      request.url = maskQueryString(request.url);
    }
    if (typeof request.query_string === 'string') {
      request.query_string = maskQueryString(request.query_string);
    }
  }

  return event;
}

/**
 * client / server / edge 공통 Sentry 옵션.
 * 각 설정 파일에서 `dsn`과 함께 펼쳐 사용한다.
 */
export const sharedSentryOptions = {
  /** Vercel 배포 환경(production/preview/development) 우선, 없으면 NODE_ENV */
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  /** 무료 플랜 쿼터 보호 — 트랜잭션 10%만 샘플링 */
  tracesSampleRate: 0.1,
  /** 기본 개인정보(IP·쿠키·헤더) 자동 수집 비활성화 */
  sendDefaultPii: false,
  /** 남은 민감 필드를 전송 직전 마스킹 */
  beforeSend: scrubSensitiveData,
} as const;
