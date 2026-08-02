'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, ChevronDown, Film, Info, Shield } from 'lucide-react';
import type { Contest } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { FormState } from '../_lib/form-types';

interface StepConsentProps {
  /** 페이지가 !contest 를 조기 반환으로 걸러낸 뒤에만 렌더된다 */
  contest: Contest;
  form: FormState;
  updateField: (field: keyof FormState, value: string | boolean) => void;
  fieldErrors: Record<string, string>;
  isBonusOnly: boolean;
  notesOpen: boolean;
  setNotesOpen: (open: boolean) => void;
}

/** 마지막 단계 — 유의사항 안내와 약관 동의. 약관 본문은 공모전 데이터에서 온다. */
export function StepConsent({ contest, form, updateField, fieldErrors, isBonusOnly, notesOpen, setNotesOpen }: StepConsentProps) {
  return (
    <>
          {/* ===== STEP 최종: 안내 및 동의 ===== */}
          <Card className={`p-6 border border-border ${isBonusOnly ? 'hidden' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">확인 및 제출</h2>
                <p className="text-xs text-muted-foreground">안내사항을 확인하고 영상을 제출해 주세요</p>
              </div>
            </div>
            {/* 안내 사항 */}
            <div className="p-4 rounded-xl bg-brand/5 border border-brand/10 mb-5">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Film className="h-4 w-4 text-brand" />
                제출 전 확인사항
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5">
                <li>공모전 주제에 맞는 AI 영상만 제출할 수 있습니다.</li>
                <li>저작권/초상권 문제가 없는 콘텐츠만 허용됩니다.</li>
                <li>제출 후 영상 파일과 썸네일은 수정이 불가합니다.</li>
                <li>가산점 인증, 영상 설명, 제작과정 등은 마감 전까지 수정 가능합니다.</li>
                <li>마감일 이후에는 모든 수정이 불가합니다.</li>
              </ul>
            </div>
            {/* 동의 체크박스 */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20">
              <input
                id="agree"
                type="checkbox"
                checked={form.agree}
                onChange={(e) => updateField('agree', e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded cursor-pointer accent-violet-600"
              />
              <label
                htmlFor="agree"
                className={`text-sm cursor-pointer ${form.agree ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="underline underline-offset-2 decoration-dashed hover:text-primary transition-colors cursor-pointer"
                      onClick={(e) => { e.preventDefault(); setNotesOpen(true); }}
                    >
                      유의사항 및 저작권 안내
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:z-20">
                    {/* 스타일링된 헤더 */}
                    <div className="relative overflow-hidden bg-zinc-950 px-6 pt-6 pb-5">
                      <div className="absolute -top-16 -right-16 w-52 h-52 bg-primary/30 rounded-full blur-[60px] pointer-events-none" />
                      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-brand/20 rounded-full blur-[60px] pointer-events-none" />
                      <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-brand border border-white/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]">
                            <Shield className="h-5 w-5 text-white/90" />
                          </div>
                          <div>
                            <DialogTitle className="text-white text-lg font-bold">유의사항 및 저작권 안내</DialogTitle>
                            <DialogDescription className="text-zinc-400 text-sm mt-0.5">공모전 참가 전 반드시 확인해 주세요.</DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                    </div>
                    {/* 본문 */}
                    <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
                      {contest?.notes ? (
                        <div className="space-y-4">
                          {contest.notes.split(/\n\s*\n/).map((section, sectionIndex) => {
                            const lines = section.trim().split('\n').filter((l: string) => l.trim());
                            if (lines.length === 0) return null;

                            /* 숫자로 시작하는 줄은 섹션 제목으로 처리 */
                            const isTitle = /^\d+[\.)\s]/.test(lines[0]);
                            const titleLine = isTitle ? lines[0] : null;
                            const bodyLines = isTitle ? lines.slice(1) : lines;

                            return (
                              <div key={`section-${titleLine ?? bodyLines.join('-')}`} className={sectionIndex > 0 ? 'pt-4 border-t border-border/50' : ''}>
                                {titleLine && (
                                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    {titleLine}
                                  </h3>
                                )}
                                <div className="space-y-1.5">
                                  {bodyLines.map((line: string) => {
                                    const isBullet = /^[\-·•※]\s/.test(line);
                                    const content = isBullet ? line.replace(/^[\-·•※]\s/, '') : line;
                                    return (
                                      <p
                                        key={`line-${line}`}
                                        className={`text-sm leading-relaxed text-muted-foreground ${isBullet
                                          ? 'pl-4 relative before:absolute before:left-1 before:top-[0.55em] before:w-1 before:h-1 before:rounded-full before:bg-muted-foreground/40'
                                          : ''
                                          }`}
                                      >
                                        {content}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-8 text-center">
                          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <Info className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">유의사항 정보가 아직 등록되지 않았습니다.</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">공모전 주최자에게 문의해 주세요.</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                에 동의합니다 <span className="text-destructive">*</span>
              </label>
            </div>
            {fieldErrors.agree && <p className="text-xs text-destructive mt-1 ml-8">{fieldErrors.agree}</p>}

            {/* 개인 SNS 업로드 자제 안내 */}
            <div className="mt-4 rounded-xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold">!</div>
                <div>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">📢 제출 작품 개인 SNS 업로드 자제 안내</p>
                  <p className="mt-1.5 text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    제출하신 작품은 <strong>공모전 페이지에 게시되어 대중평가(좋아요) 점수가 심사에 반영</strong>됩니다.
                    수상 발표 전까지 동일한 영상을 <strong>개인 SNS에 업로드하시는 것을 자제</strong>해 주세요.
                  </p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-300">
                    ※ 가산점 인증을 위한 포스터·링크 공유는 해당되지 않습니다.
                  </p>
                </div>
              </div>
            </div>
          </Card>
    </>
  );
}
