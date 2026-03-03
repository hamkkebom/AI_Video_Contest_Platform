-- 공모전 히어로 섹션 배경 이미지 URL 컬럼 추가
ALTER TABLE contests ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
