-- 038: submissions 재제출 추적 컬럼 추가 (prod drift 복구)
-- prod엔 이미 존재하나 마이그레이션 파일엔 누락됐던 컬럼.
-- IF NOT EXISTS라 prod에 재적용해도 안전.

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS resubmission_count INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS resubmission_allowed_at TIMESTAMPTZ;
