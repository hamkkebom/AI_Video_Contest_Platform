-- 040: 관리자 계정 8개 추가 (admin6 ~ admin13)
-- 기존 admin1~5 + 신규 admin6~13 = 총 13개 관리자 계정
-- 비밀번호: Test1234! (admin1~5와 동일한 bcrypt 해시)
-- 멱등: 이메일이 이미 있으면 skip.

DO $$
DECLARE
  new_uid UUID;
  account RECORD;
BEGIN
  FOR account IN
    SELECT * FROM (VALUES
      ('admin6@test.hamkkebom.com',  '관리자6'),
      ('admin7@test.hamkkebom.com',  '관리자7'),
      ('admin8@test.hamkkebom.com',  '관리자8'),
      ('admin9@test.hamkkebom.com',  '관리자9'),
      ('admin10@test.hamkkebom.com', '관리자10'),
      ('admin11@test.hamkkebom.com', '관리자11'),
      ('admin12@test.hamkkebom.com', '관리자12'),
      ('admin13@test.hamkkebom.com', '관리자13')
    ) AS t(email, name)
  LOOP
    /* 이미 있으면 skip */
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = account.email) THEN
      RAISE NOTICE 'skip (exists): %', account.email;
      CONTINUE;
    END IF;

    new_uid := gen_random_uuid();

    /* auth.users */
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid,
      'authenticated',
      'authenticated',
      account.email,
      '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
      NOW(),
      jsonb_build_object('email_verified', true, 'name', account.name),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      NOW(),
      NOW(),
      '',
      '',
      FALSE
    );

    /* auth.identities */
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_uid,
      account.email,
      jsonb_build_object('sub', new_uid::text, 'email', account.email),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    /* profiles — 트리거가 먼저 생성했을 수 있으므로 UPSERT */
    INSERT INTO profiles (id, email, name, roles, plan_id, status, created_at, updated_at)
    VALUES (new_uid, account.email, account.name, ARRAY['admin']::TEXT[], 'plan-free', 'active', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
      SET roles = ARRAY['admin']::TEXT[],
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          updated_at = NOW();

    RAISE NOTICE 'created admin: %', account.email;
  END LOOP;
END $$;
