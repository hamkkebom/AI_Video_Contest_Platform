'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Heart, Trophy, Medal, Award, Sparkles } from 'lucide-react';

/** 하위 등급은 수가 많아 한 번에 다 보여주지 않는다 */
const LOWEST_TIER_INITIAL = 12;
const LOWEST_TIER_STEP = 12;

export interface AwardItem {
  id: string;
  title: string;
  creatorName: string;
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  rank?: number | null;
  prizeLabel?: string | null;
}

export interface AwardTierInfo {
  label: string;
  count: number;
  /** 1인당 상금 (표시용 문자열) */
  prizeAmount?: string;
}

interface AwardsGridProps {
  submissions: AwardItem[];
  tiers: AwardTierInfo[];
}

/** 등급 순서(0부터)에 따른 시각 강조 — 위로 갈수록 크고 화려하게 */
const TIER_STYLE = [
  {
    icon: Trophy,
    badge: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white',
    ring: 'ring-2 ring-amber-400/40',
    glow: 'shadow-2xl shadow-amber-500/20',
    accent: 'text-amber-500',
  },
  {
    icon: Medal,
    badge: 'bg-gradient-to-r from-slate-300 to-slate-500 text-white',
    ring: 'ring-1 ring-slate-400/40',
    glow: 'shadow-xl shadow-slate-400/10',
    accent: 'text-slate-400',
  },
  {
    icon: Award,
    badge: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white',
    ring: 'ring-1 ring-orange-400/30',
    glow: 'shadow-lg shadow-orange-500/10',
    accent: 'text-orange-500',
  },
  {
    icon: Sparkles,
    badge: 'bg-primary/90 text-primary-foreground',
    ring: 'ring-1 ring-primary/20',
    glow: '',
    accent: 'text-primary',
  },
];

const tierStyle = (index: number) => TIER_STYLE[Math.min(index, TIER_STYLE.length - 1)];

/**
 * 등급별 카드 크기 — 위 등급일수록 크게, 아래로 갈수록 촘촘하게.
 * 하위 등급은 수가 많아 모바일에서도 2열로 깔아야 스크롤이 감당된다.
 */
function gridClass(index: number, total: number): string {
  /* 최상위 등급이 단독 수상이면 한 장을 크게 보여준다 */
  if (index === 0) return total === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';
  if (index === 1) return 'grid-cols-1 sm:grid-cols-2';
  if (index === 2) return 'grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-2 lg:grid-cols-4';
}

/** '3000000' 같은 원시 문자열을 '3,000,000원' 으로 — DB 에는 숫자만 저장돼 있다 */
function formatPrize(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return raw;
  return `${Number(digits).toLocaleString()}원`;
}

