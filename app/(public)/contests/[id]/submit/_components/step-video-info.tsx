'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AiToolChips } from '@/components/common/ai-tool-chips';
import { CHAT_AI_TOOLS, IMAGE_AI_TOOLS, VIDEO_AI_TOOLS } from '@/config/constants';
import type { FormState } from '../_lib/form-types';

interface StepVideoInfoProps {
  form: FormState;
  updateField: (field: keyof FormState, value: string | boolean) => void;
  /** AI 도구 칩은 배열을 통째로 바꾸므로 setter 가 필요하다 */
  setForm: Dispatch<SetStateAction<FormState>>;
  fieldErrors: Record<string, string>;
  /** 가산점만 수정하는 모드에서는 이 단계를 숨긴다 */
  isBonusOnly: boolean;
}

/** STEP 1 — 출품자·영상 기본 정보. 폼 상태는 페이지가 소유하고 여기서는 그리기만 한다. */
export function StepVideoInfo({ form, updateField, setForm, fieldErrors, isBonusOnly }: StepVideoInfoProps) {
  return (
    <>
          {/* ===== STEP 1: 영상 정보 ===== */}
          <Card className={`p-6 border border-border ${isBonusOnly ? 'hidden' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <div>
                <h2 className="text-lg font-bold">영상 정보</h2>
                <p className="text-xs text-muted-foreground">영상의 기본 정보를 입력해 주세요</p>
              </div>
            </div>
            <div className="space-y-5">
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="submitterName" className="text-sm font-semibold">
                  이름 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="submitterName"
                  type="text"
                  required
                  maxLength={50}
                  value={form.submitterName}
                  onChange={(e) => updateField('submitterName', e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="bg-background/50 border-border"
                />
                {fieldErrors.submitterName && <p className="text-xs text-destructive">{fieldErrors.submitterName}</p>}
              </div>
              {/* 전화번호 */}
              <div className="space-y-2">
                <Label htmlFor="submitterPhone" className="text-sm font-semibold">
                  전화번호 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="submitterPhone"
                  type="tel"
                  required
                  maxLength={20}
                  value={form.submitterPhone}
                  onChange={(e) => updateField('submitterPhone', e.target.value)}
                  placeholder="010-0000-0000"
                  className="bg-background/50 border-border"
                />
                {fieldErrors.submitterPhone && <p className="text-xs text-destructive">{fieldErrors.submitterPhone}</p>}
              </div>
              {/* 영상 제목 */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  영상 제목 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  required
                  maxLength={100}
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="영상 제목을 입력하세요 (최대 100자)"
                  className="bg-background/50 border-border"
                />
                <p className="text-xs text-muted-foreground text-right">{form.title.length}/100</p>
                {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
              </div>
              {/* 영상 설명 */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  영상 설명 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  required
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="영상에 대한 설명을 입력하세요. 제작 의도, 주제 해석 등을 포함해 주세요."
                  className="min-h-32 bg-background/50 border-border"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.description.length}/1000
                </p>
                {fieldErrors.description && <p className="text-xs text-destructive">{fieldErrors.description}</p>}
              </div>
              {/* 사용한 AI 도구 */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">
                  사용한 AI 도구 <span className="text-xs text-muted-foreground font-normal">(선택)</span>
                </Label>
                <AiToolChips
                  label="💬 채팅 AI"
                  tools={CHAT_AI_TOOLS}
                  selected={form.chatAi}
                  onChange={(v) => setForm((p) => ({ ...p, chatAi: v }))}
                  allowCustom
                />
                <AiToolChips
                  label="🖼️ 이미지 AI"
                  tools={IMAGE_AI_TOOLS}
                  selected={form.imageAi}
                  onChange={(v) => setForm((p) => ({ ...p, imageAi: v }))}
                  allowCustom
                />
                <AiToolChips
                  label="🎬 영상 AI"
                  tools={VIDEO_AI_TOOLS}
                  selected={form.videoAi}
                  onChange={(v) => setForm((p) => ({ ...p, videoAi: v }))}
                  allowCustom
                />
              </div>
              {/* 제작과정 설명 */}
              <div className="space-y-2">
                <Label htmlFor="productionProcess" className="text-sm font-semibold">
                  제작과정 설명 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="productionProcess"
                  required
                  maxLength={3000}
                  value={form.productionProcess}
                  onChange={(e) => updateField('productionProcess', e.target.value)}
                  placeholder="영상의 기획 → 제작 → 편집 과정을 상세히 설명해 주세요. 어떤 AI 도구를 어떤 단계에서 활용했는지, 제작 기간, 특별한 기법 등을 포함하면 좋습니다."
                  className="min-h-48 bg-background/50 border-border"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.productionProcess.length}/3000
                </p>
                {fieldErrors.productionProcess && <p className="text-xs text-destructive">{fieldErrors.productionProcess}</p>}
              </div>
            </div>
          </Card>
    </>
  );
}
