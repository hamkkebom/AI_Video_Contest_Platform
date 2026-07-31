/**
 * SEO 메타데이터 공통 정의
 *
 * 원칙: 사이트 전역 메타데이터는 **플랫폼**을 설명하고, 개별 공모전 이름은 넣지 않는다.
 * 특정 공모전명을 전역에 하드코딩하면 그 공모전이 끝난 뒤에도 사이트 전체가
 * 그 이름으로 검색에 노출되고, 새 공모전이 열려도 검색 결과가 갱신되지 않는다.
 * 공모전별 키워드는 각 공모전 페이지의 generateMetadata 가 DB 값으로 만든다.
 */
import type { Contest } from '@/lib/types';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';
export const SITE_NAME = 'AI꿈';

/** 브랜드·서비스 성격을 나타내는 고정 키워드 — 특정 공모전명은 포함하지 않는다 */
export const BRAND_KEYWORDS = [
  'AI꿈',
  'AI꿈허브',
  'AI 영상 공모전',
  '영상 공모전',
  '공모전 플랫폼',
  'AI 영상 제작',
  '생성형AI 영상',
  'AI 영상 콘테스트',
  'AI video contest',
] as const;

export const DEFAULT_TITLE = 'AI꿈 — AI와 함께 꿈을 설계하고 완성하다';
export const DEFAULT_DESCRIPTION =
  'AI꿈(AI꿈허브)은 AI 영상 공모전 전문 플랫폼입니다. 진행 중인 공모전에 참가하고, 창작자들의 AI 영상 작품과 수상작을 감상해 보세요.';

/** 진행 상태별 문구 — 목록 페이지 제목에 쓰인다 */
const STATUS_PHRASE: Record<string, string> = {
  open: '접수중',
  judging: '심사중',
  closed: '종료',
  draft: '준비중',
};

/**
 * 공모전 목록에서 검색용 요약 문구를 만든다.
 * 접수중인 공모전이 있으면 그것을 앞세우고, 없으면 플랫폼 소개로 되돌아간다.
 */
export function summarizeContests(contests: Contest[]): { title: string; description: string } {
  const open = contests.filter((c) => c.status === 'open');
  const judging = contests.filter((c) => c.status === 'judging');

  if (open.length === 1) {
    const c = open[0];
    return {
      title: `${c.title} 접수중 — AI 영상 공모전`,
      description: `${c.title} 접수중입니다. ${trimDescription(c.description)} AI꿈에서 지금 참가하세요.`,
    };
  }
  if (open.length > 1) {
    return {
      title: `AI 영상 공모전 ${open.length}건 접수중`,
      description: `AI꿈에서 ${open.map((c) => c.title).slice(0, 3).join(', ')} 등 ${open.length}개 공모전이 접수 중입니다. 지금 참가하세요.`,
    };
  }
  if (judging.length > 0) {
    return {
      title: 'AI 영상 공모전 목록 — 심사 진행 중',
      description: `AI꿈에서 진행된 AI 영상 공모전을 확인하세요. 현재 ${judging.length}개 공모전이 심사 중입니다.`,
    };
  }
  return {
    title: 'AI 영상 공모전 목록',
    description: 'AI꿈에서 진행된 AI 영상 공모전과 수상작을 확인하세요. 새로운 공모전이 열리면 이곳에 안내됩니다.',
  };
}

/** 공모전 설명을 메타 설명에 넣을 수 있게 한 문장으로 줄인다 */
export function trimDescription(raw: string | null | undefined, max = 90): string {
  if (!raw) return '';
  const flat = raw.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).trimEnd()}…`;
}

/**
 * 공모전 데이터에서 검색 키워드를 만든다.
 * DB 의 tags 를 그대로 활용하므로 새 공모전을 등록하면 키워드가 자동으로 따라온다.
 */
export function contestKeywords(contest: Pick<Contest, 'title' | 'tags'>): string[] {
  const fromTags = (contest.tags ?? []).filter(Boolean);
  return [...new Set([contest.title, ...fromTags, ...BRAND_KEYWORDS])];
}

/** 여러 공모전에서 키워드를 모은다 — 목록 페이지용 */
export function keywordsFromContests(contests: Pick<Contest, 'title' | 'tags'>[], limit = 20): string[] {
  const collected = contests.flatMap((c) => [c.title, ...(c.tags ?? [])]).filter(Boolean);
  return [...new Set([...BRAND_KEYWORDS, ...collected])].slice(0, limit);
}

/** 상태 라벨 — 목록·상세 메타데이터에서 공통으로 쓴다 */
export function statusPhrase(status: string): string {
  return STATUS_PHRASE[status] ?? '';
}
