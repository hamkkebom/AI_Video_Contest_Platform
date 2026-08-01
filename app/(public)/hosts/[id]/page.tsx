import Link from 'next/link';
import NextImage from 'next/image';
import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { Building2, ExternalLink, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getPublicCompanyById, getContests, getGallerySubmissions } from '@/lib/data';
import { contestTotalPrize } from '@/lib/prize';
import { formatDateCompact, safeJsonLd } from '@/lib/utils';
import { STATUS_BADGE_CLASS_MAP, publicContestStatusLabel } from '@/config/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

type HostPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: HostPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await getPublicCompanyById(id);
  /* 본문 스트리밍 시작 후의 notFound()는 상태코드가 200으로 굳는다(소프트 404).
     메타데이터 단계에서 끊어야 검색엔진에 진짜 404가 나간다 */
  if (!company) notFound();

  const title = `${company.name} — 주최 공모전`;
  const description = company.description?.slice(0, 155)
    ?? `${company.name}가 개최한 AI 영상 공모전을 확인하세요.`;
  const url = `${SITE_URL}/hosts/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      images: company.logoUrl ? [{ url: company.logoUrl, alt: company.name }] : undefined,
    },
  };
}

/**
 * 주최자 공개 페이지
 * 승인된 기업만 노출된다 (public_companies 뷰가 status='approved' 로 한정).
 * 사업자등록번호·대표자명·연락처는 뷰에 없으므로 여기서 노출될 수 없다. (마이그레이션 048)
 */
export default async function HostPage({ params }: HostPageProps) {
  const { id } = await params;
  const company = await getPublicCompanyById(id);
  if (!company) notFound();

  const [allContests, gallerySubmissions] = await Promise.all([
    getContests().catch(() => []),
    getGallerySubmissions().catch(() => []),
  ]);

  /* 이 주최자의 공모전 — 미공개 초안은 제외 */
  const contests = allContests
    .filter((c) => c.hostCompanyId === id && c.status !== 'draft')
    .sort((a, b) => new Date(b.submissionStartAt).getTime() - new Date(a.submissionStartAt).getTime());

  const contestIds = new Set(contests.map((c) => String(c.id)));
  const workCount = gallerySubmissions.filter((s) => contestIds.has(String(s.contestId))).length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    description: company.description ?? undefined,
    logo: company.logoUrl ?? undefined,
    url: company.website || `${SITE_URL}/hosts/${id}`,
    ...(contests.length > 0
      ? {
          event: contests.map((c) => ({
            '@type': 'Event',
            name: c.title,
            startDate: c.submissionStartAt,
            endDate: c.submissionEndAt,
            url: `${SITE_URL}/contests/${c.id}`,
          })),
        }
      : {}),
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      {/* 주최자 헤더 */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* 로고 */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-card">
              {company.logoUrl ? (
                <NextImage
                  src={company.logoUrl}
                  alt={`${company.name} 로고`}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* 이름·소개·링크 */}
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">주최자</p>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl break-keep">{company.name}</h1>
              </div>
              {company.description && (
                <p className="text-muted-foreground leading-relaxed break-keep">{company.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  공모전 <span className="font-semibold text-foreground">{contests.length}</span>개
                </span>
                {workCount > 0 && (
                  <span className="text-muted-foreground">
                    출품작 <span className="font-semibold text-foreground">{workCount.toLocaleString()}</span>편
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    웹사이트
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주최 공모전 목록 */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-5xl space-y-6">
          <h2 className="text-xl font-bold">주최 공모전</h2>

          {contests.length === 0 ? (
            <Card className="border border-border p-12 text-center">
              <p className="text-muted-foreground">아직 공개된 공모전이 없습니다.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {contests.map((contest) => {
                const totalPrize = contestTotalPrize(contest.prizeAmount, contest.awardTiers);
                const beforeStart =
                  contest.status === 'open' &&
                  new Date(contest.submissionStartAt).getTime() > Date.now();
                const displayStatus = beforeStart ? 'draft' : contest.status;
                return (
                  <Link key={contest.id} href={`/contests/${contest.id}` as Route} className="group">
                    <Card className="h-full border border-border p-6 transition-all hover:shadow-lg hover:-translate-y-0.5">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold leading-snug break-keep group-hover:text-primary transition-colors">
                            {contest.title}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                              STATUS_BADGE_CLASS_MAP[displayStatus] ?? STATUS_BADGE_CLASS_MAP.completed
                            }`}
                          >
                            {publicContestStatusLabel(displayStatus)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDateCompact(contest.submissionStartAt)} ~ {formatDateCompact(contest.submissionEndAt)}
                        </p>
                        {totalPrize && (
                          <p className="text-sm font-semibold">총 상금 {totalPrize}</p>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
