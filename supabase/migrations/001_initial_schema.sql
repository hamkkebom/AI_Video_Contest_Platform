-- ============================================================
-- 함께봄 AI 영상 공모전 플랫폼 — 초기 DB 스키마
-- Supabase PostgreSQL 용
-- ============================================================

-- 0) 확장 모듈
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1) profiles — auth.users 확장 (Supabase Auth 연동)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  roles TEXT[] DEFAULT '{participant}' NOT NULL,
  region TEXT,
  preferred_ai_tools TEXT[],
  plan_id TEXT DEFAULT 'plan-free',
  avatar_url TEXT,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE profiles IS '사용자 프로필 (auth.users 확장)';

-- 신규 가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2) companies — 기업 (사업자 단위)
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ============================================================
-- 3) company_members — 기업-사용자 매핑
-- ============================================================
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff' NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  company_email TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(company_id, user_id)
);

-- ============================================================
-- 4) contests — 공모전
-- ============================================================
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  host_company_id UUID REFERENCES companies(id),
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
  bonus_percentage INT,                              -- 가산점 반영 비율 (%)
  judge_weight_percent INT,                          -- 심사위원 평가 비율 (%)
  online_vote_weight_percent INT,                    -- 온라인 투표(좋아요) 비율 (%)
  online_vote_type TEXT DEFAULT 'likes',              -- 온라인 투표 방식 (likes, views, likes_and_views)
  vote_likes_percent INT,                             -- 조회수+좋아요 모드: 좋아요 비율 (%)
  vote_views_percent INT,                             -- 조회수+좋아요 모드: 조회수 비율 (%)
  judging_criteria JSONB DEFAULT '[]'::jsonb,        -- 심사기준 배열 [{label, maxScore, description}]
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_slug ON contests(slug);

-- ============================================================
-- 5) contest_award_tiers — 공모전 수상 티어
-- ============================================================
CREATE TABLE contest_award_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  count INT NOT NULL DEFAULT 1,
  prize_amount TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_award_tiers_contest ON contest_award_tiers(contest_id);

-- ============================================================
-- 6) contest_bonus_configs — 공모전 가산점 항목
-- ============================================================
CREATE TABLE contest_bonus_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  score INT DEFAULT 1 NOT NULL,
  requires_url BOOLEAN DEFAULT FALSE,
  requires_image BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_bonus_configs_contest ON contest_bonus_configs(contest_id);

-- ============================================================
-- 7) submissions — 출품작
-- ============================================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
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

-- ============================================================
-- 8) bonus_entries — 가산점 인증 내역
-- ============================================================
CREATE TABLE bonus_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  bonus_config_id UUID NOT NULL REFERENCES contest_bonus_configs(id) ON DELETE CASCADE,
  sns_url TEXT,
  proof_image_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(submission_id, bonus_config_id)
);

-- ============================================================
-- 9) likes — 좋아요
-- ============================================================
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, submission_id)
);

CREATE INDEX idx_likes_submission ON likes(submission_id);

-- 좋아요 카운트 자동 갱신 트리거
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
-- 10) judges — 심사위원 배정
-- ============================================================
CREATE TABLE judges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  is_external BOOLEAN DEFAULT FALSE,
  email TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, contest_id)
);

-- ============================================================
-- 11) judging_templates — 심사 템플릿
-- ============================================================
CREATE TABLE judging_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 12) judging_criteria — 심사 기준 항목
-- ============================================================
CREATE TABLE judging_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES judging_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  max_score INT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0
);

-- ============================================================
-- 13) scores — 심사 채점
-- ============================================================
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  template_id UUID REFERENCES judging_templates(id),
  total INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(submission_id, judge_id)
);

-- ============================================================
-- 14) score_criteria — 채점 상세 (기준별 점수)
-- ============================================================
CREATE TABLE score_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id UUID NOT NULL REFERENCES scores(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES judging_criteria(id),
  score INT NOT NULL
);

-- ============================================================
-- 15) contest_results — 수상 결과
-- ============================================================
CREATE TABLE contest_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  prize_label TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(contest_id, submission_id)
);

-- ============================================================
-- 16) articles — 게시글/공지
-- ============================================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ============================================================
-- 17) faqs — FAQ
-- ============================================================
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('participant', 'host', 'judge', 'general')),
  topic TEXT NOT NULL CHECK (topic IN ('contest', 'service', 'payment', 'technical', 'account')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 18) inquiries — 문의
-- ============================================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'support', 'agency')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 19) agency_requests — 대행 의뢰
-- ============================================================
CREATE TABLE agency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone_number TEXT,
  budget_range TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'reviewing', 'quoted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 20) activity_logs — 활동 로그
-- ============================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('contest', 'submission', 'user', 'article', 'inquiry')),
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);

-- ============================================================
-- 21) devices — 기기 관리
-- ============================================================
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('windows', 'macos', 'ios', 'android', 'linux')),
  browser TEXT CHECK (browser IN ('chrome', 'safari', 'firefox', 'edge')),
  ip_address TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_trusted BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 22) pricing_plans — 요금제
-- ============================================================
CREATE TABLE pricing_plans (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  monthly_price INT DEFAULT 0,
  yearly_price INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  feature_keys TEXT[] DEFAULT '{}'
);

