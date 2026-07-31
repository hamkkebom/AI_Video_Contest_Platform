-- ============================================================
-- 046: 관리자 판별 정책을 authenticated 로 한정
--
-- 문제: 익명(anon)이 inquiries / agency_requests 에 INSERT 하면서
--       `Prefer: return=representation` 을 붙이면(= Supabase JS 의
--       .insert().select() 와 동일) 다음 오류로 실패한다.
--         42501 permission denied for table profiles
--
--       INSERT 후 RETURNING 이 SELECT 정책을 평가하는데, 그 정책이
--       public.is_admin() 을 호출하고 이 함수가 profiles 를 읽기 때문이다.
--       is_admin() 은 SECURITY DEFINER 지만 RLS 정책 식 안에서 평가될 때
--       anon 권한으로 profiles 접근이 시도된다.
--       (FK 가 없는 agency_requests 에서도 동일하게 재현되어
--        user_id → profiles 외래키가 아니라 정책이 원인임을 확인했다.)
--
-- 영향: 현재 접수 API 는 .insert() 만 호출하고 .select() 를 붙이지 않아
--       실제 서비스는 정상 동작한다. 다만 앞으로 누군가 .select() 를
--       덧붙이는 순간 접수가 통째로 막히는 지뢰라 미리 제거한다.
--
-- 해결: 관리자·본인 조회 정책을 `TO authenticated` 로 한정한다.
--       익명은 애초에 이 정책들을 평가하지 않으므로 profiles 를 건드리지 않는다.
--       익명에게는 SELECT 정책이 하나도 남지 않아 조회 결과가 비고(0행),
--       권한 오류 대신 정상 응답이 나간다.
-- ============================================================

-- ------------------------------------------------------------
-- inquiries
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "inquiries: 본인만 조회" ON inquiries;
CREATE POLICY "inquiries: 본인만 조회" ON inquiries
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "inquiries: 관리자 조회" ON inquiries;
CREATE POLICY "inquiries: 관리자 조회" ON inquiries
FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "inquiries: 관리자 처리" ON inquiries;
CREATE POLICY "inquiries: 관리자 처리" ON inquiries
FOR UPDATE TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------
-- agency_requests
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "agency_requests: 관리자 조회" ON agency_requests;
CREATE POLICY "agency_requests: 관리자 조회" ON agency_requests
FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "agency_requests: 관리자 처리" ON agency_requests;
CREATE POLICY "agency_requests: 관리자 처리" ON agency_requests
FOR UPDATE TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------
-- 042 에서 만든 정책들도 같은 이유로 대상을 좁힌다.
-- 익명은 공개 뷰(public_profiles / public_submissions)만 쓰므로
-- 원본 테이블 정책을 평가할 일이 없다.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "profiles: 본인 조회" ON profiles;
CREATE POLICY "profiles: 본인 조회" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: 관리자 조회" ON profiles;
CREATE POLICY "profiles: 관리자 조회" ON profiles
FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "submissions: 본인 조회" ON submissions;
CREATE POLICY "submissions: 본인 조회" ON submissions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "submissions: 관리자·주최자 조회" ON submissions;
CREATE POLICY "submissions: 관리자·주최자 조회" ON submissions
FOR SELECT TO authenticated
USING (public.is_admin_or_host());

DROP POLICY IF EXISTS "submissions: 심사위원 조회" ON submissions;
CREATE POLICY "submissions: 심사위원 조회" ON submissions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM judges j
    WHERE j.user_id = auth.uid() AND j.contest_id = submissions.contest_id
  )
);

DROP POLICY IF EXISTS "judges: 본인 조회" ON judges;
CREATE POLICY "judges: 본인 조회" ON judges
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "judges: 관리자·주최자 조회" ON judges;
CREATE POLICY "judges: 관리자·주최자 조회" ON judges
FOR SELECT TO authenticated
USING (public.is_admin_or_host());

DROP POLICY IF EXISTS "bonus_entries: 본인 조회" ON bonus_entries;
CREATE POLICY "bonus_entries: 본인 조회" ON bonus_entries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM submissions s
    WHERE s.id = bonus_entries.submission_id AND s.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "bonus_entries: 관리자·주최자 조회" ON bonus_entries;
CREATE POLICY "bonus_entries: 관리자·주최자 조회" ON bonus_entries
FOR SELECT TO authenticated
USING (public.is_admin_or_host());
