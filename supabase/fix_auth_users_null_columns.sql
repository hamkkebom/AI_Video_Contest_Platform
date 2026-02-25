-- ============================================================
-- auth.users의 email_change NULL 문제 수정 (v2)
-- Supabase Dashboard > SQL Editor에서 실행하세요
--
-- 주의: phone 컬럼은 UNIQUE 제약이 있으므로 건드리지 않음!
-- email_change 관련 컬럼만 수정
-- ============================================================

-- email_change 관련 NULL 컬럼을 빈 문자열로 수정
UPDATE auth.users SET
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email_change IS NULL
   OR email_change_token_new IS NULL
   OR email_change_token_current IS NULL
   OR confirmation_token IS NULL
   OR recovery_token IS NULL
   OR reauthentication_token IS NULL;

-- phone_change 관련 (phone은 UNIQUE라 건드리지 않음!)
UPDATE auth.users SET
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '')
WHERE phone_change IS NULL
   OR phone_change_token IS NULL;

-- ============================================================
-- 완료! 이제 Google 로그인을 다시 시도해보세요.
-- ============================================================
