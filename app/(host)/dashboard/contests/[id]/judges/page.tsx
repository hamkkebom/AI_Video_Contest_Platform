import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getJudges, getContests, getUsers } from '@/lib/mock';

type ContestJudgesPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * 심사위원 관리 페이지
 * 공모전에 배정된 심사위원 목록을 테이블로 표시합니다.
 * 초대, 삭제, 재초대 버튼을 제공합니다 (데모용).
 */
export default async function HostContestJudgesPage({ params }: ContestJudgesPageProps) {
  try {
    const { id } = await params;
    const [allJudges, allContests, allUsers] = await Promise.all([
      getJudges(),
      getContests(),
      getUsers(),
    ]);

    const contest = allContests.find((c) => c.id === id);
    const contestJudges = allJudges.filter((j) => j.contestId === id);
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    // 심사위원 상태 분류
    const acceptedCount = contestJudges.filter((j) => j.acceptedAt).length;
    const pendingCount = contestJudges.length - acceptedCount;

    return (
      <div className="w-full">
        {/* 페이지 헤더 */}
        <section className="py-12 px-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#EA580C]/10 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/dashboard" className="hover:text-[#EA580C]">대시보드</Link>
              <span>/</span>
              <Link href="/dashboard/contests" className="hover:text-[#EA580C]">공모전</Link>
              <span>/</span>
              <Link href={`/dashboard/contests/${id}`} className="hover:text-[#EA580C]">
                {contest?.title ?? id}
              </Link>
              <span>/</span>
              <span className="text-foreground">심사위원</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">심사위원 관리</h1>
                <p className="text-muted-foreground">
                  {contestJudges.length}명의 심사위원 · {contest?.title}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 통계 카드 */}
        <section className="py-6 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 border border-border border-l-4 border-l-[#8B5CF6]">
                <p className="text-sm text-muted-foreground">전체 심사위원</p>
                <p className="text-3xl font-bold mt-1">{contestJudges.length}</p>
              </Card>
              <Card className="p-5 border border-border border-l-4 border-l-green-500">
                <p className="text-sm text-muted-foreground">수락</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{acceptedCount}</p>
              </Card>
              <Card className="p-5 border border-border border-l-4 border-l-yellow-500">
                <p className="text-sm text-muted-foreground">초대 대기</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* 초대 폼 */}
        <section className="py-6 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-6 border border-border">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#8B5CF6] rounded-full inline-block" />
                심사위원 초대
              </h2>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="심사위원 이메일 주소를 입력하세요"
                  className="flex-1 border-border"
                  disabled
                />
                <Button className="bg-[#8B5CF6] hover:bg-[#7C4DCC] text-white font-semibold px-6" disabled>
                  초대 보내기
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 데모 모드에서는 실제 초대가 발송되지 않습니다
              </p>
            </Card>
          </div>
        </section>

        {/* 심사위원 테이블 */}
        <section className="py-6 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            {contestJudges.length === 0 ? (
              <Card className="p-12 text-center border border-border">
                <span className="text-4xl block mb-4">⚖️</span>
                <p className="text-muted-foreground mb-4">배정된 심사위원이 없습니다</p>
                <p className="text-sm text-muted-foreground">위의 초대 폼을 사용하여 심사위원을 초대하세요</p>
              </Card>
            ) : (
              <Card className="border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#8B5CF6]/5">
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="font-bold text-foreground">심사위원</TableHead>
                      <TableHead className="font-bold text-foreground">이메일</TableHead>
                      <TableHead className="font-bold text-foreground">유형</TableHead>
                      <TableHead className="font-bold text-foreground">상태</TableHead>
                      <TableHead className="font-bold text-foreground">초대일</TableHead>
                      <TableHead className="font-bold text-foreground text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contestJudges.map((judge) => {
                      const user = usersMap.get(judge.userId);
                      const isAccepted = !!judge.acceptedAt;

                      return (
                        <TableRow
                          key={judge.id}
                          className="border-b border-border hover:bg-[#8B5CF6]/5 transition-colors"
                        >
                          {/* 이름 */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EA580C] flex items-center justify-center text-white text-xs font-bold">
                                {(user?.name ?? '?').charAt(0)}
                              </div>
                              <span className="font-medium">{user?.name ?? '외부 심사위원'}</span>
                            </div>
                          </TableCell>

                          {/* 이메일 */}
                          <TableCell className="text-sm text-muted-foreground">
                            {judge.email ?? user?.email ?? '-'}
                          </TableCell>

                          {/* 유형 */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                judge.isExternal
                                  ? 'border-[#F59E0B] text-[#F59E0B]'
                                  : 'border-[#8B5CF6] text-[#8B5CF6]'
                              }
                            >
                              {judge.isExternal ? '외부' : '내부'}
                            </Badge>
                          </TableCell>

                          {/* 상태 */}
                          <TableCell>
                            <Badge
                              className={`border-0 ${
                                isAccepted
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {isAccepted ? '수락' : '초대됨'}
                            </Badge>
                          </TableCell>

                          {/* 초대일 */}
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(judge.invitedAt).toLocaleDateString('ko-KR')}
                          </TableCell>

                          {/* 액션 */}
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {!isAccepted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                                >
                                  재초대
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load judges:', error);
    return (
      <div className="w-full py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-red-600">심사위원 목록을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }
}
