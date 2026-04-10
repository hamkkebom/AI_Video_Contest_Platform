'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, ExternalLink, Image as ImageIcon } from 'lucide-react';
import type { BonusConfig } from '@/lib/types';

interface BonusEntry {
  bonusConfigId: string;
  snsUrl?: string;
  proofImageUrl?: string;
  submittedAt: string;
}

interface BonusViewButtonProps {
  submissionTitle: string;
  bonusEntries: BonusEntry[];
  bonusConfigs: BonusConfig[];
}

export function BonusViewButton({ submissionTitle, bonusEntries, bonusConfigs }: BonusViewButtonProps) {
  const [open, setOpen] = useState(false);

  const configMap = new Map(bonusConfigs.map((c) => [c.id, c]));

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-700 hover:bg-yellow-500/20 transition-colors dark:text-yellow-300"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Star className="h-3 w-3" />
        가산점 {bonusEntries.length}건
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              가산점 인증 내역
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{submissionTitle}</p>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {bonusEntries.map((entry, index) => {
              const config = configMap.get(entry.bonusConfigId);
              return (
                <div key={index} className="rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{config?.label ?? `가산점 항목 ${index + 1}`}</p>
                    {config?.score != null && (
                      <span className="text-xs font-medium text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        +{config.score}점
                      </span>
                    )}
                  </div>
                  {config?.description && (
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  )}

                  {entry.snsUrl && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <a
                        href={entry.snsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {entry.snsUrl}
                      </a>
                    </div>
                  )}

                  {entry.proofImageUrl && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ImageIcon className="h-3.5 w-3.5" />
                        인증 이미지
                      </div>
                      <img
                        src={entry.proofImageUrl}
                        alt="가산점 인증"
                        className="w-full max-h-48 rounded-lg border border-border object-contain bg-muted/30"
                      />
                    </div>
                  )}

                  {!entry.snsUrl && !entry.proofImageUrl && (
                    <p className="text-xs text-muted-foreground">등록된 인증 자료가 없습니다.</p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    제출: {new Date(entry.submittedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
