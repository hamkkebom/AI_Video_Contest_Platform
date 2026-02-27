'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState, type FormEvent } from 'react';
import { TreePine, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

/**
 * 로그인 폼 클라이언트 컴포넌트
 * 이메일/비밀번호 + Google OAuth — useSearchParams()를 사용하므로 Suspense boundary 내에서 렌더링
 */
export default function LoginForm() {
  const { user, profile, loading, signInWithGoogle, signInWithPassword } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  /* URL에서 redirect 파라미터 읽기 (로그인 후 돌아갈 경로) */
  const searchParams = useSearchParams();
  const redirectToParam = searchParams.get('redirectTo') || searchParams.get('redirect');
  const redirectTo = redirectToParam?.startsWith('/') ? redirectToParam : '/';

  /* URL 파라미터 메시지 표시 (비밀번호 변경 완료 등) */
  const successMessage = searchParams.get('message');

  /* URL 에러 파라미터 감지 (auth callback 실패 등) */
  useEffect(() => {
    const urlError = searchParams.get('error');

    /* 해시 fragment에서 Supabase 에러 감지 (예: #error=server_error&error_description=...) */
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get('error_description');
      if (hashError) {
        setErrorMsg(decodeURIComponent(hashError));
        /* 해시 정리 (유령 세션 방지) */
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        return;
      }
    }

    if (urlError === 'auth_callback_failed') {
      setErrorMsg('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } else if (urlError === 'profile_missing') {
      setErrorMsg('계정 프로필이 생성되지 않았습니다. 다시 로그인해주세요.');
    }
  }, [searchParams]);

  /* 이미 로그인된 경우 redirect 경로 또는 홈으로 이동 */
  useEffect(() => {
    if (!loading && user && profile) {
      router.replace(redirectTo as Route);
    }
  }, [loading, user, profile, router, redirectTo]);

  /* 이메일/비밀번호 로그인 */
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setIsSigningIn(true);
    setErrorMsg('');
    try {
      const result = await signInWithPassword(email.trim(), password);
      if (result.error) {
        setErrorMsg(result.error);
        setIsSigningIn(false);
      }
      /* 성공 시 onAuthStateChange가 user를 세팅 → useEffect가 리다이렉트 처리 */
    } catch {
      setErrorMsg('로그인 중 오류가 발생했습니다.');
      setIsSigningIn(false);
    }
  };

  /* Google 로그인 */
  const handleGoogleLogin = async () => {
    setIsGoogleSigningIn(true);
    setErrorMsg('');
    try {
      await signInWithGoogle(redirectTo);
    } catch {
      setIsGoogleSigningIn(false);
    }
  };

  const isAnyLoading = isSigningIn || isGoogleSigningIn || loading;

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
            <h1 className="text-2xl font-bold tracking-tight" aria-label="로그인">로그인</h1>
            <p className="text-sm text-muted-foreground mt-1">꿈플에 로그인하세요</p>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* 성공 메시지 (비밀번호 변경 완료 등) */}
            {successMessage && (
              <p className="text-sm text-green-600 text-center mb-2">{decodeURIComponent(successMessage)}</p>
            )}

            {/* 에러 메시지 */}
            {errorMsg && (
              <p className="text-sm text-destructive text-center">{errorMsg}</p>
            )}

            {/* 이메일/비밀번호 로그인 폼 */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                    disabled={isAnyLoading}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                    disabled={isAnyLoading}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base cursor-pointer"
                disabled={isAnyLoading || !email.trim() || !password}
              >
                {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : '로그인'}
              </Button>
            </form>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            {/* Google 로그인 버튼 */}
            <Button
              variant="outline"
              className="w-full gap-2 cursor-pointer hover:bg-muted/80 hover:border-primary/30 transition-all duration-200 h-11 text-base"
              onClick={handleGoogleLogin}
              disabled={isAnyLoading}
            >
              {isGoogleSigningIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Google로 로그인
            </Button>

            {/* 하단 링크 */}
            <div className="text-center text-sm space-y-2">
              <div>
                <span className="text-muted-foreground">계정이 없으신가요? </span>
                <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold">
                  회원가입
                </Link>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm">
                <Link href="/find-email" className="text-muted-foreground hover:text-primary transition-colors">
                  이메일 찾기
                </Link>
                <span className="text-muted-foreground/50">|</span>
                <Link href="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
