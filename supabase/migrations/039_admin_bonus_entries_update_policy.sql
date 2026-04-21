-- 039: bonus_entries 관리자 UPDATE RLS 정책 추가
-- 022/024에서 DELETE는 관리자 정책 있으나 UPDATE는 '본인 제출만 수정'뿐이어서
-- 관리자가 타 유저 출품작의 가산점 인증 승인/거절 시 RLS 차단 → PGRST116 에러.
-- 037(승인 컬럼 추가)과 함께 왔어야 할 정책. 멱등 적용.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bonus_entries'
      AND policyname = 'bonus_entries: 관리자 수정'
  ) THEN
    CREATE POLICY "bonus_entries: 관리자 수정"
      ON bonus_entries FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
            AND profiles.roles::text LIKE '%admin%'
        )
      );
    RAISE NOTICE '정책 생성: bonus_entries: 관리자 수정';
  ELSE
    RAISE NOTICE '정책 이미 존재: bonus_entries: 관리자 수정';
  END IF;
END $$;
