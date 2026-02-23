'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Contest } from '@/lib/types';
import { ArrowLeft, Search } from 'lucide-react';

type AdminContestDetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabelMap: Record<Contest['status'], string> = {
  draft: '초안',
  open: '접수중',
  closed: '마감',
  judging: '심사중',
  completed: '완료',
};

const statusBadgeClassMap: Record<Contest['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  open: 'bg-primary/10 text-primary',
  closed: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  judging: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

const statusFlow: Contest['status'][] = ['draft', 'open', 'closed', 'judging', 'completed'];

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
  promotionVideoUrl?: string;
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
    promotionVideoUrl: contest.promotionVideoUrl,
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

export default function AdminContestDetailPage({ params }: AdminContestDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      } catch (error) {
        console.error('Failed to load contest:', error);
        setErrorMessage('공모전 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [id]);

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
    } catch (error) {
      console.error('Failed to update contest status:', error);
      setErrorMessage(error instanceof Error ? error.message : '상태 변경에 실패했습니다.');
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
    } catch (error) {
      console.error('Failed to delete contest:', error);
      setErrorMessage(error instanceof Error ? error.message : '공모전 삭제에 실패했습니다.');
      setDeleting(false);
    }
  };

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
        <p className="text-sm text-muted-foreground">ID: {id}</p>
        <Link href={'/admin/contests' as Route}>
          <Button size="sm">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-2">
        <Link
          href={'/admin/contests' as Route}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 공모전 목록으로
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">공모전 상세 관리</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{contest.title}</h1>
            <p className="text-sm text-muted-foreground">{contest.description || '설명이 없습니다.'}</p>
          </div>
          <Badge className={statusBadgeClassMap[contest.status]}>{statusLabelMap[contest.status]}</Badge>
        </div>
      </header>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>관리 액션</CardTitle>
          <CardDescription>상태를 다음 단계로 진행하거나 공모전을 삭제할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href={`/admin/contests/${contest.id}/edit` as Route}>
            <Button variant="outline">공모전 수정</Button>
          </Link>
          <Link href={`/admin/contests/${contest.id}/submissions` as Route}>
            <Button variant="outline">영상 관리</Button>
          </Link>
          <Button type="button" onClick={handleMoveToNextStatus} disabled={updatingStatus || !nextStatus}>
            {nextStatus ? (updatingStatus ? '상태 변경 중...' : `${statusLabelMap[nextStatus]} 상태로 변경`) : '최종 상태'}
          </Button>
          <Button type="button" variant="outline" className="text-destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? '삭제 중...' : '공모전 삭제'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>공모전 정보</CardTitle>
          <CardDescription>일정 및 심사 설정 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">지역</p>
            <p className="text-sm font-semibold text-foreground">{contest.region}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">태그</p>
            <p className="text-sm font-semibold text-foreground">{contest.tags.length > 0 ? contest.tags.join(', ') : '-'}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">제출 기간</p>
            <p className="text-sm font-semibold text-foreground">
              {new Date(contest.submissionStartAt).toLocaleDateString('ko-KR')} - {new Date(contest.submissionEndAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">심사 기간</p>
            <p className="text-sm font-semibold text-foreground">
              {new Date(contest.judgingStartAt).toLocaleDateString('ko-KR')} - {new Date(contest.judgingEndAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">결과 발표일</p>
            <p className="text-sm font-semibold text-foreground">{new Date(contest.resultAnnouncedAt).toLocaleDateString('ko-KR')}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">심사 설정</p>
            <p className="text-sm font-semibold text-foreground">
              {contest.judgingType === 'internal' ? '내부 심사' : contest.judgingType === 'external' ? '외부 심사' : '내부 + 외부 병행'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {contest.reviewPolicy === 'manual' ? '수동 검수' : '자동 검수 후 수동'}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">인당 최대 출품</p>
            <p className="text-sm font-semibold text-foreground">{contest.maxSubmissionsPerUser}개</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">허용 확장자</p>
            <p className="text-sm font-semibold text-foreground">{contest.allowedVideoExtensions.join(', ')}</p>
          </div>
          <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-4 sm:col-span-2">
            <p className="mb-2 text-xs text-muted-foreground">수상 설정 (총 {contest.awardTiers.reduce((sum, tier) => sum + tier.count, 0)}명)</p>
            <div className="flex flex-wrap gap-2">
              {contest.awardTiers.length > 0
                ? contest.awardTiers.map((tier) => (
                    <span
                      key={`${tier.label}-${tier.count}`}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                    >
                      {tier.label} {tier.count}명
                      {tier.prizeAmount ? <span className="text-amber-500/70">({tier.prizeAmount})</span> : null}
                    </span>
                  ))
                : <span className="text-xs text-muted-foreground">수상 정보가 없습니다.</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
