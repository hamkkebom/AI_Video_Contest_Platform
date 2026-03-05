-- ============================================================
-- 024: bonus_entries DELETE/UPDATE RLS 정책 — 멱등 적용
-- 기존 정책이 있으면 건너뛰고, 없으면 생성
-- ============================================================

DO $$
BEGIN
  -- 본인 출품작의 가산점 인증 삭제 허용
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bonus_entries'
      AND policyname = 'bonus_entries: 본인 제출만 삭제'
  ) THEN
    CREATE POLICY "bonus_entries: 본인 제출만 삭제"
      ON bonus_entries FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM submissions
          WHERE submissions.id = bonus_entries.submission_id
            AND submissions.user_id = auth.uid()
        )
      );
    RAISE NOTICE '정책 생성: bonus_entries: 본인 제출만 삭제';
  ELSE
    RAISE NOTICE '정책 이미 존재: bonus_entries: 본인 제출만 삭제';
  END IF;

  -- 관리자 가산점 인증 삭제 허용
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bonus_entries'
      AND policyname = 'bonus_entries: 관리자 삭제'
  ) THEN
    CREATE POLICY "bonus_entries: 관리자 삭제"
      ON bonus_entries FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
            AND profiles.roles::text LIKE '%admin%'
        )
      );
    RAISE NOTICE '정책 생성: bonus_entries: 관리자 삭제';
  ELSE
    RAISE NOTICE '정책 이미 존재: bonus_entries: 관리자 삭제';
  END IF;

  -- 본인 출품작의 가산점 인증 수정 허용
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bonus_entries'
      AND policyname = 'bonus_entries: 본인 제출만 수정'
  ) THEN
    CREATE POLICY "bonus_entries: 본인 제출만 수정"
      ON bonus_entries FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM submissions
          WHERE submissions.id = bonus_entries.submission_id
            AND submissions.user_id = auth.uid()
        )
      );
    RAISE NOTICE '정책 생성: bonus_entries: 본인 제출만 수정';
  ELSE
    RAISE NOTICE '정책 이미 존재: bonus_entries: 본인 제출만 수정';
  END IF;
END $$;
