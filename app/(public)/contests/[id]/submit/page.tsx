'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Upload,
  Film,
  FileVideo,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { getContests } from '@/lib/mock';
import type { Contest } from '@/lib/types';

/**
 * 공모전 작품 제출 페이지 (목업)
 * 실제 파일 업로드 없이 UI만 구성
 */
export default function ContestSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  /* 제출 폼 상태 */
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    tags: '',
  });
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const contests = await getContests();
      const found = contests.find((c) => c.id === contestId);
      setContest(found ?? null);
      setLoading(false);
    };
    load();
  }, [contestId]);

  /* 목업 파일 선택 핸들러 */
  const handleFileSelect = () => {
    setFileName('my-ai-video-작품.mp4');
  };

  const handleFileRemove = () => {
    setFileName(null);
  };

  /* 목업 제출 핸들러 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href={`/contests/${contestId}`}>
                <Button variant="outline" className="cursor-pointer">공모전 상세</Button>
              </Link>
              <Link href="/my/submissions">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer">
                  내 제출 목록
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
          {/* 네비게이션 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/contests" className="hover:text-foreground transition-colors">
              공모전
            </Link>
            <span>&gt;</span>
            <Link
              href={`/contests/${contestId}`}
              className="hover:text-foreground transition-colors"
            >
              {contest.title}
            </Link>
            <span>&gt;</span>
            <span className="text-foreground">작품 제출</span>
          </div>

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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="작품에 대한 설명을 입력하세요. 사용한 AI 도구, 제작 의도, 주제 해석 등을 포함해 주세요."
                className="min-h-32 bg-background/50 border-border"
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.description.length}/1000
              </p>
            </div>

            {/* 영상 업로드 (목업) */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                영상 파일 <span className="text-red-500">*</span>
              </Label>
              {fileName ? (
                <Card className="p-4 border border-border bg-background/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <FileVideo className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-xs text-muted-foreground">24.5 MB · MP4</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleFileRemove}
                      className="p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </Card>
              ) : (
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">클릭하여 영상 파일을 업로드하세요</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {contest.allowedVideoExtensions.map((e) => e.toUpperCase()).join(', ')} · 최대 500MB
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* 영상 URL (대안) */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-base font-semibold">
                영상 URL <span className="text-xs text-muted-foreground font-normal">(선택 — 파일 업로드 대신 링크 제출)</span>
              </Label>
              <Input
                id="videoUrl"
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=... 또는 https://vimeo.com/..."
                className="bg-background/50 border-border"
              />
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
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
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

            {/* 안내 사항 */}
            <Card className="p-5 border border-border bg-orange-500/5">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Film className="h-4 w-4 text-orange-500" />
                제출 전 확인사항
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5">
                <li>공모전 주제에 맞는 AI 영상만 제출할 수 있습니다.</li>
                <li>저작권/초상권 문제가 없는 콘텐츠만 허용됩니다.</li>
                <li>제출 후 검수 과정을 거치며, 승인되면 출품작 목록에 표시됩니다.</li>
                <li>마감일 이후에는 수정이 불가합니다.</li>
              </ul>
            </Card>

            {/* 제출 버튼 */}
            <div className="flex items-center gap-3 pt-2">
              <Link href={`/contests/${contestId}`} className="flex-1">
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
                disabled={!form.title || !form.description || (!fileName && !form.videoUrl)}
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
