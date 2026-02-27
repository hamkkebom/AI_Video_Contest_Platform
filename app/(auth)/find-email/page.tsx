'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, type FormEvent } from 'react';
import { TreePine, Loader2, User, Phone, ArrowLeft, Mail } from 'lucide-react';

/**
 * 이메일 찾기 페이지
 * 이름 + 전화번호 입력 → 마스킹된 이메일 조회
 */
export default function FindEmailPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  /* 조회 결과 — 마스킹된 이메일 목록 */
  const [foundEmails, setFoundEmails] = useState<string[] | null>(null);

  /* 전화번호 입력 시 자동 하이픈 포맷 */
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  /* 이메일 찾기 제출 */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setFoundEmails(null);

    try {
      const res = await fetch('/api/auth/find-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '조회에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      setFoundEmails(data.emails);
      setIsSubmitting(false);
    } catch {
      setErrorMsg('요청 처리 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* 배경 장식 — CSS 변수 기반 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Card className="backdrop-blur-xl bg-background/80 border border-border shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* 브랜드 로고 */}
            <Link href="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TreePine className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">꿈플</span>
            </Link>

            {foundEmails ? (
              <>
                {/* 결과 화면 */}
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">이메일을 찾았습니다</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  가입된 이메일 정보입니다.
                </p>
              </>
            ) : (
              <>
                {/* 입력 화면 */}
                <h1 className="text-2xl font-bold tracking-tight">이메일 찾기</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  가입 시 등록한 이름과 전화번호를 입력해주세요.
                </p>
              </>
            )}
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {foundEmails ? (
              <>
                {/* 결과 표시 */}
                <div className="space-y-2">
                  {foundEmails.map((email, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-mono">{email}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  보안을 위해 이메일 일부가 가려져 있습니다.
                </p>

                <div className="space-y-2">
                  <Link href="/login">
                    <Button className="w-full h-11 text-base cursor-pointer">
                      로그인하러 가기
                    </Button>
                  </Link>
                  <Link href="/forgot-password">
                    <Button variant="outline" className="w-full h-11 text-base cursor-pointer">
                      비밀번호 찾기
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* 에러 메시지 */}
                {errorMsg && (
                  <p className="text-sm text-destructive text-center">{errorMsg}</p>
                )}

                {/* 입력 폼 */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm">이름</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="가입 시 입력한 이름"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11"
                        required
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm">전화번호</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="010-0000-0000"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="pl-10 h-11"
                        required
                        disabled={isSubmitting}
                        maxLength={13}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-base cursor-pointer"
                    disabled={isSubmitting || !name.trim() || phone.replace(/[^0-9]/g, '').length < 10}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : '이메일 찾기'}
                  </Button>
                </form>

                {/* 하단 링크 */}
                <div className="text-center">
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    로그인으로 돌아가기
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
