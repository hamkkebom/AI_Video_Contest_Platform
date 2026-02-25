-- ============================================================
-- 스키마 보정: 운영 DB와 테스트 DB 컬럼 동기화
-- 운영에 존재하지만 마이그레이션에 누락된 컬럼 추가
-- ============================================================

-- profiles: 자기소개 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS introduction TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seq_id SERIAL UNIQUE;

-- contests: 마이그레이션 003 ~ 007 컬럼 보정
ALTER TABLE contests ADD COLUMN IF NOT EXISTS bonus_percentage INT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS judge_weight_percent INT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS online_vote_weight_percent INT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS online_vote_type TEXT DEFAULT 'likes';
ALTER TABLE contests ADD COLUMN IF NOT EXISTS vote_likes_percent INT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS vote_views_percent INT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS bonus_max_score INT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS judging_criteria JSONB DEFAULT '[]'::jsonb;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS detail_content TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS detail_image_urls TEXT[] DEFAULT '{}';
ALTER TABLE contests ADD COLUMN IF NOT EXISTS result_format TEXT DEFAULT 'website';
ALTER TABLE contests ADD COLUMN IF NOT EXISTS landing_page_url TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS guidelines TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS notes TEXT;

-- submissions: 운영에서 확인된 누락 가능 컬럼
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS cloudflare_stream_uid TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS video_duration INT DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS avg_watch_duration INT DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS auto_rejected_reason TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ai_tools TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS production_process TEXT;
