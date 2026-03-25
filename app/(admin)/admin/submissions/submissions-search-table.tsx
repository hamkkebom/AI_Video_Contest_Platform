'use client';

import { useState, useMemo } from 'react';
import { Search, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SubmissionRow } from '@/app/(admin)/admin/contests/[id]/submissions/submission-row';
import { formatDate } from '@/lib/utils';
import type { SubmissionStatus } from '@/lib/types';

const statusBadgeMap: Record<SubmissionStatus, { label: string; className: string }> = {
  pending_review: { label: '검수대기', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  approved: { label: '승인', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: '반려', className: 'bg-destructive/10 text-destructive' },
  auto_rejected: { label: '자동반려', className: 'bg-destructive/10 text-destructive' },
  judging: { label: '심사중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  judged: { label: '심사완료', className: 'bg-primary/10 text-primary' },
};

interface SubmissionItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  submitterName?: string;
  submitterPhone?: string;
  userId: string;
  contestId: string;
  status: SubmissionStatus;
  submittedAt: string;
  views: number;
  likeCount: number;
}

interface CreatorInfo {
  name: string;
  email: string;
}

interface ContestInfo {
  title: string;
}

interface Props {
  submissions: SubmissionItem[];
  contestsMap: Record<string, ContestInfo>;
  usersMap: Record<string, CreatorInfo>;
}

export function SubmissionsSearchTable({ submissions, contestsMap, usersMap }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return submissions;
    const q = query.toLowerCase().trim();
    return submissions.filter((s) => {
      const creator = usersMap[s.userId];
      const contest = contestsMap[s.contestId];
      return (
        s.title.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.submitterName || '').toLowerCase().includes(q) ||
        (s.submitterPhone || '').includes(q) ||
        (creator?.name || '').toLowerCase().includes(q) ||
        (creator?.email || '').toLowerCase().includes(q) ||
        (contest?.title || '').toLowerCase().includes(q)
      );
    });
  }, [submissions, query, contestsMap, usersMap]);

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">제출물 목록</h2>
          <p className="text-sm text-muted-foreground">
            {query.trim() ? (
              <>검색 결과 <span className="font-bold text-primary">{filtered.length}</span>건 / 전체 {submissions.length}건</>
            ) : (
              <>총 <span className="font-bold text-primary">{submissions.length}</span>건</>
            )}
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="작품명, 제출자, 계정, 공모전 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <Card className="border-border">
          <CardContent className="space-y-3 py-14 text-center">
            <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {query.trim() ? `"${query}"에 대한 검색 결과가 없습니다.` : '선택한 상태의 제출물이 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>작품</TableHead>
                  <TableHead>공모전</TableHead>
                  <TableHead>제출자</TableHead>
                  <TableHead>계정</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>제출일</TableHead>
                  <TableHead>반응</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 100).map((submission) => {
                  const creator = usersMap[submission.userId];
                  const contest = contestsMap[submission.contestId];
                  const statusInfo = statusBadgeMap[submission.status];
                  return (
                    <SubmissionRow key={submission.id} href={`/gallery/${submission.id}`}>
                      <TableCell>
                        <div className="flex min-w-[220px] items-center gap-3">
                          <img
                            src={submission.thumbnailUrl}
                            alt={submission.title}
                            className="h-14 w-24 rounded-md border border-border object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{submission.title}</p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">{submission.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[160px] truncate text-sm text-muted-foreground">
                          {contest?.title ?? submission.contestId}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{submission.submitterName || '-'}</p>
                          <p className="text-xs text-muted-foreground">{submission.submitterPhone || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{creator?.name ?? '알 수 없음'}</p>
                          <p className="text-xs text-muted-foreground">{creator?.email ?? '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(submission.submittedAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        조회 {submission.views} · 좋아요 {submission.likeCount}
                      </TableCell>
                    </SubmissionRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
