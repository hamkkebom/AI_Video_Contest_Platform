-- utm_visits: UTM 방문 추적 테이블
CREATE TABLE IF NOT EXISTS utm_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  landing_page TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_utm_visits_user ON utm_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_utm_visits_source ON utm_visits(utm_source);
CREATE INDEX IF NOT EXISTS idx_utm_visits_created ON utm_visits(created_at);

ALTER TABLE utm_visits ENABLE ROW LEVEL SECURITY;

-- 누구나 UTM 기록 삽입 가능 (비로그인 포함)
CREATE POLICY "utm_insert_anyone" ON utm_visits FOR INSERT WITH CHECK (true);
-- 관리자만 조회 (서비스 롤 키로 접근)
CREATE POLICY "utm_select_service" ON utm_visits FOR SELECT USING (false);

-- account_withdrawals: 회원 탈퇴 사유 기록
CREATE TABLE IF NOT EXISTS account_withdrawals (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON account_withdrawals(user_id);

ALTER TABLE account_withdrawals ENABLE ROW LEVEL SECURITY;

-- 인증 사용자 본인만 생성
CREATE POLICY "withdrawals: 인증 사용자 생성" ON account_withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 관리자만 조회
CREATE POLICY "withdrawals: 서비스 롤 조회" ON account_withdrawals FOR SELECT USING (false);
