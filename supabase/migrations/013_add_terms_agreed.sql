-- ============================================================
-- 013: submissions 테이블에 유의사항 동의 여부 컬럼 추가
-- ============================================================

-- 유의사항 동의 여부 (출품 시 필수 체크)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS terms_agreed BOOLEAN DEFAULT false NOT NULL;

-- 기존 출품작은 동의한 것으로 간주 (출품 당시 체크가 없었으므로)
UPDATE submissions SET terms_agreed = true WHERE terms_agreed = false;
