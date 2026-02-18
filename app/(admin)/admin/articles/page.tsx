import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getArticles, getUsers } from "@/lib/mock";
import { ARTICLE_TYPES } from "@/config/constants";

/**
 * 관리자 아티클 관리 페이지
 * 뉴스/트렌드 아티클의 CRUD 기능을 제공합니다.
 * 제목, 유형, 발행일, 상태, 관리 버튼을 테이블로 표시합니다.
 */
export default async function AdminArticlesPage() {
  try {
    const [articles, users] = await Promise.all([getArticles(), getUsers()]);

    const typeLabelMap: Record<string, { label: string; color: string }> = {};
    for (const at of ARTICLE_TYPES) {
      const colorMap: Record<string, string> = {
        trend_report: "bg-blue-100 text-blue-700",
        announcement: "bg-amber-100 text-amber-700",
        press_release: "bg-purple-100 text-purple-700",
      };
      typeLabelMap[at.value] = {
        label: at.label,
        color: colorMap[at.value] ?? "bg-gray-100 text-gray-700",
      };
    }

    const typeCounts: Record<string, number> = {};
    for (const at of ARTICLE_TYPES) {
      typeCounts[at.value] = articles.filter(
        (a) => a.type === at.value
      ).length;
    }

    const sortedArticles = articles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">아티클 관리</h1>
                <p className="text-muted-foreground">
                  총 {articles.length}개의 아티클을 관리합니다
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/dashboard">
                  <Button
                    variant="outline"
                    className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10"
                  >
                    ← 대시보드
                  </Button>
                </Link>
                <Button className="bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold">
                  + 새 아티클
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 유형 필터 */}
        <section className="py-4 px-4 bg-background border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#EA580C] text-[#EA580C] font-semibold"
                >
                  전체 ({articles.length})
                </Button>
                {ARTICLE_TYPES.map((at) => (
                  <Button key={at.value} variant="ghost" size="sm">
                    {at.label} ({typeCounts[at.value] ?? 0})
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-[#8B5CF6]">
                  최신순
                </Button>
                <Button variant="ghost" size="sm">
                  유형순
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 아티클 테이블 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <Card className="border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">제목</TableHead>
                    <TableHead className="font-semibold">유형</TableHead>
                    <TableHead className="font-semibold">작성자</TableHead>
                    <TableHead className="font-semibold">발행일</TableHead>
                    <TableHead className="font-semibold">상태</TableHead>
                    <TableHead className="font-semibold text-right">
                      관리
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedArticles.map((article) => {
                    const author = users.find(
                      (u) => u.id === article.authorId
                    );
                    const typeInfo = typeLabelMap[article.type] ?? {
                      label: article.type,
                      color: "bg-gray-100 text-gray-700",
                    };
                    return (
                      <TableRow
                        key={article.id}
                        className="hover:bg-[#EA580C]/5 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{article.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-sm">
                              {article.excerpt}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${typeInfo.color} border-0 text-xs`}
                          >
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {author?.name ?? "알 수 없음"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(article.publishedAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${article.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"} border-0 text-xs`}
                          >
                            {article.isPublished ? "발행됨" : "비공개"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs h-7 px-2"
                            >
                              수정
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10 text-xs h-7 px-2"
                            >
                              {article.isPublished ? "비공개" : "발행"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-7 px-2"
                            >
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Failed to load articles:", error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">아티클 목록을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
