-- contests 테이블 누락 컬럼 추가
ALTER TABLE contests ADD COLUMN IF NOT EXISTS detail_content TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS detail_image_urls TEXT[] DEFAULT '{}';
ALTER TABLE contests ADD COLUMN IF NOT EXISTS result_format TEXT DEFAULT 'website';
ALTER TABLE contests ADD COLUMN IF NOT EXISTS landing_page_url TEXT;