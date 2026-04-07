'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Contest, SubmissionStatus } from '@/lib/types';
import { ArrowLeft, Search, Pencil, Video, Trash2, Calendar, Gavel, Trophy, Image as ImageIcon, UserPlus, X, Loader2 } from 'lucide-react';
import { formatDateCompact } from '@/lib/utils';
import { STATUS_LABEL_MAP, STATUS_BADGE_CLASS_MAP } from '@/config/constants';

type AdminContestDetailPageProps = {
  params: Promise<{ id: string }>;
};


const statusFlow: Contest['status'][] = ['draft', 'open', 'closed', 'judging', 'completed'];

/** 수상 티어 라벨 기반 색상 클래스 (공개 페이지와 동일) */
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

/** 상금 표시 포맷 (공개 페이지와 동일) */
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

type ContestPayload = {
  title: string;
  description: string;
  region: string;
  tags: string[];
  status: Contest['status'];
  submissionStartAt: string;
  submissionEndAt: string;
  judgingStartAt: string;
  judgingEndAt: string;
  resultAnnouncedAt: string;
  judgingType: Contest['judgingType'];
  reviewPolicy: Contest['reviewPolicy'];
  maxSubmissionsPerUser: number;
  allowedVideoExtensions: string[];
  prizeAmount?: string;
  posterUrl?: string;
  promotionVideoUrls?: string[];
  hasLandingPage: boolean;
  bonusMaxScore?: number;
  awardTiers: Array<{ label: string; count: number; prizeAmount?: string }>;
  bonusConfigs: Array<{ label: string; description?: string; score: number; requiresUrl: boolean; requiresImage: boolean }>;
};

function toUpdatePayload(contest: Contest, nextStatus: Contest['status']): ContestPayload {
  return {
    title: contest.title,
    description: contest.description,
    region: contest.region,
    tags: contest.tags,
    status: nextStatus,
    submissionStartAt: contest.submissionStartAt,
    submissionEndAt: contest.submissionEndAt,
    judgingStartAt: contest.judgingStartAt,
    judgingEndAt: contest.judgingEndAt,
    resultAnnouncedAt: contest.resultAnnouncedAt,
    judgingType: contest.judgingType,
    reviewPolicy: contest.reviewPolicy,
    maxSubmissionsPerUser: contest.maxSubmissionsPerUser,
    allowedVideoExtensions: contest.allowedVideoExtensions,
    prizeAmount: contest.prizeAmount,
    posterUrl: contest.posterUrl,
    promotionVideoUrls: contest.promotionVideoUrls,
    hasLandingPage: contest.hasLandingPage ?? false,
    bonusMaxScore: contest.bonusMaxScore,
    awardTiers: contest.awardTiers,
    bonusConfigs: (contest.bonusConfigs ?? []).map((config) => ({
      label: config.label,
      description: config.description,
      score: config.score,
      requiresUrl: config.requiresUrl,
      requiresImage: config.requiresImage,
    })),
  };
}

/** 심사 방식 라벨 */
function getJudgingTypeLabel(type: string): string {
  if (type === 'internal') return '내부 심사';
  if (type === 'external') return '외부 심사';
  return '내부 + 외부 병행';
}

/** 결과 발표 형태 라벨 */
function getResultFormatLabel(format?: string): string {
  if (format === 'website') return '홈페이지 발표';
  if (format === 'email') return '이메일 개별 통보';
  if (format === 'sns') return 'SNS 발표';
  if (format === 'offline') return '오프라인 시상식';
  return format ?? '-';
}

