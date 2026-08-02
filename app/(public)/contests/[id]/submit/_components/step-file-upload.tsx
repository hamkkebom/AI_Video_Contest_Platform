'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, FileVideo, ImageIcon, Info, Upload, X } from 'lucide-react';
import type { Contest } from '@/lib/types';
import { EXT_TO_MIME } from '../_lib/form-types';

interface StepFileUploadProps {
  /** 페이지가 !contest 를 조기 반환으로 걸러낸 뒤에만 렌더된다 */
  contest: Contest;
  isBonusOnly: boolean;
  isEditMode: boolean;
  isResubmitMode: boolean;
  existingSubmission: { thumbnailUrl?: string } | null;
  videoFile: File | null;
  thumbnailFile: File | null;
  videoInputRef: RefObject<HTMLInputElement | null>;
  thumbnailInputRef: RefObject<HTMLInputElement | null>;
  handleVideoSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  handleVideoRemove: () => void;
  handleThumbnailSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  handleThumbnailRemove: () => void;
  formatFileSize: (size: number) => string;
  fieldErrors: Record<string, string>;
}

/** STEP 2 — 썸네일·영상 파일 업로드. 파일 상태와 선택 핸들러는 페이지가 소유한다. */
export function StepFileUpload({ contest, isBonusOnly, isEditMode, isResubmitMode, existingSubmission, videoFile, thumbnailFile, videoInputRef, thumbnailInputRef, handleVideoSelect, handleVideoRemove, handleThumbnailSelect, handleThumbnailRemove, formatFileSize, fieldErrors }: StepFileUploadProps) {
  return (
    <>
          {/* ===== STEP 2: 파일 업로드 ===== */}
          <Card className={`p-6 border border-border ${isBonusOnly ? 'hidden' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <div>
                <h2 className="text-lg font-bold">파일 업로드</h2>
                <p className="text-xs text-muted-foreground">썸네일과 영상 파일을 업로드해 주세요</p>
              </div>
            </div>
            <div className="mb-6 p-3 rounded-lg bg-brand dark:bg-brand/40 border-2 border-brand flex items-start gap-2">
              <Info className="h-5 w-5 text-brand dark:text-brand mt-0.5 shrink-0" />
              <p className="text-sm text-brand dark:text-brand font-medium">
                ⚠️ 업로드가 안 될 경우 <kbd className="rounded border border-brand bg-white dark:bg-brand px-1.5 py-0.5 text-xs font-mono font-bold">Ctrl+Shift+R</kbd> (Mac: <kbd className="rounded border border-brand bg-white dark:bg-brand px-1.5 py-0.5 text-xs font-mono font-bold">⌘+Shift+R</kbd>)로 <strong className="underline">강력 새로고침</strong> 후 다시 시도해 주세요.
              </p>
            </div>
            {isEditMode && !isResubmitMode && existingSubmission ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm font-medium mb-3 text-muted-foreground">업로드된 파일 (수정 불가)</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {existingSubmission.thumbnailUrl && (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <Image src={existingSubmission.thumbnailUrl} alt="썸네일" width={400} height={128} className="w-full h-32 object-cover" />
                        <div className="px-3 py-2 bg-muted/20">
                          <p className="text-xs text-muted-foreground">썸네일 이미지</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/10">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                        <FileVideo className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">영상 파일</p>
                        <p className="text-xs text-muted-foreground">업로드 완료</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-600 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  제출 후 영상 파일과 썸네일은 수정이 불가합니다.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {/* 썸네일 이미지 업로드 */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    썸네일 이미지 <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">JPG, PNG 형식, 최대 10MB · 권장 1920×1080px</p>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailSelect}
                  />
                  {thumbnailFile ? (
                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{thumbnailFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(thumbnailFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleThumbnailRemove}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ) : isResubmitMode && existingSubmission?.thumbnailUrl ? (
                    <div className="space-y-2">
                      <div className="rounded-lg border border-border overflow-hidden">
                        <Image src={existingSubmission.thumbnailUrl} alt="기존 썸네일" width={400} height={128} className="w-full h-32 object-cover" />
                        <div className="px-3 py-2 bg-muted/20 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">기존 썸네일 (변경하려면 아래 클릭)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="w-full border border-dashed border-border rounded-lg p-3 text-xs text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-center"
                      >
                        새 썸네일로 변경
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-xl p-5 sm:p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">썸네일 업로드</p>
                        <p className="text-xs text-muted-foreground mt-0.5">클릭하여 선택</p>
                      </div>
                    </button>
                  )}
                  {fieldErrors.thumbnailFile && <p className="text-xs text-destructive mt-1">{fieldErrors.thumbnailFile}</p>}
                </div>
                {/* 영상 파일 업로드 */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    영상 파일 <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {contest.allowedVideoExtensions.map((e) => e.toUpperCase()).join(', ')} 형식, 최대 200MB
                  </p>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept={contest.allowedVideoExtensions.flatMap((e) => EXT_TO_MIME[e.toLowerCase()] ?? [`video/${e}`]).join(',')}
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                  {videoFile ? (
                    <div className="p-4 rounded-xl border border-brand/30 bg-brand/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                            <FileVideo className="h-5 w-5 text-brand" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{videoFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(videoFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleVideoRemove}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-xl p-5 sm:p-8 flex flex-col items-center gap-3 hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-brand" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">영상 업로드</p>
                        <p className="text-xs text-muted-foreground mt-0.5">클릭하여 선택</p>
                      </div>
                    </button>
                  )}
                  {fieldErrors.videoFile && <p className="text-xs text-destructive mt-1">{fieldErrors.videoFile}</p>}
                </div>
              </div>
            )}
          </Card>
    </>
  );
}
