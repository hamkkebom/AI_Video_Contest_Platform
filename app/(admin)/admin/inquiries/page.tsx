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
import { getAllInquiries, getUsers } from '@/lib/data';

export default async function AdminInquiriesPage() {
  try {
    const [inquiries, users] = await Promise.all([getAllInquiries(), getUsers()]);

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

    const statusCounts = {
      all: inquiries.length,
      pending: inquiries.filter((item) => item.status === 'pending').length,
      in_progress: inquiries.filter((item) => item.status === 'in_progress').length,
      resolved: inquiries.filter((item) => item.status === 'resolved').length,
    };

    const sortedInquiries = [...inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
              <CardDescription>필터 UI 데모입니다. 상태별 문의 건수를 바로 확인합니다.</CardDescription>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">대시보드</Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-md border border-border bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              전체 ({statusCounts.all})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              대기 ({statusCounts.pending})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              처리중 ({statusCounts.in_progress})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              완료 ({statusCounts.resolved})
            </button>
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
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{author?.name ?? '알 수 없음'}</TableCell>
                      <TableCell>
                        <Badge className={`${typeInfo.color} border-0 text-xs`}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} border-0 text-xs`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(inquiry.updatedAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            보기
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            답변
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-700 dark:text-emerald-300">
                            완료
                          </Button>
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
