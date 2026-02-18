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
import { getUsers } from "@/lib/mock";
import { DEMO_ROLES } from "@/config/constants";

/**
 * 관리자 회원 관리 페이지
 * 전체 회원 목록을 테이블로 표시하며
 * 이름, 이메일, 역할, 상태, 가입일, 액션 버튼을 포함합니다.
 */
export default async function AdminUsersPage() {
  try {
    const users = await getUsers();

    const roleLabelMap: Record<string, { label: string; color: string }> = {
      participant: { label: DEMO_ROLES.participant.label, color: "bg-blue-100 text-blue-700" },
      host: { label: DEMO_ROLES.host.label, color: "bg-amber-100 text-amber-700" },
      judge: { label: DEMO_ROLES.judge.label, color: "bg-purple-100 text-purple-700" },
      admin: { label: DEMO_ROLES.admin.label, color: "bg-red-100 text-red-700" },
    };

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      active: { label: "활성", color: "bg-green-100 text-green-700" },
      pending: { label: "대기", color: "bg-yellow-100 text-yellow-700" },
      suspended: { label: "정지", color: "bg-red-100 text-red-700" },
    };

    const roleCounts = {
      all: users.length,
      participant: users.filter((u) => u.role === "participant").length,
      host: users.filter((u) => u.role === "host").length,
      judge: users.filter((u) => u.role === "judge").length,
      admin: users.filter((u) => u.role === "admin").length,
    };

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">회원 관리</h1>
                <p className="text-muted-foreground">
                  전체 {users.length}명의 회원을 관리합니다
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

        {/* 필터 */}
        <section className="py-4 px-4 bg-background border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="border-[#EA580C] text-[#EA580C] font-semibold"
              >
                전체 ({roleCounts.all})
              </Button>
              <Button variant="ghost" size="sm">
                참가자 ({roleCounts.participant})
              </Button>
              <Button variant="ghost" size="sm">
                주최자 ({roleCounts.host})
              </Button>
              <Button variant="ghost" size="sm">
                심사위원 ({roleCounts.judge})
              </Button>
              <Button variant="ghost" size="sm">
                관리자 ({roleCounts.admin})
              </Button>
            </div>
          </div>
        </section>

        {/* 회원 테이블 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <Card className="border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">이름</TableHead>
                    <TableHead className="font-semibold">이메일</TableHead>
                    <TableHead className="font-semibold">역할</TableHead>
                    <TableHead className="font-semibold">지역</TableHead>
                    <TableHead className="font-semibold">상태</TableHead>
                    <TableHead className="font-semibold">가입일</TableHead>
                    <TableHead className="font-semibold text-right">
                      관리
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const roleInfo = roleLabelMap[user.role] ?? {
                      label: user.role,
                      color: "bg-gray-100 text-gray-700",
                    };
                    const statusInfo = statusLabelMap[user.status] ?? {
                      label: user.status,
                      color: "bg-gray-100 text-gray-700",
                    };
                    return (
                      <TableRow
                        key={user.id}
                        className="hover:bg-[#EA580C]/5 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-[#EA580C]">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              {user.nickname && (
                                <p className="text-xs text-muted-foreground">
                                  @{user.nickname}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${roleInfo.color} border-0 text-xs`}
                          >
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.region}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusInfo.color} border-0 text-xs`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/users/${user.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-xs h-7 px-2"
                              >
                                보기
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                            >
                              수정
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-7 px-2"
                            >
                              정지
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
    console.error("Failed to load users:", error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">회원 목록을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
