-- ============================================================
-- 042: 개인정보 노출 차단 (긴급 보안 수정)
--
-- 문제: profiles / submissions 의 SELECT 정책이 `USING (true)` 여서
--       익명(anon) 키만으로 회원 2,384명의 이메일·전화번호와
--       출품자 528명의 실명·전화번호를 전부 조회할 수 있었다.
--       anon 키는 클라이언트 번들에 반드시 포함되므로 누구나 획득 가능하다.
--
-- 해결: RLS는 행 단위라 컬럼을 가릴 수 없다. 따라서
--       (1) 공개 화면에 필요한 컬럼만 담은 뷰를 만들고
--       (2) anon 의 원본 테이블 직접 SELECT 권한을 회수한다.
--       뷰는 소유자(postgres) 권한으로 실행되어 RLS를 우회하므로
--       비로그인 사용자도 공개 정보는 그대로 볼 수 있다.
--
-- 주의: 이 마이그레이션은 애플리케이션 코드 변경과 함께 적용해야 한다.
--       코드가 원본 테이블을 익명으로 읽던 지점을 뷰로 바꾸지 않으면
--       공개 페이지가 깨진다. (lib/data/index.ts)
-- ============================================================

-- ------------------------------------------------------------
-- 1) 공개 프로필 뷰 — email, phone 제외
--    공개 화면(크리에이터 목록/상세, 공모전 주최자 표기, 갤러리 작성자명)이
--    실제로 쓰는 컬럼만 노출한다.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  seq_id,
  name,
  nickname,
  roles,
  region,
  introduction,
  social_links,
  preferred_chat_ai,
  preferred_image_ai,
  preferred_video_ai,
  plan_id,
  avatar_url,
  status,
  created_at,
  updated_at
FROM profiles;

COMMENT ON VIEW public_profiles IS
  '비로그인 공개 화면용 프로필 투영. email·phone 제외. anon 은 profiles 원본 대신 이 뷰만 조회한다.';

-- ------------------------------------------------------------
-- 2) 공개 출품작 뷰 — submitter_phone 제외 + 공개 승인작으로 한정
--    submitter_name 은 갤러리 작성자명(creatorName)의 1순위 소스이므로 유지한다.
--    비공개/미승인 작품이 뷰를 통해 새지 않도록 조건을 뷰에 내장한다.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public_submissions AS
SELECT
  id,
  contest_id,
  user_id,
  title,
  description,
  video_url,
  thumbnail_url,
  cloudflare_stream_uid,
  status,
  is_public,
  submitted_at,
  created_at,
  updated_at,
  views,
  like_count,
  video_duration,
  avg_watch_duration,
  tags,
  ai_tools,
  production_process,
  submitter_name,
  terms_agreed,
  resubmission_count,
  resubmission_allowed_at
FROM submissions
WHERE status = 'approved'
  AND is_public IS TRUE;

COMMENT ON VIEW public_submissions IS
  '비로그인 갤러리용 출품작 투영. submitter_phone·rejection_reason·registered_by 제외, 공개 승인작만 포함.';

-- ------------------------------------------------------------
-- 3) 뷰 권한 부여
-- ------------------------------------------------------------
GRANT SELECT ON public_profiles TO anon, authenticated;
GRANT SELECT ON public_submissions TO anon, authenticated;

-- ------------------------------------------------------------
-- 4) anon 의 원본 테이블 SELECT 권한 회수 (핵심 차단)
--    authenticated 는 유지하되 아래 5)에서 RLS로 행을 제한한다.
-- ------------------------------------------------------------
REVOKE SELECT ON profiles FROM anon;
REVOKE SELECT ON submissions FROM anon;

-- ------------------------------------------------------------
-- 5) profiles RLS — 본인 / 관리자만 조회
--    정책 안에서 profiles 를 다시 조회하면 무한 재귀가 되므로
--    SECURITY DEFINER 함수로 우회한다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'RLS 정책용 관리자 판별. profiles 정책 내부에서 profiles 를 조회할 때의 무한 재귀를 피하기 위해 SECURITY DEFINER.';

CREATE OR REPLACE FUNCTION public.is_admin_or_host()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (roles && ARRAY['admin','host']::text[])
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_or_host() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_host() TO authenticated;

DROP POLICY IF EXISTS "profiles: 누구나 조회" ON profiles;

DROP POLICY IF EXISTS "profiles: 본인 조회" ON profiles;
CREATE POLICY "profiles: 본인 조회" ON profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: 관리자 조회" ON profiles;
CREATE POLICY "profiles: 관리자 조회" ON profiles
FOR SELECT USING (public.is_admin());

-- ------------------------------------------------------------
-- 6) submissions RLS — 본인 / 관리자·주최자만 원본 조회
--    공개 갤러리는 4)에서 만든 public_submissions 뷰를 사용한다.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "submissions: 누구나 조회" ON submissions;

DROP POLICY IF EXISTS "submissions: 본인 조회" ON submissions;
CREATE POLICY "submissions: 본인 조회" ON submissions
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "submissions: 관리자·주최자 조회" ON submissions;
CREATE POLICY "submissions: 관리자·주최자 조회" ON submissions
FOR SELECT USING (public.is_admin_or_host());

DROP POLICY IF EXISTS "submissions: 심사위원 조회" ON submissions;
CREATE POLICY "submissions: 심사위원 조회" ON submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM judges j
    WHERE j.user_id = auth.uid() AND j.contest_id = submissions.contest_id
  )
);

-- ------------------------------------------------------------
-- 7) judges — 익명 조회 차단 (심사위원 신원·이메일 노출 방지)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "judges: 누구나 조회" ON judges;
REVOKE SELECT ON judges FROM anon;

DROP POLICY IF EXISTS "judges: 본인 조회" ON judges;
CREATE POLICY "judges: 본인 조회" ON judges
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "judges: 관리자·주최자 조회" ON judges;
CREATE POLICY "judges: 관리자·주최자 조회" ON judges
FOR SELECT USING (public.is_admin_or_host());

-- ------------------------------------------------------------
-- 8) bonus_entries — 익명 조회 차단 (증빙 이미지 URL 노출 방지)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "bonus_entries: 누구나 조회" ON bonus_entries;
REVOKE SELECT ON bonus_entries FROM anon;

DROP POLICY IF EXISTS "bonus_entries: 본인 조회" ON bonus_entries;
CREATE POLICY "bonus_entries: 본인 조회" ON bonus_entries
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM submissions s
    WHERE s.id = bonus_entries.submission_id AND s.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "bonus_entries: 관리자·주최자 조회" ON bonus_entries;
CREATE POLICY "bonus_entries: 관리자·주최자 조회" ON bonus_entries
FOR SELECT USING (public.is_admin_or_host());

-- ------------------------------------------------------------
-- 9) 적용 검증 쿼리 (실행 후 수동 확인용)
-- ------------------------------------------------------------
-- anon 이 원본 테이블을 못 읽는지:
--   SET ROLE anon; SELECT email FROM profiles LIMIT 1;  -- permission denied 여야 정상
--   SELECT name FROM public_profiles LIMIT 1;           -- 정상 조회되어야 함
--   RESET ROLE;
