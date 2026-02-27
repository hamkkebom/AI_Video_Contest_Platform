-- ============================================================
-- 014: submissions 테이블에 수동 등록 관리자 ID 컬럼 추가
-- NULL = 참가자 직접 출품 / UUID = 관리자가 수동 등록
-- ============================================================

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS registered_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
