'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import {
  createJudgingCriteria,
  createJudgingStage,
  numericOnly,
  selectClass,
  textareaClass,
  type JudgingStageForm,
} from './contest-form-helpers';

interface JudgingStagesCardProps {
  judgingStages: JudgingStageForm[];
  setJudgingStages: Dispatch<SetStateAction<JudgingStageForm[]>>;
}

/** 카드 4.1 — 다단계 심사 설정. 단계 추가·삭제와 단계별 심사기준을 다룬다. */
export function JudgingStagesCard({ judgingStages, setJudgingStages }: JudgingStagesCardProps) {
  return (
    <>
    {/* ===== 카드 4.1: 다단계 심사 설정 ===== */}
    <Card className="border-border">
      <CardHeader>
        <CardTitle>심사 단계 설정</CardTitle>
        <CardDescription>심사 단계 수와 각 단계별 심사 방식을 설정합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 단계 수 조절 */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">심사 단계 수</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={judgingStages.length <= 1}
              onClick={() => setJudgingStages(judgingStages.slice(0, -1))}
            >
              <span className="text-lg">−</span>
            </Button>
            <span className="w-8 text-center text-lg font-bold">{judgingStages.length}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={judgingStages.length >= 5}
              onClick={() => setJudgingStages([...judgingStages, createJudgingStage(judgingStages.length + 1)])}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">최대 5단계</span>
        </div>

        {/* 단계별 설정 */}
        {judgingStages.map((stage, stageIndex) => {
          const stageCriteriaScore = stage.criteria.reduce((sum, c) => sum + (c.maxScore || 0), 0);
          return (
            <div key={stage.id} className="rounded-lg border border-border p-4 space-y-3">
              {/* 단계 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{stage.stageNumber}</span>
                  <Input
                    type="text"
                    value={stage.name}
                    className="w-40 h-8 text-sm font-medium"
                    onChange={(e) => {
                      const next = [...judgingStages];
                      next[stageIndex] = { ...stage, name: e.target.value };
                      setJudgingStages(next);
                    }}
                  />
                </div>
                {/* 심사 방식 토글 */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${stage.method === 'simple' ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    onClick={() => {
                      const next = [...judgingStages];
                      next[stageIndex] = { ...stage, method: 'simple', criteria: [] };
                      setJudgingStages(next);
                    }}
                  >
                    간편 심사
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${stage.method === 'scored' ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    onClick={() => {
                      const next = [...judgingStages];
                      next[stageIndex] = {
                        ...stage,
                        method: 'scored',
                        criteria: stage.criteria.length > 0 ? stage.criteria : [createJudgingCriteria('기술력', 0, 'AI 활용 수준'), createJudgingCriteria('스토리', 0, '전달력'), createJudgingCriteria('완성도', 0, '연출 및 편집')],
                      };
                      setJudgingStages(next);
                    }}
                  >
                    점수 심사
                  </button>
                </div>
              </div>

              {/* 간편 심사 안내 */}
              {stage.method === 'simple' && (
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
                  심사위원이 각 출품작에 대해 <span className="font-medium text-emerald-600">합격</span> / <span className="font-medium text-rose-600">불합격</span> / <span className="font-medium text-amber-600">보류</span>로 판정합니다.
                </p>
              )}

              {/* 점수 심사: 기준 항목 */}
              {stage.method === 'scored' && (
                <div className="space-y-2">
                  <div className="flex items-end gap-3">
                    <div className="flex-1"><span className="text-xs font-medium text-muted-foreground">심사 항목명</span></div>
                    <div className="w-20"><span className="text-xs font-medium text-muted-foreground">배점</span></div>
                    <div className="flex-1"><span className="text-xs font-medium text-muted-foreground">설명 (선택)</span></div>
                    <div className="w-9 shrink-0" />
                  </div>
                  {stage.criteria.map((criterion, cIndex) => (
                    <div key={criterion.id} className="flex items-start gap-3">
                      <div className="flex-1">
                        <Input type="text" placeholder="예시) 기술력" value={criterion.label}
                          onChange={(e) => {
                            const next = [...judgingStages];
                            const criteria = [...stage.criteria];
                            criteria[cIndex] = { ...criterion, label: e.target.value };
                            next[stageIndex] = { ...stage, criteria };
                            setJudgingStages(next);
                          }}
                        />
                      </div>
                      <div className="w-20">
                        <Input type="text" inputMode="numeric" placeholder="40" value={criterion.maxScore || ''}
                          onChange={(e) => {
                            const next = [...judgingStages];
                            const criteria = [...stage.criteria];
                            const val = numericOnly(e.target.value);
                            criteria[cIndex] = { ...criterion, maxScore: val ? parseInt(val, 10) : 0 };
                            next[stageIndex] = { ...stage, criteria };
                            setJudgingStages(next);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <Input type="text" placeholder="예시) AI 활용 수준" value={criterion.description}
                          onChange={(e) => {
                            const next = [...judgingStages];
                            const criteria = [...stage.criteria];
                            criteria[cIndex] = { ...criterion, description: e.target.value };
                            next[stageIndex] = { ...stage, criteria };
                            setJudgingStages(next);
                          }}
                        />
                      </div>
                      {stage.criteria.length > 1 ? (
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            const next = [...judgingStages];
                            next[stageIndex] = { ...stage, criteria: stage.criteria.filter((_, i) => i !== cIndex) };
                            setJudgingStages(next);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : <div className="w-9 shrink-0" />}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="gap-1.5"
                    onClick={() => {
                      const next = [...judgingStages];
                      next[stageIndex] = { ...stage, criteria: [...stage.criteria, createJudgingCriteria()] };
                      setJudgingStages(next);
                    }}
                  >
                    <Plus className="h-4 w-4" /> 항목 추가
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    총 배점: <span className={`font-semibold ${stageCriteriaScore === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{stageCriteriaScore}점</span>
                    {stageCriteriaScore !== 100 && <span className="ml-1 text-xs text-amber-600">(100점 권장)</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
    </>
  );
}
