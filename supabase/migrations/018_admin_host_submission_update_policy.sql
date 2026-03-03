-- ============================================================
-- 018: 관리자/주최자가 제출물 상태를 변경할 수 있도록 UPDATE RLS 정책 추가
-- 기존 정책: auth.uid() = user_id (본인만 수정 가능)
-- 추가 정책: admin 또는 host 역할이면 타인 제출물 상태 변경 가능
-- ============================================================

CREATE POLICY "submissions: 관리자/주최자 상태 변경"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.roles::text LIKE '%admin%' OR profiles.roles::text LIKE '%host%')
    )
  );
