import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getUsers,
  getContests,
  getSubmissions,
  getInquiries,
  getActivityLogs,
} from "@/lib/mock";

/**
 * 관리자 대시보드 페이지
 * 플랫폼 전체 통계(회원, 공모전, 출품작, 문의)와
 * 최근 활동 로그, 빠른 관리 메뉴를 표시합니다.
 */
export default async function AdminDashboardPage() {
  try {
    const [users, contests, submissions, inquiries, activityLogs] =
      await Promise.all([
        getUsers(),
        getContests(),
        getSubmissions(),
        getInquiries(),
        getActivityLogs(),
      ]);

    const pendingInquiries = inquiries.filter((i) => i.status === "pending");
    const activeContests = contests.filter((c) => c.status === "open");
    const recentLogs = activityLogs
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8);

    const stats = [
      {
        label: "전체 회원",
        value: users.length,
        icon: "👥",
        accent: "border-l-[#EA580C]",
        sub: `활성 ${users.filter((u) => u.status === "active").length}명`,
      },
      {
        label: "전체 공모전",
        value: contests.length,
        icon: "🏆",
        accent: "border-l-[#F59E0B]",
        sub: `진행중 ${activeContests.length}개`,
      },
      {
        label: "전체 출품작",
        value: submissions.length,
        icon: "🎬",
        accent: "border-l-[#8B5CF6]",
        sub: `승인 ${submissions.filter((s) => s.status === "approved").length}개`,
      },
      {
        label: "전체 문의",
        value: inquiries.length,
        icon: "📩",
        accent: "border-l-rose-500",
        sub: `대기 ${pendingInquiries.length}건`,
      },
    ];

    const actionLabelMap: Record<string, string> = {
      create_submission: "출품작 등록",
      like_submission: "좋아요",
    };

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 via-[#F59E0B]/5 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/30">
                    관리자
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">관리자 대시보드</h1>
                <p className="text-muted-foreground">
                  플랫폼 전체 운영 현황을 한눈에 확인하세요
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/analytics">
                  <Button
                    variant="outline"
                    className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                  >
                    📊 분석 보기
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button className="bg-[#EA580C] hover:bg-[#C2540A] text-white font-semibold">
                    👥 회원 관리
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 통계 카드 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card
                  key={stat.label}
                  className={`p-6 border border-border border-l-4 ${stat.accent} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.sub}
                      </p>
                    </div>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 최근 활동 로그 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">최근 활동</h2>
              <Link href="/admin/analytics">
                <Button
                  variant="ghost"
                  className="text-[#EA580C] hover:text-[#C2540A]"
                >
                  전체 보기 →
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => {
                const user = users.find((u) => u.id === log.userId);
                return (
                  <Card
                    key={log.id}
                    className="p-4 border border-border hover:border-[#EA580C]/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#EA580C]/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#EA580C]">
                          {user?.name.charAt(0) ?? "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          <span className="text-[#EA580C]">
                            {user?.name ?? "알 수 없음"}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            님이{" "}
                          </span>
                          <span>
                            {actionLabelMap[log.action] ?? log.action}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.targetType} · {log.targetId}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {new Date(log.createdAt).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 빠른 관리 메뉴 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-6">빠른 관리</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Card className="p-6 border border-border hover:border-[#EA580C] hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-center space-y-3">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">
                      👥
                    </span>
                    <p className="font-semibold">회원 관리</p>
                    <p className="text-xs text-muted-foreground">
                      회원 목록 및 상세 조회
                    </p>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/inquiries">
                <Card className="p-6 border border-border hover:border-[#F59E0B] hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-center space-y-3">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">
                      📩
                    </span>
                    <p className="font-semibold">문의 관리</p>
                    <p className="text-xs text-muted-foreground">
                      지원 문의 확인 및 답변
                    </p>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/analytics">
                <Card className="p-6 border border-border hover:border-[#8B5CF6] hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-center space-y-3">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">
                      📊
                    </span>
                    <p className="font-semibold">분석</p>
                    <p className="text-xs text-muted-foreground">
                      플랫폼 분석 및 통계
                    </p>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/articles">
                <Card className="p-6 border border-border hover:border-green-500 hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-center space-y-3">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">
                      📰
                    </span>
                    <p className="font-semibold">아티클 관리</p>
                    <p className="text-xs text-muted-foreground">
                      뉴스 및 트렌드 관리
                    </p>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">
            관리자 대시보드 데이터를 불러올 수 없습니다
          </p>
        </div>
      </div>
    );
  }
}
