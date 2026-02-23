'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { Contest, JudgingTemplate, Score, Submission } from '@/lib/types';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Film } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface JudgeContestContentData {
  contest: Contest;
  submissions: Submission[];
  template: JudgingTemplate;
  scoreDistribution: Array<{ range: string; count: number }>;
  scoreBySubmissionId: Record<string, Score>;
}

interface JudgeContestContentProps {
  data: JudgeContestContentData;
}

export function JudgeContestContent({ data }: JudgeContestContentProps) {
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [draftScores, setDraftScores] = useState<Record<string, Record<string, number>>>({});
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});
  const [submittedSubmissionIds, setSubmittedSubmissionIds] = useState<Set<string>>(
    () => new Set(Object.keys(data.scoreBySubmissionId))
  );

  const maxTotalScore = useMemo(
    () => data.template.criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0),
    [data.template.criteria]
  );

  const scoreDistributionForChart =
    data.scoreDistribution.some((item) => item.count > 0) ? data.scoreDistribution : [{ range: '데이터 없음', count: 1 }];

  const scoredCount = submittedSubmissionIds.size;
  const totalSubmissionCount = data.submissions.length;
  const progressPercent = totalSubmissionCount > 0 ? Math.round((scoredCount / totalSubmissionCount) * 100) : 0;

  const openScoringForm = (submissionId: string) => {
    const existingScore = data.scoreBySubmissionId[submissionId];
    const initialScores = data.template.criteria.reduce<Record<string, number>>((acc, criterion) => {
      const criterionScore = existingScore?.criteriaScores.find((item) => item.criterionId === criterion.id);
      acc[criterion.id] = criterionScore?.score ?? 0;
      return acc;
    }, {});

    setDraftScores((prev) => ({
      ...prev,
      [submissionId]: prev[submissionId] ?? initialScores,
    }));
    setDraftComments((prev) => ({
      ...prev,
      [submissionId]: prev[submissionId] ?? data.scoreBySubmissionId[submissionId]?.comment ?? '',
    }));
    setExpandedSubmissionId(submissionId);
  };

  const handleScoreChange = (submissionId: string, criterionId: string, maxScore: number, value: number) => {
    const safeScore = Math.max(0, Math.min(maxScore, value));
    setDraftScores((prev) => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] ?? {}),
        [criterionId]: safeScore,
      },
    }));
  };

  const handleSubmitScore = (submissionId: string) => {
    setSubmittedSubmissionIds((prev) => new Set(prev).add(submissionId));
    setExpandedSubmissionId(null);
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link href="/judging" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
              <ArrowLeft className="h-4 w-4" /> 공모전 목록으로
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{data.contest.title}</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">{data.contest.description}</p>
            <Badge className="bg-primary/10 text-primary">심사 템플릿: {data.template.name}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm md:min-w-64">
            <Card className="border-border bg-background/70">
              <CardContent className="p-4">
                <p className="text-muted-foreground">심사 대상</p>
                <p className="text-2xl font-bold">{totalSubmissionCount}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background/70">
              <CardContent className="p-4">
                <p className="text-muted-foreground">완료</p>
                <p className="text-2xl font-bold text-primary">{scoredCount}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">현재 진행률</span>
            <span className="font-semibold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>채점 분포</CardTitle>
            <CardDescription>해당 공모전의 총점 구간별 채점 결과</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionForChart} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="range" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>심사 기준</CardTitle>
            <CardDescription>채점 기준과 배점을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.template.criteria.map((criterion) => (
              <div key={criterion.id} className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="font-semibold text-foreground">{criterion.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{criterion.description}</p>
                <p className="mt-3 text-sm font-medium text-primary">최대 {criterion.maxScore}점</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border">
          <CardHeader>
            <CardTitle>출품작 심사</CardTitle>
            <CardDescription>목록에서 출품작을 열고 기준별 점수와 코멘트를 작성하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.submissions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                심사 대상 출품작이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {data.submissions.map((submission) => {
                  const isExpanded = expandedSubmissionId === submission.id;
                  const isSubmitted = submittedSubmissionIds.has(submission.id);
                  const scoreState = draftScores[submission.id] ?? {};
                  const totalScore = Object.values(scoreState).reduce((sum, score) => sum + score, 0);

                  return (
                    <div key={submission.id} className="overflow-hidden rounded-xl border border-border bg-background">
                      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                        <img
                          src={submission.thumbnailUrl}
                          alt={submission.title}
                          className="h-28 w-full rounded-lg border border-border object-cover md:h-20 md:w-36"
                        />

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold">{submission.title}</h3>
                            {isSubmitted ? (
                              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">심사 완료</Badge>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground">대기</Badge>
                            )}
                          </div>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{submission.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <Link href={`/judging/${data.contest.id}/${submission.id}` as Route}>
                            <Button variant="outline" size="sm" className="gap-1.5">
                              상세 심사 <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="sm" onClick={() => openScoringForm(submission.id)}>
                            {isSubmitted ? '재평가' : '심사하기'}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="space-y-5 border-t border-border bg-muted/25 p-5">
                          {data.template.criteria.map((criterion) => (
                            <div key={criterion.id} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <p className="font-medium text-foreground">{criterion.label}</p>
                                <p className="text-muted-foreground">
                                  {scoreState[criterion.id] ?? 0} / {criterion.maxScore}
                                </p>
                              </div>
                              <Input
                                type="number"
                                min={0}
                                max={criterion.maxScore}
                                value={scoreState[criterion.id] ?? 0}
                                onChange={(event) =>
                                  handleScoreChange(
                                    submission.id,
                                    criterion.id,
                                    criterion.maxScore,
                                    Number(event.target.value)
                                  )
                                }
                              />
                            </div>
                          ))}

                          <Card className="border-primary/30 bg-primary/5">
                            <CardContent className="flex items-center justify-between p-4">
                              <p className="text-sm text-muted-foreground">총점</p>
                              <p className="text-2xl font-bold text-primary">
                                {totalScore} / {maxTotalScore}
                              </p>
                            </CardContent>
                          </Card>

                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">심사 코멘트</p>
                            <Textarea
                              rows={4}
                              placeholder="출품작의 강점/개선점을 남겨주세요."
                              value={draftComments[submission.id] ?? ''}
                              onChange={(event) =>
                                setDraftComments((prev) => ({
                                  ...prev,
                                  [submission.id]: event.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" onClick={() => setExpandedSubmissionId(null)}>
                              취소
                            </Button>
                            <Button onClick={() => handleSubmitScore(submission.id)} className="gap-1.5">
                              <CheckCircle2 className="h-4 w-4" /> 점수 제출
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border border-l-4 border-l-primary">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">진행률</p>
              <p className="text-3xl font-bold text-primary">{progressPercent}%</p>
            </div>
            <ClipboardCheck className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-amber-500">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">남은 출품작</p>
              <p className="text-3xl font-bold">{Math.max(totalSubmissionCount - scoredCount, 0)}</p>
            </div>
            <Film className="h-6 w-6 text-amber-600" />
          </CardContent>
        </Card>
        <Card className="border-border border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">완료된 심사</p>
              <p className="text-3xl font-bold text-emerald-600">{scoredCount}</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
