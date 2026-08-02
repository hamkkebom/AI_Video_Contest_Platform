-- ============================================================
-- 054: 심사위원 배정을 실제로 가능하게 만든다
--
-- 배경 1 (쓰기 불가): judges 는 RLS 가 켜져 있는데 **SELECT 정책만 있다.**
--   042·046 이 조회 범위를 좁히면서 정책을 다시 썼지만 INSERT/UPDATE/DELETE 는
--   어느 마이그레이션에도 없다. 따라서 `POST /api/judges` 의 insert 는 RLS 에 막힌다.
--   050(articles)과 완전히 같은 사고다 — 화면의 버튼은 있는데 DB 가 거부한다.
--
-- 배경 2 (권한 구멍): 같은 API 가 `roles ⊇ {admin|host}` 만 확인하고 **해당 공모전의
--   주최자인지는 확인하지 않는다.** 멀티테넌트(D-014)에서 이건 아무 주최자나 남의
--   공모전에 심사위원을 꽂을 수 있다는 뜻이다.
--
-- 배경 3 (역할 부여 불가): 배정 시 대상자에게 judge 역할을 줘야 하는데 profiles 는
--   "본인만 수정"이라 남의 roles 를 못 바꾼다 (D-015 가 host 역할에서 겪은 것과 동일).
--
-- 결정: 테이블 쓰기를 열지 않고 검증이 내장된 SECURITY DEFINER RPC 로만 연다.
--       (IA.md §3-9 ③, D-015 와 같은 패턴)
-- ============================================================

-- ------------------------------------------------------------
-- 1) 배정 권한 판정 — 관리자이거나 그 공모전의 주최자인가
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_manage_contest_judges(p_contest_id INT)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_admin()
      OR EXISTS (
           SELECT 1 FROM contests
           WHERE id = p_contest_id AND host_user_id = auth.uid()
         );
$$;

REVOKE ALL ON FUNCTION public.can_manage_contest_judges(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_contest_judges(INT) TO authenticated;

-- ------------------------------------------------------------
-- 2) 심사위원 배정
--    이메일 발송이 없으므로 초대→수락 2단계가 아니라 즉시 배정이다.
--    (accepted_at 을 바로 찍는다 — 기존 API 도 그렇게 하고 있었다)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_contest_judge(
  p_contest_id INT,
  p_user_id UUID,
  p_is_external BOOLEAN DEFAULT FALSE
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_judge_id INT;
BEGIN
  IF NOT public.can_manage_contest_judges(p_contest_id) THEN
    RAISE EXCEPTION '이 공모전의 심사위원을 배정할 권한이 없습니다.'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION '대상 회원을 찾을 수 없습니다.' USING ERRCODE = 'P0002';
  END IF;

  /* UNIQUE(user_id, contest_id) — 재배정은 조용히 기존 건을 돌려준다 */
  INSERT INTO judges (user_id, contest_id, is_external, invited_at, accepted_at)
  VALUES (p_user_id, p_contest_id, COALESCE(p_is_external, FALSE), NOW(), NOW())
  ON CONFLICT (user_id, contest_id) DO UPDATE
    SET is_external = EXCLUDED.is_external
  RETURNING id INTO v_judge_id;

  /* judge 역할 부여 — 이미 있으면 건드리지 않는다 */
  UPDATE profiles
  SET roles = array_append(roles, 'judge')
  WHERE id = p_user_id
    AND NOT (roles @> ARRAY['judge']::text[]);

  RETURN v_judge_id;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_contest_judge(INT, UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_contest_judge(INT, UUID, BOOLEAN) TO authenticated;

-- ------------------------------------------------------------
-- 3) 심사위원 해제
--    다른 공모전에도 심사위원이면 judge 역할은 남긴다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.remove_contest_judge(p_judge_id INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contest_id INT;
  v_user_id UUID;
BEGIN
  SELECT contest_id, user_id INTO v_contest_id, v_user_id
  FROM judges WHERE id = p_judge_id;

  IF v_contest_id IS NULL THEN
    RAISE EXCEPTION '심사위원 배정을 찾을 수 없습니다.' USING ERRCODE = 'P0002';
  END IF;

  IF NOT public.can_manage_contest_judges(v_contest_id) THEN
    RAISE EXCEPTION '이 공모전의 심사위원을 해제할 권한이 없습니다.'
      USING ERRCODE = '42501';
  END IF;

  /* 이미 채점한 심사위원을 지우면 점수가 고아가 된다 — 막는다 */
  IF EXISTS (
    SELECT 1 FROM scores s
    WHERE s.judge_id = p_judge_id
  ) THEN
    RAISE EXCEPTION '이미 심사를 진행한 심사위원은 해제할 수 없습니다.'
      USING ERRCODE = '23503';
  END IF;

  DELETE FROM judges WHERE id = p_judge_id;

  /* 남은 배정이 없을 때만 judge 역할 회수 */
  IF NOT EXISTS (SELECT 1 FROM judges WHERE user_id = v_user_id) THEN
    UPDATE profiles
    SET roles = array_remove(roles, 'judge')
    WHERE id = v_user_id
      AND roles @> ARRAY['judge']::text[]
      /* 역할이 judge 하나뿐이면 빈 배열이 되므로 participant 로 되돌린다 */
      AND array_length(array_remove(roles, 'judge'), 1) IS NOT NULL;

    UPDATE profiles
    SET roles = ARRAY['participant']::text[]
    WHERE id = v_user_id
      AND roles @> ARRAY['judge']::text[]
      AND array_length(array_remove(roles, 'judge'), 1) IS NULL;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.remove_contest_judge(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_contest_judge(INT) TO authenticated;

-- ------------------------------------------------------------
-- 4) 배정 대상 회원 찾기
--    주최자에게 전체 회원 명부를 열어 주면 안 된다(D-014 의 PII 원칙).
--    초대할 사람의 이메일을 이미 아는 경우만 통과시키는 정확 일치 조회로 좁힌다.
--    반환값도 id·이름뿐 — 호출자가 입력하지 않은 정보는 돌려주지 않는다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.find_member_for_judge(p_email TEXT)
RETURNS TABLE (id UUID, name TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.id, p.name
  FROM profiles p
  WHERE public.is_admin_or_host()
    AND lower(p.email) = lower(btrim(p_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_member_for_judge(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_member_for_judge(TEXT) TO authenticated;

COMMENT ON FUNCTION public.assign_contest_judge(INT, UUID, BOOLEAN) IS
  '공모전 심사위원 배정. 관리자 또는 해당 공모전 주최자만 호출할 수 있다.';
COMMENT ON FUNCTION public.find_member_for_judge(TEXT) IS
  '이메일 정확 일치로 회원 1명을 찾는다. 회원 명부 열람 용도가 아니다.';
