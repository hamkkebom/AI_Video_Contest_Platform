/**
 * 상금 표기 유틸
 *
 * 상금은 DB 에 '3000000' 같은 숫자 문자열로도, '300만원' 같은 표기 문자열로도 들어온다.
 * 화면마다 따로 파싱하면 표기가 갈리므로(실제로 같은 함수가 세 파일에 복제돼 있었다)
 * 여기 한곳에 모아 쓴다.
 */
import type { AwardTier } from '@/lib/types';

/** '300만원' · '3,000,000' 등 어떤 표기든 원 단위 숫자로 변환한다 */
export function parsePrizeAmount(amount: string): number {
  const cleaned = amount.replace(/[,\s]/g, '');
  const match = cleaned.match(/(\d+)/);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  if (cleaned.includes('만')) return num * 10000;
  if (cleaned.includes('억')) return num * 100000000;
  return num;
}

/** 원 단위 숫자를 한국식 표기로 — 1,300만원 / 1억 3,000만원 */
export function formatKrw(total: number): string {
  if (total >= 100000000) {
    const eok = Math.floor(total / 100000000);
    const man = Math.floor((total % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (total >= 10000) return `${(total / 10000).toLocaleString()}만원`;
  return `${total.toLocaleString()}원`;
}

/** 이미 만·억·원이 붙은 문자열은 그대로 두고, 순수 숫자만 한국식으로 바꾼다 */
export function formatPrizeDisplay(amount: string): string {
  if (/[만억원]/.test(amount)) return amount;
  const num = parseInt(amount.replace(/[,\s]/g, ''), 10);
  if (Number.isNaN(num) || num === 0) return amount;
  return formatKrw(num);
}

/** 등급별 상금 × 정원을 합산해 총 상금을 구한다. 상금 정보가 없으면 null. */
export function calculateTotalPrize(tiers: AwardTier[]): string | null {
  let total = 0;
  for (const tier of tiers) {
    if (!tier.prizeAmount) continue;
    total += parsePrizeAmount(tier.prizeAmount) * tier.count;
  }
  return total === 0 ? null : formatKrw(total);
}

/**
 * 공모전의 총 상금 표기 — 직접 입력된 값이 있으면 그것을, 없으면 등급 합계를 쓴다.
 * 둘 다 없으면 null 이므로 호출부에서 '미정' 같은 문구를 붙인다.
 */
export function contestTotalPrize(
  prizeAmount: string | null | undefined,
  tiers: AwardTier[] | null | undefined,
): string | null {
  if (prizeAmount) return formatPrizeDisplay(prizeAmount);
  return calculateTotalPrize(tiers ?? []);
}

/**
 * 공모전의 총 상금을 원 단위 숫자로 — 여러 공모전을 합산할 때 쓴다.
 * 표기(contestTotalPrize)와 계산 규칙이 갈라지지 않도록 같은 우선순위를 따른다.
 */
export function contestTotalPrizeAmount(
  prizeAmount: string | null | undefined,
  tiers: AwardTier[] | null | undefined,
): number {
  if (prizeAmount) return parsePrizeAmount(prizeAmount);
  let total = 0;
  for (const tier of tiers ?? []) {
    if (!tier.prizeAmount) continue;
    total += parsePrizeAmount(tier.prizeAmount) * tier.count;
  }
  return total;
}
