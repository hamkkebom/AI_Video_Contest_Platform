-- ============================================================
-- 마이그레이션: UUID → SERIAL (자동증가 정수) PK 변경
-- profiles는 UUID 유지 (auth.users 연동), seq_id 컬럼 추가
-- pricing_plans는 TEXT PK 유지 (변경 없음)
-- 나머지 21개 테이블: DROP → SERIAL PK로 재생성
-- ⚠️ 기존 데이터 삭제됨 (profiles, pricing_plans 제외)
-- ============================================================

-- 0) profiles에 순번 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seq_id SERIAL UNIQUE;

-- 1) 기존 트리거/함수 삭제
DROP TRIGGER IF EXISTS on_like_change ON likes;
DROP FUNCTION IF EXISTS update_like_count();

-- 2) 테이블 삭제 (CASCADE로 FK/RLS/인덱스 자동 제거)
DROP TABLE IF EXISTS score_criteria CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS contest_results CASCADE;
DROP TABLE IF EXISTS bonus_entries CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS judges CASCADE;
DROP TABLE IF EXISTS judging_criteria CASCADE;
DROP TABLE IF EXISTS judging_templates CASCADE;
DROP TABLE IF EXISTS contest_award_tiers CASCADE;
DROP TABLE IF EXISTS contest_bonus_configs CASCADE;
DROP TABLE IF EXISTS contests CASCADE;
DROP TABLE IF EXISTS company_members CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS agency_requests CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS ip_logs CASCADE;

-- ============================================================
-- 3) 테이블 재생성 (SERIAL PK)
-- ============================================================

-- companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  business_number TEXT UNIQUE NOT NULL,
  representative_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  business_license_image_url TEXT,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- company_members
CREATE TABLE company_members (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff' NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  company_email TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(company_id, user_id)
);

-- contests
CREATE TABLE contests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  host_company_id INT REFERENCES companies(id),
  host_user_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL DEFAULT '',
  region TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'open', 'closed', 'judging', 'completed')),
  submission_start_at TIMESTAMPTZ NOT NULL,
  submission_end_at TIMESTAMPTZ NOT NULL,
  judging_start_at TIMESTAMPTZ,
  judging_end_at TIMESTAMPTZ,
  result_announced_at TIMESTAMPTZ,
  judging_type TEXT DEFAULT 'internal' NOT NULL CHECK (judging_type IN ('internal', 'external', 'both')),
  review_policy TEXT DEFAULT 'manual' NOT NULL CHECK (review_policy IN ('manual', 'auto_then_manual')),
  max_submissions_per_user INT DEFAULT 3 NOT NULL,
  allowed_video_extensions TEXT[] DEFAULT '{mp4}',
  prize_amount TEXT,
  poster_url TEXT,
  promotion_video_url TEXT,
  has_landing_page BOOLEAN DEFAULT FALSE,
  bonus_max_score INT,
  bonus_percentage INT,
  judge_weight_percent INT,
  online_vote_weight_percent INT,
  online_vote_type TEXT DEFAULT 'likes',
  vote_likes_percent INT,
  vote_views_percent INT,
  judging_criteria JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_slug ON contests(slug);

-- contest_award_tiers
CREATE TABLE contest_award_tiers (
  id SERIAL PRIMARY KEY,
  contest_id INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  count INT NOT NULL DEFAULT 1,
  prize_amount TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_award_tiers_contest ON contest_award_tiers(contest_id);

-- contest_bonus_configs
CREATE TABLE contest_bonus_configs (
  id SERIAL PRIMARY KEY,
  contest_id INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  score INT DEFAULT 1 NOT NULL,
  requires_url BOOLEAN DEFAULT FALSE,
  requires_image BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_bonus_configs_contest ON contest_bonus_configs(contest_id);

-- submissions
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  contest_id INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  cloudflare_stream_uid TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending_review' NOT NULL CHECK (status IN ('pending_review', 'approved', 'rejected', 'auto_rejected', 'judging', 'judged')),
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  views INT DEFAULT 0,
  like_count INT DEFAULT 0,
  video_duration INT DEFAULT 0,
  avg_watch_duration INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  auto_rejected_reason TEXT,
  ai_tools TEXT,
  production_process TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_submissions_contest ON submissions(contest_id);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- bonus_entries
CREATE TABLE bonus_entries (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  bonus_config_id INT NOT NULL REFERENCES contest_bonus_configs(id) ON DELETE CASCADE,
  sns_url TEXT,
  proof_image_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(submission_id, bonus_config_id)
);

-- likes
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, submission_id)
);

CREATE INDEX idx_likes_submission ON likes(submission_id);

-- judges
CREATE TABLE judges (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contest_id INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  is_external BOOLEAN DEFAULT FALSE,
  email TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, contest_id)
);

-- judging_templates
CREATE TABLE judging_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- judging_criteria
CREATE TABLE judging_criteria (
  id SERIAL PRIMARY KEY,
  template_id INT NOT NULL REFERENCES judging_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  max_score INT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0
);

-- scores
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id INT NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  template_id INT REFERENCES judging_templates(id),
  total INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(submission_id, judge_id)
);

