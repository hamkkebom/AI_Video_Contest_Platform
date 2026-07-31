'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, CircleCheckBig, Clock, Loader2, Mail, Send } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

/**
 * 1:1 문의 페이지
 * 문의 유형별 폼 + 운영시간 안내
 * 비회원도 접수 가능 — 이름/이메일을 직접 입력받고, 회원은 계정 정보를 자동으로 사용한다.
 */

/**
 * 화면의 문의 유형 → DB inquiries.type 매핑
 * DB는 general/support/agency 세 값만 허용하므로, 세부 유형은 label로 내용에 남긴다.
 */
const CATEGORY_OPTIONS = [
  { value: 'service', label: '서비스 이용', type: 'support' },
  { value: 'payment', label: '결제/환불', type: 'general' },
  { value: 'contest', label: '공모전 관련', type: 'general' },
  { value: 'tech', label: '기술 지원', type: 'support' },
  { value: 'agency', label: '영상 제작 대행', type: 'agency' },
  { value: 'other', label: '기타', type: 'general' },
] as const;

const TITLE_MAX = 200;
/** 서버 상한은 5000자 — 유형 라벨을 앞에 덧붙이므로 입력은 여유를 두고 제한한다 */
const CONTENT_MAX = 4900;

export default function InquiryPage() {
  const { user, profile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  /* 회원은 계정 정보로 답변하므로 이름/이메일 입력란을 읽기 전용으로 채운다 */
  const isLoggedIn = Boolean(user);
  const displayName = profile?.name ?? '';
  const displayEmail = profile?.email ?? user?.email ?? '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const selected = CATEGORY_OPTIONS.find((option) => option.value === category);
    if (!selected) {
      setErrorMsg('문의 유형을 선택해주세요.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setErrorMsg('제목과 내용을 입력해주세요.');
      return;
    }
    if (!isLoggedIn && !email.trim()) {
      setErrorMsg('답변받을 이메일을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    /* 세부 유형은 DB에 별도 컬럼이 없으므로 내용 첫 줄에 남겨 관리자가 확인할 수 있게 한다 */
    const composedContent = `[문의 유형] ${selected.label}\n\n${content.trim()}`;

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selected.type,
          title: title.trim(),
          content: composedContent,
          name: isLoggedIn ? undefined : name.trim(),
          email: isLoggedIn ? undefined : email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '문의 접수에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      /* 성공 — 폼 초기화 후 완료 안내로 전환 */
      setName('');
      setEmail('');
      setCategory('');
      setTitle('');
      setContent('');
      setIsSubmitted(true);
      setIsSubmitting(false);
    } catch {
      setErrorMsg('요청 처리 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto max-w-4xl">
          {/* 브레드크럼 */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <Link href="/support" className="hover:text-foreground transition-colors">고객센터</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">1:1 문의</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground">궁금한 점이나 불편한 점을 남겨주세요. 빠르게 답변드리겠습니다.</p>
        </div>
      </section>

      {/* 폼 + 안내 */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 문의 폼 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    문의하기
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    /* 접수 완료 안내 */
                    <div className="py-10 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <CircleCheckBig className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold mb-2">문의가 접수되었습니다</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        영업일 기준 1~2일 내에 입력하신 이메일로 답변드리겠습니다.
                      </p>
                      <Button variant="outline" className="cursor-pointer" onClick={() => setIsSubmitted(false)}>
                        추가 문의하기
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* 에러 메시지 */}
                      {errorMsg && (
                        <p className="text-sm text-destructive">{errorMsg}</p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="inquiry-name">이름</Label>
                          <Input
                            id="inquiry-name"
                            placeholder="이름을 입력하세요"
                            value={isLoggedIn ? displayName : name}
                            onChange={(e) => setName(e.target.value)}
                            readOnly={isLoggedIn}
                            disabled={isSubmitting}
                            className={isLoggedIn ? 'bg-muted/50' : undefined}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inquiry-email">이메일</Label>
                          <Input
                            id="inquiry-email"
                            type="email"
                            placeholder="user@example.com"
                            value={isLoggedIn ? displayEmail : email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly={isLoggedIn}
                            disabled={isSubmitting}
                            required={!isLoggedIn}
                            className={isLoggedIn ? 'bg-muted/50' : undefined}
                          />
                        </div>
                      </div>
                      {isLoggedIn && (
                        <p className="text-xs text-muted-foreground -mt-2">
                          로그인 계정 정보로 답변드립니다. 변경이 필요하면 프로필에서 수정해주세요.
                        </p>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="inquiry-category">문의 유형</Label>
                        <select
                          id="inquiry-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                        >
                          <option value="">유형을 선택하세요</option>
                          {CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiry-title">제목</Label>
                        <Input
                          id="inquiry-title"
                          placeholder="문의 제목을 입력하세요"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          maxLength={TITLE_MAX}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiry-content">내용</Label>
                        <Textarea
                          id="inquiry-content"
                          placeholder="문의 내용을 상세히 작성해주세요"
                          rows={6}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          maxLength={CONTENT_MAX}
                          disabled={isSubmitting}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full cursor-pointer font-semibold"
                        disabled={isSubmitting || !category || !title.trim() || !content.trim() || (!isLoggedIn && !email.trim())}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            접수 중...
                          </>
                        ) : '문의 접수하기'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 안내 사이드바 */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">운영시간</h3>
                      <p className="text-xs text-muted-foreground">평일 09:00 - 18:00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">이메일</h3>
                      <p className="text-xs text-muted-foreground">support@hamkkebom.kr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <Badge className="bg-primary/10 text-primary border-0 mb-3">안내</Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    접수된 문의는 영업일 기준 1~2일 내에 이메일로 답변드립니다. 긴급한 문의는 운영시간 내 전화 상담을 이용해주세요.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
