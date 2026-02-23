import Link from 'next/link';
import { BookText, Megaphone, Newspaper, PlusCircle } from 'lucide-react';
import { ARTICLE_TYPES } from '@/config/constants';
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
import { getAllArticles, getUsers } from '@/lib/data';

export default async function AdminArticlesPage() {
  try {
    const [articles, users] = await Promise.all([getAllArticles(), getUsers()]);

    const typeColorMap: Record<string, string> = {
      notice: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
      program: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
      insight: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    };

    const typeLabelMap: Record<string, { label: string; color: string }> = {};
    for (const articleType of ARTICLE_TYPES) {
      typeLabelMap[articleType.value] = {
        label: articleType.label,
        color: typeColorMap[articleType.value] ?? 'bg-muted text-muted-foreground',
      };
    }

    const typeCounts: Record<string, number> = {};
    for (const articleType of ARTICLE_TYPES) {
      typeCounts[articleType.value] = articles.filter((article) => article.type === articleType.value).length;
    }

    const publishedCount = articles.filter((article) => article.isPublished).length;
    const privateCount = articles.length - publishedCount;

    const stats = [
      {
        label: '전체 아티클',
        value: articles.length,
        sub: `발행 ${publishedCount}개`,
        icon: BookText,
        borderClass: 'border-l-primary',
        iconClass: 'bg-primary/10 text-primary',
      },
      {
        label: '공지',
        value: typeCounts.notice ?? 0,
        sub: '운영 공지 콘텐츠',
        icon: Megaphone,
        borderClass: 'border-l-orange-500',
        iconClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
      },
      {
        label: '프로그램',
        value: typeCounts.program ?? 0,
        sub: '프로그램 콘텐츠',
        icon: Newspaper,
        borderClass: 'border-l-violet-500',
        iconClass: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
      },
      {
        label: '비공개',
        value: privateCount,
        sub: '검수 중 콘텐츠',
        icon: PlusCircle,
        borderClass: 'border-l-destructive',
        iconClass: 'bg-destructive/10 text-destructive',
      },
    ];

    const sortedArticles = [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">아티클 관리</h1>
          <p className="text-sm text-muted-foreground">유형과 발행 상태를 기준으로 콘텐츠를 운영합니다.</p>
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
              <CardTitle>유형/상태 필터</CardTitle>
              <CardDescription>필터 UI 데모입니다. 유형별 콘텐츠 비중을 확인할 수 있습니다.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/dashboard">
                <Button variant="outline">대시보드</Button>
              </Link>
              <Button>새 아티클</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-md border border-border bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                전체 ({articles.length})
              </button>
              {ARTICLE_TYPES.map((articleType) => (
                <button
                  key={articleType.value}
                  type="button"
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {articleType.label} ({typeCounts[articleType.value] ?? 0})
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">발행 {publishedCount}</Badge>
              <Badge className="bg-destructive/10 text-destructive">비공개 {privateCount}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border overflow-hidden">
          <CardHeader>
            <CardTitle>아티클 목록</CardTitle>
            <CardDescription>제목, 유형, 작성자, 발행 상태를 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">제목</TableHead>
                  <TableHead className="font-semibold">유형</TableHead>
                  <TableHead className="font-semibold">작성자</TableHead>
                  <TableHead className="font-semibold">발행일</TableHead>
                  <TableHead className="font-semibold">상태</TableHead>
                  <TableHead className="font-semibold text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedArticles.map((article) => {
                  const author = users.find((user) => user.id === article.authorId);
                  const typeInfo = typeLabelMap[article.type] ?? {
                    label: article.type,
                    color: 'bg-muted text-muted-foreground',
                  };

                  return (
                    <TableRow key={article.id} className="transition-colors hover:bg-primary/5">
                      <TableCell>
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="max-w-sm truncate text-xs text-muted-foreground">{article.excerpt}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${typeInfo.color} border-0 text-xs`}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{author?.name ?? '알 수 없음'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(article.publishedAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            article.isPublished
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {article.isPublished ? '발행됨' : '비공개'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            수정
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            {article.isPublished ? '비공개' : '발행'}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive">
                            삭제
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
    console.error('Failed to load articles:', error);
    return (
      <div className="w-full rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-destructive">아티클 목록을 불러올 수 없습니다</p>
      </div>
    );
  }
}