export default function AdminContestDetailPage({ params }: AdminContestDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submissionCounts, setSubmissionCounts] = useState({ total: 0, pendingReview: 0, approved: 0, rejected: 0, judging: 0, judged: 0, bonusSubmissions: 0 });
  const [countsError, setCountsError] = useState(false);

  // 심사위원 관리
  const [judges, setJudges] = useState<Array<{ id: string; user_id: string; is_external: boolean; invited_at: string; accepted_at?: string; userName?: string; userEmail?: string }>>([]);
  const [judgeSearch, setJudgeSearch] = useState('');
  const [judgeSearchResults, setJudgeSearchResults] = useState<Array<{ id: string; name: string; email: string; nickname?: string }>>([]);
  const [judgeSearching, setJudgeSearching] = useState(false);
  const [addingJudge, setAddingJudge] = useState(false);
  const [removingJudgeId, setRemovingJudgeId] = useState<string | null>(null);

  useEffect(() => {
    const loadContest = async () => {
      try {
        const response = await fetch(`/api/admin/contests/${id}`);
        if (response.status === 404) {
          setContest(null);
          return;
        }
        if (!response.ok) {
          throw new Error('공모전 정보를 불러오지 못했습니다.');
        }

        const data = (await response.json()) as { contest: Contest };
        setContest(data.contest);
      } catch {
        setErrorMessage('공모전 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [id]);

  /* 출품작 상태별 카운트 조회 */
  useEffect(() => {
    const loadSubmissionCounts = async () => {
      try {
        const response = await fetch(`/api/admin/contests/${id}/submissions-count`);
        if (!response.ok) {
          throw new Error('카운트 조회 실패');
        }
        const data = (await response.json()) as typeof submissionCounts;
        setCountsError(false);
        setSubmissionCounts(data);
      } catch (err) {
        setCountsError(true);
      }
    };

    loadSubmissionCounts();
  }, [id]);

  /* 심사위원 목록 로드 (API에서 유저 정보 포함 반환) */
  const loadJudges = async () => {
    try {
      const res = await fetch(`/api/judges?contestId=${id}`);
      if (!res.ok) return;
      const data = (await res.json()) as { judges: typeof judges };
      setJudges(data.judges);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadJudges(); }, [id]);

  /* 심사위원 검색 (디바운스) */
  useEffect(() => {
    if (judgeSearch.trim().length < 2) {
      setJudgeSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setJudgeSearching(true);
      try {
        const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(judgeSearch.trim())}`);
        if (res.ok) {
          const data = (await res.json()) as { users: Array<{ id: string; name: string; email: string; nickname?: string }> };
          // 이미 배정된 심사위원 제외
          const assignedIds = new Set(judges.map((j) => j.user_id));
          setJudgeSearchResults(data.users.filter((u) => !assignedIds.has(u.id)));
        }
      } catch { /* ignore */ }
      setJudgeSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [judgeSearch, judges]);

  /* 심사위원 추가 */
  const handleAddJudge = async (userId: string) => {
    setAddingJudge(true);
    try {
      const res = await fetch('/api/judges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, contestId: id, isExternal: false }),
      });
      if (res.ok) {
        setJudgeSearch('');
        setJudgeSearchResults([]);
        await loadJudges();
      }
    } catch { /* ignore */ }
    setAddingJudge(false);
  };

  /* 심사위원 해제 */
  const handleRemoveJudge = async (judgeId: string) => {
    if (!window.confirm('이 심사위원을 해제하시겠습니까?')) return;
    setRemovingJudgeId(judgeId);
    try {
      const res = await fetch(`/api/judges?judgeId=${judgeId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadJudges();
      }
    } catch { /* ignore */ }
    setRemovingJudgeId(null);
  };

  const nextStatus = useMemo(() => {
    if (!contest) return null;
    const currentIndex = statusFlow.indexOf(contest.status);
    if (currentIndex < 0 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  }, [contest]);

  const handleMoveToNextStatus = async () => {
    if (!contest || !nextStatus) return;

    setUpdatingStatus(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/contests/${contest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toUpdatePayload(contest, nextStatus)),
      });

      const data = (await response.json()) as { contest?: Contest; error?: string };
      if (!response.ok || !data.contest) {
        throw new Error(data.error ?? '상태 변경에 실패했습니다.');
      }

      setContest(data.contest);
      router.refresh();
    } catch {
      setErrorMessage('상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!contest) return;

    const confirmed = window.confirm('정말 이 공모전을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.');
    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/contests/${contest.id}`, {
        method: 'DELETE',
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? '공모전 삭제에 실패했습니다.');
      }

      router.replace('/admin/contests');
      router.refresh();
    } catch {
      setErrorMessage('공모전 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setDeleting(false);
    }
  };

  /* 총 상금 계산 */
  const totalPrize = useMemo(() => {
    if (!contest) return null;
    if (contest.prizeAmount) return formatPrizeDisplay(contest.prizeAmount);
    let total = 0;
    for (const tier of contest.awardTiers) {
      if (!tier.prizeAmount) continue;
      const num = parseInt(String(tier.prizeAmount).replace(/[,\s]/g, ''), 10);
      if (!isNaN(num)) total += num * tier.count;
    }
    if (total === 0) return null;
    if (total >= 10000) return `${(total / 10000).toLocaleString()}만원`;
    return `${total.toLocaleString()}원`;
  }, [contest]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-muted-foreground">공모전 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <Search className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-semibold tracking-tight">공모전을 찾을 수 없습니다</h1>
        <p className="text-sm text-muted-foreground">요청하신 공모전이 존재하지 않거나 일시적인 오류가 발생했습니다.</p>
        <Link href={'/admin/contests' as Route}>
          <Button size="sm">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-10">
      {/* 뒤로가기 */}
      <div className="mb-4">
        <Link
          href={'/admin/contests' as Route}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/10 text-sm font-medium text-foreground/70 hover:bg-primary hover:text-white transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          목록으로
        </Link>
      </div>

      {/* 히어로 헤더 섹션 — 포스터(좌) + 정보(우) */}
      <section className="relative -mx-4 mb-8 overflow-hidden rounded-xl bg-gradient-to-b from-primary/8 via-primary/3 to-background border border-border px-6 py-8 sm:px-8 sm:py-10">
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          {/* 포스터 + 정보 2컬럼 레이아웃 */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* 좌측: 포스터 */}
            <div className="w-full lg:w-64 shrink-0">
              {contest.posterUrl ? (
                <div className="overflow-hidden rounded-xl bg-muted shadow-lg aspect-[3/4] pointer-events-none">
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
            <div className="flex-1 min-w-0 space-y-4">
              {/* 상태 드롭다운 (뱃지 스타일) + 제목 */}
              <div className="space-y-3">
                <Select
                  value={contest.status}
                  onValueChange={(value) => {
                    const newStatus = value as Contest['status'];
                    if (newStatus !== contest.status) {
                      setUpdatingStatus(true);
                      setErrorMessage(null);
                      fetch(`/api/admin/contests/${contest.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(toUpdatePayload(contest, newStatus)),
                      })
                        .then((res) => res.json())
                        .then((data: { contest?: Contest; error?: string }) => {
                          if (data.contest) {
                            setContest(data.contest);
                            router.refresh();
                          } else {
                            setErrorMessage(data.error ?? '상태 변경에 실패했습니다.');
                          }
                        })
                        .catch(() => setErrorMessage('상태 변경에 실패했습니다.'))
                        .finally(() => setUpdatingStatus(false));
                    }
                  }}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className={`${STATUS_BADGE_CLASS_MAP[contest.status]} w-auto inline-flex h-auto rounded-full border-0 px-4 py-1 text-base font-semibold gap-1.5 cursor-pointer [&>svg]:opacity-60`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFlow.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL_MAP[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updatingStatus && <p className="text-xs text-muted-foreground">변경 중...</p>}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                    {contest.title}
                  </h1>
                  <Link href={`/admin/contests/${contest.id}/edit` as Route} className="shrink-0">
                    <Button size="sm" className="gap-1.5 bg-orange-500 text-white hover:bg-orange-400 transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                      수정
                    </Button>
                  </Link>
                </div>

              </div>

              {/* 설명 */}
              {contest.description && (
                <p className="text-base text-foreground/70 leading-relaxed border-l-4 border-primary/30 pl-4 whitespace-pre-line">
                  {contest.description}
                </p>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 영상 관리 섹션 — 풀 width + 상태별 카운트 */}
      <div className="mb-8">
        <Link href={`/admin/contests/${contest.id}/submissions` as Route} className="block">
          <Card className="p-5 border border-primary/20 bg-gradient-to-r from-primary/8 to-sky-500/5 hover:from-primary/15 hover:to-sky-500/10 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">영상 관리</p>
                  <p className="text-sm text-muted-foreground">출품작 검수 및 심사 관리</p>
                </div>
              </div>
              {countsError ? (
                <p className="text-sm text-destructive">일시적으로 정보를 불러올 수 없습니다</p>
              ) : (
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{submissionCounts.total}</p>
                    <p className="text-muted-foreground font-bold">총 접수</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-600">{submissionCounts.pendingReview}</p>
                    <p className="text-muted-foreground font-bold">검수대기</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{submissionCounts.approved}</p>
                    <p className="text-muted-foreground font-bold">검수완료</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-rose-600">{submissionCounts.rejected}</p>
                    <p className="text-muted-foreground font-bold">반려</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-sky-600">{submissionCounts.judging}</p>
                    <p className="text-muted-foreground font-bold">심사중</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{submissionCounts.judged}</p>
                    <p className="text-muted-foreground font-bold">심사완료</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-violet-600">{submissionCounts.bonusSubmissions}</p>
                    <p className="text-muted-foreground font-bold">가산점</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Link>
      </div>

      {/* 심사위원 관리 섹션 */}
      <div className="mb-8">
        <Card className="p-6 border border-border space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Gavel className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">심사위원 관리</p>
                <p className="text-sm text-muted-foreground">배정된 심사위원 {judges.length}명</p>
              </div>
            </div>
          </div>

          {/* 심사위원 추가: 검색 */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="이름, 이메일로 회원 검색 (2글자 이상)"
                  value={judgeSearch}
                  onChange={(e) => setJudgeSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {judgeSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* 검색 결과 드롭다운 */}
            {judgeSearchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                {judgeSearchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                    onClick={() => handleAddJudge(user.id)}
                    disabled={addingJudge}
                  >
                    <div className="text-left">
                      <span className="font-medium">{user.name}</span>
                      {user.nickname && <span className="ml-1 text-muted-foreground">({user.nickname})</span>}
                      <span className="ml-2 text-muted-foreground">{user.email}</span>
                    </div>
                    <UserPlus className="h-4 w-4 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 심사위원 목록 */}
          {judges.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              배정된 심사위원이 없습니다. 위 검색으로 심사위원을 추가하세요.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">심사위원</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">이메일</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">유형</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">초대일</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {judges.map((judge) => {
                    return (
                      <tr key={judge.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{judge.userName ?? '알 수 없음'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{judge.userEmail ?? '-'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={judge.is_external ? 'border-amber-500/40 text-amber-700 dark:text-amber-300' : 'border-primary/40 text-primary'}>
                            {judge.is_external ? '외부' : '내부'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDateCompact(judge.invited_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            onClick={() => handleRemoveJudge(judge.id)}
                            disabled={removingJudgeId === judge.id}
                          >
                            {removingJudgeId === judge.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            해제
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {/* 일정 카드 — 3개 개별 카드 (공개 페이지 스타일) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-1">접수 기간</p>
              <p className="font-semibold text-[15px] leading-relaxed">
                {formatDateCompact(contest.submissionStartAt)} ~ {formatDateCompact(contest.submissionEndAt)}
              </p>
            </div>
            <Calendar className="h-5 w-5 text-orange-500 shrink-0" />
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-1">심사 기간</p>
              <p className="font-semibold text-[15px] leading-relaxed">
                {formatDateCompact(contest.judgingStartAt)} ~ {formatDateCompact(contest.judgingEndAt)}
              </p>
            </div>
            <Gavel className="h-5 w-5 text-primary shrink-0" />
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-1">결과 발표일</p>
              <p className="font-semibold text-[15px]">
                {formatDateCompact(contest.resultAnnouncedAt)}
              </p>
            </div>
            <Trophy className="h-5 w-5 text-violet-600 shrink-0" />
          </div>
        </Card>
      </div>

      {/* 본문: 2칼럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 요약 정보 + 태그 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 요약 정보 — 공개 페이지 스타일 key-value */}
          <Card className="p-6 border border-border space-y-4">
            <h3 className="text-lg font-bold">요약 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">심사 방식</span>
                <span className="text-right font-medium">{getJudgingTypeLabel(contest.judgingType)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">검수 정책</span>
                <span className="text-right font-medium">{contest.reviewPolicy === 'manual' ? '수동 검수' : '자동 검수 후 수동'}</span>
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
              {contest.landingPageUrl && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">랜딩페이지</span>
                  <a href={contest.landingPageUrl} target="_blank" rel="noopener noreferrer" className="text-right font-medium text-primary hover:underline truncate max-w-[60%]">
                    {contest.landingPageUrl}
                  </a>
                </div>
              )}
              {totalPrize && (
                <div className="flex items-start justify-between gap-3 pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">총 상금</span>
                  <span className="text-right font-bold text-amber-600">{totalPrize}</span>
                </div>
              )}
            </div>
          </Card>

          {/* 태그 */}
          {contest.tags.length > 0 && (
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
          )}
        </div>

        {/* 오른쪽: 수상 + 위험 */}
        <div className="space-y-6">
          {/* 수상 설정 — 공개 페이지 스타일 색상 코딩 */}
          <Card className="p-6 border border-border space-y-4 bg-gradient-to-br from-amber-500/5 to-transparent">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              수상 설정
            </h3>
            {contest.awardTiers.length > 0 ? (
              <>
                <div className="space-y-2">
                  {contest.awardTiers.map((tier, index) => {
                    const colorClass = getAwardColorClass(tier.label, index);
                    return (
                      <div key={`${tier.label}-${tier.count}`} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${colorClass}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{tier.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium">{tier.count}명</span>
                          {tier.prizeAmount && (
                            <span className="font-bold">{formatPrizeDisplay(String(tier.prizeAmount))}</span>
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
              </>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">수상 정보가 없습니다.</p>
            )}
          </Card>

          {/* 위험 영역 */}
          <Card className="p-6 border border-destructive/20 space-y-3">
            <h3 className="text-sm font-semibold text-destructive">위험 영역</h3>
            <p className="text-xs text-muted-foreground">이 공모전을 삭제하면 복구할 수 없습니다.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? '삭제 중...' : '공모전 삭제'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