-- score_criteria
CREATE TABLE score_criteria (
  id SERIAL PRIMARY KEY,
  score_id INT NOT NULL REFERENCES scores(id) ON DELETE CASCADE,
  criterion_id INT NOT NULL REFERENCES judging_criteria(id),
  score INT NOT NULL
);

-- contest_results
CREATE TABLE contest_results (
  id SERIAL PRIMARY KEY,
  contest_id INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  prize_label TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(contest_id, submission_id)
);

-- articles
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('notice', 'program', 'insight')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  author_id UUID REFERENCES profiles(id),
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- faqs
CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('participant', 'host', 'judge', 'general')),
  topic TEXT NOT NULL CHECK (topic IN ('contest', 'service', 'payment', 'technical', 'account')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- inquiries
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'support', 'agency')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- agency_requests
CREATE TABLE agency_requests (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone_number TEXT,
  budget_range TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'reviewing', 'quoted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- activity_logs
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('contest', 'submission', 'user', 'article', 'inquiry')),
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);

-- devices
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('windows', 'macos', 'ios', 'android', 'linux')),
  browser TEXT CHECK (browser IN ('chrome', 'safari', 'firefox', 'edge')),
  ip_address TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_trusted BOOLEAN DEFAULT TRUE
);

-- ip_logs
CREATE TABLE ip_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT NOT NULL,
  country TEXT,
  region TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 4) 트리거 재생성
-- ============================================================

CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE submissions SET like_count = like_count + 1 WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE submissions SET like_count = like_count - 1 WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- ============================================================
-- 5) RLS 활성화 + 정책 재생성
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_award_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_bonus_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE judging_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE judging_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_logs ENABLE ROW LEVEL SECURITY;

-- companies
CREATE POLICY "companies: 누구나 조회" ON companies FOR SELECT USING (true);
CREATE POLICY "companies: 멤버만 수정" ON companies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = companies.id AND user_id = auth.uid() AND role IN ('owner', 'manager'))
);
CREATE POLICY "companies: 인증 사용자 생성" ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- company_members
CREATE POLICY "company_members: 누구나 조회" ON company_members FOR SELECT USING (true);

-- contests
CREATE POLICY "contests: 누구나 조회" ON contests FOR SELECT USING (true);
CREATE POLICY "contests: 주최자만 생성" ON contests FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "contests: 주최자만 수정" ON contests FOR UPDATE USING (auth.uid() = host_user_id);

-- contest_award_tiers / contest_bonus_configs
CREATE POLICY "award_tiers: 누구나 조회" ON contest_award_tiers FOR SELECT USING (true);
CREATE POLICY "bonus_configs: 누구나 조회" ON contest_bonus_configs FOR SELECT USING (true);

-- submissions
CREATE POLICY "submissions: 누구나 조회" ON submissions FOR SELECT USING (true);
CREATE POLICY "submissions: 인증 사용자 생성" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "submissions: 본인만 수정" ON submissions FOR UPDATE USING (auth.uid() = user_id);

-- bonus_entries
CREATE POLICY "bonus_entries: 누구나 조회" ON bonus_entries FOR SELECT USING (true);
CREATE POLICY "bonus_entries: 본인 제출만 생성" ON bonus_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM submissions WHERE id = bonus_entries.submission_id AND user_id = auth.uid())
);

-- likes
CREATE POLICY "likes: 누구나 조회" ON likes FOR SELECT USING (true);
CREATE POLICY "likes: 인증 사용자 생성" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes: 본인만 삭제" ON likes FOR DELETE USING (auth.uid() = user_id);

-- judges
CREATE POLICY "judges: 누구나 조회" ON judges FOR SELECT USING (true);

-- judging_templates / judging_criteria
CREATE POLICY "templates: 누구나 조회" ON judging_templates FOR SELECT USING (true);
CREATE POLICY "criteria: 누구나 조회" ON judging_criteria FOR SELECT USING (true);

-- scores / score_criteria
CREATE POLICY "scores: 누구나 조회" ON scores FOR SELECT USING (true);
CREATE POLICY "scores: 심사위원 생성" ON scores FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM judges WHERE id = scores.judge_id AND user_id = auth.uid())
);
CREATE POLICY "score_criteria: 누구나 조회" ON score_criteria FOR SELECT USING (true);

-- contest_results
CREATE POLICY "results: 누구나 조회" ON contest_results FOR SELECT USING (true);

-- articles
CREATE POLICY "articles: 누구나 조회" ON articles FOR SELECT USING (is_published = true);

-- faqs
CREATE POLICY "faqs: 누구나 조회" ON faqs FOR SELECT USING (true);

-- inquiries
CREATE POLICY "inquiries: 본인만 조회" ON inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inquiries: 인증 사용자 생성" ON inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- agency_requests
CREATE POLICY "agency_requests: 인증 사용자 생성" ON agency_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- activity_logs
CREATE POLICY "activity_logs: 본인만 조회" ON activity_logs FOR SELECT USING (auth.uid() = user_id);

-- devices
CREATE POLICY "devices: 본인만 조회" ON devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "devices: 본인만 관리" ON devices FOR ALL USING (auth.uid() = user_id);

-- ip_logs
CREATE POLICY "ip_logs: 본인만 조회" ON ip_logs FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 완료! profiles(UUID 유지 + seq_id 추가), 나머지 21개 테이블 SERIAL PK
-- ============================================================
