-- ============================================================
-- 049: 주최자 온보딩 — 기업 등록 신청 / 관리자 승인 RPC
--
-- 배경: 멀티테넌트(D-014)로 가려면 외부 주최자가 스스로 기업을 등록하고
--       관리자 승인 후 주최자 권한을 얻는 흐름이 필요하다. 그런데
--       - company_members 에는 INSERT 정책이 없어 신청자가 자신을
--         owner 로 등록할 수 없고, 정책을 열면 아무나 임의 회사의
--         멤버로 자신을 추가할 수 있게 된다 (소속 위조).
--       - 신청 직후에는 아직 멤버가 아니라서 companies 의
--         "소속 멤버 조회" 정책에 걸려 INSERT ... RETURNING 도 실패한다
--         (가입 전에는 자기 회사를 SELECT 할 수 없는 순환).
--       - profiles 는 "본인만 수정"이라 관리자가 승인 시점에 host 역할을
--         부여할 방법이 없다.
--
-- 해결: 신청과 승인을 각각 SECURITY DEFINER RPC 로 원자 처리한다.
--       클라이언트에 테이블 쓰기 권한을 여는 대신, 검증이 내장된
--       두 개의 좁은 문만 연다. (042·048 과 같은 최소 노출 원칙)
-- ============================================================

-- ------------------------------------------------------------
-- 1) companies INSERT 정책 강화 — 직접 INSERT 는 pending 만 허용
--    (신청은 RPC 로 하므로 실사용 경로는 아니지만, 직접 INSERT 로
--     status='approved' 를 밀어 넣는 우회를 막는다)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "companies: 인증 사용자 생성" ON companies;
CREATE POLICY "companies: 인증 사용자 생성" ON companies
FOR INSERT TO authenticated
WITH CHECK (status = 'pending');

-- ------------------------------------------------------------
-- 2) 기업 등록 신청 RPC — 회사(pending) + 신청자 owner 멤버십을 원자 생성
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_host_company(
  p_name TEXT,
  p_business_number TEXT,
  p_representative_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF coalesce(trim(p_name), '') = '' OR coalesce(trim(p_business_number), '') = '' OR coalesce(trim(p_representative_name), '') = '' THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;

  -- 이미 owner 인 회사(반려 제외)가 있으면 중복 신청 차단
  IF EXISTS (
    SELECT 1
    FROM company_members cm
    JOIN companies c ON c.id = cm.company_id
    WHERE cm.user_id = auth.uid()
      AND cm.role = 'owner'
      AND c.status IN ('pending', 'approved')
  ) THEN
    RAISE EXCEPTION 'ALREADY_APPLIED';
  END IF;

  INSERT INTO companies (name, business_number, representative_name, phone, website, description, status)
  VALUES (trim(p_name), trim(p_business_number), trim(p_representative_name), nullif(trim(p_phone), ''), nullif(trim(p_website), ''), nullif(trim(p_description), ''), 'pending')
  RETURNING id INTO v_company_id;

  INSERT INTO company_members (company_id, user_id, role)
  VALUES (v_company_id, auth.uid(), 'owner');

  RETURN v_company_id;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_host_company(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_host_company(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.apply_host_company IS
  '주최자 온보딩 신청. 회사(pending)와 신청자 owner 멤버십을 원자 생성. 중복 신청(ALREADY_APPLIED)·사업자번호 중복(unique 위반)은 예외로 반환.';

-- ------------------------------------------------------------
-- 3) 관리자 승인/반려 RPC — 승인 시 owner 들에게 host 역할 부여
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_company_status(
  target_company_id INT,
  new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED';
  END IF;

  IF new_status NOT IN ('approved', 'rejected', 'pending') THEN
    RAISE EXCEPTION 'INVALID_STATUS';
  END IF;

  UPDATE companies
  SET status = new_status, updated_at = NOW()
  WHERE id = target_company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'COMPANY_NOT_FOUND';
  END IF;

  -- 승인 시 owner 멤버 전원에게 host 역할 부여 (이미 있으면 그대로)
  IF new_status = 'approved' THEN
    UPDATE profiles
    SET roles = array_append(roles, 'host')
    WHERE id IN (
      SELECT user_id FROM company_members
      WHERE company_id = target_company_id AND role = 'owner'
    )
    AND NOT (roles @> ARRAY['host']);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_company_status(INT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_company_status(INT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_set_company_status IS
  '관리자 전용 기업 승인/반려. 승인 시 owner 에게 host 역할을 함께 부여한다. 내부에서 is_admin() 을 강제한다.';
