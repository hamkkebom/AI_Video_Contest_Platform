export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CircleCheckBig, Clock3, MessageSquareMore, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Route } from 'next';
import { getAllInquiries, getUsersByIds } from '@/lib/data';
import { StatusSelect } from '../_components/status-select';
import { InquiryAnswer } from '../_components/inquiry-answer';
import { isEmailConfigured } from '@/lib/email';
import { formatDate } from '@/lib/utils';

/** inquiries.status CHECK 제약과 같은 값 */
const STATUS_OPTIONS = [
  { value: 'pending', label: '대기' },
  { value: 'in_progress', label: '처리중' },
  { value: 'resolved', label: '완료' },
];

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  try {
    const { status: statusFilter } = await searchParams;
    const inquiries = await getAllInquiries();

    /* 목록에 표시할 문의자만 조회한다 — 비회원 문의는 userId 가 null (전체 회원 조회 방지) */
    const inquiryUserIds = [
      ...new Set(inquiries.map((inquiry) => inquiry.userId).filter((id): id is string => Boolean(id))),
    ];
    const users = inquiryUserIds.length > 0 ? await getUsersByIds(inquiryUserIds) : [];

    const typeLabelMap: Record<string, { label: string; color: string }> = {
      general: { label: '일반', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
      support: { label: '기술지원', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
      agency: { label: '대행문의', color: 'bg-primary/10 text-primary' },
    };

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      pending: { label: '대기', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
      in_progress: { label: '처리중', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
      resolved: { label: '해결', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
    };

    /* 필터는 URL 파라미터로 — 서버 컴포넌트라 onClick 을 쓸 수 없다 */
    const activeStatus = STATUS_OPTIONS.some((o) => o.value === statusFilter) ? statusFilter : '';

    const statusCounts = {
      all: inquiries.length,
      pending: inquiries.filter((item) => item.status === 'pending').length,
      in_progress: inquiries.filter((item) => item.status === 'in_progress').length,
      resolved: inquiries.filter((item) => item.status === 'resolved').length,
    };

    /* 비회원 답변은 메일로만 전달된다 — 설정이 안 돼 있으면 답변을 쓰기 전에 알려준다 */
    const emailReady = isEmailConfigured();
    const guestPending = inquiries.filter((i) => !i.userId && i.guestEmail && !i.answer).length;

    const visibleInquiries = activeStatus ? inquiries.filter((i) => i.status === activeStatus) : inquiries;
    const sortedInquiries = [...visibleInquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = [
      {
        label: '전체 문의',
        value: statusCounts.all,
        sub: '최근 등록 순으로 정렬',
        icon: MessageSquareMore,
        borderClass: 'border-l-primary',
        iconClass: 'bg-primary/10 text-primary',
      },
      {
        label: '대기',
        value: statusCounts.pending,
        sub: '초기 응답 필요',
        icon: Clock3,
        borderClass: 'border-l-amber-500',
        iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      },
      {
        label: '처리중',
        value: statusCounts.in_progress,
        sub: '담당자 진행 상태',
        icon: Timer,
        borderClass: 'border-l-sky-500',
        iconClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
      },
      {
        label: '완료',
        value: statusCounts.resolved,
        sub: '응답 완료 건',
        icon: CircleCheckBig,
        borderClass: 'border-l-emerald-500',
        iconClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      },
    ];

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">문의 관리</h1>
          <p className="text-sm text-muted-foreground">문의 상태별 진행 현황을 추적하고 빠르게 응답합니다.</p>
        </header>

        {!emailReady && guestPending > 0 && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium">비회원 문의 {guestPending}건에 답변 메일을 보낼 수 없습니다</p>
            <p className="mt-0.5 text-xs">
              <code className="font-mono">RESEND_API_KEY</code> 가 설정되지 않았습니다. 답변은 저장되지만
              문의자에게 전달되지 않으니, 설정 전까지는 표시된 이메일로 직접 회신해 주세요.
            </p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className={`border-border border-l-4 ${stat.borderClass}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.iconClass}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>상태 필터</CardTitle>
              <CardDescription>상태별 문의 건수를 바로 확인합니다.</CardDescription>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">대시보드</Button>
            </Link>
          </CardHeader>
          {/* 링크 기반 필터 — 예전에는 onClick 없는 버튼이라 눌러도 아무 일이 없었다 */}
          <CardContent className="flex flex-wrap items-center gap-2">
            {[
              { value: '', label: '전체', count: statusCounts.all },
              ...STATUS_OPTIONS.map((o) => ({ ...o, count: statusCounts[o.value as keyof typeof statusCounts] ?? 0 })),
            ].map((opt) => {
              const isActive = activeStatus === opt.value;
              const href = (opt.value ? `/admin/inquiries?status=${opt.value}` : '/admin/inquiries') as Route;
              return (
                <Link
                  key={opt.value || 'all'}
                  href={href}
                  className={`rounded-md border border-border px-3 py-1.5 text-sm transition-colors ${
                    isActive ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label} ({opt.count})
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardHeader>
            <CardTitle>문의 목록</CardTitle>
            <CardDescription>제목, 작성자, 유형, 처리 상태를 기준으로 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">제목</TableHead>
                  <TableHead className="font-semibold">작성자</TableHead>
                  <TableHead className="font-semibold">유형</TableHead>
                  <TableHead className="font-semibold">상태</TableHead>
                  <TableHead className="font-semibold">작성일</TableHead>
                  <TableHead className="font-semibold">수정일</TableHead>
                  <TableHead className="font-semibold text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInquiries.map((inquiry) => {
                  const author = users.find((user) => user.id === inquiry.userId);
                  const typeInfo = typeLabelMap[inquiry.type] ?? {
                    label: inquiry.type,
                    color: 'bg-muted text-muted-foreground',
                  };
                  const statusInfo = statusLabelMap[inquiry.status] ?? {
                    label: inquiry.status,
                    color: 'bg-muted text-muted-foreground',
                  };

                  return (
                    <TableRow key={inquiry.id} className="transition-colors hover:bg-primary/5">
                      <TableCell>
                        <div>
                          <p className="font-medium">{inquiry.title}</p>
                          <p className="max-w-xs truncate text-xs text-muted-foreground">{inquiry.content}</p>
                          {inquiry.answer && (
                            /* 이미 등록된 답변 — 회원이라면 /my/inquiries 에서 이 내용을 본다 */
                            <p className="mt-1 max-w-xs truncate border-l-2 border-primary/40 pl-2 text-xs text-primary">
                              답변: {inquiry.answer}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {author ? (
                          <div>
                            <p>{author.name}</p>
                            <p className="text-xs text-muted-foreground">{author.email}</p>
                          </div>
                        ) : inquiry.guestEmail ? (
                          /* 비회원 문의 — 답변할 연락처를 함께 보여준다 */
                          <div>
                            <p>
                              {inquiry.guestName || '비회원'}
                              <span className="ml-1 text-xs text-muted-foreground">(비회원)</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{inquiry.guestEmail}</p>
                            {inquiry.guestPhone && (
                              <p className="text-xs text-muted-foreground">{inquiry.guestPhone}</p>
                            )}
                          </div>
                        ) : (
                          '알 수 없음'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${typeInfo.color} border-0 text-xs`}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} border-0 text-xs`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(inquiry.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(inquiry.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-2">
                          <StatusSelect
                            endpoint={`/api/admin/inquiries/${inquiry.id}`}
                            current={inquiry.status}
                            options={STATUS_OPTIONS}
                          />
                          <InquiryAnswer
                            inquiryId={inquiry.id}
                            answer={inquiry.answer}
                            guestEmail={inquiry.userId ? undefined : inquiry.guestEmail}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to load inquiries:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">문의 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
