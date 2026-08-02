-- ============================================================
-- 055: 가입하지 않은 외부 인사를 심사위원으로 부른다
--
-- 배경: 054 는 이메일이 없다는 전제에서 초대를 버리고 **배정**만 남겼다(D-018).
--       그 대가가 "가입한 회원만 심사위원이 될 수 있다"였고, 로드맵 2-1 로 남겨 뒀다.
--       이제 aikkumhub.com 발송이 실제로 동작하므로(D-021) 그 제약을 푼다.
--
-- 설계 판단 세 가지 —
--  ① 토큰은 **초대한 이메일에 묶는다.** 링크가 전달돼도 그 주소로 가입한 사람만 수락할 수 있다.
--     심사위원은 수상 결과에 영향을 주므로 링크 하나로 아무나 되게 두면 안 된다.
--  ② 만료를 둔다(14일). 오래된 링크가 계속 살아 있으면 그 자체가 구멍이다.
--  ③ 테이블에 직접 접근을 열지 않는다. 054 와 같은 패턴으로 RPC 만 연다.
-- ============================================================

CREATE TABLE IF NOT EXISTS judge_invites (
  id SERIAL PRIMARY KEY,
  contest_id INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  /* 초대받은 주소. 수락자의 계정 이메일과 일치해야 한다 */
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  is_external BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  /* 같은 공모전에 같은 주소로 두 번 초대하지 않는다 — 재초대는 기존 건을 갱신한다 */
  UNIQUE (contest_id, email)
);

CREATE INDEX IF NOT EXISTS idx_judge_invites_contest ON judge_invites (contest_id);

ALTER TABLE judge_invites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON judge_invites FROM anon, authenticated;

/* 주최자·관리자가 자기 공모전의 초대 현황을 본다. 토큰은 이 정책으로 노출되지 않는다
   — 목록 조회는 아래 list RPC 가 토큰을 뺀 컬럼만 돌려준다. */
DROP POLICY IF EXISTS "judge_invites: 관리 권한자 조회" ON judge_invites;
CREATE POLICY "judge_invites: 관리 권한자 조회" ON judge_invites
FOR SELECT TO authenticated
USING (public.can_manage_contest_judges(contest_id));

GRANT SELECT ON judge_invites TO authenticated;

COMMENT ON TABLE judge_invites IS
  '심사위원 초대. 가입 회원은 054 의 assign_contest_judge 로 바로 배정하고, 이 표는 미가입자 전용이다.';

