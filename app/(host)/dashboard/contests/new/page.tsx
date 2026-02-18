'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { JUDGING_TYPES, VIDEO_EXTENSIONS } from '@/config/constants';

/**
 * 공모전 생성 페이지
 * 호스트가 새 공모전을 생성하기 위한 폼 페이지입니다.
 * 데모용으로 실제 데이터 저장은 하지 않습니다.
 */
export default function HostContestCreatePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [judgingType, setJudgingType] = useState<string>('internal');
  const [reviewPolicy, setReviewPolicy] = useState<string>('manual');
  const [maxSubmissions, setMaxSubmissions] = useState(3);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(
    VIDEO_EXTENSIONS.map((ext) => ext.value)
  );
  const [submitted, setSubmitted] = useState(false);

  const toggleExtension = (value: string) => {
    setSelectedExtensions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo only - no actual persistence
    console.log('Create contest:', {
      title,
      description,
      startDate,
      endDate,
      submissionDeadline,
      judgingType,
      reviewPolicy,
      maxSubmissions,
      selectedExtensions,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-lg p-8 border border-border text-center space-y-4">
          <span className="text-5xl block">🎉</span>
          <h2 className="text-2xl font-bold">공모전이 생성되었습니다!</h2>
          <p className="text-muted-foreground">데모 모드에서는 실제 저장되지 않습니다.</p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/dashboard/contests">
              <Button variant="outline" className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10">
                목록으로
              </Button>
            </Link>
            <Button
              className="bg-[#8B5CF6] hover:bg-[#7C4DCC]"
              onClick={() => {
                setSubmitted(false);
                setTitle('');
                setDescription('');
                setStartDate('');
                setEndDate('');
                setSubmissionDeadline('');
                setJudgingType('internal');
                setReviewPolicy('manual');
                setMaxSubmissions(3);
                setSelectedExtensions(VIDEO_EXTENSIONS.map((ext) => ext.value));
              }}
            >
              하나 더 만들기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">새 공모전 만들기</h1>
          <p className="text-muted-foreground">공모전 정보를 입력하고 생성하세요</p>
        </div>
      </section>

      {/* 폼 */}
      <section className="py-8 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <form onSubmit={handleSubmit}>
            <Card className="border border-border p-6 space-y-6">
              {/* 기본 정보 */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#EA580C] rounded-full inline-block" />
                  기본 정보
                </h2>
                <div className="space-y-4">
                  {/* 제목 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      공모전 제목 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="예: 2026 AI 영상 공모전"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="border-border focus:border-[#EA580C] focus:ring-[#EA580C]"
                    />
                  </div>

                  {/* 설명 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">공모전 설명</label>
                    <textarea
                      placeholder="공모전의 목적, 주제, 참가 대상 등을 설명하세요"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-border" />

              {/* 일정 */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#F59E0B] rounded-full inline-block" />
                  일정 설정
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">시작일</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">종료일</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">접수 마감일</label>
                    <Input
                      type="date"
                      value={submissionDeadline}
                      onChange={(e) => setSubmissionDeadline(e.target.value)}
                      className="border-border"
                    />
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-border" />

              {/* 심사 설정 */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#8B5CF6] rounded-full inline-block" />
                  심사 설정
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 심사 유형 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">심사 유형</label>
                    <select
                      value={judgingType}
                      onChange={(e) => setJudgingType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                    >
                      {JUDGING_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 검수 정책 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">검수 정책</label>
                    <select
                      value={reviewPolicy}
                      onChange={(e) => setReviewPolicy(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                    >
                      <option value="manual">수동 검수</option>
                      <option value="auto_then_manual">자동 검수 후 수동</option>
                    </select>
                  </div>

                  {/* 최대 출품 수 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">인당 최대 출품 수</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={maxSubmissions}
                      onChange={(e) => setMaxSubmissions(Number(e.target.value))}
                      className="border-border"
                    />
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-border" />

              {/* 허용 확장자 */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
                  허용 영상 형식
                </h2>
                <div className="flex flex-wrap gap-3">
                  {VIDEO_EXTENSIONS.map((ext) => (
                    <button
                      key={ext.value}
                      type="button"
                      onClick={() => toggleExtension(ext.value)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedExtensions.includes(ext.value)
                          ? 'bg-[#EA580C] text-white border-[#EA580C]'
                          : 'bg-background text-muted-foreground border-border hover:border-[#EA580C]'
                      }`}
                    >
                      .{ext.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-border" />

              {/* 버튼 */}
              <div className="flex gap-3 justify-end pt-2">
                <Link href="/dashboard/contests">
                  <Button type="button" variant="outline" className="border-border">
                    취소
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold px-8"
                  disabled={!title.trim()}
                >
                  공모전 생성
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </section>
    </div>
  );
}
