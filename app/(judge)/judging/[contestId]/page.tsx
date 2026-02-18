'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Submission {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  status: string;
  userId: string;
}

interface JudgingCriterion {
  id: string;
  label: string;
  maxScore: number;
  description: string;
}

interface ScoringState {
  submissionId: string;
  scores: Record<string, number>;
  comment: string;
}

/**
 * 심사위원 출품작 심사 페이지
 * 배정된 공모전의 출품작 목록과 심사 점수 입력 폼을 표시합니다.
 */
export default function JudgeContestPage() {
  const params = useParams();
  const contestId = params.contestId as string;
  const [submissions] = useState<Submission[]>([
    {
      id: 'submission-1',
      title: '출품작 1',
      description: '첫 번째 출품작 설명',
      thumbnailUrl: 'https://picsum.photos/seed/submission-1/640/360',
      status: 'judging',
      userId: 'user-10',
    },
    {
      id: 'submission-2',
      title: '출품작 2',
      description: '두 번째 출품작 설명',
      thumbnailUrl: 'https://picsum.photos/seed/submission-2/640/360',
      status: 'judging',
      userId: 'user-11',
    },
    {
      id: 'submission-3',
      title: '출품작 3',
      description: '세 번째 출품작 설명',
      thumbnailUrl: 'https://picsum.photos/seed/submission-3/640/360',
      status: 'judging',
      userId: 'user-12',
    },
  ]);

  const criteria: JudgingCriterion[] = [
    { id: 'criterion-tech', label: '기술력', maxScore: 40, description: 'AI 활용 수준' },
    { id: 'criterion-story', label: '스토리', maxScore: 30, description: '전달력' },
    { id: 'criterion-finish', label: '완성도', maxScore: 30, description: '연출 및 편집' },
  ];

  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [scoringState, setScoringState] = useState<ScoringState>({
    submissionId: '',
    scores: {},
    comment: '',
  });

  const [submittedScores, setSubmittedScores] = useState<Set<string>>(new Set());

  const handleScoreChange = (criterionId: string, value: number) => {
    setScoringState((prev) => ({
      ...prev,
      scores: { ...prev.scores, [criterionId]: value },
    }));
  };

  const handleCommentChange = (value: string) => {
    setScoringState((prev) => ({
      ...prev,
      comment: value,
    }));
  };

  const handleSubmitScore = () => {
    if (scoringState.submissionId) {
      setSubmittedScores((prev) => new Set([...prev, scoringState.submissionId]));
      setScoringState({
        submissionId: '',
        scores: {},
        comment: '',
      });
      setExpandedSubmissionId(null);
    }
  };

  const openScoringForm = (submissionId: string) => {
    setScoringState({
      submissionId,
      scores: criteria.reduce((acc, c) => ({ ...acc, [c.id]: 0 }), {}),
      comment: '',
    });
    setExpandedSubmissionId(submissionId);
  };

  const totalScore = Object.values(scoringState.scores).reduce((sum, score) => sum + score, 0);
  const maxTotalScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link href="/judging" className="text-[#EA580C] hover:text-[#C2540A] text-sm mb-2 inline-block">
                ← 공모전 목록으로
              </Link>
              <h1 className="text-4xl font-bold mb-2">출품작 심사</h1>
              <p className="text-muted-foreground">공모전 ID: {contestId}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 심사 기준 안내 */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-xl font-bold mb-4">심사 기준</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criteria.map((criterion) => (
              <Card key={criterion.id} className="p-4 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[#EA580C]">{criterion.label}</h3>
                  <span className="text-sm text-muted-foreground">최대 {criterion.maxScore}점</span>
                </div>
                <p className="text-sm text-muted-foreground">{criterion.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 출품작 목록 */}
      <section className="py-8 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-6">심사 대상 출품작</h2>

          {submissions.length === 0 ? (
            <Card className="p-12 text-center border border-border">
              <p className="text-muted-foreground">심사 대상 출품작이 없습니다</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const isScored = submittedScores.has(submission.id);
                const isExpanded = expandedSubmissionId === submission.id;

                return (
                  <Card key={submission.id} className="border border-border overflow-hidden hover:shadow-md transition-shadow">
                    {/* 출품작 카드 헤더 */}
                    <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                      <img
                        src={submission.thumbnailUrl}
                        alt={submission.title}
                        className="w-full md:w-24 md:h-24 object-cover rounded border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg">{submission.title}</h3>
                          {isScored && <Badge className="bg-green-500 text-white shrink-0">심사 완료</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{submission.description}</p>
                      </div>
                      <Button
                        onClick={() => openScoringForm(submission.id)}
                        className={`shrink-0 ${
                          isScored
                            ? 'bg-gray-400 hover:bg-gray-500'
                            : 'bg-[#EA580C] hover:bg-[#C2540A]'
                        } text-white font-semibold`}
                        disabled={isScored}
                      >
                        {isScored ? '✓ 완료' : '심사하기'}
                      </Button>
                    </div>

                    {/* 점수 입력 폼 (확장 가능) */}
                    {isExpanded && (
                      <div className="border-t border-border p-6 bg-muted/30 space-y-6">
                        {/* 점수 입력 */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">점수 입력</h3>
                          {criteria.map((criterion) => (
                            <div key={criterion.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="font-medium">{criterion.label}</label>
                                <span className="text-sm text-muted-foreground">
                                  {scoringState.scores[criterion.id] || 0} / {criterion.maxScore}
                                </span>
                              </div>
                              <Input
                                type="number"
                                min="0"
                                max={criterion.maxScore}
                                value={scoringState.scores[criterion.id] || 0}
                                onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value) || 0)}
                                className="border-[#EA580C]/30 focus:border-[#EA580C]"
                              />
                              <p className="text-xs text-muted-foreground">{criterion.description}</p>
                            </div>
                          ))}
                        </div>

                        {/* 총점 */}
                        <div className="p-4 bg-[#EA580C]/10 rounded border border-[#EA580C]/30">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">총점</span>
                            <span className="text-2xl font-bold text-[#EA580C]">
                              {totalScore} / {maxTotalScore}
                            </span>
                          </div>
                        </div>

                        {/* 코멘트 */}
                        <div className="space-y-2">
                          <label className="font-semibold">심사 코멘트</label>
                          <textarea
                            placeholder="심사 의견을 입력하세요..."
                            value={scoringState.comment}
                            onChange={(e) => handleCommentChange(e.target.value)}
                            className="w-full p-3 border border-[#EA580C]/30 rounded focus:border-[#EA580C] focus:outline-none"
                            rows={4}
                          />
                        </div>

                        {/* 제출 버튼 */}
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => setExpandedSubmissionId(null)}
                            variant="outline"
                            className="border-border"
                          >
                            취소
                          </Button>
                          <Button
                            onClick={handleSubmitScore}
                            className="bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold"
                          >
                            점수 제출
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 심사 통계 */}
      {submittedScores.size > 0 && (
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">심사 진행 현황</h3>
                  <p className="text-sm text-muted-foreground">
                    {submittedScores.size} / {submissions.length} 완료
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#EA580C]">{submittedScores.size}</p>
                  <p className="text-sm text-muted-foreground">완료된 심사</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
