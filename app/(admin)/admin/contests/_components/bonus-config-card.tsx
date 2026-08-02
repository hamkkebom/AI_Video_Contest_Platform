'use client';

import type { Dispatch, SetStateAction, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Star, X } from 'lucide-react';
import { createBonusConfig, numericOnly, textareaClass, type BonusConfigForm } from './contest-form-helpers';

interface BonusConfigCardProps {
  bonusConfigs: BonusConfigForm[];
  setBonusConfigs: Dispatch<SetStateAction<BonusConfigForm[]>>;
  renderRangeWarning: (value: string, min: number, max: number, unit: string) => ReactNode;
}

/** 카드 4.3 — 가산점 항목. 항목마다 URL·이미지 인증 요구 여부를 정한다. */
export function BonusConfigCard({ bonusConfigs, setBonusConfigs, renderRangeWarning }: BonusConfigCardProps) {
  return (
    <>
    {/* ===== 카드 4.3: 가산점 항목 ===== */}
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          가산점 항목
        </CardTitle>
        <CardDescription>참가자가 추가 점수를 받을 수 있는 가산점 항목을 설정합니다. (선택)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {bonusConfigs.map((bc, index) => (
          <div key={bc.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">항목명</label>
                  <Input
                    type="text"
                    placeholder="예: 공식포스터 SNS 공유"
                    value={bc.label}
                    onChange={(e) => {
                      const next = [...bonusConfigs];
                      next[index] = { ...bc, label: e.target.value };
                      setBonusConfigs(next);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">설명 (선택)</label>
                  <Input
                    type="text"
                    placeholder="참가자에게 보여질 안내"
                    value={bc.description}
                    onChange={(e) => {
                      const next = [...bonusConfigs];
                      next[index] = { ...bc, description: e.target.value };
                      setBonusConfigs(next);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">점수</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="예시) 1"
                    value={bc.score || ''}
                    onChange={(e) => {
                      const next = [...bonusConfigs];
                      const val = numericOnly(e.target.value);
                      next[index] = { ...bc, score: val ? Math.max(1, Math.min(10, parseInt(val, 10) || 1)) : 1 };
                      setBonusConfigs(next);
                    }}
                  />
                  {renderRangeWarning(String(bc.score), 1, 10, '점')}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={bc.requiresUrl}
                    onChange={(e) => {
                      const next = [...bonusConfigs];
                      next[index] = { ...bc, requiresUrl: e.target.checked };
                      setBonusConfigs(next);
                    }}
                    className="rounded"
                  />
                  URL 제출 필요
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={bc.requiresImage}
                    onChange={(e) => {
                      const next = [...bonusConfigs];
                      next[index] = { ...bc, requiresImage: e.target.checked };
                      setBonusConfigs(next);
                    }}
                    className="rounded"
                  />
                  이미지 제출 필요
                </label>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive mt-5"
              onClick={() => setBonusConfigs(bonusConfigs.filter((_, i) => i !== index))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setBonusConfigs([...bonusConfigs, createBonusConfig()])}
        >
          <Plus className="h-4 w-4" />
          가산점 항목 추가
        </Button>
      </CardContent>
    </Card>
    </>
  );
}
