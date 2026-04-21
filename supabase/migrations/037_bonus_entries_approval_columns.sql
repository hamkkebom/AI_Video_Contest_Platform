-- ============================================================
-- 037: bonus_entries 승인/반려 관련 컬럼 (prod drift 복구)
-- ============================================================
-- prod에는 이미 존재하나 마이그레이션 파일에 누락된 컬럼들.
-- Dashboard에서 직접 추가됐던 것으로 추정되며, dev와 싱크를 맞추고
-- 향후 환경 간 drift 재발 방지를 위해 공식 마이그레이션으로 기록.

ALTER TABLE bonus_entries
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE bonus_entries
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);

ALTER TABLE bonus_entries
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE bonus_entries
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 상태별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_bonus_entries_status ON bonus_entries(status);
CREATE INDEX IF NOT EXISTS idx_bonus_entries_submission ON bonus_entries(submission_id);
