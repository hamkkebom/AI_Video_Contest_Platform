'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import type { Contest, JudgingTemplate, JudgingStage, Score, Submission } from '@/lib/types';
import { ArrowLeft, CheckCircle2, MessageSquareText, Trophy, ThumbsUp, ThumbsDown, Pause } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatDateTime } from '@/lib/utils';

interface JudgeSubmissionContentData {
  contest: Contest;
  submission: Submission;
  template: JudgingTemplate;
  currentJudgeScore: Score | null;
  criteriaAverages: Array<{
    criterionId: string;
    criterion: string;
    averageScore: number;
    maxScore: number;
  }>;
  scoreCount: number;
  stage?: JudgingStage;
  existingJudgment?: 'pass' | 'fail' | 'hold';
}

interface JudgeSubmissionContentProps {
  data: JudgeSubmissionContentData;
}

export function JudgeSubmissionContent({ data }: JudgeSubmissionContentProps) {
  const initialScores = useMemo(
    () =>
      data.template.criteria.reduce<Record<string, number>>((acc, criterion) => {
        const existingScore = data.currentJudgeScore?.criteriaScores.find((item) => item.criterionId === criterion.id)?.score;
        acc[criterion.id] = existingScore ?? 0;
        return acc;
      }, {}),
    [data.currentJudgeScore, data.template.criteria]
  );

  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [comment, setComment] = useState<string>(data.currentJudgeScore?.comment ?? '');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const maxTotalScore = data.template.criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  const handleScoreChange = (criterionId: string, maxScore: number, value: number) => {
    const safeScore = Math.max(0, Math.min(maxScore, value));
    setScores((prev) => ({
      ...prev,
      [criterionId]: safeScore,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 간편 심사
  const isSimpleMode = data.stage?.method === 'simple';
  const [judgment, setJudgment] = useState<'pass' | 'fail' | 'hold' | undefined>(data.existingJudgment);
  const [judgmentSubmitting, setJudgmentSubmitting] = useState(false);

  const handleSimpleJudgment = async (value: 'pass' | 'fail' | 'hold') => {
    if (!data.stage) return;
    setJudgmentSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/judgments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: data.submission.id,
          stageId: data.stage.id,
          contestId: data.contest.id,
          judgment: value,
        }),
      });
      if (res.ok) {
        setJudgment(value);
        setIsSubmitted(true);
      } else {
        const err = await res.json();
        setSubmitError(err.error ?? '판정 저장에 실패했습니다.');
      }
    } catch {
      setSubmitError('판정 저장 중 오류가 발생했습니다.');
    }
    setJudgmentSubmitting(false);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: data.submission.id,
          contestId: data.contest.id,
          templateId: data.template.id,
          criteriaScores: data.template.criteria.map(c => ({
            criterionId: c.id,
            score: scores[c.id] ?? 0,
          })),
          comment: comment.trim() || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setSubmitError(result.error || '채점 저장에 실패했습니다.');
        return;
      }
      setIsSubmitted(true);
    } catch {
      setSubmitError('채점 요청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 md:p-8">
        <Link
          href={`/judging/${data.contest.id}` as Route}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" /> 공모전 심사 목록으로
        </Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{data.submission.title}</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">{data.submission.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/10 text-primary">{data.template.name}</Badge>
              <Badge className="bg-muted text-muted-foreground">참여 심사 수 {data.scoreCount}건</Badge>
            </div>
          </div>
          <Card className="border-border bg-background/70">
            <CardContent className="p-4 text-right">
              <p className="text-xs text-muted-foreground">현재 총점</p>
              <p className="text-3xl font-bold text-primary">
                {totalScore} <span className="text-base text-muted-foreground">/ {maxTotalScore}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-border overflow-hidden">
          <div className="relative h-64 w-full md:h-80">
            <Image src={data.submission.thumbnailUrl} alt={data.submission.title} fill className="object-cover" sizes="100vw" />
          </div>
          <CardContent className="grid grid-cols-2 gap-4 p-5 text-sm md:grid-cols-4">
            <div>
              <p className="text-muted-foreground">조회수</p>
              <p className="font-semibold text-foreground">{data.submission.views}</p>
            </div>
            <div>
              <p className="text-muted-foreground">좋아요</p>
              <p className="font-semibold text-foreground">{data.submission.likeCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">상태</p>
              <p className="font-semibold text-foreground">{data.submission.status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">제출일</p>
              <p className="font-semibold text-foreground">{formatDate(data.submission.submittedAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>기준별 평균 점수</CardTitle>
            <CardDescription>다른 심사 결과 평균과 비교해보세요.</CardDescription>
          </CardHeader>
          <CardContent className="h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.criteriaAverages} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="criterion" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)}점`, '평균']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Bar dataKey="averageScore" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border">
          {isSimpleMode ? (
            /* 간편 심사 모드 */
            <>
              <CardHeader>
                <CardTitle>간편 심사</CardTitle>
                <CardDescription>이 출품작에 대해 합격, 불합격, 보류 중 하나를 선택하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {judgment && (
                  <div className={`rounded-lg p-4 text-center text-sm font-medium ${
                    judgment === 'pass' ? 'bg-emerald-500/10 text-emerald-700' :
                    judgment === 'fail' ? 'bg-rose-500/10 text-rose-700' :
                    'bg-amber-500/10 text-amber-700'
                  }`}>
                    현재 판정: {judgment === 'pass' ? '합격' : judgment === 'fail' ? '불합격' : '보류'}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    size="lg"
                    variant={judgment === 'pass' ? 'default' : 'outline'}
                    className={`h-20 flex-col gap-2 ${judgment === 'pass' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50'}`}
                    disabled={judgmentSubmitting}
                    onClick={() => handleSimpleJudgment('pass')}
                  >
                    <ThumbsUp className="h-6 w-6" />
                    합격
                  </Button>
                  <Button
                    size="lg"
                    variant={judgment === 'hold' ? 'default' : 'outline'}
                    className={`h-20 flex-col gap-2 ${judgment === 'hold' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'text-amber-600 border-amber-300 hover:bg-amber-50'}`}
                    disabled={judgmentSubmitting}
                    onClick={() => handleSimpleJudgment('hold')}
                  >
                    <Pause className="h-6 w-6" />
                    보류
                  </Button>
                  <Button
                    size="lg"
                    variant={judgment === 'fail' ? 'default' : 'outline'}
                    className={`h-20 flex-col gap-2 ${judgment === 'fail' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'text-rose-600 border-rose-300 hover:bg-rose-50'}`}
                    disabled={judgmentSubmitting}
                    onClick={() => handleSimpleJudgment('fail')}
                  >
                    <ThumbsDown className="h-6 w-6" />
                    불합격
                  </Button>
                </div>

                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href={`/judging/${data.contest.id}` as Route}>목록으로</Link>
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            /* 점수 심사 모드 */
            <>
              <CardHeader>
                <CardTitle>채점 입력</CardTitle>
                <CardDescription>기준별 점수를 입력하고 심사 코멘트를 남기세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {data.template.criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{criterion.label}</p>
                        <p className="text-xs text-muted-foreground">{criterion.description}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {scores[criterion.id] ?? 0} / {criterion.maxScore}
                      </p>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={criterion.maxScore}
                      value={scores[criterion.id] ?? 0}
                      onChange={(event) => handleScoreChange(criterion.id, criterion.maxScore, Number(event.target.value))}
                      className="w-full accent-primary"
                    />

                    <Input
                      type="number"
                      min={0}
                      max={criterion.maxScore}
                      value={scores[criterion.id] ?? 0}
                      onChange={(event) => handleScoreChange(criterion.id, criterion.maxScore, Number(event.target.value))}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">심사 코멘트</p>
                  <Textarea
                    rows={5}
                    placeholder="평가 근거와 개선 포인트를 남겨주세요."
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/judging/${data.contest.id}` as Route}>목록으로</Link>
                  </Button>
                  <Button onClick={handleSubmit} className="gap-1.5" disabled={isSubmitting || isSubmitted}>
                    {isSubmitting ? (
                      <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> 저장 중...</>
                    ) : isSubmitted ? (
                      <><CheckCircle2 className="h-4 w-4" /> 저장 완료</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> 점수 제출</>
                    )}
              </Button>
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                {submitError}
              </div>
            )}

            {isSubmitted && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                점수가 저장되었습니다.
              </div>
            )}
              </CardContent>
            </>
          )}
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>이전 채점 기록</CardTitle>
            <CardDescription>이미 심사한 기록이 있으면 최근 점수를 보여줍니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.currentJudgeScore ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">이전 총점</p>
                  <p className="text-3xl font-bold text-primary">
                    {data.currentJudgeScore.total} <span className="text-base text-muted-foreground">/ {maxTotalScore}</span>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    최근 작성: {formatDateTime(data.currentJudgeScore.createdAt)}
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MessageSquareText className="h-4 w-4 text-primary" /> 심사 코멘트
                  </div>
                  <p className="text-sm text-muted-foreground">{data.currentJudgeScore.comment ?? '코멘트 없음'}</p>
                </div>

                <div className="space-y-2">
                  {data.template.criteria.map((criterion) => {
                    const item = data.currentJudgeScore?.criteriaScores.find((score) => score.criterionId === criterion.id);
                    return (
                      <div key={criterion.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                        <span>{criterion.label}</span>
                        <span className="font-semibold text-primary">
                          {item?.score ?? 0} / {criterion.maxScore}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                아직 작성된 채점 기록이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border border-l-4 border-l-primary">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">권장 채점 운영 팁</p>
              <p className="text-sm font-medium">기준별 근거를 코멘트에 남기면 합의 심사 시 의사결정이 빨라집니다.</p>
            </div>
            <Trophy className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