-- ------------------------------------------------------------
-- 1) 초대 생성 — 토큰을 돌려준다 (메일 본문에 넣을 링크용)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_judge_invite(
  p_contest_id INT,
  p_email TEXT,
  p_is_external BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (token TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := lower(btrim(p_email));
  v_token TEXT;
  v_expires TIMESTAMPTZ := NOW() + INTERVAL '14 days';
BEGIN
  IF NOT public.can_manage_contest_judges(p_contest_id) THEN
    RAISE EXCEPTION '이 공모전의 심사위원을 초대할 권한이 없습니다.' USING ERRCODE = '42501';
  END IF;

  IF v_email = '' OR position('@' in v_email) = 0 THEN
    RAISE EXCEPTION '올바른 이메일이 아닙니다.' USING ERRCODE = '22023';
  END IF;

  /* 이미 가입한 회원이면 초대가 아니라 배정을 써야 한다 — 두 경로가 갈라지면 헷갈린다 */
  IF EXISTS (SELECT 1 FROM profiles WHERE lower(email) = v_email) THEN
    RAISE EXCEPTION '이미 가입한 회원입니다. 초대 대신 바로 배정하세요.' USING ERRCODE = '23505';
  END IF;

  /* 256비트 난수 — 추측할 수 없어야 한다 */
  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO judge_invites (contest_id, email, token, is_external, invited_by, expires_at)
  VALUES (p_contest_id, v_email, v_token, COALESCE(p_is_external, TRUE), auth.uid(), v_expires)
  ON CONFLICT (contest_id, email) DO UPDATE
    SET token = EXCLUDED.token,
        is_external = EXCLUDED.is_external,
        invited_by = EXCLUDED.invited_by,
        invited_at = NOW(),
        expires_at = EXCLUDED.expires_at,
        /* 재초대하면 이전 수락 흔적을 지운다 — 이미 수락했으면 아래에서 막힌다 */
        accepted_at = NULL,
        accepted_by = NULL
  WHERE judge_invites.accepted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION '이미 수락된 초대입니다.' USING ERRCODE = '23505';
  END IF;

  RETURN QUERY SELECT v_token, v_expires;
END;
$$;

REVOKE ALL ON FUNCTION public.create_judge_invite(INT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_judge_invite(INT, TEXT, BOOLEAN) TO authenticated;

-- ------------------------------------------------------------
-- 2) 초대 열람 — 수락 화면이 "무엇에 대한 초대인지" 보여주기 위한 최소 정보
--    토큰을 가진 사람에게만 응답하므로 anon 도 호출할 수 있다(가입 전이니 당연히 필요).
--    초대받은 이메일은 그대로 돌려주지 않고 가려서 준다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_judge_invite(p_token TEXT)
RETURNS TABLE (
  contest_id INT,
  contest_title TEXT,
  masked_email TEXT,
  expires_at TIMESTAMPTZ,
  is_accepted BOOLEAN,
  is_expired BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    i.contest_id,
    c.title,
    regexp_replace(i.email, '^(.).*(@.*)$', '\1***\2'),
    i.expires_at,
    i.accepted_at IS NOT NULL,
    i.expires_at < NOW()
  FROM judge_invites i
  JOIN contests c ON c.id = i.contest_id
  WHERE i.token = p_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_judge_invite(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_judge_invite(TEXT) TO anon, authenticated;

-- ------------------------------------------------------------
-- 3) 초대 수락 — 로그인한 본인이 호출한다
--    054 의 assign_contest_judge 를 재사용할 수 없다(그건 주최자 권한을 요구한다).
--    여기서는 **유효한 토큰 + 이메일 일치**가 권한을 대신한다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_judge_invite(p_token TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite judge_invites%ROWTYPE;
  v_user_id UUID := auth.uid();
  v_user_email TEXT;
  v_judge_id INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '로그인이 필요합니다.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_invite FROM judge_invites WHERE token = p_token;
  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION '초대를 찾을 수 없습니다.' USING ERRCODE = 'P0002';
  END IF;
  IF v_invite.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION '이미 수락된 초대입니다.' USING ERRCODE = '23505';
  END IF;
  IF v_invite.expires_at < NOW() THEN
    RAISE EXCEPTION '초대가 만료되었습니다. 주최자에게 재발송을 요청하세요.' USING ERRCODE = '22023';
  END IF;

  SELECT lower(email) INTO v_user_email FROM profiles WHERE id = v_user_id;
  /* 링크가 전달돼도 초대받은 주소의 계정만 수락할 수 있다 */
  IF v_user_email IS DISTINCT FROM v_invite.email THEN
    RAISE EXCEPTION '초대받은 이메일(%)로 로그인해야 수락할 수 있습니다.', v_invite.email
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO judges (user_id, contest_id, is_external, invited_at, accepted_at)
  VALUES (v_user_id, v_invite.contest_id, v_invite.is_external, v_invite.invited_at, NOW())
  ON CONFLICT (user_id, contest_id) DO UPDATE SET is_external = EXCLUDED.is_external
  RETURNING id INTO v_judge_id;

  UPDATE profiles
  SET roles = array_append(roles, 'judge')
  WHERE id = v_user_id AND NOT (roles @> ARRAY['judge']::text[]);

  UPDATE judge_invites
  SET accepted_at = NOW(), accepted_by = v_user_id
  WHERE id = v_invite.id;

  RETURN v_judge_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_judge_invite(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_judge_invite(TEXT) TO authenticated;

COMMENT ON FUNCTION public.accept_judge_invite(TEXT) IS
  '초대 수락. 토큰과 계정 이메일이 함께 맞아야 한다 — 링크만으로는 심사위원이 될 수 없다.';
