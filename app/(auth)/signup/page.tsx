'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TreePine, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { useState } from 'react';

/**
 * 회원가입 페이지 — Google OAuth 전용
 * Google 로그인 시 자동 가입 처리
 */
export default function SignupPage() {
  const { signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Google 회원가입 (로그인과 동일한 플로우) */
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle('/');
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* 배경 장식 — CSS 변수 기반 */}
      <div className="absolute top-0 right-1/4 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Card className="backdrop-blur-xl bg-background/80 border border-border shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* 브랜드 로고 */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TreePine className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">꿈플</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">회원가입</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Google 계정으로 간편하게 가입하세요
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Google 회원가입 버튼 */}
            <Button
              variant="outline"
              className="w-full gap-2 cursor-pointer hover:bg-muted/80 hover:border-primary/30 transition-all duration-200 h-12 text-base"
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Google로 회원가입
            </Button>

            <p className="mt-4 text-xs text-center text-muted-foreground">
              가입 시{' '}
              <Link href="/terms" className="text-primary hover:text-primary/80 underline">이용약관</Link>
              {' '}및{' '}
              <Link href="/privacy" className="text-primary hover:text-primary/80 underline">개인정보처리방침</Link>
              에 동의하게 됩니다
            </p>

            {/* 로그인 링크 */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
                로그인
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
