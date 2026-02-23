import { ParticipantAnalyticsContent } from '@/components/dashboard/participant-analytics-content';
import { getSubmissions } from '@/lib/mock';
import { Card, CardContent } from '@/components/ui/card';

export default async function ParticipantAnalyticsPage() {
  try {
    const allSubmissions = await getSubmissions();
    const userSubmissions = allSubmissions.filter((submission) => submission.userId === 'user-1');

    return <ParticipantAnalyticsContent submissions={userSubmissions} />;
  } catch (error) {
    console.error('Failed to load analytics:', error);

    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-10 text-center">
          <p className="font-medium text-destructive">분석 데이터를 불러오지 못했습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
        </CardContent>
      </Card>
    );
  }
}