-- ============================================================
-- 23) ip_logs — IP 로그
-- ============================================================
CREATE TABLE ip_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT NOT NULL,
  country TEXT,
  region TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_logs ENABLE ROW LEVEL SECURITY;

-- === profiles ===
CREATE POLICY "profiles: 누구나 조회" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles: 본인만 수정" ON profiles FOR UPDATE USING (auth.uid() = id);

-- === companies ===
CREATE POLICY "companies: 누구나 조회" ON companies FOR SELECT USING (true);
CREATE POLICY "companies: 멤버만 수정" ON companies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = companies.id AND user_id = auth.uid() AND role IN ('owner', 'manager'))
);
CREATE POLICY "companies: 인증 사용자 생성" ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- === company_members ===
CREATE POLICY "company_members: 누구나 조회" ON company_members FOR SELECT USING (true);

-- === contests ===
CREATE POLICY "contests: 누구나 조회" ON contests FOR SELECT USING (true);
CREATE POLICY "contests: 주최자만 생성" ON contests FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "contests: 주최자만 수정" ON contests FOR UPDATE USING (auth.uid() = host_user_id);

-- === contest_award_tiers / contest_bonus_configs ===
CREATE POLICY "award_tiers: 누구나 조회" ON contest_award_tiers FOR SELECT USING (true);
CREATE POLICY "bonus_configs: 누구나 조회" ON contest_bonus_configs FOR SELECT USING (true);

-- === submissions ===
CREATE POLICY "submissions: 누구나 조회" ON submissions FOR SELECT USING (true);
CREATE POLICY "submissions: 인증 사용자 생성" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "submissions: 본인만 수정" ON submissions FOR UPDATE USING (auth.uid() = user_id);

-- === bonus_entries ===
CREATE POLICY "bonus_entries: 누구나 조회" ON bonus_entries FOR SELECT USING (true);
CREATE POLICY "bonus_entries: 본인 제출만 생성" ON bonus_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM submissions WHERE id = bonus_entries.submission_id AND user_id = auth.uid())
);

-- === likes ===
CREATE POLICY "likes: 누구나 조회" ON likes FOR SELECT USING (true);
CREATE POLICY "likes: 인증 사용자 생성" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes: 본인만 삭제" ON likes FOR DELETE USING (auth.uid() = user_id);

-- === judges ===
CREATE POLICY "judges: 누구나 조회" ON judges FOR SELECT USING (true);

-- === judging_templates / judging_criteria ===
CREATE POLICY "templates: 누구나 조회" ON judging_templates FOR SELECT USING (true);
CREATE POLICY "criteria: 누구나 조회" ON judging_criteria FOR SELECT USING (true);

-- === scores / score_criteria ===
CREATE POLICY "scores: 누구나 조회" ON scores FOR SELECT USING (true);
CREATE POLICY "scores: 심사위원 생성" ON scores FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM judges WHERE id = scores.judge_id AND user_id = auth.uid())
);
CREATE POLICY "score_criteria: 누구나 조회" ON score_criteria FOR SELECT USING (true);

-- === contest_results ===
CREATE POLICY "results: 누구나 조회" ON contest_results FOR SELECT USING (true);

-- === articles ===
CREATE POLICY "articles: 누구나 조회" ON articles FOR SELECT USING (is_published = true);

-- === faqs ===
CREATE POLICY "faqs: 누구나 조회" ON faqs FOR SELECT USING (true);

-- === inquiries ===
CREATE POLICY "inquiries: 본인만 조회" ON inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inquiries: 인증 사용자 생성" ON inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- === agency_requests ===
CREATE POLICY "agency_requests: 인증 사용자 생성" ON agency_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- === activity_logs ===
CREATE POLICY "activity_logs: 본인만 조회" ON activity_logs FOR SELECT USING (auth.uid() = user_id);

-- === devices ===
CREATE POLICY "devices: 본인만 조회" ON devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "devices: 본인만 관리" ON devices FOR ALL USING (auth.uid() = user_id);

-- === pricing_plans ===
CREATE POLICY "plans: 누구나 조회" ON pricing_plans FOR SELECT USING (true);

-- === ip_logs ===
CREATE POLICY "ip_logs: 본인만 조회" ON ip_logs FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Storage 버킷
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('proof-images', 'proof-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('company-assets', 'company-assets', true);

-- Storage 정책: 인증 사용자 업로드, 누구나 조회
CREATE POLICY "storage: 누구나 조회" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "storage: 인증 사용자 업로드" ON storage.objects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "storage: 본인 파일 삭제" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- 초기 데이터: 요금제
-- ============================================================
INSERT INTO pricing_plans (id, role, name, monthly_price, yearly_price, active, feature_keys) VALUES
  ('plan-free', 'participant', '무료', 0, 0, true, '{work-performance}'),
  ('plan-participant-premium', 'participant', '참가자 프리미엄', 9900, 99000, true, '{work-performance,category-competition,ai-tool-trends,detailed-analysis}'),
  ('plan-host-basic', 'host', '주최자 기본', 0, 0, true, '{submission-status}'),
  ('plan-host-premium', 'host', '주최자 프리미엄', 29900, 299000, true, '{submission-status,participant-distribution,channel-performance,detailed-analysis}'),
  ('plan-judge-basic', 'judge', '심사위원 기본', 0, 0, true, '{progress}'),
  ('plan-judge-premium', 'judge', '심사위원 프리미엄', 0, 0, true, '{progress,score-distribution}');
