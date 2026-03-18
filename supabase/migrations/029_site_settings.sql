-- 사이트 전역 설정 (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'false'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES profiles(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings: 누구나 조회" ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings: 관리자만 생성" ON site_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.roles::text LIKE '%admin%')
);
CREATE POLICY "site_settings: 관리자만 수정" ON site_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.roles::text LIKE '%admin%')
);

-- 초기 설정값 (모두 꺼진 상태로 시작)
INSERT INTO site_settings (key, value, description) VALUES
  ('menu.gallery', 'false', '헤더에 갤러리 메뉴 표시'),
  ('menu.story', 'false', '헤더에 스토리 메뉴 표시'),
  ('landing.featured_carousel', 'false', '랜딩 페이지 추천 작품 캐러셀 표시')
ON CONFLICT (key) DO NOTHING;
