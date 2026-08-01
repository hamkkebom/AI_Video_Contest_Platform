-- ============================================================
-- 048: companies / company_members 익명 노출 차단 + 공개 주최자 뷰
--
-- 문제: 042(D-009)가 profiles·submissions·judges·bonus_entries 의
--       `USING (true)` SELECT 정책을 걷어냈지만 **companies 와
--       company_members 는 빠져 있었다**. 두 테이블은 지금도
--       `FOR SELECT USING (true)` 이고 anon 의 SELECT 권한도 회수된 적이 없다.
--       클라이언트 번들에 실리는 anon 키만으로 다음이 조회된다.
--         companies        : business_number(사업자등록번호, NOT NULL),
--                            representative_name(대표자명, NOT NULL),
--                            address, phone,
--                            business_license_image_url(사업자등록증 이미지)
--         company_members  : company_email, 그리고 user_id ↔ company_id 소속 관계
--
--       주최자를 외부에 개방하면(멀티테넌트) 이 테이블에 실제 사업자 정보가
--       쌓이므로, 개방 전에 닫아야 하는 선결 조건이다.
--
-- 해결: 042 와 동일한 패턴 — 민감 컬럼을 뺀 공개 뷰를 만들고
--       원본 테이블의 anon SELECT 를 회수한다.
--       공개 화면은 뷰만, 관리자·소속 멤버는 세션 클라이언트로 원본을 읽는다.
-- ============================================================

-- ------------------------------------------------------------
-- 1) 공개 주최자 뷰 — 사업자 정보 전면 제외 + 승인된 기업으로 한정
--    공개 화면(주최자 페이지, 공모전 카드의 주최자 표기)이 쓰는 컬럼만 노출한다.
--    business_number·representative_name·address·phone·business_license_image_url 제외.
--    승인 전(pending)·반려(rejected) 기업이 뷰로 새지 않도록 조건을 뷰에 내장한다.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public_companies AS
SELECT
  id,
  name,
  logo_url,
  website,
  description,
  created_at
FROM companies
WHERE status = 'approved';

COMMENT ON VIEW public_companies IS
  '비로그인 공개 화면용 주최자 투영. 사업자등록번호·대표자명·주소·연락처·사업자등록증 제외, 승인된 기업만. anon 은 companies 원본 대신 이 뷰만 조회한다.';

GRANT SELECT ON public_companies TO anon, authenticated;

-- ------------------------------------------------------------
-- 2) companies — 익명 차단
--    관리자는 전체, 소속 멤버는 자기 회사만 원본을 읽는다.
--    046 과 같은 이유로 관리자·멤버 정책은 TO authenticated 로 한정한다
--    (익명이 is_admin() 을 평가하며 profiles 를 건드리지 않게).
-- ------------------------------------------------------------
REVOKE SELECT ON companies FROM anon;

DROP POLICY IF EXISTS "companies: 누구나 조회" ON companies;

DROP POLICY IF EXISTS "companies: 소속 멤버 조회" ON companies;
CREATE POLICY "companies: 소속 멤버 조회" ON companies
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = companies.id
      AND company_members.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "companies: 관리자 조회" ON companies;
CREATE POLICY "companies: 관리자 조회" ON companies
FOR SELECT TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------
-- 3) company_members — 익명 차단
--    소속 관계와 company_email 은 공개 정보가 아니다.
--    본인 행, 같은 회사 멤버, 관리자만 조회한다.
--    같은 회사 멤버 조회는 자기 참조라 재귀를 피하려 SECURITY DEFINER 함수를 쓴다.
-- ------------------------------------------------------------
REVOKE SELECT ON company_members FROM anon;

CREATE OR REPLACE FUNCTION public.is_company_member(target_company_id INT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = target_company_id
      AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_company_member(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_company_member(INT) TO authenticated;

DROP POLICY IF EXISTS "company_members: 누구나 조회" ON company_members;

DROP POLICY IF EXISTS "company_members: 본인·같은 회사 조회" ON company_members;
CREATE POLICY "company_members: 본인·같은 회사 조회" ON company_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_company_member(company_id)
);

DROP POLICY IF EXISTS "company_members: 관리자 조회" ON company_members;
CREATE POLICY "company_members: 관리자 조회" ON company_members
FOR SELECT TO authenticated
USING (public.is_admin());
