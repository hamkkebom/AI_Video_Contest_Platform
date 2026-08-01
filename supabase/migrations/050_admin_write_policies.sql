-- ============================================================
-- 050: 관리자 쓰기 경로 개통 (아티클 / 회원 상태)
--
-- 배경: 관리자 화면에 아티클 작성·수정·삭제와 회원 수정·정지 버튼이 있는데
--       DB 에는 그 쓰기를 허용하는 정책이 하나도 없다.
--         articles : "누구나 조회"(SELECT) 하나뿐 — INSERT/UPDATE/DELETE 정책 없음
--         profiles : "본인만 수정" 하나뿐 — 관리자가 남의 계정을 못 건드림
--       그래서 /api/articles 의 POST 는 관리자 확인까지 통과한 뒤 RLS 에서 막히고,
--       아티클이 한 건도 생성되지 않는다. 화면만 있고 기능은 없던 셈이다.
--
-- 해결: 아티클은 콘텐츠라 일반 관리자 정책으로 열고,
--       프로필은 역할 상승 위험이 있으므로 컬럼을 좁힌 RPC 로만 연다.
--       (048·049 와 같은 최소 노출 원칙)
-- ============================================================

-- ------------------------------------------------------------
-- 1) articles — 관리자 쓰기
--    공개 조회는 기존 "누구나 조회"(is_published = true)를 그대로 둔다.
--    관리자는 미발행 초안도 봐야 하므로 조회 정책을 따로 추가한다.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "articles: 관리자 조회" ON articles;
CREATE POLICY "articles: 관리자 조회" ON articles
FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "articles: 관리자 생성" ON articles;
CREATE POLICY "articles: 관리자 생성" ON articles
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "articles: 관리자 수정" ON articles;
CREATE POLICY "articles: 관리자 수정" ON articles
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "articles: 관리자 삭제" ON articles;
CREATE POLICY "articles: 관리자 삭제" ON articles
FOR DELETE TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------
-- 2) profiles — 관리자 회원 상태 변경 RPC
--    테이블에 관리자 UPDATE 정책을 열면 roles 배열까지 통째로 쓸 수 있어
--    관리자 계정이 탈취될 경우 권한 상승 경로가 된다.
--    바꿀 수 있는 것을 status 한 컬럼으로 못박은 RPC 만 연다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_user_status(
  target_user_id UUID,
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

  IF new_status NOT IN ('active', 'pending', 'suspended') THEN
    RAISE EXCEPTION 'INVALID_STATUS';
  END IF;

  -- 마지막 관리자를 스스로 잠그는 사고를 막는다
  IF new_status <> 'active' AND target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'CANNOT_SUSPEND_SELF';
  END IF;

  UPDATE profiles
  SET status = new_status, updated_at = NOW()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_set_user_status IS
  '관리자 전용 회원 상태 변경(active/pending/suspended). status 한 컬럼만 바꾸며 roles 는 건드리지 않는다. 본인 정지는 거부.';
