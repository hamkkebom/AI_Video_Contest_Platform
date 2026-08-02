'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { numericOnly, selectClass } from './contest-form-helpers';

interface OnlineVoteCardProps {
  useOnlineVote: boolean;
  setUseOnlineVote: (value: boolean) => void;
  /** 온라인 투표를 끄면 배분 비율도 함께 비운다 */
  setOnlineVoteWeightPercentStr: (value: string) => void;
  onlineVoteType: 'likes' | 'views' | 'likes_and_views';
  setOnlineVoteType: (value: 'likes' | 'views' | 'likes_and_views') => void;
  voteLikesPercentStr: string;
  setVoteLikesPercentStr: (value: string) => void;
  voteViewsPercentStr: string;
  setVoteViewsPercentStr: (value: string) => void;
}

/** 카드 4.2 — 온라인 투표 방식. 조회수를 고르면 채점 기준이 달라진다는 것을 그 자리에서 알린다(D-023). */
export function OnlineVoteCard({ useOnlineVote, setUseOnlineVote, setOnlineVoteWeightPercentStr, onlineVoteType, setOnlineVoteType, voteLikesPercentStr, setVoteLikesPercentStr, voteViewsPercentStr, setVoteViewsPercentStr }: OnlineVoteCardProps) {
  return (
    <>
    {/* ===== 카드 4.2: 온라인 투표 방식 (선택) ===== */}
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>온라인 투표 방식</CardTitle>
            <CardDescription>온라인 투표를 평가에 반영할지 선택합니다. (선택)</CardDescription>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useOnlineVote}
              onChange={(e) => {
                setUseOnlineVote(e.target.checked);
                if (!e.target.checked) {
                  setOnlineVoteWeightPercentStr('');
                }
              }}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-sm font-medium">사용</span>
          </label>
        </div>
      </CardHeader>
      {useOnlineVote && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">투표 지표 선택</label>
            <select
              value={onlineVoteType}
              onChange={(e) => setOnlineVoteType(e.target.value as 'likes' | 'views' | 'likes_and_views')}
              className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="likes">좋아요만</option>
              <option value="views">조회수만</option>
              <option value="likes_and_views">조회수 + 좋아요</option>
            </select>
          </div>
          {(onlineVoteType === 'views' || onlineVoteType === 'likes_and_views') && (
            /* 채점에 쓰이는 조회수는 화면에 표시되는 값과 다르다 — 주최자가 알아야 한다 */
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              점수 계산에는 <span className="font-medium">로그인한 사용자의 조회만</span> 반영됩니다.
              출품작 화면에 보이는 조회수(비로그인 포함)와 값이 다를 수 있습니다 — 익명 조회로
              순위가 움직이지 않게 하기 위해서입니다.
            </p>
          )}
          {onlineVoteType === 'likes_and_views' && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">세부 비율 (합 100%)</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">좋아요</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="예시) 50"
                    value={voteLikesPercentStr}
                    onChange={(e) => setVoteLikesPercentStr(numericOnly(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">조회수</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="예시) 50"
                    value={voteViewsPercentStr}
                    onChange={(e) => setVoteViewsPercentStr(numericOnly(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              {(() => {
                const l = parseInt(voteLikesPercentStr, 10) || 0;
                const v = parseInt(voteViewsPercentStr, 10) || 0;
                const sub = l + v;
                return (
                  <p className={`text-sm font-medium ${sub === 100 ? 'text-green-600' : 'text-destructive'}`}>
                    세부 합계: {sub}% {sub === 100 ? '✓' : '(100%가 되어야 합니다)'}
                  </p>
                );
              })()}
            </div>
          )}
        </CardContent>
      )}
    </Card>
    </>
  );
}
