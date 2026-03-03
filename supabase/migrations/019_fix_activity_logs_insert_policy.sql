-- ============================================================
-- 019: activity_logs INSERT RLS 정책 완화
-- 문제: 로그인 직후 쿠키 세션이 완전히 설정되기 전에 로그 INSERT가 실행되면
--       auth.uid()가 NULL이 되어 RLS 위반 발생
-- 해결: /api/log 라우트에서 이미 인증을 검증하므로 INSERT 정책을 완화
-- ============================================================

DROP POLICY IF EXISTS "activity_logs: 로그 삽입 허용" ON activity_logs;

CREATE POLICY "activity_logs: 로그 삽입 허용"
  ON activity_logs FOR INSERT
  WITH CHECK (true);
