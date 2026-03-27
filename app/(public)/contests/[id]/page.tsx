import Link from 'next/link';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getContestById, getUserById, getRelatedContests } from '@/lib/data';
import { Calendar, Gavel, Trophy, ArrowLeft, Search, Image as ImageIcon } from 'lucide-react';
import { RelatedContestCarousel } from '@/components/contest/related-contest-carousel';
import { PromoVideoSection } from '@/components/contest/promo-video-section';
import type { AwardTier } from '@/lib/types';
import { AuthSubmitButton } from '@/components/contest/auth-submit-button';
import { formatDateCompact, safeJsonLd } from '@/lib/utils';
import { STATUS_BADGE_CLASS_MAP } from '@/config/constants';

type ContestDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

/** 공모전 상세 페이지 동적 메타데이터 */
export async function generateMetadata({ params }: ContestDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const contest = await getContestById(id);
  if (!contest) {
    return { title: '공모전을 찾을 수 없습니다' };
  }

  const title = `${contest.title} — AI 영상 공모전`;
  const description = contest.description
    ? contest.description.slice(0, 155)
    : `${contest.title} AI 영상 공모전에 참가하세요. AI꿈에서 접수, 심사, 수상작을 확인할 수 있습니다.`;
  const url = `${SITE_URL}/contests/${id}`;
  const keywords = [
    contest.title,
    'AI 영상 공모전',
    'AI꿈',
    ...(contest.tags ?? []),
  ];
  const images = contest.posterUrl
    ? [{ url: contest.posterUrl, width: 1200, height: 630, alt: contest.title }]
    : undefined;

  return {
    title,
    description,
    keywords,
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

/** 공개 페이지용 상태 메타 — 색상은 공통 상수, 라벨은 사용자 노출용 */
function getStatusMeta(status: string) {
  const publicLabels: Record<string, string> = {
    draft: '접수전',
    open: '접수중',
    judging: '심사중',
    closed: '결과발표',
    completed: '결과발표',
  };
  const label = publicLabels[status] ?? '결과발표';
  const className = `${STATUS_BADGE_CLASS_MAP[status] ?? STATUS_BADGE_CLASS_MAP.completed} cursor-default`;
  return { label, className };
}

function getJudgingTypeLabel(type: string) {
  if (type === 'internal') return '내부 심사';
  if (type === 'external') return '외부 심사';
  return '내부 + 외부 심사';
}

function getResultFormatLabel(format?: string) {
  if (format === 'website') return '홈페이지 발표';
  if (format === 'email') return '이메일 개별 통보';
  if (format === 'sns') return 'SNS 발표';
  if (format === 'offline') return '오프라인 시상식';
  return format ?? '-';
}

/** 상금 문자열("300만원", "1,000만원" 등)을 숫자(원)로 변환 */
function parsePrizeAmount(amount: string): number {
  const cleaned = amount.replace(/[,\s]/g, '');
  const match = cleaned.match(/(\d+)/);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  if (cleaned.includes('만')) return num * 10000;
  if (cleaned.includes('억')) return num * 100000000;
  return num;
}

/** awardTiers에서 총 상금을 계산 (인원 × 개인 상금 합산) */
function calculateTotalPrize(tiers: AwardTier[]): string | null {
  let total = 0;
  for (const tier of tiers) {
    if (!tier.prizeAmount) continue;
    total += parsePrizeAmount(tier.prizeAmount) * tier.count;
  }
  if (total === 0) return null;
  if (total >= 100000000) {
    const eok = Math.floor(total / 100000000);
    const man = Math.floor((total % 100000000) / 10000);
    if (man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
    return `${eok}억원`;
  }
  if (total >= 10000) {
    return `${(total / 10000).toLocaleString()}만원`;
  }
  return `${total.toLocaleString()}원`;
}

/** 상금 표시 포맷: 순수 숫자면 한국 원 단위로 변환, 이미 포맷된 문자열이면 그대로 반환 */
function formatPrizeDisplay(amount: string): string {
  if (/[만억원]/.test(amount)) return amount;
  const num = parseInt(amount.replace(/[,\s]/g, ''), 10);
  if (isNaN(num) || num === 0) return amount;
  if (num >= 100000000) {
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    if (man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
    return `${eok}억원`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toLocaleString()}만원`;
  }
  return `${num.toLocaleString()}원`;
}

/** 수상 티어 라벨 기반 색상 클래스 */
function getAwardColorClass(label: string, index: number): string {
  const lower = label.toLowerCase();
  if (lower.includes('대상')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  if (lower.includes('최우수') || lower.includes('금상')) return 'bg-slate-400/10 text-slate-500 border-slate-400/20';
  if (lower.includes('우수') || lower.includes('은상')) return 'bg-orange-600/10 text-orange-500 border-orange-600/20';
  if (lower.includes('장려') || lower.includes('입선') || lower.includes('동상')) return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
  if (lower.includes('특별')) return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
  if (index === 0) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  if (index === 1) return 'bg-slate-400/10 text-slate-500 border-slate-400/20';
  if (index === 2) return 'bg-orange-600/10 text-orange-500 border-orange-600/20';
  return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
}

export default async function ContestDetailPage({ params, searchParams }: ContestDetailPageProps) {
  const { id } = await params;
  await searchParams;
  const contest = await getContestById(id);

  /* 공모전 미존재 상태 */
  if (!contest) {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="container mx-auto max-w-6xl" />
        </section>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-12 text-center border border-border">
              <div className="space-y-4">
                <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                <h1 className="text-2xl font-bold">공모전을 찾을 수 없습니다</h1>
                <p className="text-muted-foreground">요청하신 공모전이 존재하지 않거나 삭제되었습니다.</p>
                <Link href="/contests">
                  <button type="button" className="text-sm text-muted-foreground hover:text-[#EA580C] hover:font-bold transition-all cursor-pointer">
                    목록으로 돌아가기 →
                  </button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  /* 표시용 상태 */
  const displayStatus = (contest.status === 'open' && new Date(contest.submissionStartAt).getTime() > Date.now())
    ? 'draft'
    : contest.status;
  const statusMeta = getStatusMeta(displayStatus);

  const [hostUser, relatedContests] = await Promise.all([
    getUserById(contest.hostUserId),
    getRelatedContests(contest.id, 6),
  ]);
  const isAdminHost = hostUser?.roles?.includes('admin');
  const totalPrize = (contest.prizeAmount ? formatPrizeDisplay(contest.prizeAmount) : null) || calculateTotalPrize(contest.awardTiers);

  /* JSON-LD 구조화 데이터 — Event 스키마 */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: contest.title,
    description: contest.description ?? `${contest.title} AI 영상 공모전`,
    startDate: contest.submissionStartAt,
    endDate: contest.submissionEndAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: `${SITE_URL}/contests/${id}`,
    },
    image: contest.posterUrl || undefined,
    organizer: {
      '@type': 'Organization',
      name: 'AI꿈',
      url: SITE_URL,
    },
    ...(contest.awardTiers.length > 0 ? {
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/contests/${id}`,
        validFrom: contest.submissionStartAt,
      },
    } : {}),
    url: `${SITE_URL}/contests/${id}`,
    inLanguage: 'ko',
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* 히어로 섹션: 포스터(좌) + 공모전 정보(우) */}
      <section className="relative py-10 sm:py-16 px-4 bg-gradient-to-b from-primary/8 via-primary/3 to-background border-b border-border overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-6xl space-y-6">
          {/* 돌아가기 */}
          <div>
            <Link
              href="/contests"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/10 text-sm font-medium text-foreground/70 hover:bg-violet-500 hover:text-white transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              돌아가기
            </Link>
          </div>

          {/* 포스터 + 정보 2컬럼 레이아웃 */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* 좌측: 포스터 */}
            <div className="w-full lg:w-80 shrink-0">
              {contest.posterUrl ? (
                <div className="overflow-hidden rounded-xl bg-muted shadow-lg aspect-[3/4]">
                  <img
                    src={contest.posterUrl}
                    alt={`${contest.title} 포스터`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl bg-muted/50 border border-dashed border-border shadow-lg aspect-[3/4] flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* 우측: 공모전 정보 */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* 상태 배지 + 제목 */}
              <div className="space-y-3">
                <Badge className={`${statusMeta.className} text-base px-4 py-1`}>{statusMeta.label}</Badge>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">{contest.title}</h1>
              </div>

              {/* 설명 */}
              {contest.description && (
                <p className="text-base text-foreground/70 leading-relaxed border-l-4 border-primary/30 pl-4 whitespace-pre-line">
                  {contest.description}
                </p>
              )}

              {/* 핵심 정보 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* 제출기간 */}
                <Card className="p-5 border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground mb-1">제출기간</p>
                      <p className="font-semibold text-[15px] leading-relaxed">
                        {formatDateCompact(contest.submissionStartAt)} ~ {formatDateCompact(contest.submissionEndAt)}
                      </p>
                    </div>
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                </Card>

                {/* 심사기간 */}
                <Card className="p-5 border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground mb-1">심사기간</p>
                      <p className="font-semibold text-[15px] leading-relaxed">
                        {formatDateCompact(contest.judgingStartAt)} ~ {formatDateCompact(contest.judgingEndAt)}
                      </p>
                    </div>
                    <Gavel className="h-5 w-5 text-primary" />
                  </div>
                </Card>

                {/* 결과 발표일 */}
                <Card className="p-5 border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground mb-1">결과 발표일</p>
                      <p className="font-semibold text-[15px]">{formatDateCompact(contest.resultAnnouncedAt)}</p>
                    </div>
                    <Trophy className="h-5 w-5 text-violet-600" />
                  </div>
                </Card>
              </div>

            </div>
          </div>

          {/* 영상 제출 버튼 — 포스터+정보 전체 너비 */}
          {displayStatus === 'open' && (
            <AuthSubmitButton contestId={contest.id} variant="hero" />
          )}
        </div>
      </section>

      {/* 예시영상 섹션 — 탭 없이 바로 노출 */}
      {contest.promotionVideoUrls && contest.promotionVideoUrls.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <PromoVideoSection
              videoUrls={contest.promotionVideoUrls}
              title={contest.title}
            />
          </div>
        </section>
      )}

      {/* 공모전 상세 정보 */}
      <section className="pb-10 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측 상세 설명 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 상세 안내 */}
            <Card className="p-6 border border-border space-y-6">
              <h2 className="text-2xl font-bold">상세 안내</h2>

              {/* 상세 안내 이미지 */}
              {contest.detailImageUrls && contest.detailImageUrls.length > 0 && (
                <div className="flex flex-col items-center gap-4">
                  {contest.detailImageUrls.map((url) => (
                    <div key={url} className="overflow-hidden rounded-lg bg-muted aspect-[3/4] max-w-sm w-full">
                      <img
                        src={url}
                        alt={`${contest.title} 상세 안내`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 상세 안내 텍스트 */}
              {contest.detailContent ? (
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {contest.detailContent}
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">{contest.description}</p>
              )}
            </Card>
          </div>

          {/* 우측 사이드바 */}
          <div className="space-y-6">
            {/* 수상 안내 */}
            {contest.awardTiers.length > 0 && (
              <Card className="p-6 border border-border space-y-4 bg-gradient-to-br from-amber-500/5 to-transparent">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  수상 안내
                </h3>
                <div className="space-y-2">
                  {contest.awardTiers.map((tier, index) => {
                    const colorClass = getAwardColorClass(tier.label, index);
                    return (
                      <div key={tier.label} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${colorClass}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{tier.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium">{tier.count}명</span>
                          {tier.prizeAmount && (
                            <span className="font-bold">{formatPrizeDisplay(tier.prizeAmount)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-border/50 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">총 수상 인원</span>
                    <span className="font-bold">{contest.awardTiers.reduce((sum, t) => sum + t.count, 0)}명</span>
                  </div>
                  {totalPrize && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">총 상금</span>
                      <span className="font-bold text-amber-600">{totalPrize}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* 요약 정보 */}
            <Card className="p-6 border border-border space-y-4">
              <h3 className="text-lg font-bold">요약 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">주최</span>
                  <span className="text-right font-medium">
                    {isAdminHost ? '함께봄 주식회사' : (hostUser?.name ?? '운영팀')}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">심사 방식</span>
                  <span className="text-right font-medium">{getJudgingTypeLabel(contest.judgingType)}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">최대 출품</span>
                  <span className="text-right font-medium">{contest.maxSubmissionsPerUser}개</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">허용 확장자</span>
                  <span className="text-right font-medium uppercase">{contest.allowedVideoExtensions.join(', ')}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">결과 발표 형태</span>
                  <span className="text-right font-medium">{getResultFormatLabel(contest.resultFormat)}</span>
                </div>
              </div>
            </Card>

            {/* 유의사항 */}
            {contest.notes && (
              <Card className="p-6 border border-border space-y-3">
                <h3 className="text-lg font-bold">유의사항 및 저작권 안내</h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {contest.notes}
                </div>
              </Card>
            )}

            {/* 개인 SNS 업로드 자제 안내 */}
            <Card className="p-6 border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/30 space-y-3">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">📢 제출 작품 개인 SNS 업로드 자제 안내</h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
                <p>
                  제출된 작품은 <strong>공모전 페이지에 게시되어 대중평가(좋아요) 점수가 심사에 반영</strong>됩니다.
                  공정한 심사를 위해 수상 발표 전까지 동일한 영상을 <strong>개인 SNS에 업로드하시는 것을 자제</strong>해 주세요.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  ※ 가산점 인증을 위한 공식 포스터·링크 공유는 해당되지 않습니다.
                </p>
              </div>
            </Card>

            {/* 태그 */}
            <Card className="p-6 border border-border space-y-3">
              <h3 className="text-lg font-bold">태그</h3>
              <div className="flex flex-wrap gap-2">
                {contest.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* 가이드라인 */}
            {contest.guidelines && (
              <Card className="p-6 border border-border space-y-3">
                <h3 className="text-lg font-bold">참가 규정 및 가이드라인</h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {contest.guidelines}
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* 관련 공모전 */}
      {relatedContests.length > 0 && (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-6xl space-y-5">
            <h2 className="text-2xl font-bold">관련 공모전</h2>
            <RelatedContestCarousel contests={relatedContests} />
          </div>
        </section>
      )}
    </div>
  );
}
