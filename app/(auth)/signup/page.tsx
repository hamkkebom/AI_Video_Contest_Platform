'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

/**
 * 회원가입 페이지
 * 이메일/비밀번호/비밀번호 확인 입력 폼 (데모용, 실제 인증 없음)
 */
export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo only - no actual authentication
    console.log('Signup attempt:', { email, password, confirmPassword });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-[#8B5CF6]/5 px-4">
      <Card className="w-full max-w-md p-8 border border-border shadow-lg">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">회원가입</h1>
          <p className="text-muted-foreground">새 계정을 만드세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">이메일</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border"
            />
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">비밀번호</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-border"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">비밀번호 확인</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-border"
            />
          </div>

          {/* 회원가입 버튼 */}
          <Button
            type="submit"
            className="w-full bg-[#8B5CF6] hover:bg-[#7C4DCC] text-white font-semibold"
          >
            회원가입
          </Button>
        </form>

        {/* 로그인 링크 */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
          <Link href="/login" className="text-[#8B5CF6] hover:text-[#7C4DCC] font-semibold">
            로그인
          </Link>
        </div>
      </Card>
    </div>
  );
}
