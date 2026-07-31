-- ============================================================
-- 047: auth.users NULL 컬럼 보정 — 테스트 관리자 admin6~13 로그인 불가 수정
--
-- 증상: admin6~13 으로 로그인하면 500 "Database error querying schema".
--       admin1~5 는 정상. profiles·auth.identities 는 모두 정상 생성돼 있다.
--
-- 원인: 040 이 auth.users 를 SQL 로 직접 INSERT 하면서 confirmation_token 과
--       recovery_token 만 빈 문자열로 채우고 나머지 토큰 컬럼은 비워뒀다.
--       GoTrue 는 이 컬럼들을 NOT NULL 문자열로 스캔하므로 NULL 을 만나면
--       행 전체를 읽지 못하고 위 오류를 낸다.
--
-- 같은 문제를 예전에도 겪어 supabase/fix_auth_users_null_columns.sql 로
-- 손수 고쳤지만 마이그레이션으로 남기지 않아 040 에서 재발했다.
-- 이번에는 마이그레이션으로 편입해 다음에 계정을 추가해도 반복되지 않게 한다.
--
-- 주의: phone 컬럼은 UNIQUE 제약이 있어 건드리지 않는다.
--       빈 문자열로 채우면 두 번째 계정부터 중복 위반이 난다.
-- ============================================================

UPDATE auth.users SET
  confirmation_token          = COALESCE(confirmation_token, ''),
  recovery_token              = COALESCE(recovery_token, ''),
  email_change                = COALESCE(email_change, ''),
  email_change_token_new      = COALESCE(email_change_token_new, ''),
  email_change_token_current  = COALESCE(email_change_token_current, ''),
  email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
  reauthentication_token      = COALESCE(reauthentication_token, '')
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change IS NULL
   OR email_change_token_new IS NULL
   OR email_change_token_current IS NULL
   OR email_change_confirm_status IS NULL
   OR reauthentication_token IS NULL;

UPDATE auth.users SET
  phone_change       = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '')
WHERE phone_change IS NULL
   OR phone_change_token IS NULL;

-- 확인용
-- SELECT email,
--        confirmation_token IS NULL AS c, recovery_token IS NULL AS r,
--        email_change IS NULL AS ec, reauthentication_token IS NULL AS rt
-- FROM auth.users WHERE email LIKE 'admin%@test.hamkkebom.com' ORDER BY email;
--   → 전부 false 여야 정상
