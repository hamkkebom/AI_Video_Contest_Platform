import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { ArrowRight, Play } from 'lucide-react';

export interface MosaicTile {
  id: string;
  title: string;
  thumbnailUrl: string;
}

interface HeroMosaicProps {
  /** 배경을 채울 작품 썸네일 — 결과 발표가 끝난 공모전 것만 넘긴다 */
  tiles: MosaicTile[];
  /** 오른쪽 상단 눈금용 지표 */
  stats: { works: number; contests: number; prize: string | null };
  /** 접수 중 공모전이 있으면 그쪽으로, 없으면 목록으로 */
  primaryHref: Route;
  primaryLabel: string;
  eyebrow: string;
}

/** 열 개수만큼 타일을 나눠 담는다 (부족하면 반복해서 채운다) */
function toColumns(tiles: MosaicTile[], columnCount: number): MosaicTile[][] {
  if (tiles.length === 0) return [];
  const columns: MosaicTile[][] = Array.from({ length: columnCount }, () => []);
  const perColumn = 6;
  for (let c = 0; c < columnCount; c += 1) {
    for (let r = 0; r < perColumn; r += 1) {
      columns[c].push(tiles[(c * perColumn + r) % tiles.length]);
    }
  }
  return columns;
}

/**
 * 홈 히어로 — 실제 출품작으로 만든 배경 위에 한 문장.
 *
 * 예전 히어로는 어두운 상자에 가운데 텍스트뿐이라, 462편의 작품을 가진 플랫폼의
 * 첫 화면에 작품이 한 장도 없었다. 배경은 장식이므로 개별 작품으로 가는 링크를 걸지 않는다
 * — 특정 작품을 홈에서 밀어주면 좋아요·조회수에 유리해져 심사 공정성을 해친다.
 * 같은 이유로 결과 발표가 끝난 공모전의 작품만 넘겨받는다.
 */
export function HeroMosaic({ tiles, stats, primaryHref, primaryLabel, eyebrow }: HeroMosaicProps) {
  const columns = toColumns(tiles, 6);

  return (
    <section className="relative isolate w-full overflow-hidden bg-neutral-950">
      {/* ── 배경: 작품 타일이 열마다 다른 속도로 흐른다 ── */}
      {columns.length > 0 && (
        <div className="absolute inset-0 -z-10 flex gap-2 opacity-80 sm:gap-3" aria-hidden>
          {columns.map((column, ci) => (
            <div
              key={ci}
              className="hero-mosaic-column flex min-w-0 flex-1 flex-col gap-2 sm:gap-3"
              style={{
                animationDuration: `${52 + ci * 9}s`,
                animationDirection: ci % 2 === 0 ? 'normal' : 'reverse',
              }}
            >
              {/* 끊김 없이 이어지도록 같은 열을 두 번 쌓는다 */}
              {[...column, ...column].map((tile, ti) => (
                <div key={`${tile.id}-${ti}`} className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={tile.thumbnailUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 33vw, 20vw"
                    className="object-cover"
                    priority={ci < 3 && ti === 0}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── 가독성 레이어 ──
          작품이 보여야 의미가 있으므로 전면을 균일하게 덮지 않는다.
          가운데(글자 자리)만 진하게 깔고 가장자리로 갈수록 작품을 드러낸다. */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_center,rgba(8,8,10,0.92)_0%,rgba(8,8,10,0.78)_45%,rgba(8,8,10,0.45)_100%)]"
        aria-hidden
      />
      {/* 위아래 가장자리는 헤더·다음 섹션과 이어지도록 어둡게 마감 */}
      <div
        className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-neutral-950 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent via-neutral-950/80 to-background"
        aria-hidden
      />

      {/* ── 내용 ── */}
      <div className="relative px-4 py-28 sm:py-36 md:py-44">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            {eyebrow}
          </p>

          {/* 배경이 흐르므로 뒤에 어떤 썸네일이 와도 읽히도록 그림자를 고정으로 깐다 */}
          <h1 className="text-balance text-4xl font-black leading-[1.15] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)] sm:text-6xl md:text-7xl">
            상상하면,
            <br />
            <span className="bg-gradient-to-r from-brand via-amber-300 to-brand bg-clip-text text-transparent [text-shadow:none]">
              작품이 됩니다
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)] sm:text-lg">
            {/* br 을 숨기는 모바일에서 두 문장이 붙지 않도록 공백을 명시한다 */}
            AI로 만든 영상 한 편이 무대에 오르는 곳.{' '}
            <br className="hidden sm:block" />
            지금 공모전에 참여하고 당신의 이야기를 보여주세요.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href={primaryHref}>
              <span className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-bold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/30">
                {primaryLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link href="/gallery/all">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                <Play className="h-4 w-4" />
                작품 감상하기
              </span>
            </Link>
          </div>

          {/* ── 지표: 문구가 아니라 숫자로 증명 ── */}
          <dl className="mx-auto mt-14 flex max-w-lg flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-2xl border border-white/10 bg-black/25 px-6 py-5 text-white backdrop-blur-md">
            <div className="text-center">
              <dt className="text-xs tracking-wide text-white/60">출품작</dt>
              <dd className="text-2xl font-bold tabular-nums">{stats.works.toLocaleString()}</dd>
            </div>
            <div className="text-center">
              <dt className="text-xs tracking-wide text-white/60">공모전</dt>
              <dd className="text-2xl font-bold tabular-nums">{stats.contests.toLocaleString()}</dd>
            </div>
            {stats.prize && (
              <div className="text-center">
                <dt className="text-xs tracking-wide text-white/60">누적 상금</dt>
                <dd className="text-2xl font-bold">{stats.prize}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
