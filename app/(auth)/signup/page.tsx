'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, type FormEvent } from 'react';
import { TreePine, Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

/**
 * 회원가입 페이지 — Google OAuth + 이메일/비밀번호 공존
 * Google 간편가입을 상단에 배치, 이메일 폼은 하단
 * 이름, 전화번호, 이메일, 비밀번호, 비밀번호 확인 입력
 */
export default function SignupPage() {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  /* 이메일 인증 대기 화면 표시 여부 */
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

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

  /* 이메일/비밀번호 회원가입 */
  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    /* 클라이언트 검증 */
    if (!name.trim()) {
      setErrorMsg('이름을 입력해주세요.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      /* 전화번호 정규화 (숫자만) */
      const normalizedPhone = phone.replace(/[^0-9]/g, '');
      const result = await signUpWithEmail(
        email.trim(),
        password,
        name.trim(),
        normalizedPhone || undefined,
      );
      if (result.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
        return;
      }
      if (result.needsConfirmation) {
        /* 이메일 확인 대기 상태 */
        setNeedsConfirmation(true);
        setIsSubmitting(false);
        return;
      }
      /* 자동 로그인 성공 → 홈으로 이동 */
      router.replace('/');
    } catch {
      setErrorMsg('회원가입 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  /* Google 회원가입 (로그인과 동일한 플로우) */
  const handleGoogleSignup = async () => {
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle('/');
    } catch {
      setIsGoogleSubmitting(false);
    }
  };

  const isAnyLoading = isSubmitting || isGoogleSubmitting;

  /* 이메일 인증 대기 화면 */
  if (needsConfirmation) {
    return (
      <div className="w-full min-h-screen relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-0 right-1/4 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <Card className="backdrop-blur-xl bg-background/80 border border-border shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold">꿈플</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">이메일을 확인해주세요</h1>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>{email}</strong>로 인증 이메일을 보냈습니다.<br />
                이메일의 링크를 클릭하면 가입이 완료됩니다.
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground text-center mb-4">
                이메일이 보이지 않으면 스팸함을 확인해주세요.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full h-11 text-base cursor-pointer">
                  로그인으로 돌아가기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* 배경 장식 — CSS 변수 기반 */}
      <div className="absolute top-0 right-1/4 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

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
            <h1 className="text-2xl font-bold tracking-tight">회원가입</h1>
            <p className="text-sm text-muted-foreground mt-1">꿈플에 가입하세요</p>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* 에러 메시지 */}
            {errorMsg && (
              <p className="text-sm text-destructive text-center">{errorMsg}</p>
            )}

            {/* Google 회원가입 버튼 (상단) */}
            <Button
              variant="outline"
              className="w-full gap-2 cursor-pointer hover:bg-muted/80 hover:border-primary/30 transition-all duration-200 h-11 text-base"
              onClick={handleGoogleSignup}
              disabled={isAnyLoading}
            >
              {isGoogleSubmitting ? (
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

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            {/* 이메일/비밀번호 회원가입 폼 */}
            <form onSubmit={handleEmailSignup} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11"
                    required
                    disabled={isAnyLoading}
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
                    disabled={isAnyLoading}
                    maxLength={13}
                  />
                </div>
              </div>
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
                    placeholder="8자 이상 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                    minLength={8}
                    disabled={isAnyLoading}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                    minLength={8}
                    disabled={isAnyLoading}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base cursor-pointer"
                disabled={isAnyLoading || !name.trim() || !email.trim() || !password || !confirmPassword}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : '회원가입'}
              </Button>
            </form>

            {/* 약관 동의 안내 */}
            <p className="text-xs text-center text-muted-foreground">
              가입 시{' '}
              <Link href="/terms" className="text-primary hover:text-primary/80 underline">이용약관</Link>
              {' '}및{' '}
              <Link href="/privacy" className="text-primary hover:text-primary/80 underline">개인정보처리방침</Link>
              에 동의하게 됩니다
            </p>

            {/* 로그인 링크 */}
            <div className="text-center text-sm">
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
