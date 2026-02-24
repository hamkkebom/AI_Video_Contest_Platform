-- contest_award_tiers / contest_bonus_configs INSERT 정책 추가
-- 공모전 주최자만 수상 등급 및 가산점 설정 추가 가능
CREATE POLICY "award_tiers: 주최자만 생성" ON contest_award_tiers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM contests WHERE id = contest_award_tiers.contest_id AND host_user_id = auth.uid())
);

CREATE POLICY "bonus_configs: 주최자만 생성" ON contest_bonus_configs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM contests WHERE id = contest_bonus_configs.contest_id AND host_user_id = auth.uid())
);