function AwardCard({ item, tierIndex, featured }: { item: AwardItem; tierIndex: number; featured: boolean }) {
  const style = tierStyle(tierIndex);
  const Icon = style.icon;

  return (
    <Link href={`/gallery/${item.id}` as any} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 ${style.ring} ${style.glow}`}
      >
        {/* 대상은 좁은 화면에서 21:9 로 두면 아래 등급 카드보다 낮아져 위계가 뒤집힌다.
            모바일에서는 4:3 으로 키우고, 넓은 화면에서만 시네마틱 비율을 쓴다. */}
        <div
          className={`relative overflow-hidden bg-muted ${featured ? 'aspect-[4/3] sm:aspect-[21/9]' : 'aspect-video'}`}
        >
          {item.thumbnailUrl && (
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              /* 최상위 수상작은 화면 폭을 크게 차지하므로 더 큰 이미지를 받는다 */
              sizes={featured ? '(max-width: 1024px) 100vw, 1100px' : '(max-width: 768px) 100vw, 33vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={featured}
            />
          )}
          {/* 좁은 화면의 2열 카드에서는 뱃지를 줄여 썸네일을 덜 가린다 */}
          <div className="absolute left-2 top-2 z-10 sm:left-3 sm:top-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold shadow-lg sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm ${style.badge}`}
            >
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {item.prizeLabel}
            </span>
          </div>
        </div>

        <div className={featured ? 'space-y-2 p-5 sm:p-6' : 'space-y-1.5 p-3 sm:p-4'}>
          <h3 className={`font-semibold ${featured ? 'text-lg sm:text-xl md:text-2xl' : 'line-clamp-2 text-[13px] sm:text-sm'}`}>
            {item.title}
          </h3>
          <p className={`truncate text-muted-foreground ${featured ? 'text-sm sm:text-base' : 'text-xs'}`}>
            {item.creatorName}
          </p>
          <div className="flex gap-3 pt-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {item.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {item.likeCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * 수상작 목록 — 등급별로 구분해 보여준다.
 *
 * 이전에는 43개 수상작을 같은 크기 카드로 평면 나열해, 상금 300만원의 대상과
 * 10만원의 최하위 등급이 시각적으로 동등해 보였다. 시상 결과는 등급이 핵심 정보이므로
 * 등급마다 섹션을 나누고 위로 갈수록 카드를 크게 해 순위가 한눈에 읽히도록 한다.
 */
export function AwardsGrid({ submissions, tiers }: AwardsGridProps) {
  const [expandedTiers, setExpandedTiers] = useState<Record<string, number>>({});

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
          <Trophy className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="mb-2 text-xl font-bold">수상작이 없습니다</h3>
        <p className="max-w-md text-muted-foreground">이 공모전에 수상작이 아직 등록되지 않았습니다.</p>
      </div>
    );
  }

  /* 공모전에 등록된 등급 순서를 기준으로 묶는다. 등급 정보가 없으면 rank 순 단일 그룹. */
  const grouped = tiers.length
    ? tiers
        .map((tier) => ({ tier, items: submissions.filter((s) => s.prizeLabel === tier.label) }))
        .filter((g) => g.items.length > 0)
    : [{ tier: { label: '수상작', count: submissions.length } as AwardTierInfo, items: submissions }];

  /* 등급에 속하지 않은 수상작이 있으면 마지막에 따로 보여준다 (데이터 불일치 대비) */
  const knownLabels = new Set(grouped.map((g) => g.tier.label));
  const orphans = submissions.filter((s) => !s.prizeLabel || !knownLabels.has(s.prizeLabel));
  if (orphans.length > 0) {
    grouped.push({ tier: { label: '기타 수상', count: orphans.length }, items: orphans });
  }

  return (
    <div className="space-y-16">
      {grouped.map((group, tierIndex) => {
        const style = tierStyle(tierIndex);
        const Icon = style.icon;
        const isLargeTier = group.items.length > LOWEST_TIER_INITIAL;
        const shown = expandedTiers[group.tier.label] ?? (isLargeTier ? LOWEST_TIER_INITIAL : group.items.length);
        const visible = group.items.slice(0, shown);
        const remaining = group.items.length - shown;
        const featured = tierIndex === 0 && group.items.length === 1;

        return (
          <section key={group.tier.label} aria-labelledby={`tier-${tierIndex}`}>
            {/* 등급 헤더 — 등급명·인원·상금 */}
            <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-3">
              <h2 id={`tier-${tierIndex}`} className={`flex items-center gap-2 text-xl font-bold md:text-2xl ${style.accent}`}>
                <Icon className="h-5 w-5" />
                {group.tier.label}
              </h2>
              <span className="text-sm text-muted-foreground">{group.items.length}작품</span>
              {formatPrize(group.tier.prizeAmount) && (
                <span className="text-sm text-muted-foreground">· 1인당 {formatPrize(group.tier.prizeAmount)}</span>
              )}
            </div>

            {/* 단독 대상은 한 장이 화면 전체를 가로지르면 오히려 비어 보여 폭을 제한한다 */}
            <div className={`grid gap-4 ${gridClass(tierIndex, group.items.length)} ${featured ? 'mx-auto max-w-4xl' : ''}`}>
              {visible.map((item) => (
                <AwardCard key={item.id} item={item} tierIndex={tierIndex} featured={featured} />
              ))}
            </div>

            {remaining > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTiers((prev) => ({
                      ...prev,
                      [group.tier.label]: shown + LOWEST_TIER_STEP,
                    }))
                  }
                  className="cursor-pointer rounded-full border-2 border-primary px-8 py-2.5 font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {group.tier.label} 더보기
                  <span className="ml-2 text-sm opacity-70">+{remaining.toLocaleString()}</span>
                </button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
