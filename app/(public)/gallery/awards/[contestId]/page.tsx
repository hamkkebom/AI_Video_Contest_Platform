import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAwardedSubmissions, getCompletedContests } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { AwardsGrid } from './awards-grid';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

type ContestAwardsMetadataProps = {
  params: Promise<{ contestId: string }>;
};

export async function generateMetadata({ params }: ContestAwardsMetadataProps): Promise<Metadata> {
  const { contestId } = await params;
  const completedContests = await getCompletedContests();
  const contest = completedContests.find((c) => c.id === contestId);

  if (!contest) {
    return { title: '수상작을 찾을 수 없습니다' };
  }

  const title = `${contest.title} 수상작 — AI꿈 갤러리`;
  const description = `${contest.title} AI 영상 공모전의 수상작을 감상하세요.`;
  const url = `${SITE_URL}/gallery/awards/${contestId}`;
  const images = contest.posterUrl
    ? [{ url: contest.posterUrl, width: 1200, height: 630, alt: contest.title }]
    : undefined;

  return {
    title,
    description,
    keywords: [contest.title, '수상작 갤러리', 'AI 영상 공모전 수상작', 'AI꿈'],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: contest.posterUrl ? [contest.posterUrl] : undefined,
    },
  };
}

/**
 * 공모전별 수상작 상세 갤러리
 * 특정 공모전의 수상작만 표시
 */
export default async function ContestAwardsPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = await params;

  const [allAwarded, completedContests] = await Promise.all([
    getAwardedSubmissions(),
    getCompletedContests(),
  ]);

  // 해당 공모전 찾기
  const contest = completedContests.find((c) => c.id === contestId);
  if (!contest) notFound();

  // 해당 공모전 수상작 필터 + rank 정렬 (대상 → 최우수상 → 우수상)
  const contestAwarded = allAwarded
    .filter((s) => s.contestId === contestId)
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  // AwardsGrid 클라이언트 컴포넌트에 전달할 직렬화 가능한 데이터
  const gridSubmissions = contestAwarded.map((s) => ({
    id: s.id,
    title: s.title,
    creatorName: s.creatorName,
    thumbnailUrl: s.thumbnailUrl,
    views: s.views,
    likeCount: s.likeCount,
    rank: s.rank,
    prizeLabel: s.prizeLabel,
  }));

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">

      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* 뒤로가기 */}
          <Link href="/gallery/awards" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            수상작 갤러리로 돌아가기
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-violet-500/80 to-foreground/70">
              {contest.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{contest.prizeAmount ?? '상금 미정'}</span>
              <span>발표일 {formatDate(contest.resultAnnouncedAt, { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 수상작 그리드 */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-5">
            <p className="text-base text-muted-foreground">
              총 <span className="text-[#EA580C] font-semibold">{contestAwarded.length.toLocaleString()}</span>개의 수상작
            </p>
          </div>

          <AwardsGrid submissions={gridSubmissions} />
        </div>
      </section>
    </div>
  );
}
