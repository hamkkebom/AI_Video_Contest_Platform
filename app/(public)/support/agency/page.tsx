'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clapperboard, Users, DollarSign, Zap, ShieldCheck } from 'lucide-react';

/**
 * 영상 제작 의뢰 페이지
 * AI 영상 제작 대행 서비스 의뢰 폼
 */
export default function AgencyRequestPage() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productionType, setProductionType] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 의뢰 API 연동 시 구현
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
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>제작 의뢰서 작성</CardTitle>
              <p className="text-sm text-muted-foreground">상세히 작성해주시면 더 정확한 견적을 받아보실 수 있습니다</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agency-company">회사명 / 이름</Label>
                    <Input id="agency-company" placeholder="함께봄 주식회사" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agency-email">이메일</Label>
                    <Input id="agency-email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agency-phone">연락처</Label>
                    <Input id="agency-phone" type="tel" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agency-type">제작 유형</Label>
                    <select
                      id="agency-type"
                      value={productionType}
                      onChange={(e) => setProductionType(e.target.value)}
                      className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    >
                      <option value="">유형을 선택하세요</option>
                      <option value="corporate">기업 홍보</option>
                      <option value="product">제품 소개</option>
                      <option value="education">교육 콘텐츠</option>
                      <option value="sns">SNS 콘텐츠</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agency-budget">예산 범위</Label>
                    <select
                      id="agency-budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    >
                      <option value="">예산을 선택하세요</option>
                      <option value="under100">100만원 미만</option>
                      <option value="100-300">100~300만원</option>
                      <option value="300-500">300~500만원</option>
                      <option value="500-1000">500~1,000만원</option>
                      <option value="over1000">1,000만원 이상</option>
                      <option value="negotiable">협의 가능</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agency-deadline">희망 납품일</Label>
                    <Input id="agency-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency-details">상세 요청사항</Label>
                  <Textarea
                    id="agency-details"
                    placeholder="제작 목적, 영상 길이, 참고 자료 등 상세한 요청사항을 작성해주세요"
                    rows={6}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled className="flex-1 cursor-not-allowed font-semibold bg-muted text-muted-foreground">
                    서비스 준비 중
                  </Button>
                  <Badge variant="outline" className="shrink-0">무료 견적</Badge>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
