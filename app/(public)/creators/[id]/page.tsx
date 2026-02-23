import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUsers, getSubmissions, getContests } from '@/lib/mock';
import { MapPin, Film, Heart, Eye, Award, ArrowLeft, Calendar, Search } from 'lucide-react';

type CreatorDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'participant':
      return '참가자';
    case 'host':
      return '주최자';
    case 'judge':
      return '심사위원';
    case 'admin':
      return '관리자';
    default:
      return '게스트';
  }
}

function getContestStatusLabel(status: string) {
  switch (status) {
    case 'draft':
      return '준비중';
    case 'open':
      return '진행중';
    case 'closed':
      return '접수마감';
    case 'judging':
      return '심사중';
    case 'completed':
      return '종료';
    default:
      return status;
  }
}

function getContestStatusClassName(status: string) {
  switch (status) {
    case 'open':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
    case 'judging':
      return 'bg-violet-500/10 text-violet-600 border-violet-500/30';
    case 'completed':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-secondary text-secondary-foreground border-border';
  }
}

export default async function CreatorDetailPage({ params }: CreatorDetailPageProps) {
  const { id } = await params;
  const [allUsers, allSubmissions, allContests] = await Promise.all([
    getUsers(),
    getSubmissions({ userId: id }),
    getContests(),
  ]);
  const user = allUsers.find(u => u.id === id);

  // 크리에이터가 없는 경우의 상태 UI
  if (!user) {
    return (
      <div className="w-full">
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <Link
              href="/creators"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              크리에이터 목록으로
            </Link>
            <h1 className="text-3xl font-bold">크리에이터 프로필</h1>
          </div>
        </section>

        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <Card className="p-12 text-center border-dashed">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 bg-muted flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">크리에이터를 찾을 수 없습니다</h2>
              <p className="text-muted-foreground mb-8">요청하신 크리에이터 정보가 존재하지 않습니다.</p>
              <Button asChild>
                <Link href="/creators">목록으로 돌아가기</Link>
              </Button>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  const displayName = user.nickname || user.name;
  const totalViews = allSubmissions.reduce((sum, submission) => sum + submission.views, 0);
  const totalLikes = allSubmissions.reduce((sum, submission) => sum + submission.likeCount, 0);
  const contestById = new Map(allContests.map(contest => [contest.id, contest]));
  const participatedContests = Array.from(new Set(allSubmissions.map(submission => submission.contestId)))
    .map(contestId => contestById.get(contestId))
    .filter((contest): contest is NonNullable<typeof contest> => Boolean(contest));

  return (
    <div className="w-full">
      {/* 프로필 헤더 섹션 */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            크리에이터 목록으로
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-4xl font-bold border-4 border-background/80">
                {displayName.charAt(0)}
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {user.region}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(user.createdAt)} 가입
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
              <Card className="p-4 text-center min-w-24">
                <p className="text-2xl font-bold text-primary">{allSubmissions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">작품 수</p>
              </Card>
              <Card className="p-4 text-center min-w-24">
                <p className="text-2xl font-bold text-primary">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">총 조회수</p>
              </Card>
              <Card className="p-4 text-center min-w-24">
                <p className="text-2xl font-bold text-primary">{totalLikes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">총 좋아요</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="py-10 px-4 bg-background border-b border-border">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">소개</h2>
            <p className="text-muted-foreground leading-relaxed">
              AI 영상 크리에이터입니다. 다양한 공모전에 참여하고 있습니다.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">빠른 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">이메일</span>
                <span className="text-right break-all">{user.email}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">지역</span>
                <span>{user.region}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">가입일</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">역할</span>
                <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 작품 목록 섹션 */}
      <section className="py-10 px-4 bg-background border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Film className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">작품 목록</h2>
          </div>

          {allSubmissions.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-1">등록된 작품이 없습니다</p>
              <p className="text-sm text-muted-foreground">아직 참여한 출품작이 없습니다.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSubmissions.map((submission, index) => {
                const contest = contestById.get(submission.contestId);

                return (
                  <Card key={submission.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={`/images/contest-${(index % 5) + 1}.jpg`}
                        alt={submission.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{submission.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {contest?.title || '알 수 없는 공모전'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          {submission.views.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="w-4 h-4" />
                          {submission.likeCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 참여 공모전 섹션 */}
      <section className="py-10 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">참여 공모전</h2>
          </div>

          {participatedContests.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">참여한 공모전이 없습니다.</Card>
          ) : (
            <div className="space-y-3">
              {participatedContests.map(contest => (
                <Card key={contest.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-semibold">{contest.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(contest.submissionStartAt)} - {formatDate(contest.resultAnnouncedAt)}
                      </p>
                    </div>
                    <Badge className={getContestStatusClassName(contest.status)}>
                      {getContestStatusLabel(contest.status)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
