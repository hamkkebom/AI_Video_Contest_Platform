import { notFound } from 'next/navigation';
import { AlertCircle, CheckCircle2, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getJudgeInvite } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { AcceptInvite } from './_components/accept-invite';

/** 초대 상태는 수락 즉시 바뀐다 — 캐시하지 않는다 */
export const dynamic = 'force-dynamic';

/** 초대 링크는 검색에 잡히면 안 된다 */
export const metadata = {
  title: '심사위원 초대',
  robots: { index: false, follow: false },
};

/**
 * 심사위원 초대 수락 화면.
 *
 * 로그인을 요구하지 않는다 — 아직 계정이 없는 사람이 여는 화면이기 때문이다.
 * 대신 수락 자체는 서버에서 토큰과 계정 이메일이 함께 맞을 때만 통과한다(마이그레이션 055).
 */
export default async function JudgeInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getJudgeInvite(token);

  /* 없는 토큰은 404 — "만료됐다"고 알려주면 토큰 유효성을 떠볼 수 있다 */
  if (!invite) notFound();

  const closed = invite.isAccepted || invite.isExpired;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-24 pb-20">
      <Card className="border-border">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Scale className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                심사위원 초대
              </p>
              <h1 className="text-2xl font-bold tracking-tight">{invite.contestTitle}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              이 공모전의 심사위원으로 초대되었습니다.
            </p>
          </div>

          {invite.isAccepted ? (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">이미 수락된 초대입니다</p>
                <p className="text-muted-foreground">심사 화면에서 배정된 출품작을 확인하세요.</p>
              </div>
            </div>
          ) : invite.isExpired ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">초대가 만료되었습니다</p>
                <p className="text-amber-700 dark:text-amber-400">
                  {formatDate(invite.expiresAt)} 까지였습니다. 주최자에게 재발송을 요청해 주세요.
                </p>
              </div>
            </div>
          ) : (
            <AcceptInvite
              token={token}
              contestTitle={invite.contestTitle}
              maskedEmail={invite.maskedEmail}
            />
          )}

          {!closed && (
            <p className="text-center text-xs text-muted-foreground">
              유효기간 {formatDate(invite.expiresAt)} 까지
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
