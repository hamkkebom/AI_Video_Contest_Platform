'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { use, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { JUDGING_TYPES, VIDEO_EXTENSIONS } from '@/config/constants';
import { getContests } from '@/lib/mock';
import type { Contest } from '@/lib/types';
import { CheckCircle2, Search, Plus, X, Trophy } from 'lucide-react';

type ContestEditPageProps = {
  params: Promise<{ id: string }>;
};

export default function HostContestEditPage({ params }: ContestEditPageProps) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<Contest | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submissionStartDate, setSubmissionStartDate] = useState('');
  const [submissionEndDate, setSubmissionEndDate] = useState('');
  const [judgingStartDate, setJudgingStartDate] = useState('');
  const [judgingEndDate, setJudgingEndDate] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [judgingType, setJudgingType] = useState<string>('internal');
  const [reviewPolicy, setReviewPolicy] = useState<string>('manual');
  const [maxSubmissions, setMaxSubmissions] = useState(3);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  // 수상 설정 상태
  const [awardTiers, setAwardTiers] = useState([
    { label: '대상', count: 1, prizeAmount: '' },
    { label: '최우수상', count: 2, prizeAmount: '' },
    { label: '우수상', count: 3, prizeAmount: '' },
  ]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadContest = async () => {
      try {
        const contests = await getContests();
        const found = contests.find((item) => item.id === id);

        if (found) {
          setContest(found);
          setTitle(found.title);
          setDescription(found.description);
          setSubmissionStartDate(found.submissionStartAt.split('T')[0]);
          setSubmissionEndDate(found.submissionEndAt.split('T')[0]);
          setJudgingStartDate(found.judgingStartAt.split('T')[0]);
          setJudgingEndDate(found.judgingEndAt.split('T')[0]);
          setResultDate(found.resultAnnouncedAt.split('T')[0]);
          setJudgingType(found.judgingType);
          setReviewPolicy(found.reviewPolicy);
          setMaxSubmissions(found.maxSubmissionsPerUser);
          setSelectedExtensions(found.allowedVideoExtensions);
          setAwardTiers(found.awardTiers.map((t) => ({ label: t.label, count: t.count, prizeAmount: t.prizeAmount ?? '' })));
        }
      } catch (error) {
        console.error('Failed to load contest:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [id]);

  const toggleExtension = (value: string) => {
    setSelectedExtensions((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Update contest (demo):', {
      id,
      title,
      description,
      submissionStartDate,
      submissionEndDate,
      judgingStartDate,
      judgingEndDate,
      resultDate,
      judgingType,
      reviewPolicy,
      maxSubmissions,
      selectedExtensions,
    });
    setSaved(true);
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
        <Link href="/host/contests">
          <Button size="sm">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">공모전 수정</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">저장이 완료되었습니다</h1>
          <p className="text-sm text-muted-foreground">데모 모드에서는 실제 데이터가 변경되지 않습니다.</p>
        </header>

        <Card className="border-border">
          <CardContent className="space-y-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-foreground">{contest.title}</p>
              <p className="text-sm text-muted-foreground">수정 요청이 성공적으로 처리되었습니다.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href={`/host/contests/${id}` as Route}>
                <Button>상세 보기</Button>
              </Link>
              <Link href="/host/contests">
                <Button variant="outline">목록으로</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">공모전 설정 수정</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{contest.title}</h1>
        <p className="text-sm text-muted-foreground">기본 정보, 일정, 심사 정책을 업데이트합니다.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>공모전 이름과 설명을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="contest-title" className="text-sm font-medium">
                공모전 제목 <span className="text-destructive">*</span>
              </label>
              <Input id="contest-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="contest-description" className="text-sm font-medium">공모전 설명</label>
              <textarea
                id="contest-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>일정 설정</CardTitle>
            <CardDescription>제출 기간, 심사 기간, 결과 발표일을 조정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold mb-3">제출 기간</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="contest-submission-start" className="text-sm font-medium">시작일</label>
                  <Input id="contest-submission-start" type="date" value={submissionStartDate} onChange={(event) => setSubmissionStartDate(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contest-submission-end" className="text-sm font-medium">마감일</label>
                  <Input id="contest-submission-end" type="date" value={submissionEndDate} onChange={(event) => setSubmissionEndDate(event.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">심사 기간</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="contest-judging-start" className="text-sm font-medium">시작일</label>
                  <Input id="contest-judging-start" type="date" value={judgingStartDate} onChange={(event) => setJudgingStartDate(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contest-judging-end" className="text-sm font-medium">종료일</label>
                  <Input id="contest-judging-end" type="date" value={judgingEndDate} onChange={(event) => setJudgingEndDate(event.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">결과 발표</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="contest-result-date" className="text-sm font-medium">발표일</label>
                  <Input id="contest-result-date" type="date" value={resultDate} onChange={(event) => setResultDate(event.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>심사 설정</CardTitle>
            <CardDescription>심사 방식과 검수 정책을 구성합니다.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="contest-judging-type" className="text-sm font-medium">심사 유형</label>
              <select
                id="contest-judging-type"
                value={judgingType}
                onChange={(event) => setJudgingType(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {JUDGING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="contest-review-policy" className="text-sm font-medium">검수 정책</label>
              <select
                id="contest-review-policy"
                value={reviewPolicy}
                onChange={(event) => setReviewPolicy(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="manual">수동 검수</option>
                <option value="auto_then_manual">자동 검수 후 수동</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="contest-max-submissions" className="text-sm font-medium">인당 최대 출품 수</label>
              <Input
                id="contest-max-submissions"
                type="number"
                min={1}
                max={10}
                value={maxSubmissions}
                onChange={(event) => setMaxSubmissions(Number(event.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* 수상 설정 */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              수상 설정
            </CardTitle>
            <CardDescription>상 종류와 수상 인원, 상금을 설정하세요. 수상 인원은 상별로 자유롭게 지정할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {awardTiers.map((tier, index) => (
              <div key={`tier-${tier.label}-${index}`} className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  {index === 0 && <label htmlFor="edit-award-label-0" className="text-xs font-medium text-muted-foreground">상 이름</label>}
                  <Input
                    id={`edit-award-label-${index}`}
                    type="text"
                    placeholder="예: 대상"
                    value={tier.label}
                    onChange={(e) => {
                      const next = [...awardTiers];
                      next[index] = { ...tier, label: e.target.value };
                      setAwardTiers(next);
                    }}
                  />
                </div>
                <div className="w-24 space-y-1">
                  {index === 0 && <label htmlFor="edit-award-count-0" className="text-xs font-medium text-muted-foreground">인원</label>}
                  <Input
                    id={`edit-award-count-${index}`}
                    type="number"
                    min={1}
                    max={20}
                    value={tier.count}
                    onChange={(e) => {
                      const next = [...awardTiers];
                      next[index] = { ...tier, count: Math.max(1, Number(e.target.value)) };
                      setAwardTiers(next);
                    }}
                  />
                </div>
                <div className="w-32 space-y-1">
                  {index === 0 && <label htmlFor="edit-award-prize-0" className="text-xs font-medium text-muted-foreground">상금 (선택)</label>}
                  <Input
                    id={`edit-award-prize-${index}`}
                    type="text"
                    placeholder="예: 300만원"
                    value={tier.prizeAmount}
                    onChange={(e) => {
                      const next = [...awardTiers];
                      next[index] = { ...tier, prizeAmount: e.target.value };
                      setAwardTiers(next);
                    }}
                  />
                </div>
                {awardTiers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setAwardTiers(awardTiers.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5"
              onClick={() => setAwardTiers([...awardTiers, { label: '', count: 1, prizeAmount: '' }])}
            >
              <Plus className="h-4 w-4" />
              수상 항목 추가
            </Button>
            <div className="pt-2 border-t border-border text-sm text-muted-foreground">
              총 수상 인원: <span className="font-semibold text-foreground">{awardTiers.reduce((sum, t) => sum + t.count, 0)}명</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>허용 영상 형식</CardTitle>
            <CardDescription>참가자가 업로드할 수 있는 파일 확장자를 선택하세요.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {VIDEO_EXTENSIONS.map((ext) => {
              const selected = selectedExtensions.includes(ext.value);

              return (
                <button
                  key={ext.value}
                  type="button"
                  onClick={() => toggleExtension(ext.value)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                    }`}
                >
                  .{ext.label}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href={`/host/contests/${id}` as Route}>
            <Button type="button" variant="outline">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={!title.trim()} className="bg-accent-foreground text-white hover:bg-accent-foreground/90">
            변경사항 저장
          </Button>
        </div>
      </form>
    </div>
  );
}
