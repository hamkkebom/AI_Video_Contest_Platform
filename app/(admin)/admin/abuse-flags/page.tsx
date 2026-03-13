import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAbuseFlags } from '@/lib/data';
import { formatDateTime } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

/** 플래그 타입 한글 라벨 */
const FLAG_TYPE_LABEL: Record<string, string> = {
  multi_account: '다계정 의심',
  spike_like: '좋아요 급증',
  spike_view: '조회수 급증',
  bot_suspect: '봇 의심',
};

/** 심각도 뱃지 */
function SeverityBadge({ severity }: { severity: number }) {
  if (severity >= 3) {
    return <Badge variant="destructive">높음</Badge>;
  }
  if (severity >= 2) {
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">보통</Badge>;
  }
  return <Badge variant="outline">낮음</Badge>;
}

/**
 * 관리자 — 부정사용 플래그 조회 페이지
 * abuse_flags 테이블에서 최근 100건을 표시
 */
export default async function AbuseFlagsPage() {
  const flags = await getAbuseFlags();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-destructive" />
        <h1 className="text-2xl font-bold">부정사용 감지</h1>
        <Badge variant="outline" className="ml-auto">
          {flags.filter(f => !f.resolvedAt).length}건 미해결
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 감지 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">감지된 부정사용이 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>유형</TableHead>
                  <TableHead>심각도</TableHead>
                  <TableHead>출품작</TableHead>
                  <TableHead>IP 해시</TableHead>
                  <TableHead>상세</TableHead>
                  <TableHead>감지 시각</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-medium">
                      {FLAG_TYPE_LABEL[flag.flagType] ?? flag.flagType}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={flag.severity} />
                    </TableCell>
                    <TableCell>
                      {flag.submissionId ? (
                        <Link
                          href={`/gallery/${flag.submissionId}`}
                          className="text-primary hover:underline"
                        >
                          #{flag.submissionId}
                        </Link>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate">
                      {flag.ipHash ? flag.ipHash.slice(0, 16) + '…' : '-'}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      {flag.details ? (
                        <span className="text-muted-foreground">
                          {Object.entries(flag.details)
                            .filter(([k]) => k !== 'detected_at')
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDateTime(flag.createdAt)}
                    </TableCell>
                    <TableCell>
                      {flag.resolvedAt ? (
                        <Badge variant="outline" className="text-green-600 border-green-300">해결됨</Badge>
                      ) : (
                        <Badge variant="destructive">미해결</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
