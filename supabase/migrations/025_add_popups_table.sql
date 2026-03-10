-- 팝업 관리 테이블
CREATE TABLE popups (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  link_target TEXT DEFAULT '_self',
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'active', 'inactive')),
  display_start_at TIMESTAMPTZ NOT NULL,
  display_end_at TIMESTAMPTZ NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_popups_status ON popups(status);
CREATE INDEX idx_popups_display_dates ON popups(display_start_at, display_end_at);

ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능 (공개 팝업 표시용)
CREATE POLICY "popups: 누구나 조회" ON popups FOR SELECT USING (true);

-- 관리자만 생성/수정/삭제
CREATE POLICY "popups: 관리자만 생성" ON popups FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.roles::text LIKE '%admin%')
);
CREATE POLICY "popups: 관리자만 수정" ON popups FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.roles::text LIKE '%admin%')
);
CREATE POLICY "popups: 관리자만 삭제" ON popups FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.roles::text LIKE '%admin%')
);
