import Link from 'next/link';
import type { Route } from 'next';
import { Building2, CheckCircle, Clock, XCircle } from 'lucide-react';
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
import { getCompanies, getCompanyMembers } from '@/lib/data';
import type { CompanyStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

/** 기업 승인 상태 라벨 */
const STATUS_LABEL_MAP: Record<CompanyStatus, { label: string; color: string }> = {
  pending: { label: '승인대기', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  approved: { label: '승인', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: '반려', color: 'bg-destructive/10 text-destructive' },
};

export default async function AdminCompaniesPage() {
  try {
    const [companies, members] = await Promise.all([
      getCompanies(),
      getCompanyMembers(),
    ]);

    /* 기업별 소속 멤버 수 집계 */
    const memberCountByCompany = members.reduce<Record<string, number>>((acc, m) => {
      acc[m.companyId] = (acc[m.companyId] ?? 0) + 1;
      return acc;
    }, {});

    const pendingCount = companies.filter((c) => c.status === 'pending').length;
    const approvedCount = companies.filter((c) => c.status === 'approved').length;
    const rejectedCount = companies.filter((c) => c.status === 'rejected').length;

    const stats = [
      {
        label: '전체 기업',
        value: companies.length,
        sub: `소속 멤버 ${members.length}명`,
        icon: Building2,
        borderClass: 'border-l-primary',
        iconClass: 'bg-primary/10 text-primary',
      },
      {
        label: '승인대기',
        value: pendingCount,
        sub: '검토 필요',
        icon: Clock,
        borderClass: 'border-l-amber-500',
        iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      },
      {
        label: '승인완료',
        value: approvedCount,
        sub: '정상 운영 중',
        icon: CheckCircle,
        borderClass: 'border-l-emerald-500',
        iconClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      },
      {
        label: '반려',
        value: rejectedCount,
        sub: '재신청 대기',
        icon: XCircle,
        borderClass: 'border-l-destructive',
        iconClass: 'bg-destructive/10 text-destructive',
      },
    ];

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">기업 관리</h1>
          <p className="text-sm text-muted-foreground">등록된 기업의 승인 상태를 검토하고 사업자등록증을 확인합니다.</p>
        </header>

        {/* 요약 카드 */}
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

        {/* 상태별 필터 데모 */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>상태별 필터</CardTitle>
            <CardDescription>기업 승인 상태별 분포를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <button type="button" className="rounded-md border border-border bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              전체 ({companies.length})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              승인대기 ({pendingCount})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              승인 ({approvedCount})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              반려 ({rejectedCount})
            </button>
          </CardContent>
        </Card>

        {/* 기업 테이블 */}
        <Card className="border-border overflow-hidden">
          <CardHeader>
            <CardTitle>기업 목록</CardTitle>
            <CardDescription>기업 정보와 승인 상태를 한 번에 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">기업명</TableHead>
                  <TableHead className="font-semibold">사업자번호</TableHead>
                  <TableHead className="font-semibold">대표자명</TableHead>
                  <TableHead className="font-semibold">소속 멤버</TableHead>
                  <TableHead className="font-semibold">상태</TableHead>
                  <TableHead className="font-semibold">등록일</TableHead>
                  <TableHead className="font-semibold text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => {
                  const statusInfo = STATUS_LABEL_MAP[company.status];
                  return (
                    <TableRow key={company.id} className="transition-colors hover:bg-primary/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.representativeName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{company.businessNumber}</TableCell>
                      <TableCell className="text-sm">{company.representativeName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {memberCountByCompany[company.id] ?? 0}명
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} border-0 text-xs`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(company.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/companies/${company.id}` as Route}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            상세
                          </Button>
                        </Link>
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
    console.error('Failed to load companies:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">기업 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
