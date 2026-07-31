-- ============================================================
-- 045: 문의·대행 의뢰 접수 활성화
--
-- 문제 1 (접수 유실): 고객센터 문의 폼과 대행 의뢰 폼의 제출 버튼이
--   아무 동작도 하지 않아(코드에 // TODO만 존재) 지금까지 들어온
--   모든 문의가 저장되지 않고 사라졌다. 두 테이블 모두 0건이다.
--
-- 문제 2 (비회원 접수 불가): inquiries 에는 비회원 연락처를 담을 컬럼이
--   없고, INSERT 정책도 `auth.uid() = user_id` 라 로그인해야만 쓸 수 있다.
--   공모전 특성상 가입 전 문의가 많으므로 비회원 접수를 허용한다.
--
-- 문제 3 (관리자가 못 봄): 두 테이블에 관리자 SELECT/UPDATE 정책이 없다.
--   inquiries 는 `본인만 조회`뿐이고 agency_requests 는 SELECT 정책 자체가
--   없어, 접수가 되더라도 관리자 화면에서 조회·처리가 불가능했다.
-- ============================================================

-- ------------------------------------------------------------
-- 1) inquiries — 비회원 연락처 컬럼 추가
--    회원 문의는 user_id 로 연결되므로 이 컬럼들은 비워둔다.
-- ------------------------------------------------------------
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS guest_phone TEXT;

COMMENT ON COLUMN inquiries.guest_name IS '비회원 문의자 이름 (회원 문의는 NULL, user_id 사용)';
COMMENT ON COLUMN inquiries.guest_email IS '비회원 문의자 회신 이메일';
COMMENT ON COLUMN inquiries.guest_phone IS '비회원 문의자 연락처 (선택)';

-- 회원이면 user_id, 비회원이면 guest_email 중 하나는 반드시 있어야
-- 답변을 보낼 수 있다. 접수 경로가 잘못돼도 DB 레벨에서 걸러낸다.
ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_contact_required;
ALTER TABLE inquiries ADD CONSTRAINT inquiries_contact_required
  CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL);

-- ------------------------------------------------------------
-- 2) inquiries — 접수 정책
--    비회원: user_id 가 NULL 이고 guest_email 이 있는 행만 생성 가능
--    회원  : 본인 user_id 로만 생성 가능 (기존 정책 유지)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "inquiries: 비회원 접수" ON inquiries;
CREATE POLICY "inquiries: 비회원 접수" ON inquiries
FOR INSERT TO anon
WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

DROP POLICY IF EXISTS "inquiries: 인증 사용자 생성" ON inquiries;
CREATE POLICY "inquiries: 인증 사용자 생성" ON inquiries
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND guest_email IS NOT NULL));

GRANT INSERT ON inquiries TO anon;
GRANT USAGE, SELECT ON SEQUENCE inquiries_id_seq TO anon;

-- ------------------------------------------------------------
-- 3) inquiries — 관리자 조회·처리 정책
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "inquiries: 관리자 조회" ON inquiries;
CREATE POLICY "inquiries: 관리자 조회" ON inquiries
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "inquiries: 관리자 처리" ON inquiries;
CREATE POLICY "inquiries: 관리자 처리" ON inquiries
FOR UPDATE USING (public.is_admin());

-- ------------------------------------------------------------
-- 4) agency_requests — 접수 정책 (비회원 허용)
--    이 테이블은 이미 contact_name·contact_email·phone_number 를 갖고 있어
--    스키마 변경 없이 비회원 접수가 가능하다.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "agency_requests: 비회원 접수" ON agency_requests;
CREATE POLICY "agency_requests: 비회원 접수" ON agency_requests
FOR INSERT TO anon
WITH CHECK (
  company_name <> '' AND contact_name <> '' AND contact_email <> '' AND message <> ''
);

DROP POLICY IF EXISTS "agency_requests: 인증 사용자 생성" ON agency_requests;
CREATE POLICY "agency_requests: 인증 사용자 생성" ON agency_requests
FOR INSERT TO authenticated
WITH CHECK (
  company_name <> '' AND contact_name <> '' AND contact_email <> '' AND message <> ''
);

GRANT INSERT ON agency_requests TO anon;
GRANT USAGE, SELECT ON SEQUENCE agency_requests_id_seq TO anon;

-- ------------------------------------------------------------
-- 5) agency_requests — 관리자 조회·처리 정책
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "agency_requests: 관리자 조회" ON agency_requests;
CREATE POLICY "agency_requests: 관리자 조회" ON agency_requests
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "agency_requests: 관리자 처리" ON agency_requests;
CREATE POLICY "agency_requests: 관리자 처리" ON agency_requests
FOR UPDATE USING (public.is_admin());

-- ------------------------------------------------------------
-- 6) 레이트리밋 — 비회원 접수 스팸 방지
--    026 의 api_rate_limits 를 그대로 재사용한다.
--    익명 요청도 카운트를 올려야 하므로 SECURITY DEFINER 함수로 감싼다.
--    한도 초과 시 false 를 반환하고, 호출부(API 라우트)가 429 로 응답한다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_intake_rate_limit(
  p_key TEXT,
  p_action TEXT,
  p_limit INT DEFAULT 5,
  p_window_minutes INT DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bucket TIMESTAMPTZ;
  v_count INT;
BEGIN
  /* 윈도우 시작 시각으로 버킷을 잘라 동일 구간의 요청을 한 행에 모은다 */
  v_bucket := date_trunc('hour', NOW())
              + (floor(date_part('minute', NOW()) / p_window_minutes) * p_window_minutes) * INTERVAL '1 minute';

  INSERT INTO api_rate_limits (key, action, bucket_start, count, first_seen_at, last_seen_at)
  VALUES (p_key, p_action, v_bucket, 1, NOW(), NOW())
  ON CONFLICT (key, action, bucket_start)
  DO UPDATE SET count = api_rate_limits.count + 1, last_seen_at = NOW()
  RETURNING count INTO v_count;

  RETURN v_count <= p_limit;
END;
$$;

COMMENT ON FUNCTION public.check_intake_rate_limit IS
  '문의·대행 접수 레이트리밋. 한도 이내면 true, 초과하면 false. 익명 호출을 위해 SECURITY DEFINER.';

REVOKE ALL ON FUNCTION public.check_intake_rate_limit(TEXT, TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_intake_rate_limit(TEXT, TEXT, INT, INT) TO anon, authenticated;
