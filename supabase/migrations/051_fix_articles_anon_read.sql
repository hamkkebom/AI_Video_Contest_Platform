-- ============================================================
-- 051: articles 익명 조회 복구 (050 회귀 수정)
--
-- 사고: 050 이 articles 에 관리자 조회 정책을 추가했다.
--         CREATE POLICY "articles: 관리자 조회" ON articles
--         FOR SELECT TO authenticated USING (public.is_admin());
--       `TO authenticated` 로 한정했는데도 익명 조회가 다음으로 깨졌다.
--         42501 permission denied for table profiles
--       is_admin() 이 profiles 를 읽는데 anon 은 042 로 profiles SELECT 를 잃었고,
--       이 환경에서는 역할을 한정해도 정책 식 평가 단계에서 접근이 시도된다.
--       결과: 공개 스토리 페이지가 아티클 0건으로 표시됐다.
--
-- 참고: 046 이 같은 방식으로 "고쳤다"는 inquiries·agency_requests 도 실제로는
--       동일하게 anon 401 이다. `TO authenticated` 한정은 이 증상을 막지 못한다.
--
-- 해결: 정책에서 is_admin() 을 걷어내고, 042·048 에서 이미 검증된 뷰 패턴을 쓴다.
--       익명은 발행분만 담긴 뷰를, 관리자는 원본 테이블을 읽는다.
-- ============================================================

-- ------------------------------------------------------------
-- 1) 문제 정책 제거 — 이것만으로 익명 조회가 즉시 복구된다
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "articles: 관리자 조회" ON articles;

-- ------------------------------------------------------------
-- 2) 공개 아티클 뷰 — 발행분만
--    뷰는 소유자 권한으로 평가되므로 anon 이 원본 정책을 건드리지 않는다.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public_articles AS
SELECT
  id,
  type,
  title,
  slug,
  excerpt,
  content,
  thumbnail_url,
  tags,
  author_id,
  is_published,
  published_at,
  created_at,
  updated_at
FROM articles
WHERE is_published = true;

COMMENT ON VIEW public_articles IS
  '비로그인 공개 화면용 아티클 투영. 발행분만. 원본 articles 는 관리자 정책이 걸려 있어 anon 이 직접 읽으면 is_admin() 평가에서 막힌다.';

GRANT SELECT ON public_articles TO anon, authenticated;

-- ------------------------------------------------------------
-- 3) 관리자 조회 경로
--    미발행 초안을 봐야 하므로 SECURITY DEFINER 함수로 우회한다.
--    정책에 is_admin() 을 다시 넣으면 같은 사고가 재발한다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_articles()
RETURNS SETOF articles
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED';
  END IF;
  RETURN QUERY SELECT * FROM articles ORDER BY published_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_articles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_articles() TO authenticated;

COMMENT ON FUNCTION public.admin_list_articles IS
  '관리자용 아티클 전체 조회(미발행 포함). 정책에 is_admin() 을 넣으면 익명 조회가 깨지므로 함수로 뺐다. (051)';
