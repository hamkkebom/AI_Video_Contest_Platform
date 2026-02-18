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
import { getInquiries, getUsers } from "@/lib/mock";

/**
 * 관리자 문의 관리 페이지
 * 전체 지원 문의 목록을 테이블로 표시하며
 * 제목, 유형, 상태, 작성일, 액션 버튼을 포함합니다.
 */
export default async function AdminInquiriesPage() {
  try {
    const [inquiries, users] = await Promise.all([
      getInquiries(),
      getUsers(),
    ]);

    const typeLabelMap: Record<string, { label: string; color: string }> = {
      general: { label: "일반", color: "bg-blue-100 text-blue-700" },
      support: { label: "기술지원", color: "bg-amber-100 text-amber-700" },
      agency: { label: "대행문의", color: "bg-purple-100 text-purple-700" },
    };

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      pending: { label: "대기", color: "bg-yellow-100 text-yellow-700" },
      in_progress: { label: "처리중", color: "bg-blue-100 text-blue-700" },
      resolved: { label: "해결", color: "bg-green-100 text-green-700" },
    };

    const statusCounts = {
      all: inquiries.length,
      pending: inquiries.filter((i) => i.status === "pending").length,
      in_progress: inquiries.filter((i) => i.status === "in_progress").length,
      resolved: inquiries.filter((i) => i.status === "resolved").length,
    };

    const sortedInquiries = inquiries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#F59E0B]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">문의 관리</h1>
                <p className="text-muted-foreground">
                  총 {inquiries.length}건의 문의를 관리합니다
                </p>
              </div>
              <Link href="/admin/dashboard">
                <Button
                  variant="outline"
                  className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10"
                >
                  ← 대시보드
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 상태 필터 */}
        <section className="py-4 px-4 bg-background border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#EA580C] text-[#EA580C] font-semibold"
                >
                  전체 ({statusCounts.all})
                </Button>
                <Button variant="ghost" size="sm">
                  대기 ({statusCounts.pending})
                </Button>
                <Button variant="ghost" size="sm">
                  처리중 ({statusCounts.in_progress})
                </Button>
                <Button variant="ghost" size="sm">
                  해결 ({statusCounts.resolved})
                </Button>
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

        {/* 문의 테이블 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <Card className="border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">제목</TableHead>
                    <TableHead className="font-semibold">작성자</TableHead>
                    <TableHead className="font-semibold">유형</TableHead>
                    <TableHead className="font-semibold">상태</TableHead>
                    <TableHead className="font-semibold">작성일</TableHead>
                    <TableHead className="font-semibold">수정일</TableHead>
                    <TableHead className="font-semibold text-right">
                      관리
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInquiries.map((inquiry) => {
                    const author = users.find((u) => u.id === inquiry.userId);
                    const typeInfo = typeLabelMap[inquiry.type] ?? {
                      label: inquiry.type,
                      color: "bg-gray-100 text-gray-700",
                    };
                    const statusInfo = statusLabelMap[inquiry.status] ?? {
                      label: inquiry.status,
                      color: "bg-gray-100 text-gray-700",
                    };
                    return (
                      <TableRow
                        key={inquiry.id}
                        className="hover:bg-[#EA580C]/5 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{inquiry.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {inquiry.content}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {author?.name ?? "알 수 없음"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${typeInfo.color} border-0 text-xs`}
                          >
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusInfo.color} border-0 text-xs`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(inquiry.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(inquiry.updatedAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs h-7 px-2"
                            >
                              보기
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10 text-xs h-7 px-2"
                            >
                              답변
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs h-7 px-2"
                            >
                              완료
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
    console.error("Failed to load inquiries:", error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">문의 목록을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
