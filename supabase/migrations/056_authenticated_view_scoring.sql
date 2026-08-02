-- ============================================================
-- 056: 조회수를 점수에 쓸 때는 로그인 조회만 센다
--
-- 배경: 026 의 rpc_record_view 는 이미 방어가 두껍다 — IP당 분당 60회 레이트리밋,
--       6시간 중복 제거, 스파이크·누적 이상 플래그. 그럼에도 **비로그인 조회는
--       ip_hash 로 식별**되므로, IP를 바꿔 가며 부풀리는 것을 원천 차단하지는 못한다.
--
--       표시용 조회수(submissions.views)는 그래도 괜찮다 — 틀려도 순위가 바뀌지 않는다.
--       문제는 `online_vote_type` 에 views 가 들어간 공모전이다. 그때는 조회수가
--       **상금을 가르는 값**이 되고, 그 값이 익명 트래픽으로 움직여선 안 된다.
--       (로드맵 4번이 "인증 조회 집계 정책"이라고 적어 둔 것이 이것이다)
--
-- 결정: 표시와 채점을 분리한다. 화면에 보이는 조회수는 지금 그대로 두고,
--       **결과 계산만** 로그인 사용자의 조회로 다시 센다.
--       기존 데이터는 영향이 없다 — 지금 있는 공모전은 online_vote_type='likes' 다.
-- ============================================================

CREATE OR REPLACE FUNCTION public.contest_authenticated_view_counts(p_contest_id INT)
RETURNS TABLE (submission_id INT, authenticated_views BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  /* 054 의 판정을 그대로 쓴다 — 관리자이거나 그 공모전의 주최자 */
  IF NOT public.can_manage_contest_judges(p_contest_id) THEN
    RAISE EXCEPTION '이 공모전의 집계를 조회할 권한이 없습니다.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT v.submission_id, COUNT(*)::BIGINT
  FROM submission_views v
  JOIN submissions s ON s.id = v.submission_id
  WHERE s.contest_id = p_contest_id
    /* 익명 조회(user_id IS NULL)는 세지 않는다 — ip_hash 는 바꿀 수 있다 */
    AND v.user_id IS NOT NULL
  GROUP BY v.submission_id;
END;
$$;

REVOKE ALL ON FUNCTION public.contest_authenticated_view_counts(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contest_authenticated_view_counts(INT) TO authenticated;

COMMENT ON FUNCTION public.contest_authenticated_view_counts(INT) IS
  '채점용 조회수. 화면에 보이는 submissions.views 와 달리 로그인 조회만 센다.';
