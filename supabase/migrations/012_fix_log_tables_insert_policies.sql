-- ============================================================
-- 로그 테이블 수정: INSERT 정책 추가 + 스키마 보정
-- 문제: activity_logs, ip_logs에 RLS INSERT 정책이 없어
--       모든 로그 삽입이 조용히 차단되고 있었음
-- ============================================================

-- 1. activity_logs: target_type CHECK 제약 조건 제거
--    코드에서 'profile', 'video', '', null 등 다양한 값을 전송하는데
--    기존 CHECK는 ('contest','submission','user','article','inquiry')만 허용
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_target_type_check;

-- 2. activity_logs: target_type / target_id 를 nullable로 변경
--    search 액션 등은 targetType/targetId 없이 호출됨
ALTER TABLE activity_logs ALTER COLUMN target_type DROP NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN target_id DROP NOT NULL;

-- 3. ip_logs: user_agent 컬럼 추가
--    코드에서 user_agent를 삽입하지만 스키마에 누락되어 있었음
ALTER TABLE ip_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 4. activity_logs: INSERT 정책 추가
--    인증 사용자 본인 로그 + session_out(user_id=null) 허용
CREATE POLICY "activity_logs: 로그 삽입 허용"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 5. ip_logs: INSERT 정책 추가
--    인증 사용자 본인 IP 로그만 허용
CREATE POLICY "ip_logs: 로그 삽입 허용"
  ON ip_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
