'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Upload,
  Film,
  FileVideo,
  ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  Shield,
  FileCheck,
  ShoppingBag,
  Scale,
  Users,
  AlertTriangle,
  Megaphone,
  Cpu,
  ThumbsUp,
} from 'lucide-react';

import type { Contest } from '@/lib/types';

/** 제출 폼 상태 타입 */
interface FormState {
  title: string;
  description: string;
  aiTools: string;
  productionProcess: string;
  tags: string;
  agree: boolean;
}

/** 가산점 인증 상태 (bonusConfigId별) */
interface BonusFormEntry {
  snsUrl: string;
  hasProofImage: boolean;
}

/**
 * 공모전 작품 제출 페이지 (목업)
 * ApplySection 기준으로 통합된 접수 폼
 * 실제 파일 업로드 없이 UI만 구성
 */
export default function ContestSubmitPage() {
  const params = useParams();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  /* 제출 폼 상태 */
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    aiTools: '',
    productionProcess: '',
    tags: '',
    agree: false,
  });

  /* 파일 업로드 목업 상태 */
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [thumbnailFileName, setThumbnailFileName] = useState<string | null>(null);

  /* 가산점 아코디언 열림 상태 */
  const [openBonuses, setOpenBonuses] = useState<string[]>([]);
  /* 가산점 폼 데이터 (bonusConfigId → 값) */
  const [bonusForms, setBonusForms] = useState<Record<string, BonusFormEntry>>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/contests'); const contests: Contest[] = await res.json();
      const found = contests.find((c) => c.id === contestId);
      setContest(found ?? null);
      setLoading(false);
    };
    load();
  }, [contestId]);

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* 가산점 아코디언 토글 */
  const toggleBonus = (id: string) => {
    setOpenBonuses((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  /* 가산점 폼 업데이트 */
  const updateBonusForm = (configId: string, field: keyof BonusFormEntry, value: string | boolean) => {
    setBonusForms((prev) => ({
      ...prev,
      [configId]: { ...prev[configId], [field]: value },
    }));
  };

  /* 목업 파일 선택 핸들러 */
  const handleVideoSelect = () => setVideoFileName('my-ai-video-작품.mp4');
  const handleVideoRemove = () => setVideoFileName(null);
  const handleThumbnailSelect = () => setThumbnailFileName('thumbnail-작품.jpg');
  const handleThumbnailRemove = () => setThumbnailFileName(null);

  /* 목업 제출 핸들러 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agree) return;
    setSubmitted(true);
  };

  /* 가산점 존재 여부 */
  const hasBonusConfigs = contest?.bonusConfigs && contest.bonusConfigs.length > 0;

  /* 제출 가능 여부 */
  const canSubmit =
    form.title.trim() &&
    form.description.trim() &&
    form.productionProcess.trim() &&
    videoFileName &&
    thumbnailFileName &&
    form.agree;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">공모전을 찾을 수 없습니다</h1>
            <p className="text-muted-foreground mb-6">
              요청하신 공모전이 존재하지 않거나 삭제되었습니다.
            </p>
            <Link href="/contests">
              <Button variant="outline">공모전 목록으로</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  /* 접수중이 아닌 경우 */
  if (contest.status !== 'open') {
    return (
      <div className="w-full min-h-screen bg-background">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">제출 기간이 아닙니다</h1>
            <p className="text-muted-foreground mb-6">
              이 공모전은 현재 {contest.status === 'judging' ? '심사중' : '종료'}입니다.
            </p>
            <Link href={`/contests/${contestId}`}>
              <Button variant="outline">공모전 상세로 돌아가기</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  /* 제출 완료 상태 */
  if (submitted) {
    return (
      <div className="w-full min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3">작품이 제출되었습니다!</h1>
            <p className="text-muted-foreground mb-2">
              &quot;{form.title}&quot; 작품이 성공적으로 접수되었습니다.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              검수 완료 후 공모전 출품작 목록에 표시됩니다.
              {hasBonusConfigs && ' 가산점 인증은 마이페이지에서 추후 수정할 수 있습니다.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href={`/contests/${contestId}`}>
                <Button variant="outline" className="cursor-pointer">공모전 상세</Button>
              </Link>
              <Link href="/my/submissions">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer">
                  내 출품작
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden font-sans">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 페이지 헤더 */}
      <section className="relative pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-3xl relative z-10">

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            작품 제출하기
          </h1>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{contest.title}</span>에 참가할 작품을 제출해 주세요.
          </p>
        </div>
      </section>

      {/* 제출 폼 */}
      <section className="relative px-4 pb-24">
        <div className="container mx-auto max-w-3xl relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 공모전 정보 요약 */}
            <Card className="p-5 border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-foreground">{contest.title}</p>
                  <p className="text-muted-foreground">
                    마감: {new Date(contest.submissionEndAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' · '}
                    허용 형식: {contest.allowedVideoExtensions.map((e) => e.toUpperCase()).join(', ')}
                    {' · '}
                    최대 {contest.maxSubmissionsPerUser}작품 제출 가능
                  </p>
                </div>
              </div>
            </Card>

            {/* 작품 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                작품 제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                required
                maxLength={100}
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="작품 제목을 입력하세요 (최대 100자)"
                className="bg-background/50 border-border"
              />
              <p className="text-xs text-muted-foreground text-right">{form.title.length}/100</p>
            </div>

            {/* 작품 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                작품 설명 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                required
                maxLength={1000}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="작품에 대한 설명을 입력하세요. 제작 의도, 주제 해석 등을 포함해 주세요."
                className="min-h-32 bg-background/50 border-border"
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.description.length}/1000
              </p>
            </div>

            {/* 사용한 AI 도구 */}
            <div className="space-y-2">
              <Label htmlFor="aiTools" className="text-base font-semibold">
                사용한 AI 도구 <span className="text-xs text-muted-foreground font-normal">(선택)</span>
              </Label>
              <Input
                id="aiTools"
                type="text"
                value={form.aiTools}
                onChange={(e) => updateField('aiTools', e.target.value)}
                placeholder="예: Sora, Runway, Midjourney 등"
                className="bg-background/50 border-border"
              />
            </div>

            {/* 제작과정 설명 */}
            <div className="space-y-2">
              <Label htmlFor="productionProcess" className="text-base font-semibold">
                제작과정 설명 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="productionProcess"
                required
                maxLength={3000}
                value={form.productionProcess}
                onChange={(e) => updateField('productionProcess', e.target.value)}
                placeholder="작품의 기획 → 제작 → 편집 과정을 상세히 설명해 주세요. 어떤 AI 도구를 어떤 단계에서 활용했는지, 제작 기간, 특별한 기법 등을 포함하면 좋습니다."
                className="min-h-48 bg-background/50 border-border"
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.productionProcess.length}/3000
              </p>
            </div>

            {/* 썸네일 + 영상 업로드 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* 썸네일 이미지 업로드 (목업) */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  썸네일 이미지 <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">JPG, PNG 형식, 권장 1920×1080px</p>
                {thumbnailFileName ? (
                  <Card className="p-4 border border-border bg-background/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{thumbnailFileName}</p>
                          <p className="text-xs text-muted-foreground">1.2 MB · JPG</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleThumbnailRemove}
                        className="p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </Card>
                ) : (
                  <button
                    type="button"
                    onClick={handleThumbnailSelect}
                    className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer min-h-[140px] justify-center"
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium text-xs text-muted-foreground">클릭하여 썸네일 업로드</p>
                  </button>
                )}
              </div>

              {/* 영상 파일 업로드 (목업) */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  영상 파일 <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  {contest.allowedVideoExtensions.map((e) => e.toUpperCase()).join(', ')} 형식, 최대 500MB
                </p>
                {videoFileName ? (
                  <Card className="p-4 border border-border bg-background/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <FileVideo className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{videoFileName}</p>
                          <p className="text-xs text-muted-foreground">24.5 MB · MP4</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleVideoRemove}
                        className="p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </Card>
                ) : (
                  <button
                    type="button"
                    onClick={handleVideoSelect}
                    className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer min-h-[140px] justify-center"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium text-xs text-muted-foreground">클릭하여 영상 업로드</p>
                  </button>
                )}
              </div>
            </div>

            {/* 태그 */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-base font-semibold">
                태그 <span className="text-xs text-muted-foreground font-normal">(선택)</span>
              </Label>
              <Input
                id="tags"
                type="text"
                value={form.tags}
                onChange={(e) => updateField('tags', e.target.value)}
                placeholder="쉼표로 구분 (예: AI영상, 단편, 실험적)"
                className="bg-background/50 border-border"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                        #{tag}
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            {/* 가산점 인증 — 해당 공모전에 bonusConfigs가 있을 때만 표시 */}
            {hasBonusConfigs && (
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-semibold">
                    가산점 인증 <span className="text-xs text-muted-foreground font-normal">(선택 — 추후 마이페이지에서도 등록 가능)</span>
                  </Label>
                  {contest.bonusMaxScore && (
                    <p className="text-xs text-muted-foreground mt-1">
                      항목당 1회만 인정 · 최대 {contest.bonusMaxScore}점
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {contest.bonusConfigs!.map((config) => {
                    const isOpen = openBonuses.includes(config.id);
                    const entry = bonusForms[config.id] || { snsUrl: '', hasProofImage: false };
                    return (
                      <Card key={config.id} className="border border-border overflow-hidden">
                        {/* 아코디언 헤더 */}
                        <button
                          type="button"
                          onClick={() => toggleBonus(config.id)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <span className="flex-1 text-sm font-medium">{config.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {/* 아코디언 본문 */}
                        <div
                          className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            {config.description && (
                              <p className="text-xs text-muted-foreground">{config.description}</p>
                            )}
                            {/* SNS URL 입력 */}
                            {config.requiresUrl && (
                              <Input
                                type="url"
                                value={entry.snsUrl}
                                onChange={(e) => updateBonusForm(config.id, 'snsUrl', e.target.value)}
                                placeholder="SNS 게시물 URL (예: https://instagram.com/p/...)"
                                className="bg-background/50 border-border text-sm"
                              />
                            )}
                            {/* 인증 이미지 업로드 (목업) */}
                            {config.requiresImage && (
                              <button
                                type="button"
                                onClick={() => updateBonusForm(config.id, 'hasProofImage', !entry.hasProofImage)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border hover:border-violet-500/50 cursor-pointer transition-colors text-left"
                              >
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {entry.hasProofImage ? '✓ 캡처 이미지 선택됨 (클릭하여 제거)' : '캡처 이미지 업로드'}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 안내 사항 */}
            <Card className="p-5 border border-border bg-orange-500/5">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Film className="h-4 w-4 text-orange-500" />
                제출 전 확인사항
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5">
                <li>공모전 주제에 맞는 AI 영상만 제출할 수 있습니다.</li>
                <li>저작권/초상권 문제가 없는 콘텐츠만 허용됩니다.</li>
                <li>제출 후 영상 파일과 썸네일은 수정이 불가합니다.</li>
                <li>가산점 인증, 작품 설명, 제작과정 등은 마감 전까지 수정 가능합니다.</li>
                <li>마감일 이후에는 모든 수정이 불가합니다.</li>
              </ul>
            </Card>

            {/* 동의 체크박스 */}
            <div className="flex items-start gap-3">
              <input
                id="agree"
                type="checkbox"
                checked={form.agree}
                onChange={(e) => updateField('agree', e.target.checked)}
                className="mt-1 w-5 h-5 rounded cursor-pointer accent-violet-600"
              />
              <label
                htmlFor="agree"
                className={`text-sm cursor-pointer ${form.agree ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="underline underline-offset-2 decoration-dashed hover:text-violet-600 transition-colors cursor-pointer"
                      onClick={(e) => { e.preventDefault(); setNotesOpen(true); }}
                    >
                      유의사항 및 저작권 안내
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>유의사항 및 저작권 안내</DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">공모전 참가 전 반드시 확인해 주세요.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {[
                        { icon: Shield, title: '권리 귀속', desc: '출품작의 저작권은 제작자에게 있습니다. 단, 수상작에 한하여 저작권은 함께봄과 제작자가 각 50%씩 공동 소유합니다.', note: '향후 AI콘텐츠저작권협회 설립 시 제작자에게 100% 양도 가능' },
                        { icon: FileCheck, title: '사용권', desc: '출품작에 대한 사용권 및 2차적 저작물 작성권은 함께봄에 100% 귀속되며, 마케팅 및 홍보 목적으로 활용될 수 있습니다.' },
                        { icon: ShoppingBag, title: '상업적 이용 보장', desc: '응모자는 AI툴로 제작된 결과물이 상업적 이용에 결격 사유가 없는 결과물이어야 합니다.' },
                        { icon: Scale, title: '법적 책임', desc: '모든 출품작은 제3자의 저작권, 초상권 등을 침해하지 않는 순수 창작물이어야 하며, 문제 발생 시 모든 책임은 출품자에게 있습니다.' },
                        { icon: Users, title: '중복 참여 및 팀 참여 불가', desc: '1인당 1회 응모 가능하며, 팀으로 작업한 사실이 밝혀질 경우 수상은 취소될 수 있습니다.' },
                        { icon: AlertTriangle, title: '즉시 실격 처리 대상', desc: '선정적, 차별적, 폭력적 내용 등이 포함된 작품은 즉시 실격 처리됩니다.' },
                        { icon: Megaphone, title: '작품 활용 안내', desc: '제출된 작품은 행사 홍보·연출에 활용될 수 있습니다.' },
                        { icon: Cpu, title: 'AI 창작물 필수', desc: '제출 작품은 반드시 AI 활용 창작물이어야 하며, 저작권·초상권 문제 발생 시 실격 처리될 수 있습니다.' },
                        { icon: ThumbsUp, title: '대중 평가 반영', desc: '제출된 작품은 함께봄 공모전 페이지에 게시되며, 좋아요 수 등 대중평가 점수가 심사에 반영됩니다.' },
                      ].map((item) => (
                        <div key={item.title} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                          <item.icon className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                            {'note' in item && item.note && (
                              <p className="text-xs text-muted-foreground/70 italic mt-1">* {item.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                에 동의합니다 <span className="text-red-500">*</span>
              </label>
            </div>

            {/* 제출 버튼 */}
            <div className="flex items-center gap-3 pt-2">
              <Link href={`/contests/${contestId}/landing`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  돌아가기
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer"
                disabled={!canSubmit}
              >
                <Upload className="h-4 w-4 mr-2" />
                작품 제출하기
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
