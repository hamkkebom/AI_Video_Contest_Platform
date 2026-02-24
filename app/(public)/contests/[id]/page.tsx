import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getContests, getSubmissions, getUsers } from '@/lib/data';
import { Calendar, Users, Gavel, Trophy, ArrowLeft, Search } from 'lucide-react';
import { SubmissionCarousel } from '@/components/contest/submission-carousel';
import { RelatedContestCarousel } from '@/components/contest/related-contest-carousel';
import { MediaTabs } from '@/components/contest/media-tabs';
import type { AwardTier } from '@/lib/types';
import { AuthSubmitButton } from '@/components/contest/auth-submit-button';
import { formatDateCompact } from '@/lib/utils';

type ContestDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function getStatusMeta(status: string) {
  if (status === 'open') {
    return { label: '접수중', className: 'bg-accent text-accent-foreground' };
  }
  if (status === 'judging') {
    return { label: '심사중', className: 'bg-primary text-primary-foreground' };
  }
  return { label: '결과발표', className: 'bg-muted text-muted-foreground' };
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

/** 수상 티어 라벨 기반 색상 클래스 */
function getAwardColorClass(label: string, index: number): string {
  const lower = label.toLowerCase();
  if (lower.includes('대상')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  if (lower.includes('최우수') || lower.includes('금상')) return 'bg-slate-400/10 text-slate-500 border-slate-400/20';
  if (lower.includes('우수') || lower.includes('은상')) return 'bg-orange-600/10 text-orange-500 border-orange-600/20';
  if (lower.includes('장려') || lower.includes('입선') || lower.includes('동상')) return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
  if (lower.includes('특별')) return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
  // 라벨로 매칭 안 되면 인덱스 기반 폴백
  if (index === 0) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  if (index === 1) return 'bg-slate-400/10 text-slate-500 border-slate-400/20';
  if (index === 2) return 'bg-orange-600/10 text-orange-500 border-orange-600/20';
  return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
}

export default async function ContestDetailPage({ params, searchParams }: ContestDetailPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const [allContests, allSubmissions, allUsers] = await Promise.all([
    getContests(),
    getSubmissions({ contestId: id }),
    getUsers(),
  ]);
  const contest = allContests.find((c) => c.id === id);

  // 공모전 미존재 상태
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

  const statusMeta = getStatusMeta(contest.status);
  const hostUser = allUsers.find((u) => u.id === contest.hostUserId);
  const isAdminHost = hostUser?.roles?.includes('admin');

  // 총 상금 계산: contest.prizeAmount가 있으면 사용, 없으면 awardTiers에서 합산
  const totalPrize = contest.prizeAmount || calculateTotalPrize(contest.awardTiers);

  // 클라이언트 컴포넌트에 전달하기 위해 Map → 직렬화 가능한 객체로 변환
  const creatorsRecord: Record<string, (typeof allUsers)[number]> = {};
  for (const u of allUsers) {
    creatorsRecord[u.id] = u;
  }

  const sameRegionContests = allContests.filter((c) => c.id !== contest.id && c.region === contest.region);
  const fallbackContests = allContests.filter((c) => c.id !== contest.id && c.region !== contest.region);
  const relatedContests = [...sameRegionContests, ...fallbackContests].slice(0, 6);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* 페이지 헤더 */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-primary/8 via-primary/3 to-background border-b border-border overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-6xl space-y-6">
          {/* 돌아가기 네비게이션 */}
          <div>
            <Link
              href="/contests"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-sm text-muted-foreground hover:bg-muted hover:text-violet-500 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              돌아가기
            </Link>
          </div>
          {/* 타이틀 및 설명 */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">{contest.title}</h1>
              <Badge className={`${statusMeta.className} text-base px-4 py-1`}>{statusMeta.label}</Badge>
            </div>
            {contest.description && (
              <p className="max-w-3xl text-lg text-foreground/70 leading-relaxed border-l-4 border-primary/30 pl-4 whitespace-pre-line">
                {contest.description}
              </p>
            )}
            {/* 작품 제출 버튼 — 접수중일 때만 표시 */}
            {contest.status === 'open' && (
              <div className="flex justify-end py-3">
                <AuthSubmitButton contestId={contest.id} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 공모전 핵심 지표 — 제출기간 / 심사기간 / 결과 발표일 / 참가자 */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* 참가자 */}
            <Card className="p-5 border border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">참가자</p>
                  <p className="font-semibold text-[15px]">{allSubmissions.length}명</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 공모전 상세 정보 */}
      <section className="pb-10 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측 상세 설명 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 포스터 & 홍보영상 — 탭 전환 */}
            <Card className="p-6 border border-border">
              <MediaTabs
                posterUrl={contest.posterUrl}
                promotionVideoUrls={contest.promotionVideoUrls}
                title={contest.title}
                defaultTab={tab === 'video' ? 'video' : undefined}
              />
            </Card>

            {/* 상세 안내 */}
            <Card className="p-6 border border-border space-y-6">
              <h2 className="text-2xl font-bold">상세 안내</h2>

              {/* 상세 안내 이미지 (포스터 크기) */}
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

          {/* 우측 수상 안내 + 퀵 정보 + 태그 + 가이드라인 */}
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
                            <span className="font-bold">{tier.prizeAmount}</span>
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

            {/* Quick Info */}
            <Card className="p-6 border border-border space-y-4">
              <h3 className="text-lg font-bold">Quick Info</h3>
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
                  <span className="text-muted-foreground">총 상금</span>
                  <span className="text-right font-medium">{totalPrize ?? '미정'}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">접수작 수</span>
                  <span className="text-right font-medium">{allSubmissions.length}개</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">결과 발표 형태</span>
                  <span className="text-right font-medium">{getResultFormatLabel(contest.resultFormat)}</span>
                </div>
              </div>
            </Card>


            {/* 유의사항 및 저작권 안내 */}
            {contest.notes && (
              <Card className="p-6 border border-border space-y-3">
                <h3 className="text-lg font-bold">유의사항 및 저작권 안내</h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {contest.notes}
                </div>
              </Card>
            )}

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

            {/* 참가 규정 및 가이드라인 */}
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

      {/* 출품작 섹션 — 캐러셀 */}
      {allSubmissions.length > 0 && (
        <section className="pb-10 px-4">
          <div className="container mx-auto max-w-6xl space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">출품작 ({allSubmissions.length})</h2>
              <span className="text-base text-muted-foreground hover:text-[#EA580C] hover:font-bold transition-all cursor-pointer">
                더보기 →
              </span>
            </div>
            <SubmissionCarousel
              submissions={allSubmissions}
              creators={creatorsRecord}
            />
          </div>
        </section>
      )}

      {/* 관련 공모전 섹션 — 캐러셀 (3개씩) */}
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
