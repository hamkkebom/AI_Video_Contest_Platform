'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, HandMetal, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface InvitationData {
  contestTitle: string;
  hostName: string;
  hostCompany: string;
  message: string;
  invitedAt: string;
}

export default function JudgeInvitePage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  // 데모: 로그인 상태 토글
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const invitationData: InvitationData = {
    contestTitle: 'AI 영상 공모전 2026',
    hostName: '김호스트',
    hostCompany: '기업 1',
    message:
      '안녕하세요! 저희 공모전의 심사위원으로 참여해주실 것을 초대드립니다. 귀하의 전문성과 경험이 출품작 평가 품질을 높이는 데 큰 도움이 됩니다.',
    invitedAt: '2026-01-15',
  };

  if (status === 'accepted') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4 py-10">
        <Card className="w-full max-w-lg border-border shadow-xl">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">초대 수락 완료</h1>
              <p className="text-sm text-muted-foreground">{invitationData.contestTitle} 심사위원으로 등록되었습니다.</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
              심사 공모전 목록에서 배정된 출품작을 확인하고 바로 채점을 시작할 수 있습니다.
            </div>
            <Link href="/judging">
              <Button className="w-full">심사 공모전 보기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/50 via-background to-secondary/10 px-4 py-10">
        <Card className="w-full max-w-lg border-border shadow-lg">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HandMetal className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">초대 거절 완료</h1>
              <p className="text-sm text-muted-foreground">{invitationData.contestTitle} 심사위원 초대를 거절하셨습니다.</p>
            </div>
            <p className="text-sm text-muted-foreground">향후 다른 공모전 초대 링크로 다시 참여할 수 있습니다.</p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                홈으로 돌아가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-secondary/10 px-4 py-12">
      {/* 데모: 로그인 상태 토글 바 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-muted/80 backdrop-blur flex items-center justify-center gap-2 py-1.5 text-xs">
        <span className="text-muted-foreground">데모:</span>
        <button
          type="button"
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {isLoggedIn ? '로그인 상태' : '비로그인 상태'} — 클릭하여 전환
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-6 xl:grid-cols-[1.2fr_0.8fr] pt-12">
        <Card className="overflow-hidden border-border shadow-xl">
          <CardHeader className="border-b border-border bg-gradient-to-r from-primary/10 to-secondary/20 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary">Judge Invitation</Badge>
                <CardTitle className="text-3xl tracking-tight">{invitationData.contestTitle}</CardTitle>
                <CardDescription>
                  주최: <span className="font-semibold text-foreground">{invitationData.hostName}</span> ({invitationData.hostCompany})
                </CardDescription>
              </div>
              <div className="rounded-full border border-border bg-background/70 p-2 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">초대 메시지</h3>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
                {invitationData.message}
              </div>
            </section>

             <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
               <div className="rounded-lg border border-border bg-background p-4">
                 <p className="text-xs uppercase tracking-wide text-muted-foreground">초대 일시</p>
                 <p className="mt-1 text-sm font-semibold text-foreground">
                   {formatDate(invitationData.invitedAt, {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                   })}
                 </p>
               </div>
               <div className="rounded-lg border border-border bg-background p-4">
                 <p className="text-xs uppercase tracking-wide text-muted-foreground">토큰</p>
                 <p className="mt-1 truncate font-mono text-sm text-muted-foreground">{token}</p>
               </div>
             </section>

             {/* 로그인하지 않은 경우 표시되는 프롬프트 */}
             {!isLoggedIn && (
               <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center space-y-4">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                   <LogIn className="h-6 w-6 text-primary" />
                 </div>
                 <div className="space-y-1">
                   <p className="font-semibold">로그인이 필요합니다</p>
                   <p className="text-sm text-muted-foreground">심사위원 초대를 수락하려면 먼저 로그인해주세요.</p>
                 </div>
                 <div className="flex gap-3 justify-center">
                   <Link href="/login">
                     <Button>로그인</Button>
                   </Link>
                   <Link href="/signup">
                     <Button variant="outline">회원가입</Button>
                   </Link>
                 </div>
               </div>
             )}

             <section className="flex gap-3 pt-2">
               <Button
                 onClick={() => setStatus('declined')}
                 variant="outline"
                 className="flex-1"
                 disabled={!isLoggedIn}
               >
                 거절
               </Button>
               <Button
                 onClick={() => setStatus('accepted')}
                 className="flex-1 bg-accent-foreground text-white hover:bg-accent-foreground/90"
                 disabled={!isLoggedIn}
               >
                 초대 수락
               </Button>
             </section>

            <p className="text-center text-sm text-muted-foreground">
              질문이 있으신가요?{' '}
              <Link href="/" className="font-semibold text-primary hover:text-primary/80">
                홈으로 이동
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="h-fit border-border bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" /> 심사위원 역할 안내
            </CardTitle>
            <CardDescription>수락 후 바로 수행하게 되는 핵심 역할입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-muted/30 p-3">배정된 공모전 출품작 심사</div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">기준별 점수 부여 및 근거 작성</div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">최종 평가 의견 제출</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
