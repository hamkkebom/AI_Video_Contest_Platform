-- 가산점 인증 마감일 컬럼 추가
-- 제출 마감(submission_end_at)과 별도로 가산점 인증 수정 마감일을 관리
ALTER TABLE contests ADD COLUMN IF NOT EXISTS bonus_deadline_at TIMESTAMPTZ;
