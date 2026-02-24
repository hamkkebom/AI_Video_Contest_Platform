-- contests / award_tiers / bonus_configs DELETE 정책 추가
-- 공모전 주최자만 삭제 가능
CREATE POLICY "contests: 주최자만 삭제" ON contests FOR DELETE USING (auth.uid() = host_user_id);

CREATE POLICY "award_tiers: 주최자만 삭제" ON contest_award_tiers FOR DELETE USING (
  EXISTS (SELECT 1 FROM contests WHERE id = contest_award_tiers.contest_id AND host_user_id = auth.uid())
);

CREATE POLICY "bonus_configs: 주최자만 삭제" ON contest_bonus_configs FOR DELETE USING (
  EXISTS (SELECT 1 FROM contests WHERE id = contest_bonus_configs.contest_id AND host_user_id = auth.uid())
);