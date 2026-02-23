import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getContests, getSubmissions, getUsers } from '@/lib/data';
import { Calendar, Users, Clock, Trophy, ArrowLeft, Search, Image, Upload } from 'lucide-react';
import { SubmissionCarousel } from '@/components/contest/submission-carousel';
import { RelatedContestCarousel } from '@/components/contest/related-contest-carousel';
import { MediaTabs } from '@/components/contest/media-tabs';

type ContestDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

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

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
  const { id } = await params;
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
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto max-w-6xl space-y-5">
          {/* 상단 네비게이션 */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <Link href="/contests" className="hover:text-foreground transition-colors">
                공모전
              </Link>
              <span className="mx-2">&gt;</span>
              <span className="text-foreground">{contest.title}</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-[#EA580C] hover:font-bold transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              메인으로
            </Link>
          </div>

          {/* 타이틀 및 설명 */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">{contest.title}</h1>
              <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">{contest.description}</p>
            {/* 작품 제출 버튼 — 접수중일 때만 표시 */}
            {contest.status === 'open' && (
              <div className="pt-2">
                <Link href={`/contests/${contest.id}/submit` as any} className="group/btn inline-block">
                  <span className="relative inline-flex items-center gap-2 px-8 py-2.5 rounded-lg border-2 border-orange-500 text-orange-500 font-semibold overflow-hidden transition-all duration-300 cursor-pointer">
                    <span className="absolute inset-0 bg-orange-500 scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />
                    <Upload className="relative z-10 h-4 w-4 group-hover/btn:text-white transition-colors" />
                    <span className="relative z-10 group-hover/btn:text-white transition-colors">작품 제출하기</span>
                  </span>
                </Link>
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
                    {formatDate(contest.submissionStartAt)} ~ {formatDate(contest.submissionEndAt)}
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
                    {formatDate(contest.judgingStartAt)} ~ {formatDate(contest.judgingEndAt)}
                  </p>
                </div>
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </Card>

            {/* 결과 발표일 */}
            <Card className="p-5 border border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">결과 발표일</p>
                  <p className="font-semibold text-[15px]">{formatDate(contest.resultAnnouncedAt)}</p>
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
                promotionVideoUrl={contest.promotionVideoUrl}
                title={contest.title}
              />
            </Card>

            {/* 공모전 소개 + 상세 이미지 영역 */}
            <Card className="p-6 border border-border space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">공모전 소개</h2>
                <p className="text-muted-foreground leading-relaxed">{contest.description}</p>
              </div>

              {/* 상세 내용 이미지 영역 (실서비스에서 HTML/이미지 삽입) */}
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 border border-dashed border-border p-12 text-center">
                  <Image className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">공모전 상세 안내 이미지</p>
                  <p className="text-xs text-muted-foreground mt-1">주최자가 업로드한 상세 안내 이미지가 이 영역에 표시됩니다</p>
                </div>
              </div>
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
                    const colorClass = index === 0
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      : index === 1
                        ? 'bg-slate-400/10 text-slate-500 border-slate-400/20'
                        : 'bg-orange-600/10 text-orange-500 border-orange-600/20';
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
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">총 수상 인원</span>
                  <span className="font-bold">{contest.awardTiers.reduce((sum, t) => sum + t.count, 0)}명</span>
                </div>
              </Card>
            )}

            {/* Quick Info */}
            <Card className="p-6 border border-border space-y-4">
              <h3 className="text-lg font-bold">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">주최</span>
                  <span className="text-right font-medium">{hostUser?.name ?? '운영팀'}</span>
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
                  <span className="text-right font-medium">{contest.prizeAmount ?? '미정'}</span>
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
            <Card className="p-6 border border-border space-y-3">
              <h3 className="text-lg font-bold">참가 규정 및 가이드라인</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>공모전 주제에 맞는 독창적인 AI 영상 콘텐츠만 제출할 수 있습니다.</li>
                <li>저작권 및 초상권 이슈가 없는 원본 또는 사용 허가된 소스만 활용해야 합니다.</li>
                <li>심사 기준은 창의성, 완성도, 주제 적합성, 전달력을 중심으로 평가됩니다.</li>
              </ul>
            </Card>
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
