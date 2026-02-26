/**
 * 필수 환경변수 검증
 *
 * - 서버 시작 시(instrumentation.ts)에서 호출하여 빠른 실패(fail-fast) 보장
 * - Supabase 클라이언트 생성 시에도 호출하여 런타임 안전성 확보
 */

/** 환경변수 미설정 시 던지는 에러 */
export class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvError';
  }
}

/** 플레이스홀더로 간주할 값 목록 */
const PLACEHOLDER_VALUES = [
  'https://your-project.supabase.co',
  'eyJhbGciOi...',
];

/**
 * Supabase 필수 환경변수를 검증하고 반환한다.
 * 누락 또는 플레이스홀더일 경우 명확한 에러 메시지와 함께 throw.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const problems: string[] = [];

  if (!url) {
    problems.push('  - NEXT_PUBLIC_SUPABASE_URL 누락');
  } else if (PLACEHOLDER_VALUES.includes(url)) {
    problems.push('  - NEXT_PUBLIC_SUPABASE_URL 이 플레이스홀더 값입니다');
  }

  if (!anonKey) {
    problems.push('  - NEXT_PUBLIC_SUPABASE_ANON_KEY 누락');
  } else if (PLACEHOLDER_VALUES.includes(anonKey)) {
    problems.push('  - NEXT_PUBLIC_SUPABASE_ANON_KEY 가 플레이스홀더 값입니다');
  }

  if (problems.length > 0) {
    const msg = [
      '',
      '╔═══════════════════════════════════════════════════════╗',
      '║  Supabase 환경변수가 올바르게 설정되지 않았습니다     ║',
      '╠═══════════════════════════════════════════════════════╣',
      ...problems,
      '║',
      '║  .env.local 파일을 확인하세요:',
      '║  cp .env.local.example .env.local',
      '╚═══════════════════════════════════════════════════════╝',
      '',
    ].join('\n');

    throw new EnvError(msg);
  }

  return { url: url!, anonKey: anonKey! };
}
