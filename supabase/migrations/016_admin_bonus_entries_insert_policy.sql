-- ============================================================
-- 016: 관리자가 대리 등록한 출품작에 가산점 인증을 추가할 수 있도록 RLS 정책 추가
-- 기존 정책: submission의 user_id = auth.uid() 인 경우만 생성 가능 (본인 출품작만)
-- 추가 정책: admin 역할이면 모든 출품작에 가산점 인증 생성 가능
-- ============================================================

CREATE POLICY "bonus_entries: 관리자 대리 생성"
  ON bonus_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.roles::text LIKE '%admin%'
    )
  );
