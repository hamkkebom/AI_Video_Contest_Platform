'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, type FormEvent } from 'react';
import { TreePine, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

/** 비밀번호 검증 패턴: 8~20자, 영문+숫자+특수문자 (서버 API와 동일) */
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

/**
 * 비밀번호 재설정 페이지
 * 이메일의 재설정 링크 클릭 → auth/callback → 여기로 리다이렉트
 * 새 비밀번호 입력 후 PUT /api/profile/password 호출
 */
export default function ResetPasswordPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /* 비밀번호 재설정 제출 */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    /* 클라이언트 검증 */
    if (!PASSWORD_REGEX.test(password)) {
      setErrorMsg('비밀번호는 8~20자, 영문·숫자·특수문자를 포함해야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    /* 세션이 없으면 재설정 불가 (링크 만료 등) */
    if (!session) {
      setErrorMsg('세션이 만료되었습니다. 비밀번호 찾기를 다시 요청해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '비밀번호 변경에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      /* 성공 → 로그인 페이지로 이동 (성공 메시지 전달) */
      router.replace(('/login?message=' + encodeURIComponent('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.')) as Route);
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
              <span className="text-xl font-bold">AI꿈</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">비밀번호 재설정</h1>
            <p className="text-sm text-muted-foreground mt-1">새로운 비밀번호를 입력해주세요</p>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* 에러 메시지 */}
            {errorMsg && (
              <p className="text-sm text-destructive text-center">{errorMsg}</p>
            )}

            {/* 비밀번호 입력 폼 */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">새 비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="8~20자, 영문·숫자·특수문자 포함"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                    minLength={8}
                    maxLength={20}
                    disabled={isSubmitting}
                    autoFocus
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
                    maxLength={20}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* 비밀번호 요구사항 안내 */}
              <p className="text-xs text-muted-foreground">
                8~20자, 영문·숫자·특수문자를 각각 1개 이상 포함해야 합니다.
              </p>

              <Button
                type="submit"
                className="w-full h-11 text-base cursor-pointer"
                disabled={isSubmitting || !password || !confirmPassword}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : '비밀번호 변경'}
              </Button>
            </form>

            {/* 로그인으로 돌아가기 */}
            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                로그인으로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
