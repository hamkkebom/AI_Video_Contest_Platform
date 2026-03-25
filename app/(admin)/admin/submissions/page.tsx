export const dynamic = 'force-dynamic';

import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { REVIEW_TABS } from '@/config/constants';
import { getContests, getSubmissions, getUsers } from '@/lib/data';
import type { SubmissionStatus } from '@/lib/types';
import { SubmissionsSearchTable } from './submissions-search-table';

type AdminSubmissionsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AdminSubmissionsPage({ searchParams }: AdminSubmissionsPageProps) {
  try {
    const { tab } = await searchParams;
    const activeTab = REVIEW_TABS.some((item) => item.value === tab) ? (tab as SubmissionStatus) : 'pending_review';

    const [allSubmissions, allContests, allUsers] = await Promise.all([
      getSubmissions(),
      getContests(),
      getUsers(),
    ]);

    const contestsMap = new Map(allContests.map((c) => [c.id, c]));
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const countByStatus = REVIEW_TABS.reduce<Record<string, number>>((acc, item) => {
      acc[item.value] = allSubmissions.filter((s) => s.status === item.value).length;
      return acc;
    }, {});

    const filteredSubmissions = allSubmissions.filter((s) => s.status === activeTab);

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">제출물 관리</h1>
          <p className="text-sm text-muted-foreground">
            전체 {allSubmissions.length}개 · {allContests.length}개 공모전
          </p>
        </header>

        {/* 검수 현황 */}
        <section>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>검수 현황</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {REVIEW_TABS.map((reviewTab) => {
                const isActive = reviewTab.value === activeTab;
                return (
                  <Link key={reviewTab.value} href={`/admin/submissions?tab=${reviewTab.value}` as Route}>
                    <Button variant={isActive ? 'default' : 'outline'} size="sm" className="gap-1.5">
                      {reviewTab.label}
                      <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-xs text-muted-foreground">
                        {countByStatus[reviewTab.value] ?? 0}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* 제출물 테이블 */}
        <SubmissionsSearchTable
          submissions={filteredSubmissions.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            thumbnailUrl: s.thumbnailUrl,
            submitterName: s.submitterName,
            submitterPhone: s.submitterPhone,
            userId: s.userId,
            contestId: s.contestId,
            status: s.status,
            submittedAt: s.submittedAt,
            views: s.views,
            likeCount: s.likeCount,
          }))}
          contestsMap={Object.fromEntries([...contestsMap].map(([k, v]) => [k, { title: v.title }]))}
          usersMap={Object.fromEntries([...usersMap].map(([k, v]) => [k, { name: v.name, email: v.email }]))}
        />
      </div>
    );
  } catch (error) {
    console.error('Failed to load submissions:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">제출물 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
