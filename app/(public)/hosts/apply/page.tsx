'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * 주최자 온보딩 신청 페이지
 * 로그인 필수(미들웨어) → 기업 정보 제출 → 관리자 승인 → host 역할 부여 (D-015)
 * 사업자 정보는 관리자 검토에만 쓰이고 공개 페이지(/hosts/[id])에는 노출되지 않는다 (048 뷰).
 */
export default function HostApplyPage() {
  const [form, setForm] = useState({
    name: '',
    businessNumber: '',
    representativeName: '',
    phone: '',
    website: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/host-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '신청 처리에 실패했습니다.');
        return;
      }
      setDone(true);
    } catch {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg border-border shadow-lg">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">신청이 접수되었습니다</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                관리자 검토 후 승인되면 주최자 대시보드가 열립니다.
                <br />
                승인 결과는 프로필에 등록된 이메일로 안내됩니다.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="w-full cursor-pointer">홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-12">
      <div className="container mx-auto max-w-2xl space-y-8">
        {/* 안내 헤더 */}
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">공모전 개최 신청</h1>
          <p className="text-muted-foreground leading-relaxed">
            기업 정보를 등록하면 관리자 검토 후 공모전을 직접 개최할 수 있습니다.
            <br />
            사업자 정보는 검토에만 사용되며 공개 페이지에는 노출되지 않습니다.
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>기업 정보</CardTitle>
            <CardDescription>승인 후 기업명과 소개는 주최자 페이지에 공개됩니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">기업명 *</Label>
                  <Input id="name" value={form.name} onChange={set('name')} required maxLength={100} placeholder="주식회사 OOO" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자등록번호 *</Label>
                  <Input id="businessNumber" value={form.businessNumber} onChange={set('businessNumber')} required inputMode="numeric" placeholder="000-00-00000" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="representativeName">대표자명 *</Label>
                  <Input id="representativeName" value={form.representativeName} onChange={set('representativeName')} required maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">대표 연락처</Label>
                  <Input id="phone" value={form.phone} onChange={set('phone')} inputMode="tel" placeholder="02-0000-0000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input id="website" value={form.website} onChange={set('website')} type="url" placeholder="https://example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">기업 소개</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={set('description')}
                  rows={4}
                  maxLength={500}
                  placeholder="어떤 기업이고 어떤 공모전을 열고 싶은지 간단히 소개해주세요."
                />
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" disabled={submitting} className="w-full cursor-pointer gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> 접수 중...
                  </>
                ) : (
                  '개최 신청하기'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
