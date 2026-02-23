import { BriefcaseBusiness, CircleCheckBig, ClipboardList, Hourglass } from 'lucide-react';
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
import { getAgencyRequests } from '@/lib/mock';

export default async function AdminAgencyRequestsPage() {
  try {
    const requests = await getAgencyRequests();

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      new: { label: '신규', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
      reviewing: { label: '검토중', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
      quoted: { label: '견적발송', color: 'bg-primary/10 text-primary' },
      closed: { label: '종료', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
    };

    const counts = {
      all: requests.length,
      new: requests.filter((item) => item.status === 'new').length,
      reviewing: requests.filter((item) => item.status === 'reviewing').length,
      quoted: requests.filter((item) => item.status === 'quoted').length,
      closed: requests.filter((item) => item.status === 'closed').length,
    };

    const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = [
      {
        label: '전체 의뢰',
        value: counts.all,
        sub: `신규 ${counts.new}건`,
        icon: BriefcaseBusiness,
        borderClass: 'border-l-primary',
        iconClass: 'bg-primary/10 text-primary',
      },
      {
        label: '검토중',
        value: counts.reviewing,
        sub: '내부 확인 단계',
        icon: Hourglass,
        borderClass: 'border-l-sky-500',
        iconClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
      },
      {
        label: '견적발송',
        value: counts.quoted,
        sub: '클라이언트 회신 대기',
        icon: ClipboardList,
        borderClass: 'border-l-amber-500',
        iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      },
      {
        label: '종료',
        value: counts.closed,
        sub: '완료 또는 보류 종료',
        icon: CircleCheckBig,
        borderClass: 'border-l-emerald-500',
        iconClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      },
    ];

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">대행 의뢰 관리</h1>
          <p className="text-sm text-muted-foreground">브랜드 대행 의뢰를 상태별로 관리하고 대응 이력을 추적합니다.</p>
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
          <CardHeader>
            <CardTitle>상태 필터</CardTitle>
            <CardDescription>필터 UI 데모입니다. 의뢰 우선순위를 빠르게 파악할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <button type="button" className="rounded-md border border-border bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              전체 ({counts.all})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              신규 ({counts.new})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              검토중 ({counts.reviewing})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              견적발송 ({counts.quoted})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              종료 ({counts.closed})
            </button>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardHeader>
            <CardTitle>의뢰 목록</CardTitle>
            <CardDescription>회사 정보, 예산, 상태를 기준으로 후속 액션을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>회사명</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>예산</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>접수일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequests.map((request) => {
                  const statusInfo = statusLabelMap[request.status] ?? {
                    label: request.status,
                    color: 'bg-muted text-muted-foreground',
                  };

                  return (
                    <TableRow key={request.id} className="transition-colors hover:bg-primary/5">
                      <TableCell>
                        <p className="font-medium">{request.companyName}</p>
                        <p className="max-w-xs truncate text-xs text-muted-foreground">{request.message}</p>
                      </TableCell>
                      <TableCell>{request.contactName}</TableCell>
                      <TableCell>
                        <p className="text-sm">{request.contactEmail}</p>
                        <p className="text-xs text-muted-foreground">{request.phoneNumber ?? '-'}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{request.budgetRange ?? '-'}</TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} border-0 text-xs`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            상세
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            상태 변경
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
    console.error('Failed to load agency requests:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">대행 의뢰 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
