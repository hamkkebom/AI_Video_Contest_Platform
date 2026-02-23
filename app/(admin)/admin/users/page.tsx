import Link from 'next/link';
import { Filter, ShieldCheck, UserCheck, Users } from 'lucide-react';
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
import { getUsers } from '@/lib/data';

const ROLE_LABEL_MAP: Record<string, { label: string; color: string }> = {
  participant: { label: '참가자', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  host: { label: '주최자', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  judge: { label: '심사위원', color: 'bg-primary/10 text-primary' },
  admin: { label: '관리자', color: 'bg-destructive/10 text-destructive' },
  guest: { label: '비로그인', color: 'bg-muted text-muted-foreground' },
};

export default async function AdminUsersPage() {
  try {
    const users = await getUsers();

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      active: { label: '활성', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
      pending: { label: '대기', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
      suspended: { label: '정지', color: 'bg-destructive/10 text-destructive' },
    };

    const roleCounts = {
      all: users.length,
      participant: users.filter((user) => user.roles.includes('participant')).length,
      host: users.filter((user) => user.roles.includes('host')).length,
      judge: users.filter((user) => user.roles.includes('judge')).length,
      admin: users.filter((user) => user.roles.includes('admin')).length,
    };

    const activeCount = users.filter((user) => user.status === 'active').length;
    const pendingCount = users.filter((user) => user.status === 'pending').length;
    const suspendedCount = users.filter((user) => user.status === 'suspended').length;

    const stats = [
      {
        label: '전체 회원',
        value: roleCounts.all,
        sub: `활성 ${activeCount}명`,
        icon: Users,
        borderClass: 'border-l-primary',
        iconClass: 'bg-primary/10 text-primary',
      },
      {
        label: ROLE_LABEL_MAP.participant.label,
        value: roleCounts.participant,
        sub: `대기 ${pendingCount}명`,
        icon: UserCheck,
        borderClass: 'border-l-sky-500',
        iconClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
      },
      {
        label: ROLE_LABEL_MAP.host.label,
        value: roleCounts.host,
        sub: `${ROLE_LABEL_MAP.judge.label} ${roleCounts.judge}명`,
        icon: ShieldCheck,
        borderClass: 'border-l-amber-500',
        iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      },
      {
        label: '관리 필요 계정',
        value: suspendedCount,
        sub: `${ROLE_LABEL_MAP.admin.label} ${roleCounts.admin}명`,
        icon: Filter,
        borderClass: 'border-l-destructive',
        iconClass: 'bg-destructive/10 text-destructive',
      },
    ];

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">회원 관리</h1>
          <p className="text-sm text-muted-foreground">회원 역할과 상태를 빠르게 검토하고 계정을 관리합니다.</p>
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
            <CardTitle>역할별 필터</CardTitle>
            <CardDescription>필터 UI 데모입니다. 역할별 분포를 빠르게 확인할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <button type="button" className="rounded-md border border-border bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              전체 ({roleCounts.all})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              참가자 ({roleCounts.participant})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              주최자 ({roleCounts.host})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              심사위원 ({roleCounts.judge})
            </button>
            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              관리자 ({roleCounts.admin})
            </button>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>회원 목록</CardTitle>
              <CardDescription>회원 프로필, 역할, 상태를 한 번에 확인합니다.</CardDescription>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">대시보드</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">이름</TableHead>
                  <TableHead className="font-semibold">이메일</TableHead>
                  <TableHead className="font-semibold">역할</TableHead>
                  <TableHead className="font-semibold">지역</TableHead>
                  <TableHead className="font-semibold">상태</TableHead>
                  <TableHead className="font-semibold">가입일</TableHead>
                  <TableHead className="font-semibold text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleInfos = user.roles.map((role) => ROLE_LABEL_MAP[role] ?? {
                    label: role,
                    color: 'bg-muted text-muted-foreground',
                  });
                  const statusInfo = statusLabelMap[user.status] ?? {
                    label: user.status,
                    color: 'bg-muted text-muted-foreground',
                  };

                  return (
                    <TableRow key={user.id} className="transition-colors hover:bg-primary/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            {user.nickname ? <p className="text-xs text-muted-foreground">@{user.nickname}</p> : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {roleInfos.map((roleInfo) => (
                            <Badge key={roleInfo.label} className={`${roleInfo.color} border-0 text-xs`}>{roleInfo.label}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.region ?? '-'}</TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} border-0 text-xs`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              보기
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            수정
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive">
                            정지
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
    console.error('Failed to load users:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">회원 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
