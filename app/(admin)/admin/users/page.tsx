import Link from 'next/link';
import { UserStatusActions } from '../_components/user-status-actions';
import type { Route } from 'next';
import { Filter, Search, ShieldCheck, UserCheck, Users } from 'lucide-react';
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
import { getAdminUserCounts, getAdminUsers } from '@/lib/data';
import { formatDate } from '@/lib/utils';

const ROLE_LABEL_MAP: Record<string, { label: string; color: string }> = {
  participant: { label: '참가자', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  host: { label: '주최자', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  judge: { label: '심사위원', color: 'bg-primary/10 text-primary' },
  admin: { label: '관리자', color: 'bg-destructive/10 text-destructive' },
  guest: { label: '비로그인', color: 'bg-muted text-muted-foreground' },
};

const STATUS_LABEL_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '활성', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  pending: { label: '대기', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  suspended: { label: '정지', color: 'bg-destructive/10 text-destructive' },
};

/** 한 페이지에 표시할 회원 수 */
const PAGE_SIZE = 50;

const VALID_ROLES = ['participant', 'host', 'judge', 'admin'];
const VALID_STATUSES = ['active', 'pending', 'suspended'];

type AdminUsersPageProps = {
  searchParams: Promise<{ page?: string; q?: string; role?: string; status?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  try {
    const { page, q, role, status } = await searchParams;
    const currentPage = Math.max(1, Number(page) || 1);
    const searchQuery = q?.trim() ?? '';
    const activeRole = VALID_ROLES.includes(role ?? '') ? role! : '';
    const activeStatus = VALID_STATUSES.includes(status ?? '') ? status! : '';

    /* 목록은 해당 페이지만, 통계는 count 쿼리로 — 전체 행을 가져오지 않는다 */
    const [userPage, counts] = await Promise.all([
      getAdminUsers({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: searchQuery || undefined,
        role: activeRole || undefined,
        status: activeStatus || undefined,
      }),
      getAdminUserCounts(),
    ]);

    const { users, total, pageSize } = userPage;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    /** 필터·페이지 URL 빌더 (지정하지 않은 조건은 현재 값 유지) */
    const buildUrl = (overrides: { q?: string; role?: string; status?: string; page?: number }) => {
      const params = new URLSearchParams();
      const nextQuery = overrides.q ?? searchQuery;
      const nextRole = overrides.role ?? activeRole;
      const nextStatus = overrides.status ?? activeStatus;
      const nextPage = overrides.page ?? 1;
      if (nextQuery) params.set('q', nextQuery);
      if (nextRole) params.set('role', nextRole);
      if (nextStatus) params.set('status', nextStatus);
      if (nextPage > 1) params.set('page', String(nextPage));
      const qs = params.toString();
      return `/admin/users${qs ? `?${qs}` : ''}` as Route;
    };

    const stats = [
      {
        label: '전체 회원',
        value: counts.total,
        sub: `활성 ${counts.active}명`,
        icon: Users,
        borderClass: 'border-l-primary',
        iconClass: 'bg-primary/10 text-primary',
      },
      {
        label: ROLE_LABEL_MAP.participant.label,
        value: counts.participant,
        sub: `대기 ${counts.pending}명`,
        icon: UserCheck,
        borderClass: 'border-l-sky-500',
        iconClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
      },
      {
        label: ROLE_LABEL_MAP.host.label,
        value: counts.host,
        sub: `${ROLE_LABEL_MAP.judge.label} ${counts.judge}명`,
        icon: ShieldCheck,
        borderClass: 'border-l-amber-500',
        iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      },
      {
        label: '관리 필요 계정',
        value: counts.suspended,
        sub: `${ROLE_LABEL_MAP.admin.label} ${counts.admin}명`,
        icon: Filter,
        borderClass: 'border-l-destructive',
        iconClass: 'bg-destructive/10 text-destructive',
      },
    ];

    /* 역할 필터 탭 (전체 포함) */
    const roleTabs = [
      { value: '', label: '전체', count: counts.total },
      { value: 'participant', label: ROLE_LABEL_MAP.participant.label, count: counts.participant },
      { value: 'host', label: ROLE_LABEL_MAP.host.label, count: counts.host },
      { value: 'judge', label: ROLE_LABEL_MAP.judge.label, count: counts.judge },
      { value: 'admin', label: ROLE_LABEL_MAP.admin.label, count: counts.admin },
    ];

    /* 상태 필터 탭 (전체 포함) */
    const statusTabs = [
      { value: '', label: '전체', count: counts.total },
      { value: 'active', label: STATUS_LABEL_MAP.active.label, count: counts.active },
      { value: 'pending', label: STATUS_LABEL_MAP.pending.label, count: counts.pending },
      { value: 'suspended', label: STATUS_LABEL_MAP.suspended.label, count: counts.suspended },
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
            <CardTitle>검색 및 필터</CardTitle>
            <CardDescription>이름·닉네임·이메일로 검색하고 역할과 상태로 좁혀볼 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 검색 폼 — 서버에서 처리되도록 GET 방식 사용 */}
            <form method="get" action="/admin/users" className="flex flex-wrap items-center gap-2">
              {activeRole ? <input type="hidden" name="role" value={activeRole} /> : null}
              {activeStatus ? <input type="hidden" name="status" value={activeStatus} /> : null}
              <div className="relative flex min-w-[240px] flex-1 items-center">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="이름, 닉네임, 이메일 검색..."
                  className="w-full rounded-lg border border-border bg-background/80 py-2 pl-4 pr-10 text-sm placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="absolute right-2 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label="검색"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              {searchQuery ? (
                <Link href={buildUrl({ q: '' })}>
                  <Button type="button" variant="ghost" size="sm">
                    검색 초기화
                  </Button>
                </Link>
              ) : null}
            </form>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">역할</p>
              <div className="flex flex-wrap gap-2">
                {roleTabs.map((tab) => {
                  const isActive = tab.value === activeRole;
                  return (
                    <Link key={tab.value || 'all'} href={buildUrl({ role: tab.value })} scroll={false}>
                      <span
                        className={`inline-block rounded-md border px-3 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'border-border bg-primary/10 font-medium text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">상태</p>
              <div className="flex flex-wrap gap-2">
                {statusTabs.map((tab) => {
                  const isActive = tab.value === activeStatus;
                  return (
                    <Link key={tab.value || 'all'} href={buildUrl({ status: tab.value })} scroll={false}>
                      <span
                        className={`inline-block rounded-md border px-3 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'border-border bg-primary/10 font-medium text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>회원 목록</CardTitle>
              <CardDescription>
                총 <span className="font-semibold text-primary">{total}</span>명 · 페이지 {currentPage}/{totalPages}
                {searchQuery ? (
                  <span className="ml-1">
                    · &apos;<span className="font-semibold text-foreground">{searchQuery}</span>&apos; 검색 결과
                  </span>
                ) : null}
              </CardDescription>
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
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                      조건에 맞는 회원이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const roleInfos = user.roles.map((role) => ROLE_LABEL_MAP[role] ?? {
                      label: role,
                      color: 'bg-muted text-muted-foreground',
                    });
                    const statusInfo = STATUS_LABEL_MAP[user.status] ?? {
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
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/users/${user.id}` as Route}>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                보기
                              </Button>
                            </Link>
                            {/* 수정은 편집 폼이 없어 뺐다 — 동작하지 않는 버튼을 두지 않는다 (ROADMAP 이관) */}
                            <UserStatusActions
                              userId={user.id}
                              status={user.status}
                              name={user.name || user.email}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 페이지 네비게이션 */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3">
            {currentPage > 1 ? (
              <Link href={buildUrl({ page: currentPage - 1 })} scroll={false}>
                <Button variant="outline" size="sm">← 이전</Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>← 이전</Button>
            )}
            <span className="text-sm tabular-nums text-muted-foreground">
              <span className="font-semibold text-foreground">{currentPage}</span> / {totalPages} 페이지
            </span>
            {currentPage < totalPages ? (
              <Link href={buildUrl({ page: currentPage + 1 })} scroll={false}>
                <Button variant="outline" size="sm">다음 →</Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>다음 →</Button>
            )}
          </div>
        ) : null}
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
