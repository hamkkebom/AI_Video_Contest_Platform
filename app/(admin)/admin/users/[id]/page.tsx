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
import { getUsers, getActivityLogs, getIpLogs } from "@/lib/mock";
import { DEMO_ROLES } from "@/config/constants";

type AdminUserDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * 관리자 회원 상세 페이지
 * 특정 회원의 프로필 정보, 활동 로그, IP 로그, 관리자 메모를 표시합니다.
 */
export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  try {
    const { id } = await params;

    const [users, allActivityLogs, allIpLogs] = await Promise.all([
      getUsers(),
      getActivityLogs(),
      getIpLogs(),
    ]);

    const user = users.find((u) => u.id === id);

    if (!user) {
      return (
        <div className="w-full py-12 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <p className="text-red-600">해당 회원을 찾을 수 없습니다</p>
            <Link href="/admin/users">
              <Button
                variant="outline"
                className="mt-4 border-[#EA580C] text-[#EA580C]"
              >
                ← 회원 목록
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    const userActivityLogs = allActivityLogs
      .filter((log) => log.userId === id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const userIpLogs = allIpLogs
      .filter((log) => log.userId === id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const roleLabelMap: Record<string, { label: string; color: string }> = {
      participant: {
        label: DEMO_ROLES.participant.label,
        color: "bg-blue-100 text-blue-700",
      },
      host: {
        label: DEMO_ROLES.host.label,
        color: "bg-amber-100 text-amber-700",
      },
      judge: {
        label: DEMO_ROLES.judge.label,
        color: "bg-purple-100 text-purple-700",
      },
      admin: {
        label: DEMO_ROLES.admin.label,
        color: "bg-red-100 text-red-700",
      },
    };

    const statusLabelMap: Record<string, { label: string; color: string }> = {
      active: { label: "활성", color: "bg-green-100 text-green-700" },
      pending: { label: "대기", color: "bg-yellow-100 text-yellow-700" },
      suspended: { label: "정지", color: "bg-red-100 text-red-700" },
    };

    const riskLabelMap: Record<string, { label: string; color: string }> = {
      low: { label: "낮음", color: "bg-green-100 text-green-700" },
      medium: { label: "보통", color: "bg-yellow-100 text-yellow-700" },
      high: { label: "높음", color: "bg-red-100 text-red-700" },
    };

    const actionLabelMap: Record<string, string> = {
      create_submission: "출품작 등록",
      like_submission: "좋아요",
    };

    const roleInfo = roleLabelMap[user.role] ?? {
      label: user.role,
      color: "bg-gray-100 text-gray-700",
    };
    const statusInfo = statusLabelMap[user.status] ?? {
      label: user.status,
      color: "bg-gray-100 text-gray-700",
    };

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#EA580C]/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#EA580C]">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <Badge className={`${roleInfo.color} border-0`}>
                      {roleInfo.label}
                    </Badge>
                    <Badge className={`${statusInfo.color} border-0`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/users">
                  <Button
                    variant="outline"
                    className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10"
                  >
                    ← 목록
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                >
                  수정
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  정지
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 프로필 정보 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-4">프로필 정보</h2>
            <Card className="p-6 border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">닉네임</p>
                  <p className="font-medium">
                    {user.nickname ?? "미설정"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">소속</p>
                  <p className="font-medium">
                    {user.companyName ?? "개인"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">지역</p>
                  <p className="font-medium">{user.region}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">가입일</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 활동 로그 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">활동 로그</h2>
              <Badge
                variant="outline"
                className="border-[#EA580C] text-[#EA580C]"
              >
                {userActivityLogs.length}건
              </Badge>
            </div>
            <Card className="border border-border overflow-hidden">
              {userActivityLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  활동 로그가 없습니다
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">활동</TableHead>
                      <TableHead className="font-semibold">
                        대상 타입
                      </TableHead>
                      <TableHead className="font-semibold">대상 ID</TableHead>
                      <TableHead className="font-semibold">일시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {actionLabelMap[log.action] ?? log.action}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs border-[#8B5CF6]/30 text-[#8B5CF6]"
                          >
                            {log.targetType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {log.targetId}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </section>

        {/* IP 로그 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">IP 로그</h2>
              <Badge
                variant="outline"
                className="border-[#8B5CF6] text-[#8B5CF6]"
              >
                {userIpLogs.length}건
              </Badge>
            </div>
            <Card className="border border-border overflow-hidden">
              {userIpLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  IP 로그가 없습니다
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">IP 주소</TableHead>
                      <TableHead className="font-semibold">국가</TableHead>
                      <TableHead className="font-semibold">지역</TableHead>
                      <TableHead className="font-semibold">
                        위험 수준
                      </TableHead>
                      <TableHead className="font-semibold">일시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userIpLogs.map((log) => {
                      const riskInfo = riskLabelMap[log.riskLevel] ?? {
                        label: log.riskLevel,
                        color: "bg-gray-100 text-gray-700",
                      };
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {log.ipAddress}
                          </TableCell>
                          <TableCell>{log.country}</TableCell>
                          <TableCell>{log.region}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${riskInfo.color} border-0 text-xs`}
                            >
                              {riskInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </section>

        {/* 관리자 메모 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-4">관리자 메모</h2>
            <Card className="p-6 border border-border">
              <textarea
                className="w-full h-32 p-4 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#EA580C]/30 focus:border-[#EA580C]"
                placeholder="이 회원에 대한 관리자 메모를 작성하세요..."
                readOnly
                defaultValue=""
              />
              <div className="flex justify-end mt-3">
                <Button className="bg-[#EA580C] hover:bg-[#C2540A] text-white">
                  메모 저장
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Failed to load user detail:", error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">회원 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
