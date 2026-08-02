import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageSquareMore, MessageSquareReply } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAuthProfile, getMyInquiries } from '@/lib/data';
import { formatDateTime } from '@/lib/utils';

/** 답변 여부는 요청 시점에 바뀐다 — 캐시하지 않는다 */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: '내 문의',
  description: '내가 남긴 문의와 관리자 답변을 확인합니다.',
};

const TYPE_LABEL: Record<string, string> = {
  general: '일반',
  support: '기술지원',
  agency: '대행문의',
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: '접수됨', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  in_progress: { label: '처리중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  resolved: { label: '완료', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
};

/**
 * 내 문의함.
 *
 * 문의를 넣고 나면 그 뒤로 아무것도 볼 수 없던 화면을 메운다. 답변은 마이그레이션 053 의
 * inquiries.answer 에 저장되고, RLS "본인만 조회"(auth.uid() = user_id)가 다른 사람 문의를 막는다.
 * 비회원 문의는 계정이 없어 여기 뜨지 않는다 — 그건 별도 회신이 필요하다.
 */
export default async function MyInquiriesPage() {
  const profile = await getAuthProfile();
  if (!profile) redirect('/login?redirectTo=/my/inquiries');

  const inquiries = await getMyInquiries();

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">내 문의</h1>
        <p className="text-sm text-muted-foreground">
          남긴 문의와 답변을 모아 봅니다. 답변이 등록되면 이 화면에 바로 표시됩니다.
        </p>
      </header>

      {inquiries.length === 0 ? (
        <Card className="border-border border-dashed">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <MessageSquareMore className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">아직 남긴 문의가 없습니다</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              공모전 참가나 대행 제작에 관해 궁금한 점이 있으면 문의를 남겨 주세요.
            </p>
            <Link href="/support/inquiry">
              <Button className="mt-1 cursor-pointer">문의하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {inquiries.map((inquiry) => {
            const status = STATUS_META[inquiry.status] ?? {
              label: inquiry.status,
              className: 'bg-muted text-muted-foreground',
            };

            return (
              <li key={inquiry.id}>
                <Card className="border-border">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="font-semibold">{inquiry.title}</h2>
                        <p className="text-xs text-muted-foreground">
                          {TYPE_LABEL[inquiry.type] ?? inquiry.type} · {formatDateTime(inquiry.createdAt)}
                        </p>
                      </div>
                      <Badge className={`${status.className} border-0 text-xs`}>{status.label}</Badge>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{inquiry.content}</p>

                    {inquiry.answer ? (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                          <MessageSquareReply className="h-3.5 w-3.5" />
                          운영팀 답변
                          {inquiry.answeredAt && (
                            <span className="font-normal text-muted-foreground">
                              · {formatDateTime(inquiry.answeredAt)}
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{inquiry.answer}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        아직 답변이 등록되지 않았습니다. 답변이 달리면 이 자리에 표시됩니다.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
