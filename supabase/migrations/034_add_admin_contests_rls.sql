-- 034: admin 역할의 공모전 UPDATE/DELETE 정책 추가
-- 기존: host_user_id만 수정/삭제 가능 → admin이 다른 호스트의 공모전을 수정할 수 없음

DROP POLICY IF EXISTS "contests: 관리자 수정" ON contests;
CREATE POLICY "contests: 관리자 수정" ON contests
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roles::text LIKE '%admin%')
);

DROP POLICY IF EXISTS "contests: 관리자 삭제" ON contests;
CREATE POLICY "contests: 관리자 삭제" ON contests
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roles::text LIKE '%admin%')
);
