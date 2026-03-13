-- ============================================================
-- 027: submissions 테이블 보완
--   1) submitter_name / submitter_phone 컬럼 추가
--   2) 관리자 삭제 RLS 정책 추가
-- ============================================================

-- 1. 제출자 이름 / 연락처 컬럼 (프로덕션에 이미 있을 수 있으므로 IF NOT EXISTS)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitter_name TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitter_phone TEXT;

-- 2. 관리자 출품작 삭제 정책 (중복 방지를 위해 DROP 후 CREATE)
DROP POLICY IF EXISTS "submissions: 관리자 삭제" ON submissions;
CREATE POLICY "submissions: 관리자 삭제" ON submissions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.roles::text LIKE '%admin%'
  )
);
