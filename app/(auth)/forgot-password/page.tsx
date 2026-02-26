'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, type FormEvent } from 'react';
import { TreePine, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

/**
 * 비밀번호 찾기 내부 폼 — useSearchParams()를 사용하므로 Suspense boundary 필요
 */
function ForgotPasswordForm() {
  const { resetPasswordForEmail } = useAuth();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  /* 이메일 발송 성공 여부 */
  const [isSent, setIsSent] = useState(false);

  /* URL 에러 파라미터 감지 (만료된 링크 등) */
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'link_expired') {
      setErrorMsg('재설정 링크가 만료되었습니다. 다시 요청해주세요.');
    }
  }, [searchParams]);

  /* 비밀번호 재설정 이메일 발송 */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const result = await resetPasswordForEmail(email.trim());
      if (result.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
        return;
      }
      setIsSent(true);
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

            {isSent ? (
              <>
                {/* 성공 화면 */}
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">이메일을 확인해주세요</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.<br />
                  이메일의 링크를 클릭하여 비밀번호를 재설정하세요.
                </p>
              </>
            ) : (
              <>
                {/* 입력 화면 */}
                <h1 className="text-2xl font-bold tracking-tight">비밀번호 찾기</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>
              </>
            )}
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {isSent ? (
              <>
                {/* 성공 후 안내 */}
                <p className="text-xs text-muted-foreground text-center">
                  이메일이 보이지 않으면 스팸함을 확인해주세요.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full h-11 text-base cursor-pointer">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    로그인으로 돌아가기
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* 에러 메시지 */}
                {errorMsg && (
                  <p className="text-sm text-destructive text-center">{errorMsg}</p>
                )}

                {/* 이메일 입력 폼 */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="가입한 이메일을 입력하세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-base cursor-pointer"
                    disabled={isSubmitting || !email.trim()}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : '재설정 링크 보내기'}
                  </Button>
                </form>

                {/* 로그인으로 돌아가기 */}
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

/**
 * 비밀번호 찾기 페이지 — Suspense boundary로 useSearchParams 래핑
 */
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
