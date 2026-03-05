-- ============================================================
-- 022: bonus_entries DELETE/UPDATE RLS 정책 추가
-- 문제: 출품작 수정 시 가산점 인증 삭제→재삽입 패턴에서
--       DELETE 정책이 없어 삭제가 조용히 실패 (0 rows affected)
--       → UNIQUE 제약으로 INSERT도 실패 → 가산점 데이터 유실
-- ============================================================

-- 본인 출품작의 가산점 인증 삭제 허용
CREATE POLICY "bonus_entries: 본인 제출만 삭제"
  ON bonus_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = bonus_entries.submission_id
        AND submissions.user_id = auth.uid()
    )
  );

-- 관리자는 모든 가산점 인증 삭제 허용
CREATE POLICY "bonus_entries: 관리자 삭제"
  ON bonus_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.roles::text LIKE '%admin%'
    )
  );

-- 본인 출품작의 가산점 인증 수정 허용
CREATE POLICY "bonus_entries: 본인 제출만 수정"
  ON bonus_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = bonus_entries.submission_id
        AND submissions.user_id = auth.uid()
    )
  );
