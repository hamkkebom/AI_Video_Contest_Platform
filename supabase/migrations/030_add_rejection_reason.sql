-- 관리자 수동 거절 사유 컬럼 추가
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
