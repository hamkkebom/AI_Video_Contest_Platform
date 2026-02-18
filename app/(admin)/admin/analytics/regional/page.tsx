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
import { REGIONS_KR } from "@/config/constants";
import { getUsers, getContests, getSubmissions } from "@/lib/mock";
import type { RegionalMetric } from "@/lib/types";

/**
 * 관리자 지역별 분석 페이지
 * 시도별 회원 수, 공모전 수, 출품작 수를 테이블과 차트로 표시합니다.
 */
export default async function AdminAnalyticsRegionalPage() {
  try {
    const [users, contests, submissions] = await Promise.all([
      getUsers(),
      getContests(),
      getSubmissions(),
    ]);

    const regionalMetrics: RegionalMetric[] = REGIONS_KR.map((region) => ({
      region,
      userCount: users.filter((u) => u.region === region).length,
      contestCount: contests.filter((c) => c.region === region).length,
      submissionCount: submissions.filter((s) => {
        const contest = contests.find((c) => c.id === s.contestId);
        return contest?.region === region;
      }).length,
    }));

    const sortedMetrics = regionalMetrics.sort(
      (a, b) => b.userCount - a.userCount
    );

    const maxUserCount = Math.max(...sortedMetrics.map((m) => m.userCount), 1);
    const totalUsers = sortedMetrics.reduce((s, m) => s + m.userCount, 0);
    const totalContests = sortedMetrics.reduce(
      (s, m) => s + m.contestCount,
      0
    );
    const totalSubmissions = sortedMetrics.reduce(
      (s, m) => s + m.submissionCount,
      0
    );

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#EA580C]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30">
                    분석
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">지역별 분석</h1>
                <p className="text-muted-foreground">
                  {REGIONS_KR.length}개 시도의 플랫폼 활동 통계를 확인합니다
                </p>
              </div>
              <Link href="/admin/analytics">
                <Button
                  variant="outline"
                  className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                >
                  ← 분석 홈
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 요약 카드 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-6 border border-border border-l-4 border-l-[#EA580C]">
                <p className="text-sm text-muted-foreground mb-1">
                  총 회원 (지역 기반)
                </p>
                <p className="text-3xl font-bold">{totalUsers}명</p>
              </Card>
              <Card className="p-6 border border-border border-l-4 border-l-[#F59E0B]">
                <p className="text-sm text-muted-foreground mb-1">총 공모전</p>
                <p className="text-3xl font-bold">{totalContests}개</p>
              </Card>
              <Card className="p-6 border border-border border-l-4 border-l-[#8B5CF6]">
                <p className="text-sm text-muted-foreground mb-1">총 출품작</p>
                <p className="text-3xl font-bold">{totalSubmissions}개</p>
              </Card>
            </div>
          </div>
        </section>

        {/* 지역별 바 차트 */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-6 border border-border">
              <h3 className="text-lg font-bold mb-4">지역별 회원 분포</h3>
              <div className="space-y-2">
                {sortedMetrics.map((metric) => (
                  <div key={metric.region} className="flex items-center gap-3">
                    <span className="text-sm w-10 shrink-0 font-medium">
                      {metric.region}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#EA580C] to-[#8B5CF6] h-full rounded-full transition-all flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.max((metric.userCount / maxUserCount) * 100, 8)}%`,
                        }}
                      >
                        <span className="text-xs font-bold text-white">
                          {metric.userCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* 지역별 테이블 */}
        <section className="py-8 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-4">상세 통계</h2>
            <Card className="border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">지역</TableHead>
                    <TableHead className="font-semibold text-right">
                      회원 수
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      공모전 수
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      출품작 수
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      회원 비율
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMetrics.map((metric, idx) => (
                    <TableRow
                      key={metric.region}
                      className={
                        idx < 3 ? "bg-[#EA580C]/5" : "hover:bg-muted/30"
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {idx < 3 && (
                            <Badge className="bg-[#EA580C] text-white border-0 text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                              {idx + 1}
                            </Badge>
                          )}
                          <span className="font-medium">{metric.region}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {metric.userCount}명
                      </TableCell>
                      <TableCell className="text-right">
                        {metric.contestCount}개
                      </TableCell>
                      <TableCell className="text-right">
                        {metric.submissionCount}개
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="border-[#8B5CF6]/30 text-[#8B5CF6]"
                        >
                          {totalUsers > 0
                            ? Math.round(
                                (metric.userCount / totalUsers) * 100
                              )
                            : 0}
                          %
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Failed to load regional analytics:", error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">지역별 분석 데이터를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
