'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InvitationData {
  contestTitle: string;
  hostName: string;
  hostCompany: string;
  message: string;
  invitedAt: string;
}

/**
 * 심사위원 초대 수락/거절 페이지
 * 심사위원 초대 링크를 통해 접근하며, 초대를 수락하거나 거절할 수 있습니다.
 */
export default function JudgeInvitePage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');

  // 데모용 초대 정보
  const invitationData: InvitationData = {
    contestTitle: 'AI 영상 공모전 2026',
    hostName: '김호스트',
    hostCompany: '기업 1',
    message: '안녕하세요! 저희 공모전의 심사위원으로 참여해주실 것을 초대드립니다. 귀하의 전문성과 경험이 큰 도움이 될 것 같습니다.',
    invitedAt: '2026-01-15',
  };

  const handleAccept = () => {
    setStatus('accepted');
  };

  const handleDecline = () => {
    setStatus('declined');
  };

  if (status === 'accepted') {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#EA580C]/5 to-[#8B5CF6]/5">
        <Card className="w-full max-w-md p-8 border border-border text-center space-y-6">
          <div className="text-5xl">✅</div>
          <div>
            <h1 className="text-2xl font-bold mb-2">초대 수락 완료</h1>
            <p className="text-muted-foreground">
              {invitationData.contestTitle} 심사위원으로 등록되었습니다.
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>심사 공모전 목록에서 배정된 공모전을 확인할 수 있습니다.</p>
          </div>
          <Link href="/judging">
            <Button className="w-full bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold">
              심사 공모전 보기
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#EA580C]/5 to-[#8B5CF6]/5">
        <Card className="w-full max-w-md p-8 border border-border text-center space-y-6">
          <div className="text-5xl">👋</div>
          <div>
            <h1 className="text-2xl font-bold mb-2">초대 거절 완료</h1>
            <p className="text-muted-foreground">
              {invitationData.contestTitle} 심사위원 초대를 거절하셨습니다.
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>향후 다른 공모전의 심사위원 초대를 받을 수 있습니다.</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="w-full border-border">
              홈으로 돌아가기
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 페이지 헤더 */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">심사위원 초대</h1>
            <p className="text-muted-foreground">공모전 심사위원으로 참여해주세요</p>
          </div>
        </div>
      </section>

      {/* 초대 정보 */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-2xl">
          <Card className="border border-border overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 p-6 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{invitationData.contestTitle}</h2>
                  <p className="text-muted-foreground">
                    주최: <span className="font-semibold text-foreground">{invitationData.hostName}</span> ({invitationData.hostCompany})
                  </p>
                </div>
                <Badge className="bg-[#EA580C] text-white shrink-0">초대</Badge>
              </div>
            </div>

            {/* 내용 */}
            <div className="p-6 space-y-6">
              {/* 초대 메시지 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">초대 메시지</h3>
                <Card className="p-4 bg-muted/50 border border-border">
                  <p className="text-foreground leading-relaxed">{invitationData.message}</p>
                </Card>
              </div>

              {/* 초대 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">초대 일시</p>
                  <p className="font-semibold">
                    {new Date(invitationData.invitedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">초대 토큰</p>
                  <p className="font-mono text-sm text-muted-foreground truncate">{token}</p>
                </div>
              </div>

              {/* 안내 */}
              <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex gap-3">
                  <span className="text-xl">ℹ️</span>
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">심사위원 역할</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>배정된 공모전의 출품작 심사</li>
                      <li>정해진 기준에 따른 점수 부여</li>
                      <li>심사 의견 작성</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* 액션 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="flex-1 border-border hover:bg-red-50 hover:text-red-600"
                >
                  거절
                </Button>
                <Button
                  onClick={handleAccept}
                  className="flex-1 bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold"
                >
                  수락
                </Button>
              </div>

              {/* 추가 정보 */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
                <p>
                  질문이 있으신가요?{' '}
                  <Link href="/" className="text-[#EA580C] hover:text-[#C2540A] font-semibold">
                    홈으로 돌아가기
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
