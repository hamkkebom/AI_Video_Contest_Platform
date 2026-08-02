'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ChevronDown, ImageIcon, Upload, X } from 'lucide-react';
import type { Contest } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { BonusFormEntry } from '../_lib/form-types';

interface StepBonusProps {
  /** 페이지가 !contest 를 조기 반환으로 걸러낸 뒤에만 렌더된다 */
  contest: Contest;
  hasBonusConfigs: boolean;
  isEditMode: boolean;
  openBonuses: string[];
  toggleBonus: (id: string) => void;
  bonusForms: Record<string, BonusFormEntry>;
  updateBonusForm: (configId: string, value: string) => void;
  savedBonusConfigIds: Set<string>;
  handleProofImageSelect: (configId: string, file: File) => void;
  handleProofImageRemove: (configId: string) => void;
  formatFileSize: (size: number) => string;
}

/** STEP 3 — 가산점 인증(조건부). 공모전에 가산점 항목이 있을 때만 렌더된다. */
export function StepBonus({ contest, hasBonusConfigs, isEditMode, openBonuses, toggleBonus, bonusForms, updateBonusForm, savedBonusConfigIds, handleProofImageSelect, handleProofImageRemove, formatFileSize }: StepBonusProps) {
  return (
    <>
          {/* ===== STEP 3: 가산점 인증 (조건부) ===== */}
          {hasBonusConfigs && (
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <h2 className="text-lg font-bold">가산점 인증 <span className="text-xs text-muted-foreground font-normal ml-1">(선택)</span></h2>
                  <p className="text-xs text-muted-foreground">추후 마이페이지에서도 등록 가능합니다</p>
                </div>
              </div>
              {contest.bonusMaxScore && (
                <p className="text-xs text-muted-foreground mb-4 pl-11">
                  항목당 1회만 인정 \u00B7 최대 {contest.bonusMaxScore}점
                </p>
              )}
              <div className="space-y-2">
                {contest.bonusConfigs!.map((config) => {
                  const isOpen = openBonuses.includes(config.id);
                  const entry = bonusForms[config.id] || { snsUrl: '', proofImageFile: null, proofImagePreview: null };
                  const hasBothFields = !!(entry.snsUrl?.trim() && (entry.proofImagePreview || entry.proofImageFile));
                  const isSaved = savedBonusConfigIds.has(String(config.id)) && hasBothFields;
                  const isNewUpload = !savedBonusConfigIds.has(String(config.id)) && isEditMode && hasBothFields;
                  return (
                    <Card key={config.id} className={cn('border overflow-hidden', isSaved ? 'border-emerald-500/50' : isNewUpload ? 'border-blue-500/50' : 'border-border')}>
                      {/* 아코디언 헤더 */}
                      <button
                        type="button"
                        onClick={() => toggleBonus(config.id)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <span className="flex-1 text-sm font-medium">{config.label}</span>
                        {isSaved && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            등록완료
                          </span>
                        )}
                        {isNewUpload && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            입력 완료
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {/* 아코디언 본문 */}
                      <div
                        className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                          {config.description && (
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          )}
                          {/* SNS URL 입력 */}
                          <Input
                            type="url"
                            value={entry.snsUrl}
                            onChange={(e) => updateBonusForm(config.id, e.target.value)}
                            placeholder="SNS 게시물 URL (예: https://instagram.com/p/...)"
                            className="bg-background/50 border-border text-sm"
                          />
                          {/* 인증 이미지 업로드 */}
                          {entry.proofImagePreview ? (
                            <div className="rounded-lg border border-border overflow-hidden">
                              <div className="relative bg-muted/30">
                                <img
                                  src={entry.proofImagePreview}
                                  alt="인증 이미지 미리보기"
                                  className="w-full max-h-48 object-contain"
                                />
                              </div>
                              <div className="flex items-center justify-between px-3 py-2 bg-muted/20">
                                <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                                  {entry.proofImageFile ? `${entry.proofImageFile.name} (${formatFileSize(entry.proofImageFile.size)})` : '업로드된 인증 이미지'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleProofImageRemove(config.id)}
                                  className="text-xs text-destructive hover:text-destructive cursor-pointer font-medium shrink-0"
                                >
                                  제거
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">캡처 이미지 업로드 (JPG, PNG, WebP, 최대 10MB)</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleProofImageSelect(config.id, file);
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                          {/* URL + 이미지 모두 필요 안내 */}
                          <p className="text-xs text-brand">
                            ※ URL과 캡처 이미지를 모두 제출해야 가산점이 인정됩니다.
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          )}
    </>
  );
}
