import { Eye, Heart, Film } from 'lucide-react';
import type { SubmissionStatus } from '@/lib/types';
import { getSubmissions } from '@/lib/mock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const statusMeta: Record<SubmissionStatus, { label: string; className: string }> = {
  pending_review: { label: '검토 중', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  approved: { label: '승인됨', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: '거절됨', className: 'bg-destructive/10 text-destructive' },
  auto_rejected: { label: '자동 거절', className: 'bg-destructive/10 text-destructive' },
  judging: { label: '심사 중', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  judged: { label: '심사 완료', className: 'bg-primary/10 text-primary' },
};

export default async function MySubmissionsPage() {
  try {
    const allSubmissions = await getSubmissions();
    const userSubmissions = allSubmissions.filter((submission) => submission.userId === 'user-1');

    return (
      <div className="space-y-6 pb-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">내 출품작</h1>
          <p className="text-sm text-muted-foreground">
            총 {userSubmissions.length}개 작품의 상태와 반응 지표를 한눈에 확인할 수 있어요.
          </p>
        </header>

        {userSubmissions.length === 0 ? (
          <Card className="border-border border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Film className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">아직 출품한 작품이 없습니다</p>
                <p className="text-sm text-muted-foreground">
                  첫 작품을 등록하고 조회수와 좋아요 변화를 추적해보세요.
                </p>
              </div>
              <Button>공모전 둘러보기</Button>
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {userSubmissions.map((submission) => {
              const currentStatus = statusMeta[submission.status];

              return (
                <Card
                  key={submission.id}
                  className="overflow-hidden border-border transition-colors hover:border-primary/40"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={submission.thumbnailUrl}
                      alt={submission.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                      <Badge className={currentStatus.className}>{currentStatus.label}</Badge>
                    </div>
                  </div>

                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-1.5">
                      <h2 className="line-clamp-2 text-lg font-semibold leading-snug">{submission.title}</h2>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{submission.description}</p>
                    </div>

                    <div className="flex items-center gap-5 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span className="font-semibold text-foreground">{submission.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span className="font-semibold text-foreground">{submission.likeCount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {submission.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        상세 보기
                      </Button>
                      <Button size="sm">수정</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to load submissions:', error);

    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-10 text-center">
          <p className="font-medium text-destructive">출품작 데이터를 불러오지 못했습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
        </CardContent>
      </Card>
    );
  }
}
