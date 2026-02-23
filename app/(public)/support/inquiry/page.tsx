'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, Mail, Send } from 'lucide-react';

/**
 * 1:1 문의 페이지
 * 문의 유형별 폼 + 운영시간 안내
 */
export default function InquiryPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inquiry submitted:', { name, email, category, title, content });
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
          <h1 className="text-3xl font-bold mb-2">1:1 문의</h1>
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
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inquiry-name">이름</Label>
                        <Input id="inquiry-name" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inquiry-email">이메일</Label>
                        <Input id="inquiry-email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiry-category">문의 유형</Label>
                      <select
                        id="inquiry-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                      >
                        <option value="">유형을 선택하세요</option>
                        <option value="service">서비스 이용</option>
                        <option value="payment">결제/환불</option>
                        <option value="contest">공모전 관련</option>
                        <option value="tech">기술 지원</option>
                        <option value="other">기타</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiry-title">제목</Label>
                      <Input id="inquiry-title" placeholder="문의 제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiry-content">내용</Label>
                      <Textarea
                        id="inquiry-content"
                        placeholder="문의 내용을 상세히 작성해주세요"
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    <Button type="submit" disabled className="w-full cursor-not-allowed font-semibold">
                      문의 접수 (데모)
                    </Button>
                  </form>
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
