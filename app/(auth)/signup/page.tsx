'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useState } from 'react';
import {
  TreePine, Mail, Lock, Eye, EyeOff, CheckCircle2,
  User, Building2, Phone, FileText, UserCheck, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

/**
 * 회원가입 페이지
 * 2단계 플로우: Step 1 (계정 유형 선택) → Step 2 (폼 입력)
 * 프리미엄 SaaS 스타일 — CSS 변수 기반 테마 적용
 */
export default function SignupPage() {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();
  /* 단계 및 계정 유형 */
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<'individual' | 'business' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /* 공통 필드 */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  /* 기업 전용 필드 */
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [representativeName, setRepresentativeName] = useState('');

  /* 비밀번호 검증: 8~20자, 영문+숫자+특수문자 모두 포함 */
  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8 || pw.length > 20) return '비밀번호는 8자 이상 20자 이하로 입력해주세요.';
    if (!/[a-zA-Z]/.test(pw)) return '비밀번호에 영문자를 포함해주세요.';
    if (!/[0-9]/.test(pw)) return '비밀번호에 숫자를 포함해주세요.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw)) return '비밀번호에 특수문자를 포함해주세요.';
    return null;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwError = validatePassword(password);
    if (pwError) {
      setErrorMsg(pwError);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('약관에 동의해주세요.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    const result = await signUpWithEmail(email, password, { name, phone: mobile || undefined });
    if (result.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    } else {
      router.push('/login');
    }
  };
  /* 계정 유형 선택 → Step 2로 진행 */
  const handleSelectType = (type: 'individual' | 'business') => {
    setAccountType(type);
    setStep(2);
  };
  /* Step 1로 돌아가기 */
  const handleBack = () => {
    setStep(1);
  };

  /* 비밀번호 강도 체크 (영문/숫자/특수문자 충족 개수 기반) */
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const meetsLength = password.length >= 8 && password.length <= 20;
  const passwordStrength = password.length === 0 ? 0 : [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabel = ['', '약함', '보통', '강함'];
  const strengthColor = ['', 'bg-destructive', 'bg-yellow-500', 'bg-green-500'];

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
              {step === 1 ? '가입 유형을 선택해주세요' : accountType === 'business' ? '기업 회원 정보를 입력하세요' : '개인 회원 정보를 입력하세요'}
            </p>
            {/* 단계 표시 */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {/* ===== Step 1: 계정 유형 선택 ===== */}
            {step === 1 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleSelectType('individual')}
                  className="w-full group cursor-pointer"
                >
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">개인 회원</p>
                      <p className="text-sm text-muted-foreground">개인 창작자로 참여하기</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectType('business')}
                  className="w-full group cursor-pointer"
                >
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">기업 회원</p>
                      <p className="text-sm text-muted-foreground">기업·단체로 참여하기</p>
                    </div>
                  </div>
                </button>

                {/* 로그인 링크 */}
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
                  <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
                    로그인
                  </Link>
                </div>
              </div>
            )}

            {/* ===== Step 2: 폼 입력 ===== */}
            {step === 2 && (
              <>
                {/* 뒤로가기 버튼 */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  유형 다시 선택
                </button>

                {/* 선택된 유형 배지 */}
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                  {accountType === 'business' ? (
                    <Building2 className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium text-primary">
                    {accountType === 'business' ? '기업 회원' : '개인 회원'}
                  </span>
                </div>

                {/* 소셜 가입 버튼 */}
                <Button variant="outline" className="w-full gap-2 cursor-pointer hover:bg-muted/80 hover:border-primary/30 transition-all duration-200" onClick={signInWithGoogle}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google로 회원가입
                </Button>

                {/* 구분선 */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 이메일 */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* 비밀번호 */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8자 이상 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* 비밀번호 강도 표시 */}
                    {password.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength ? strengthColor[passwordStrength] : 'bg-muted'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{strengthLabel[passwordStrength]}</span>
                      </div>
                    )}
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">비밀번호 확인</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                      />
                      {confirmPassword.length > 0 && password === confirmPassword && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* 이름 */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{accountType === 'business' ? '담당자명' : '이름'}</Label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={accountType === 'business' ? '담당자 이름을 입력하세요' : '이름을 입력하세요'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* 휴대폰번호 */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-mobile">휴대폰번호</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-mobile"
                        type="tel"
                        placeholder="010-0000-0000"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* 전화번호 (선택) */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">
                      전화번호 <span className="text-muted-foreground font-normal">(선택)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="02-000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* ===== 기업 전용 필드 ===== */}
                  {accountType === 'business' && (
                    <>
                      {/* 구분선 */}
                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-background px-2 text-muted-foreground">기업 정보</span>
                        </div>
                      </div>

                      {/* 회사명 */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-company">회사명</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-company"
                            type="text"
                            placeholder="회사명을 입력하세요"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* 사업자등록번호 */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-business-number">사업자등록번호</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-business-number"
                            type="text"
                            placeholder="000-00-00000"
                            value={businessNumber}
                            onChange={(e) => setBusinessNumber(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* 대표자명 */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-representative">대표자명</Label>
                        <div className="relative">
                          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-representative"
                            type="text"
                            placeholder="대표자 이름을 입력하세요"
                            value={representativeName}
                            onChange={(e) => setRepresentativeName(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* 약관 동의 */}
                  <div className="flex items-start gap-2">
                    <input
                      id="agree-terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 rounded border-border"
                    />
                    <Label htmlFor="agree-terms" className="text-sm font-normal text-muted-foreground leading-relaxed">
                      <Link href="/terms" className="text-primary hover:text-primary/80 underline">이용약관</Link>
                      {' '}및{' '}
                      <Link href="/privacy" className="text-primary hover:text-primary/80 underline">개인정보처리방침</Link>
                      에 동의합니다
                    </Label>
                  </div>

                  {/* 에러 메시지 */}
                  {errorMsg && (
                    <p className="text-sm text-destructive text-center">{errorMsg}</p>
                  )}
                  <Button type="submit" className="w-full cursor-pointer font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? '가입 중...' : '회원가입'}
                  </Button>
                </form>



                {/* 로그인 링크 */}
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
                  <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
                    로그인
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
