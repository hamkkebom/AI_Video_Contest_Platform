-- ============================================================
-- 042 롤백 — 문제 발생 시 즉시 실행하여 이전 상태로 되돌린다.
--
-- ⚠️ 경고: 이 스크립트를 실행하면 개인정보 노출 상태로 되돌아간다.
--          사이트가 깨져서 급히 복구해야 할 때만 쓰고,
--          원인을 고친 뒤 042를 다시 적용할 것.
-- ============================================================

-- 1) anon 원본 테이블 권한 복구
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON submissions TO anon;
GRANT SELECT ON judges TO anon;
GRANT SELECT ON bonus_entries TO anon;

-- 2) 원래의 전체 허용 정책 복구
DROP POLICY IF EXISTS "profiles: 본인 조회" ON profiles;
DROP POLICY IF EXISTS "profiles: 관리자 조회" ON profiles;
CREATE POLICY "profiles: 누구나 조회" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "submissions: 본인 조회" ON submissions;
DROP POLICY IF EXISTS "submissions: 관리자·주최자 조회" ON submissions;
DROP POLICY IF EXISTS "submissions: 심사위원 조회" ON submissions;
CREATE POLICY "submissions: 누구나 조회" ON submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "judges: 본인 조회" ON judges;
DROP POLICY IF EXISTS "judges: 관리자·주최자 조회" ON judges;
CREATE POLICY "judges: 누구나 조회" ON judges FOR SELECT USING (true);

DROP POLICY IF EXISTS "bonus_entries: 본인 조회" ON bonus_entries;
DROP POLICY IF EXISTS "bonus_entries: 관리자·주최자 조회" ON bonus_entries;
CREATE POLICY "bonus_entries: 누구나 조회" ON bonus_entries FOR SELECT USING (true);

-- 3) 뷰는 남겨둬도 무해하므로 유지한다.
--    (코드가 뷰를 참조하는 상태로 배포됐다면 뷰를 지우면 사이트가 깨진다)
-- DROP VIEW IF EXISTS public_profiles;
-- DROP VIEW IF EXISTS public_submissions;
