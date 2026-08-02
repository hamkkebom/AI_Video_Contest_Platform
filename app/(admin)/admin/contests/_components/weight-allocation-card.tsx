'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { numericOnly } from './contest-form-helpers';

interface WeightAllocationCardProps {
  judgeWeightPercentStr: string;
  setJudgeWeightPercentStr: (value: string) => void;
  onlineVoteWeightPercentStr: string;
  setOnlineVoteWeightPercentStr: (value: string) => void;
  bonusPercentageStr: string;
  setBonusPercentageStr: (value: string) => void;
  useOnlineVote: boolean;
}

/** 카드 4.4 — 심사·온라인투표·가산점 비율 배분. 합이 100%가 되어야 한다. */
export function WeightAllocationCard({ judgeWeightPercentStr, setJudgeWeightPercentStr, onlineVoteWeightPercentStr, setOnlineVoteWeightPercentStr, bonusPercentageStr, setBonusPercentageStr, useOnlineVote }: WeightAllocationCardProps) {
  return (
    <>
    {/* ===== 카드 4.4: 평가 비율 배분 ===== */}
    <Card className="border-border">
      <CardHeader>
        <CardTitle>평가 비율 배분</CardTitle>
        <CardDescription>평가 항목들의 비율 합이 100%가 되어야 합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">심사위원 평가</label>
            <div className="flex items-center gap-1.5">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="예시) 70"
                value={judgeWeightPercentStr}
                onChange={(e) => setJudgeWeightPercentStr(numericOnly(e.target.value))}
                onBlur={() => {
                  const n = parseInt(judgeWeightPercentStr, 10);
                  if (!Number.isNaN(n) && n > 100) setJudgeWeightPercentStr('100');
                }}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          {useOnlineVote && (
            <div className="space-y-2">
              <label className="text-sm font-medium">온라인 투표</label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="예시) 20"
                  value={onlineVoteWeightPercentStr}
                  onChange={(e) => setOnlineVoteWeightPercentStr(numericOnly(e.target.value))}
                  onBlur={() => {
                    const n = parseInt(onlineVoteWeightPercentStr, 10);
                    if (!Number.isNaN(n) && n > 100) setOnlineVoteWeightPercentStr('100');
                  }}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">가산점</label>
            <div className="flex items-center gap-1.5">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="예시) 10"
                value={bonusPercentageStr}
                onChange={(e) => setBonusPercentageStr(numericOnly(e.target.value))}
                onBlur={() => {
                  const n = parseInt(bonusPercentageStr, 10);
                  if (!Number.isNaN(n) && n > 100) setBonusPercentageStr('100');
                }}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>
        {(() => {
          const j = parseInt(judgeWeightPercentStr, 10) || 0;
          const o = useOnlineVote ? (parseInt(onlineVoteWeightPercentStr, 10) || 0) : 0;
          const b = parseInt(bonusPercentageStr, 10) || 0;
          const total = j + o + b;
          return (
            <p className={`text-sm font-medium ${total === 100 ? 'text-green-600' : 'text-destructive'}`}>
              합계: {total}% {total === 100 ? '✓' : '(100%가 되어야 합니다)'}
            </p>
          );
        })()}
      </CardContent>
    </Card>
    </>
  );
}
