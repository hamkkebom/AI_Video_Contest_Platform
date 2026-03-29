import Link from 'next/link';
import type { Route } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { REVIEW_TABS } from '@/config/constants';
import { getAdminSubmissions, getContestById, getUsersByIds } from '@/lib/data';
import type { SubmissionStatus } from '@/lib/types';
import { ArrowLeft, Inbox, Video, ClipboardCheck, CheckCircle2, XCircle, Scale, Award, Eye, Heart, ListFilter, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { formatDateTime } from '@/lib/utils';

type ContestSubmissionsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; sort?: string; search?: string }>;
};

/** 제출물 상태별 뱃지 스타일 (hover 반전 포함) */
const statusBadgeMap: Record<SubmissionStatus, { label: string; className: string }> = {
  pending_review: { label: '검수대기', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white' },
  approved: { label: '검수완료', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white' },
  rejected: { label: '반려', className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white' },
  auto_rejected: { label: '자동반려', className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white' },
  judging: { label: '심사중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white' },
  judged: { label: '심사완료', className: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-500 dark:hover:text-white' },
};

/** 상태별 카운트 카드 설정 (전체 포함) */
const statusCardConfig: Array<{ key: string; label: string; icon: typeof ClipboardCheck; color: string; countColor: string }> = [
  { key: 'all', label: '전체', icon: ListFilter, color: 'text-primary', countColor: 'text-foreground' },
  { key: 'pending_review', label: '검수대기', icon: ClipboardCheck, color: 'text-amber-500', countColor: 'text-amber-600' },
  { key: 'approved', label: '검수완료', icon: CheckCircle2, color: 'text-emerald-500', countColor: 'text-emerald-600' },
  { key: 'rejected', label: '반려', icon: XCircle, color: 'text-rose-500', countColor: 'text-rose-600' },
  { key: 'judging', label: '심사중', icon: Scale, color: 'text-sky-500', countColor: 'text-sky-600' },
  { key: 'judged', label: '심사완료', icon: Award, color: 'text-violet-500', countColor: 'text-violet-600' },
];

/** 유효한 탭 값 목록 (전체 포함) */
const VALID_TABS = ['all', ...REVIEW_TABS.map((t) => t.value)];

export default async function AdminContestSubmissionsPage({ params, searchParams }: ContestSubmissionsPageProps) {
  try {
    const { id } = await params;
    const { tab, sort, search } = await searchParams;
    const activeTab = VALID_TABS.includes(tab ?? '') ? tab! : 'all';
    const activeSort = sort === 'newest' ? 'newest' : 'oldest';
    const searchQuery = search?.trim().toLowerCase() || '';

    const [allSubmissions, contest] = await Promise.all([
      getAdminSubmissions({ contestId: id }),
      getContestById(id),
    ]);

    const userIds = [...new Set(allSubmissions.map((s) => s.userId))];
    const users = await getUsersByIds(userIds);
    const usersMap = new Map(users.map((u) => [u.id, u]));

    /* 상태별 카운트 (전체 포함) */
    const countByStatus: Record<string, number> = { all: allSubmissions.length };
    for (const item of REVIEW_TABS) {
      countByStatus[item.value] = allSubmissions.filter((s) => s.status === item.value).length;
    }

    /* 자동반려 카운트를 반려에 합산 */
    const autoRejectedCount = allSubmissions.filter((s) => s.status === 'auto_rejected').length;
    if (countByStatus['rejected'] !== undefined) {
      countByStatus['rejected'] += autoRejectedCount;
    }

    /* 탭 필터링 */
    let filteredSubmissions = activeTab === 'all'
      ? [...allSubmissions]
      : allSubmissions.filter((s) => s.status === activeTab);

    /* 검색 필터링 (제목, 제출자 이름, 닉네임) */
    if (searchQuery) {
      filteredSubmissions = filteredSubmissions.filter((s) => {
        const creator = usersMap.get(s.userId);
        return (
          s.title.toLowerCase().includes(searchQuery) ||
          (s.submitterName && s.submitterName.toLowerCase().includes(searchQuery)) ||
          (creator?.name && creator.name.toLowerCase().includes(searchQuery)) ||
          (creator?.nickname && creator.nickname.toLowerCase().includes(searchQuery)) ||
          (creator?.email && creator.email.toLowerCase().includes(searchQuery))
        );
      });
    }

    /* 정렬 */
    filteredSubmissions.sort((a, b) => {
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return activeSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    /** 탭 URL 빌더 (현재 정렬+검색 유지) */
    const buildTabUrl = (tabValue: string) => {
      const p = new URLSearchParams();
      if (tabValue !== 'all') p.set('tab', tabValue);
      if (activeSort !== 'oldest') p.set('sort', activeSort);
      if (searchQuery) p.set('search', searchQuery);
      const qs = p.toString();
      return `/admin/contests/${id}/submissions${qs ? `?${qs}` : ''}` as Route;
    };

    /** 정렬 URL 빌더 (현재 탭+검색 유지) */
    const buildSortUrl = (sortValue: string) => {
      const p = new URLSearchParams();
      if (activeTab !== 'all') p.set('tab', activeTab);
      if (sortValue !== 'oldest') p.set('sort', sortValue);
      if (searchQuery) p.set('search', searchQuery);
      const qs = p.toString();
      return `/admin/contests/${id}/submissions${qs ? `?${qs}` : ''}` as Route;
    };

    /** 현재 탭 라벨 */
    const activeTabLabel = statusCardConfig.find((c) => c.key === activeTab)?.label ?? activeTab;

    return (
      <div className="space-y-6 pb-10">
        {/* 뒤로 가기 */}
        <div>
          <Link href={`/admin/contests/${id}` as Route}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              공모전 상세
            </Button>
          </Link>
        </div>

        {/* 히어로 헤더 */}
        <section className="relative -mx-4 overflow-hidden rounded-xl bg-gradient-to-b from-primary/8 via-primary/3 to-background border border-border px-6 py-8 sm:px-8 sm:py-10">
          {/* 배경 장식 */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-orange-500/5 blur-3xl" />
          </div>

          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground">영상 관리</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{contest?.title ?? id}</h1>
              </div>
            </div>
          </div>
        </section>

        {/* 상태별 카운트 카드 (전체 포함, 6열) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {statusCardConfig.map(({ key, label, icon: Icon, color, countColor }) => {
            const isActive = key === activeTab;
            return (
              <Link key={key} href={buildTabUrl(key)} scroll={false}>
                <Card className={`p-4 border transition-all cursor-pointer hover:shadow-md hover:border-primary/40 ${isActive ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : color}`} />
                    {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className={`text-2xl font-bold ${isActive ? 'text-primary' : countColor}`}>{countByStatus[key] ?? 0}</p>
                  <p className="text-xs font-bold text-muted-foreground mt-0.5">{label}</p>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 출품 영상 목록 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">출품 영상 목록</h2>
              <p className="text-sm text-muted-foreground">
                {activeTabLabel} <span className="font-bold text-primary">{filteredSubmissions.length}</span>건
                {searchQuery && (
                  <span className="ml-2">
                    · &apos;<span className="text-foreground font-semibold">{searchQuery}</span>&apos; 검색 결과
                  </span>
                )}
              </p>
            </div>

            {/* 검색 + 정렬 */}
            <div className="flex items-center gap-3 flex-wrap">
              <SearchInput
                basePath={`/admin/contests/${id}/submissions`}
                currentSearch={searchQuery}
                extraParams={{ ...(activeTab !== 'all' ? { tab: activeTab } : {}), ...(activeSort !== 'oldest' ? { sort: activeSort } : {}) }}
                placeholder="제목, 이름, 닉네임 검색..."
              />
              <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Link href={buildSortUrl('newest')} scroll={false}>
                <Button
                  variant={activeSort === 'newest' ? 'default' : 'outline'}
                  size="sm"
                  className={`gap-1 text-xs h-7 ${activeSort === 'newest' ? 'bg-primary hover:bg-primary/90' : ''}`}
                >
                  <ArrowDown className="h-3 w-3" />
                  최신순
                </Button>
              </Link>
              <Link href={buildSortUrl('oldest')} scroll={false}>
                <Button
                  variant={activeSort === 'oldest' ? 'default' : 'outline'}
                  size="sm"
                  className={`gap-1 text-xs h-7 ${activeSort === 'oldest' ? 'bg-primary hover:bg-primary/90' : ''}`}
                >
                  <ArrowUp className="h-3 w-3" />
                  오래된순
                </Button>
              </Link>
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <Card className="border-border">
              <CardContent className="space-y-3 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Inbox className="h-7 w-7 text-muted-foreground/60" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">출품 영상이 없습니다</p>
                  <p className="text-sm text-muted-foreground mt-1">{activeTabLabel} 상태의 출품 영상이 아직 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((submission) => {
                const creator = usersMap.get(submission.userId);
                const statusInfo = statusBadgeMap[submission.status];
                const showReactions = submission.status !== 'pending_review';

                return (
                  <Link key={submission.id} href={`/gallery/${submission.id}` as Route} className="block">
                    <Card className="border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* 썸네일 */}
                          <div className="shrink-0">
                            <img
                              src={submission.thumbnailUrl}
                              alt={submission.title}
                              className="h-20 w-36 rounded-lg border border-border object-cover shadow-sm group-hover:shadow-md transition-shadow"
                            />
                          </div>

                          {/* 정보 */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-bold text-foreground group-hover:text-primary transition-colors">{submission.title}</p>
                                <p className="line-clamp-1 text-sm text-muted-foreground mt-0.5">{submission.description}</p>
                              </div>
                              <Badge className={`shrink-0 ${statusInfo.className}`}>{statusInfo.label}</Badge>
                            </div>

                            {submission.status === 'rejected' && submission.rejectionReason && (
                              <p className="text-xs text-destructive mt-1 line-clamp-1">사유: {submission.rejectionReason}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{submission.submitterName || creator?.name || '알 수 없음'}</span>
                              <span className="hidden sm:inline">·</span>
                              <span>{creator?.email ?? '-'}</span>
                              <span className="hidden sm:inline">·</span>
                              <span>{formatDateTime(submission.submittedAt)}</span>
                            </div>

                            {showReactions && (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="font-medium text-foreground">{submission.views}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3.5 w-3.5" />
                                  <span className="font-medium text-foreground">{submission.likeCount}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load contest submissions:', error);
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">출품 영상 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
