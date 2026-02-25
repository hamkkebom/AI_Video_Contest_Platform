-- ============================================================
-- 운영 DB에 직접 추가된 컬럼 동기화
-- ============================================================

-- profiles: 연락처
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- contests: 프로모션 영상 URL (운영에서 복수형으로 변경)
ALTER TABLE contests ADD COLUMN IF NOT EXISTS promotion_video_urls TEXT[] DEFAULT '{}';
