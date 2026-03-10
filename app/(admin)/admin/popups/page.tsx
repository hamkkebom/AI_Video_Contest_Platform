import Link from 'next/link';
import type { Route } from 'next';
import { Megaphone, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllPopups } from '@/lib/data';
import type { Popup, PopupStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

function getStatusBadgeClass(status: PopupStatus): string {
  if (status === 'active') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (status === 'inactive') return 'bg-muted text-muted-foreground';
  return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
}

function getStatusLabel(status: PopupStatus): string {
  if (status === 'active') return '활성';
  if (status === 'inactive') return '비활성';
  return '초안';
}

function formatDisplayRange(popup: Popup): string {
  return `${formatDateTime(popup.displayStartAt)} ~ ${formatDateTime(popup.displayEndAt)}`;
}

export default async function AdminPopupsPage() {
  try {
    const popups = await getAllPopups();
    const now = new Date();

    const activeCount = popups.filter((popup) => popup.status === 'active').length;
    const inactiveCount = popups.filter((popup) => popup.status === 'inactive').length;
    const draftCount = popups.filter((popup) => popup.status === 'draft').length;
    const scheduledCount = popups.filter((popup) => new Date(popup.displayStartAt) > now).length;

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">팝업 관리</h1>
          <p className="text-sm text-muted-foreground">운영 팝업의 노출 상태와 기간을 관리합니다.</p>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">전체</p>
              <p className="text-2xl font-bold tabular-nums">{popups.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">활성</p>
              <p className="text-2xl font-bold tabular-nums">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-muted-foreground">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">비활성</p>
              <p className="text-2xl font-bold tabular-nums">{inactiveCount}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">초안</p>
              <p className="text-2xl font-bold tabular-nums">{draftCount}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-sky-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">예약</p>
              <p className="text-2xl font-bold tabular-nums">{scheduledCount}</p>
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Megaphone className="h-5 w-5" />
              팝업 목록
            </CardTitle>
            <Link href={'/admin/popups/new' as Route}>
              <Button size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                새 팝업
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>제목</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>노출 기간</TableHead>
                  <TableHead>순서</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {popups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      등록된 팝업이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  popups.map((popup) => (
                    <TableRow key={popup.id} className="transition-colors hover:bg-primary/5">
                      <TableCell>
                        <Link href={`/admin/popups/${popup.id}` as Route} className="font-medium hover:text-primary">
                          {popup.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(popup.status)}>{getStatusLabel(popup.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDisplayRange(popup)}</TableCell>
                      <TableCell className="text-sm tabular-nums">{popup.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/popups/${popup.id}` as Route}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            수정
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to load popups:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">팝업 목록을 불러올 수 없습니다.</p>
      </div>
    );
  }
}
