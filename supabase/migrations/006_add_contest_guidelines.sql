-- 공모전별 참가 규정 및 가이드라인 필드 추가
ALTER TABLE contests ADD COLUMN IF NOT EXISTS guidelines TEXT;
