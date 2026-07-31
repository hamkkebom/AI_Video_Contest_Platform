'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, CircleCheckBig, Clapperboard, Users, DollarSign, Info, Loader2, Zap, ShieldCheck } from 'lucide-react';

/**
 * 영상 제작 의뢰 페이지
 * AI 영상 제작 대행 서비스 의뢰 폼
 * 서비스는 아직 준비 중이지만 의뢰 접수는 받는다 (준비되는 대로 담당자가 회신).
 */

/** 제작 유형 — DB에 별도 컬럼이 없어 message 상단에 라벨로 남긴다 */
const PRODUCTION_TYPE_OPTIONS = [
  { value: 'corporate', label: '기업 홍보' },
  { value: 'product', label: '제품 소개' },
  { value: 'education', label: '교육 콘텐츠' },
  { value: 'sns', label: 'SNS 콘텐츠' },
  { value: 'other', label: '기타' },
] as const;

/** 예산 범위 — 관리자 화면이 값을 그대로 표시하므로 라벨을 저장한다 */
const BUDGET_OPTIONS = [
  { value: 'under100', label: '100만원 미만' },
  { value: '100-300', label: '100~300만원' },
  { value: '300-500', label: '300~500만원' },
  { value: '500-1000', label: '500~1,000만원' },
  { value: 'over1000', label: '1,000만원 이상' },
  { value: 'negotiable', label: '협의 가능' },
] as const;

const DETAILS_MAX = 4500;

export default function AgencyRequestPage() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productionType, setProductionType] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!companyName.trim() || !contactName.trim() || !email.trim() || !details.trim()) {
      setErrorMsg('회사명, 담당자명, 이메일, 상세 요청사항은 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    /* 제작 유형·희망 납품일은 DB 컬럼이 없으므로 요청사항 상단에 정리해 남긴다 */
    const productionLabel = PRODUCTION_TYPE_OPTIONS.find((option) => option.value === productionType)?.label;
    const messageLines = [
      productionLabel ? `[제작 유형] ${productionLabel}` : null,
      deadline ? `[희망 납품일] ${deadline}` : null,
    ].filter(Boolean);
    const composedMessage = messageLines.length > 0
      ? `${messageLines.join('\n')}\n\n${details.trim()}`
      : details.trim();

    try {
      const res = await fetch('/api/agency-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          contactEmail: email.trim(),
          phoneNumber: phone.trim(),
          budgetRange: BUDGET_OPTIONS.find((option) => option.value === budget)?.label ?? '',
          message: composedMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '의뢰 접수에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      /* 성공 — 폼 초기화 후 완료 안내로 전환 */
      setCompanyName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setProductionType('');
      setBudget('');
      setDeadline('');
      setDetails('');
      setIsSubmitted(true);
      setIsSubmitting(false);
    } catch {
      setErrorMsg('요청 처리 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: Users, title: '전문 크리에이터', description: '검증된 AI 영상 전문가가 직접 제작합니다' },
    { icon: DollarSign, title: '합리적 비용', description: '예산에 맞는 최적의 제작 방안을 제안합니다' },
    { icon: Zap, title: '빠른 납품', description: 'AI 기술을 활용하여 신속하게 결과물을 전달합니다' },
    { icon: ShieldCheck, title: 'A/S 보장', description: '납품 후 수정 요청에 적극 대응합니다' },
  ];

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <Link href="/support" className="hover:text-foreground transition-colors">고객센터</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">영상 제작 의뢰</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clapperboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI 영상 제작 의뢰</h1>
              <p className="text-muted-foreground">전문 크리에이터에게 AI 영상 제작을 맡겨보세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 특징 */}
      <section className="py-10 px-4 border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="text-center p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 의뢰 폼 */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl space-y-6">
          {/* 서비스 준비 상태 안내 — 접수는 받되 즉시 제작은 어렵다는 점을 명확히 알린다 */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-3 py-4">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">영상 제작 대행 서비스는 현재 준비 중입니다</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  의뢰를 남겨주시면 접수해두었다가 서비스가 준비되는 대로 담당자가 순차적으로 연락드립니다.
                  급한 건은 고객센터 1:1 문의를 이용해주세요.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>제작 의뢰서 작성</CardTitle>
              <p className="text-sm text-muted-foreground">상세히 작성해주시면 더 정확한 견적을 받아보실 수 있습니다</p>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                /* 접수 완료 안내 */
                <div className="py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CircleCheckBig className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold mb-2">의뢰가 접수되었습니다</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    서비스가 준비되는 대로 입력하신 연락처로 담당자가 연락드리겠습니다.
                  </p>
                  <Button variant="outline" className="cursor-pointer" onClick={() => setIsSubmitted(false)}>
                    의뢰 추가로 남기기
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
                      <Label htmlFor="agency-company">회사명 / 단체명</Label>
                      <Input
                        id="agency-company"
                        placeholder="함께봄 주식회사"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agency-contact">담당자명</Label>
                      <Input
                        id="agency-contact"
                        placeholder="홍길동"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agency-email">이메일</Label>
                      <Input
                        id="agency-email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agency-phone">연락처</Label>
                      <Input
                        id="agency-phone"
                        type="tel"
                        placeholder="010-0000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agency-type">제작 유형</Label>
                      <select
                        id="agency-type"
                        value={productionType}
                        onChange={(e) => setProductionType(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                      >
                        <option value="">유형을 선택하세요</option>
                        {PRODUCTION_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agency-budget">예산 범위</Label>
                      <select
                        id="agency-budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                      >
                        <option value="">예산을 선택하세요</option>
                        {BUDGET_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agency-deadline">희망 납품일</Label>
                    <Input
                      id="agency-deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agency-details">상세 요청사항</Label>
                    <Textarea
                      id="agency-details"
                      placeholder="제작 목적, 영상 길이, 참고 자료 등 상세한 요청사항을 작성해주세요"
                      rows={6}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      maxLength={DETAILS_MAX}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      className="flex-1 cursor-pointer font-semibold"
                      disabled={isSubmitting || !companyName.trim() || !contactName.trim() || !email.trim() || !details.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          접수 중...
                        </>
                      ) : '의뢰 접수하기'}
                    </Button>
                    <Badge variant="outline" className="shrink-0">무료 견적</Badge>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
