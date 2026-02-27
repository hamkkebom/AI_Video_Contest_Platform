-- ============================================================
-- 015: 관리자가 다른 사용자 명의로 출품작을 등록할 수 있도록 RLS 정책 추가
-- 기존 정책: auth.uid() = user_id (본인만 생성 가능)
-- 추가 정책: admin 역할이면 타인 명의로도 생성 가능
-- ============================================================

CREATE POLICY "submissions: 관리자 대리 생성"
  ON submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.roles::text LIKE '%admin%'
    )
  );
