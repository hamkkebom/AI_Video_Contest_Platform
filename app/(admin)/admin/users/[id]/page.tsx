import Link from 'next/link';
import { Activity, Globe, Shield, UserCog } from 'lucide-react';
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
import { getActivityLogs, getIpLogs, getUsers } from '@/lib/mock';

const ROLE_LABEL_MAP: Record<string, { label: string; color: string }> = {
  participant: { label: '참가자', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  host: { label: '주최자', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  judge: { label: '심사위원', color: 'bg-primary/10 text-primary' },
  admin: { label: '관리자', color: 'bg-destructive/10 text-destructive' },
  guest: { label: '비로그인', color: 'bg-muted text-muted-foreground' },
};

type AdminUserDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  try {
    const { id } = await params;
    const [users, allActivityLogs, allIpLogs] = await Promise.all([getUsers(), getActivityLogs(), getIpLogs()]);

    const user = users.find((item) => item.id === id);

    if (!user) {
      return (
        <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-destructive">해당 회원을 찾을 수 없습니다</p>
          <Link href="/admin/users" className="mt-4 inline-block">
            <Button variant="outline">회원 목록으로</Button>
          </Link>
        </div>
      );
    }

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      active: { label: '활성', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
      pending: { label: '대기', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
      suspended: { label: '정지', color: 'bg-destructive/10 text-destructive' },
    };

    const riskLabelMap: Record<string, { label: string; color: string }> = {
      low: { label: '낮음', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
      medium: { label: '보통', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
      high: { label: '높음', color: 'bg-destructive/10 text-destructive' },
    };

    const actionLabelMap: Record<string, string> = {
      create_submission: '출품작 등록',
      like_submission: '좋아요',
    };

    const roleInfos = user.roles.map((role) => ROLE_LABEL_MAP[role] ?? { label: role, color: 'bg-muted text-muted-foreground' });
    const statusInfo = statusLabelMap[user.status] ?? { label: user.status, color: 'bg-muted text-muted-foreground' };

    const userActivityLogs = allActivityLogs
      .filter((log) => log.userId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const userIpLogs = allIpLogs
      .filter((log) => log.userId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">회원 상세</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{user.name}</h1>
          <p className="text-sm text-muted-foreground">프로필, 활동, 보안 로그를 한 화면에서 관리합니다.</p>
        </header>

        <Card className="border-border">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {user.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  {roleInfos.map((roleInfo) => (
                    <Badge key={roleInfo.label} className={`${roleInfo.color} border-0`}>{roleInfo.label}</Badge>
                  ))}
                  <Badge className={`${statusInfo.color} border-0`}>{statusInfo.label}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users">
                <Button variant="outline">목록</Button>
              </Link>
              <Button variant="outline">역할 변경</Button>
              <Button variant="outline">상태 변경</Button>
              <Button variant="ghost" className="text-destructive hover:text-destructive">
                계정 정지
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">닉네임</p>
              <p className="font-medium">{user.nickname ?? '미설정'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">소속</p>
              <p className="font-medium">개인</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">지역</p>
              <p className="font-medium">{user.region ?? '미설정'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">가입일</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border border-l-4 border-l-primary">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">활동 로그</p>
                  <p className="text-3xl font-bold tracking-tight">{userActivityLogs.length}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-sky-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">IP 접속 로그</p>
                  <p className="text-3xl font-bold tracking-tight">{userIpLogs.length}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">관리 액션</p>
                  <p className="text-3xl font-bold tracking-tight">데모</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <UserCog className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border overflow-hidden">
          <CardHeader>
            <CardTitle>활동 내역</CardTitle>
            <CardDescription>최근 활동 로그를 시간순으로 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {userActivityLogs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">활동 로그가 없습니다.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>활동</TableHead>
                    <TableHead>대상 타입</TableHead>
                    <TableHead>대상 ID</TableHead>
                    <TableHead>일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{actionLabelMap[log.action] ?? log.action}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary">{log.targetType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.targetId}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>보안 로그</CardTitle>
              <CardDescription>IP 로그와 위험 수준을 확인합니다.</CardDescription>
            </div>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            {userIpLogs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">IP 로그가 없습니다.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>IP 주소</TableHead>
                    <TableHead>국가</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>위험 수준</TableHead>
                    <TableHead>일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userIpLogs.map((log) => {
                    const riskInfo = riskLabelMap[log.riskLevel] ?? { label: log.riskLevel, color: 'bg-muted text-muted-foreground' };

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                        <TableCell>{log.country}</TableCell>
                        <TableCell>{log.region}</TableCell>
                        <TableCell>
                          <Badge className={`${riskInfo.color} border-0 text-xs`}>{riskInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to load user detail:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">회원 정보를 불러올 수 없습니다</p>
      </div>
    );
  }
}
