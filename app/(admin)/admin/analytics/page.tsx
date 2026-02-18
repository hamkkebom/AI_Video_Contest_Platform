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
 * 관리자 분석 페이지
 * 플랫폼 전체 분석 요약 카드와 주요 지표를 표시합니다.
 * UTM 분석, 지역별 분석 등 하위 분석 페이지로 연결됩니다.
 */
export default async function AdminAnalyticsPage() {
  try {
    const [users, contests, submissions, inquiries, activityLogs] =
      await Promise.all([
        getUsers(),
        getContests(),
        getSubmissions(),
        getInquiries(),
        getActivityLogs(),
      ]);

    const totalViews = submissions.reduce((sum, s) => sum + s.views, 0);
    const approvedCount = submissions.filter(
      (s) => s.status === "approved"
    ).length;
    const conversionRate =
      submissions.length > 0
        ? Math.round((approvedCount / submissions.length) * 100)
        : 0;

    const stats = [
      {
        label: "총 방문 (추정)",
        value: totalViews.toLocaleString(),
        icon: "👁️",
        accent: "border-l-[#EA580C]",
        change: "+12.5%",
      },
      {
        label: "전환율",
        value: `${conversionRate}%`,
        icon: "📈",
        accent: "border-l-[#F59E0B]",
        change: "+3.2%",
      },
      {
        label: "활성 회원",
        value: users.filter((u) => u.status === "active").length,
        icon: "👥",
        accent: "border-l-[#8B5CF6]",
        change: "+8.1%",
      },
      {
        label: "활동 로그",
        value: activityLogs.length,
        icon: "📊",
        accent: "border-l-green-500",
        change: "+5.7%",
      },
    ];

    /** 상태별 출품작 분포 */
    const statusDistribution = [
      {
        label: "검수대기",
        count: submissions.filter((s) => s.status === "pending_review").length,
        color: "bg-yellow-400",
      },
      {
        label: "승인",
        count: approvedCount,
        color: "bg-green-400",
      },
      {
        label: "반려",
        count: submissions.filter((s) => s.status === "rejected").length,
        color: "bg-red-400",
      },
      {
        label: "자동반려",
        count: submissions.filter((s) => s.status === "auto_rejected").length,
        color: "bg-orange-400",
      },
      {
        label: "심사중",
        count: submissions.filter((s) => s.status === "judging").length,
        color: "bg-blue-400",
      },
      {
        label: "심사완료",
        count: submissions.filter((s) => s.status === "judged").length,
        color: "bg-purple-400",
      },
    ];

    const maxCount = Math.max(...statusDistribution.map((s) => s.count), 1);

    /** 공모전 상태 */
    const contestStatusData = [
      {
        label: "초안",
        count: contests.filter((c) => c.status === "draft").length,
        color: "bg-gray-400",
      },
      {
        label: "접수중",
        count: contests.filter((c) => c.status === "open").length,
        color: "bg-green-400",
      },
      {
        label: "마감",
        count: contests.filter((c) => c.status === "closed").length,
        color: "bg-yellow-400",
      },
      {
        label: "심사중",
        count: contests.filter((c) => c.status === "judging").length,
        color: "bg-blue-400",
      },
      {
        label: "완료",
        count: contests.filter((c) => c.status === "completed").length,
        color: "bg-purple-400",
      },
    ];

    const maxContestCount = Math.max(
      ...contestStatusData.map((s) => s.count),
      1
    );

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#EA580C]/10 via-[#F59E0B]/5 to-[#8B5CF6]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">플랫폼 분석</h1>
                <p className="text-muted-foreground">
                  플랫폼 전체 운영 데이터를 분석합니다
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/analytics/utm">
                  <Button
                    variant="outline"
                    className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10"
                  >
                    🔗 UTM 생성
                  </Button>
                </Link>
                <Link href="/admin/analytics/regional">
                  <Button
                    variant="outline"
                    className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                  >
                    🗺️ 지역별
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
                      <p className="text-xs text-green-600 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 차트 영역 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 출품작 상태 분포 */}
              <Card className="p-6 border border-border">
                <h3 className="text-lg font-bold mb-4">출품작 상태 분포</h3>
                <div className="space-y-3">
                  {statusDistribution.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm w-16 shrink-0 text-muted-foreground">
                        {item.label}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                        <div
                          className={`${item.color} h-full rounded-full transition-all flex items-center justify-end pr-2`}
                          style={{
                            width: `${Math.max((item.count / maxCount) * 100, 5)}%`,
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 공모전 상태 분포 */}
              <Card className="p-6 border border-border">
                <h3 className="text-lg font-bold mb-4">공모전 상태 분포</h3>
                <div className="space-y-3">
                  {contestStatusData.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm w-16 shrink-0 text-muted-foreground">
                        {item.label}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                        <div
                          className={`${item.color} h-full rounded-full transition-all flex items-center justify-end pr-2`}
                          style={{
                            width: `${Math.max((item.count / maxContestCount) * 100, 5)}%`,
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 요약 카드 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-4">플랫폼 요약</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-6 border border-border">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">회원</p>
                  <p className="text-2xl font-bold">{users.length}명</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                      활성 {users.filter((u) => u.status === "active").length}
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                      대기 {users.filter((u) => u.status === "pending").length}
                    </Badge>
                  </div>
                </div>
              </Card>
              <Card className="p-6 border border-border">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">공모전</p>
                  <p className="text-2xl font-bold">{contests.length}개</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                      진행중{" "}
                      {contests.filter((c) => c.status === "open").length}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                      완료{" "}
                      {contests.filter((c) => c.status === "completed").length}
                    </Badge>
                  </div>
                </div>
              </Card>
              <Card className="p-6 border border-border">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">문의</p>
                  <p className="text-2xl font-bold">{inquiries.length}건</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                      대기{" "}
                      {inquiries.filter((i) => i.status === "pending").length}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                      해결{" "}
                      {inquiries.filter((i) => i.status === "resolved").length}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 하위 분석 페이지 링크 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-4">상세 분석</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/admin/analytics/utm">
                <Card className="p-6 border border-border hover:border-[#EA580C] hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      🔗
                    </span>
                    <div>
                      <p className="font-semibold">UTM 자동 생성</p>
                      <p className="text-sm text-muted-foreground">
                        캠페인 링크 생성 및 관리
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/analytics/regional">
                <Card className="p-6 border border-border hover:border-[#8B5CF6] hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      🗺️
                    </span>
                    <div>
                      <p className="font-semibold">지역별 분석</p>
                      <p className="text-sm text-muted-foreground">
                        시도별 통계 및 분포
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Failed to load analytics:", error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">분석 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
