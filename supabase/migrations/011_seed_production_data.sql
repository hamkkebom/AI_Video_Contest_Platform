-- ============================================================
-- 운영 DB 데이터 시드 (자동 생성)
-- 생성일: 2026-02-24T23:24:40.281Z
-- ============================================================

-- 프로필 자동 생성 트리거 비활성화
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- auth.users: 24명
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f98779b1-dfc9-4e0e-ab22-f98cc56754ab',
  'authenticated',
  'authenticated',
  'exscape86@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-24T17:23:16.595628Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJttIxcO-FlAK6AdOmIRB0YVTJXRyzm30TKaMCj9wxtm5Bfgg=s96-c","email":"exscape86@gmail.com","email_verified":true,"full_name":"황승률","iss":"https://accounts.google.com","name":"황승률","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJttIxcO-FlAK6AdOmIRB0YVTJXRyzm30TKaMCj9wxtm5Bfgg=s96-c","provider_id":"116589928207640781705","sub":"116589928207640781705"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-24T17:23:16.51019Z',
  '2026-02-24T17:23:18.529739Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'f98779b1-dfc9-4e0e-ab22-f98cc56754ab',
  'exscape86@gmail.com',
  json_build_object('sub', 'f98779b1-dfc9-4e0e-ab22-f98cc56754ab', 'email', 'exscape86@gmail.com')::jsonb,
  'email',
  '2026-02-24T17:23:16.51019Z',
  '2026-02-24T17:23:16.51019Z',
  '2026-02-24T17:23:18.529739Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f238f5ed-9ec3-4d86-95ab-bff403df64d6',
  'authenticated',
  'authenticated',
  'ourearth0423@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-24T13:29:29.723233Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJg_Ed9OcyCEXRQV8FfhIugQhDJ8aJtZ3rIGwzPTyPKZkb2ZV7i=s96-c","email":"ourearth0423@gmail.com","email_verified":true,"full_name":"_subong수봉","iss":"https://accounts.google.com","name":"_subong수봉","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJg_Ed9OcyCEXRQV8FfhIugQhDJ8aJtZ3rIGwzPTyPKZkb2ZV7i=s96-c","provider_id":"112869667824586596711","sub":"112869667824586596711"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-24T13:29:29.707273Z',
  '2026-02-24T13:29:30.818921Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'f238f5ed-9ec3-4d86-95ab-bff403df64d6',
  'ourearth0423@gmail.com',
  json_build_object('sub', 'f238f5ed-9ec3-4d86-95ab-bff403df64d6', 'email', 'ourearth0423@gmail.com')::jsonb,
  'email',
  '2026-02-24T13:29:29.707273Z',
  '2026-02-24T13:29:29.707273Z',
  '2026-02-24T13:29:30.818921Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe',
  'authenticated',
  'authenticated',
  '1210yesol@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-24T12:51:44.435797Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLN_YUerkEhcJuoVAZ-YbTxTqMpbUaOg3dSErRFS747WUM8MA=s96-c","email":"1210yesol@gmail.com","email_verified":true,"full_name":"YeSol Kim","iss":"https://accounts.google.com","name":"YeSol Kim","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLN_YUerkEhcJuoVAZ-YbTxTqMpbUaOg3dSErRFS747WUM8MA=s96-c","provider_id":"111160597313867202611","sub":"111160597313867202611"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-24T12:51:44.389032Z',
  '2026-02-24T22:15:24.048022Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe',
  '1210yesol@gmail.com',
  json_build_object('sub', '5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe', 'email', '1210yesol@gmail.com')::jsonb,
  'email',
  '2026-02-24T12:51:44.389032Z',
  '2026-02-24T12:51:44.389032Z',
  '2026-02-24T22:15:24.048022Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'ad0120f2-c230-4f5a-904f-d7d89dfbb551',
  'authenticated',
  'authenticated',
  'ryan9505@naver.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-24T07:42:35.288192Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKQQh3q-lcynT8bYuHhUTFact1q0VfLtOUIYgYCiDL0PclB3g=s96-c","email":"ryan9505@naver.com","email_verified":true,"full_name":"호이","iss":"https://accounts.google.com","name":"호이","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKQQh3q-lcynT8bYuHhUTFact1q0VfLtOUIYgYCiDL0PclB3g=s96-c","provider_id":"108264138267020675700","sub":"108264138267020675700"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-24T07:42:35.25033Z',
  '2026-02-24T07:42:36.014852Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'ad0120f2-c230-4f5a-904f-d7d89dfbb551',
  'ryan9505@naver.com',
  json_build_object('sub', 'ad0120f2-c230-4f5a-904f-d7d89dfbb551', 'email', 'ryan9505@naver.com')::jsonb,
  'email',
  '2026-02-24T07:42:35.25033Z',
  '2026-02-24T07:42:35.25033Z',
  '2026-02-24T07:42:36.014852Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '59ff8eb0-4959-4c9f-88af-660e92ed1f39',
  'authenticated',
  'authenticated',
  'admin5@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.788456Z',
  E'{"email_verified":true,"name":"관리자5"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.785247Z',
  '2026-02-23T14:23:45.789111Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '59ff8eb0-4959-4c9f-88af-660e92ed1f39',
  'admin5@test.hamkkebom.com',
  json_build_object('sub', '59ff8eb0-4959-4c9f-88af-660e92ed1f39', 'email', 'admin5@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:45.785247Z',
  '2026-02-23T14:23:45.785247Z',
  '2026-02-23T14:23:45.789111Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8758b4d5-950a-46da-b48f-284bdf39aee6',
  'authenticated',
  'authenticated',
  'admin4@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.629672Z',
  E'{"email_verified":true,"name":"관리자4"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.626027Z',
  '2026-02-23T14:23:45.63057Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '8758b4d5-950a-46da-b48f-284bdf39aee6',
  'admin4@test.hamkkebom.com',
  json_build_object('sub', '8758b4d5-950a-46da-b48f-284bdf39aee6', 'email', 'admin4@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:45.626027Z',
  '2026-02-23T14:23:45.626027Z',
  '2026-02-23T14:23:45.63057Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b4b2dede-cfe4-4196-94d9-47975ee5e0c7',
  'authenticated',
  'authenticated',
  'admin3@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.457324Z',
  E'{"email_verified":true,"name":"관리자3"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.454063Z',
  '2026-02-23T14:23:45.459064Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'b4b2dede-cfe4-4196-94d9-47975ee5e0c7',
  'admin3@test.hamkkebom.com',
  json_build_object('sub', 'b4b2dede-cfe4-4196-94d9-47975ee5e0c7', 'email', 'admin3@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:45.454063Z',
  '2026-02-23T14:23:45.454063Z',
  '2026-02-23T14:23:45.459064Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8dd27e53-670b-4d68-baf7-f8c909b9bf4c',
  'authenticated',
  'authenticated',
  'admin2@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.29042Z',
  E'{"email_verified":true,"name":"관리자2"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.284983Z',
  '2026-02-23T14:23:45.291075Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '8dd27e53-670b-4d68-baf7-f8c909b9bf4c',
  'admin2@test.hamkkebom.com',
  json_build_object('sub', '8dd27e53-670b-4d68-baf7-f8c909b9bf4c', 'email', 'admin2@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:45.284983Z',
  '2026-02-23T14:23:45.284983Z',
  '2026-02-23T14:23:45.291075Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '6fdcf75c-f8b4-4bd6-8358-080722880fd2',
  'authenticated',
  'authenticated',
  'admin1@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.112554Z',
  E'{"email_verified":true,"name":"관리자1"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.107326Z',
  '2026-02-24T23:01:37.473669Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '6fdcf75c-f8b4-4bd6-8358-080722880fd2',
  'admin1@test.hamkkebom.com',
  json_build_object('sub', '6fdcf75c-f8b4-4bd6-8358-080722880fd2', 'email', 'admin1@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:45.107326Z',
  '2026-02-23T14:23:45.107326Z',
  '2026-02-24T23:01:37.473669Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '4eaade73-4d4f-4ad2-8822-bb011d39b0bb',
  'authenticated',
  'authenticated',
  'judge5@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.949426Z',
  E'{"email_verified":true,"name":"심사위원5"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.94374Z',
  '2026-02-23T14:23:44.950729Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '4eaade73-4d4f-4ad2-8822-bb011d39b0bb',
  'judge5@test.hamkkebom.com',
  json_build_object('sub', '4eaade73-4d4f-4ad2-8822-bb011d39b0bb', 'email', 'judge5@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:44.94374Z',
  '2026-02-23T14:23:44.94374Z',
  '2026-02-23T14:23:44.950729Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '70436f98-f12c-4818-bb6b-e9f39284cf21',
  'authenticated',
  'authenticated',
  'judge4@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.789479Z',
  E'{"email_verified":true,"name":"심사위원4"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.784574Z',
  '2026-02-23T14:23:44.792203Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '70436f98-f12c-4818-bb6b-e9f39284cf21',
  'judge4@test.hamkkebom.com',
  json_build_object('sub', '70436f98-f12c-4818-bb6b-e9f39284cf21', 'email', 'judge4@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:44.784574Z',
  '2026-02-23T14:23:44.784574Z',
  '2026-02-23T14:23:44.792203Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '55d156f8-df31-4478-8db0-42538cac51b5',
  'authenticated',
  'authenticated',
  'judge3@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.580032Z',
  E'{"email_verified":true,"name":"심사위원3"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.577752Z',
  '2026-02-23T14:23:44.581397Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '55d156f8-df31-4478-8db0-42538cac51b5',
  'judge3@test.hamkkebom.com',
  json_build_object('sub', '55d156f8-df31-4478-8db0-42538cac51b5', 'email', 'judge3@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:44.577752Z',
  '2026-02-23T14:23:44.577752Z',
  '2026-02-23T14:23:44.581397Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '58d1c315-dea7-4014-b51f-d70338908336',
  'authenticated',
  'authenticated',
  'judge2@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.415288Z',
  E'{"email_verified":true,"name":"심사위원2"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.412966Z',
  '2026-02-23T14:23:44.415933Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '58d1c315-dea7-4014-b51f-d70338908336',
  'judge2@test.hamkkebom.com',
  json_build_object('sub', '58d1c315-dea7-4014-b51f-d70338908336', 'email', 'judge2@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:44.412966Z',
  '2026-02-23T14:23:44.412966Z',
  '2026-02-23T14:23:44.415933Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '7f6dba97-5e1c-4805-a764-b60a4ea4844d',
  'authenticated',
  'authenticated',
  'judge1@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.231232Z',
  E'{"email_verified":true,"name":"심사위원1"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.22578Z',
  '2026-02-23T14:23:44.234514Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '7f6dba97-5e1c-4805-a764-b60a4ea4844d',
  'judge1@test.hamkkebom.com',
  json_build_object('sub', '7f6dba97-5e1c-4805-a764-b60a4ea4844d', 'email', 'judge1@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:44.22578Z',
  '2026-02-23T14:23:44.22578Z',
  '2026-02-23T14:23:44.234514Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '82226932-5283-447b-897c-f0353ced9c9e',
  'authenticated',
  'authenticated',
  'host5@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.058671Z',
  E'{"email_verified":true,"name":"주최자5"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.056217Z',
  '2026-02-23T14:23:44.059279Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '82226932-5283-447b-897c-f0353ced9c9e',
  'host5@test.hamkkebom.com',
  json_build_object('sub', '82226932-5283-447b-897c-f0353ced9c9e', 'email', 'host5@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:44.056217Z',
  '2026-02-23T14:23:44.056217Z',
  '2026-02-23T14:23:44.059279Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '45a76d98-7016-4f60-9573-6553c2933fc8',
  'authenticated',
  'authenticated',
  'host4@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.886078Z',
  E'{"email_verified":true,"name":"주최자4"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.882522Z',
  '2026-02-23T14:23:43.886723Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '45a76d98-7016-4f60-9573-6553c2933fc8',
  'host4@test.hamkkebom.com',
  json_build_object('sub', '45a76d98-7016-4f60-9573-6553c2933fc8', 'email', 'host4@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:43.882522Z',
  '2026-02-23T14:23:43.882522Z',
  '2026-02-23T14:23:43.886723Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd096d0b9-4522-4b31-a866-c9315abed63c',
  'authenticated',
  'authenticated',
  'host3@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.717654Z',
  E'{"email_verified":true,"name":"주최자3"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.611238Z',
  '2026-02-23T14:23:43.722345Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'd096d0b9-4522-4b31-a866-c9315abed63c',
  'host3@test.hamkkebom.com',
  json_build_object('sub', 'd096d0b9-4522-4b31-a866-c9315abed63c', 'email', 'host3@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:43.611238Z',
  '2026-02-23T14:23:43.611238Z',
  '2026-02-23T14:23:43.722345Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '560e19e0-36fe-4f87-8b19-642dbd0ab7f2',
  'authenticated',
  'authenticated',
  'host2@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.401083Z',
  E'{"email_verified":true,"name":"주최자2"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.39477Z',
  '2026-02-23T14:23:43.40345Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '560e19e0-36fe-4f87-8b19-642dbd0ab7f2',
  'host2@test.hamkkebom.com',
  json_build_object('sub', '560e19e0-36fe-4f87-8b19-642dbd0ab7f2', 'email', 'host2@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:43.39477Z',
  '2026-02-23T14:23:43.39477Z',
  '2026-02-23T14:23:43.40345Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '05112cda-d7fb-4ea6-901a-013848be02a6',
  'authenticated',
  'authenticated',
  'host1@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.241561Z',
  E'{"email_verified":true,"name":"주최자1"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.230555Z',
  '2026-02-23T14:23:43.243677Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '05112cda-d7fb-4ea6-901a-013848be02a6',
  'host1@test.hamkkebom.com',
  json_build_object('sub', '05112cda-d7fb-4ea6-901a-013848be02a6', 'email', 'host1@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:43.230555Z',
  '2026-02-23T14:23:43.230555Z',
  '2026-02-23T14:23:43.243677Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '0b6a6e0f-bdc0-40b1-a5b5-529df66f341f',
  'authenticated',
  'authenticated',
  'participant5@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.05029Z',
  E'{"email_verified":true,"name":"참가자5"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.043462Z',
  '2026-02-23T14:23:43.052246Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '0b6a6e0f-bdc0-40b1-a5b5-529df66f341f',
  'participant5@test.hamkkebom.com',
  json_build_object('sub', '0b6a6e0f-bdc0-40b1-a5b5-529df66f341f', 'email', 'participant5@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:43.043462Z',
  '2026-02-23T14:23:43.043462Z',
  '2026-02-23T14:23:43.052246Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8d9e4bc0-0ec9-4b4c-a789-0bcd9cbde4bf',
  'authenticated',
  'authenticated',
  'participant4@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:42.886476Z',
  E'{"email_verified":true,"name":"참가자4"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:42.87942Z',
  '2026-02-23T14:23:42.889424Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '8d9e4bc0-0ec9-4b4c-a789-0bcd9cbde4bf',
  'participant4@test.hamkkebom.com',
  json_build_object('sub', '8d9e4bc0-0ec9-4b4c-a789-0bcd9cbde4bf', 'email', 'participant4@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:42.87942Z',
  '2026-02-23T14:23:42.87942Z',
  '2026-02-23T14:23:42.889424Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '17088fc7-c078-4d6d-b573-9e0899980b92',
  'authenticated',
  'authenticated',
  'participant3@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:42.62458Z',
  E'{"email_verified":true,"name":"참가자3"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:42.614799Z',
  '2026-02-23T14:23:42.628879Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '17088fc7-c078-4d6d-b573-9e0899980b92',
  'participant3@test.hamkkebom.com',
  json_build_object('sub', '17088fc7-c078-4d6d-b573-9e0899980b92', 'email', 'participant3@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:42.614799Z',
  '2026-02-23T14:23:42.614799Z',
  '2026-02-23T14:23:42.628879Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '1b955c07-ada1-4b14-b17e-7cc67e568a6c',
  'authenticated',
  'authenticated',
  'participant2@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:42.435972Z',
  E'{"email_verified":true,"name":"참가자2"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:42.426058Z',
  '2026-02-23T14:23:42.438657Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  '1b955c07-ada1-4b14-b17e-7cc67e568a6c',
  'participant2@test.hamkkebom.com',
  json_build_object('sub', '1b955c07-ada1-4b14-b17e-7cc67e568a6c', 'email', 'participant2@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:42.426058Z',
  '2026-02-23T14:23:42.426058Z',
  '2026-02-23T14:23:42.438657Z'
) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a62f0602-e2f2-4268-a094-d9eadaf0ccb3',
  'authenticated',
  'authenticated',
  'participant1@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:42.133157Z',
  E'{"email_verified":true,"name":"참가자1"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:42.116609Z',
  '2026-02-24T04:59:44.792795Z',
  '',
  '',
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'a62f0602-e2f2-4268-a094-d9eadaf0ccb3',
  'participant1@test.hamkkebom.com',
  json_build_object('sub', 'a62f0602-e2f2-4268-a094-d9eadaf0ccb3', 'email', 'participant1@test.hamkkebom.com')::jsonb,
  'email',
  '2026-02-23T14:23:42.116609Z',
  '2026-02-23T14:23:42.116609Z',
  '2026-02-24T04:59:44.792795Z'
) ON CONFLICT DO NOTHING;


-- pricing_plans: 6행
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-free', E'participant', E'무료', 0, 0, TRUE, '{"work-performance"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-host-basic', E'host', E'주최자 기본', 0, 0, TRUE, '{"submission-status"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-host-premium', E'host', E'주최자 프리미엄', 29900, 299000, TRUE, '{"submission-status","participant-distribution","channel-performance","detailed-analysis"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-judge-basic', E'judge', E'심사위원 기본', 0, 0, TRUE, '{"progress"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-judge-premium', E'judge', E'심사위원 프리미엄', 0, 0, TRUE, '{"progress","score-distribution"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-participant-premium', E'participant', E'참가자 프리미엄', 9900, 99000, TRUE, '{"work-performance","category-competition","ai-tool-trends","detailed-analysis"}') ON CONFLICT DO NOTHING;

-- profiles: 24행
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'05112cda-d7fb-4ea6-901a-013848be02a6', E'host1@test.hamkkebom.com', E'주최자1', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.229502+00:00', E'2026-02-23T14:23:43.229502+00:00', NULL, NULL, 20) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'0b6a6e0f-bdc0-40b1-a5b5-529df66f341f', E'participant5@test.hamkkebom.com', E'참가자5', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.043118+00:00', E'2026-02-23T14:23:43.043118+00:00', NULL, NULL, 5) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'17088fc7-c078-4d6d-b573-9e0899980b92', E'participant3@test.hamkkebom.com', E'참가자3', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:42.614459+00:00', E'2026-02-23T14:23:42.614459+00:00', NULL, NULL, 3) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'1b955c07-ada1-4b14-b17e-7cc67e568a6c', E'participant2@test.hamkkebom.com', E'참가자2', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:42.425702+00:00', E'2026-02-23T14:23:42.425702+00:00', NULL, NULL, 2) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'45a76d98-7016-4f60-9573-6553c2933fc8', E'host4@test.hamkkebom.com', E'주최자4', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.882195+00:00', E'2026-02-23T14:23:43.882195+00:00', NULL, NULL, 8) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'4eaade73-4d4f-4ad2-8822-bb011d39b0bb', E'judge5@test.hamkkebom.com', E'심사위원5', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.943416+00:00', E'2026-02-23T14:23:44.943416+00:00', NULL, NULL, 14) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'55d156f8-df31-4478-8db0-42538cac51b5', E'judge3@test.hamkkebom.com', E'심사위원3', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.577404+00:00', E'2026-02-23T14:23:44.577404+00:00', NULL, NULL, 12) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'560e19e0-36fe-4f87-8b19-642dbd0ab7f2', E'host2@test.hamkkebom.com', E'주최자2', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.39371+00:00', E'2026-02-23T14:23:43.39371+00:00', NULL, NULL, 6) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'58d1c315-dea7-4014-b51f-d70338908336', E'judge2@test.hamkkebom.com', E'심사위원2', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.411952+00:00', E'2026-02-23T14:23:44.411952+00:00', NULL, NULL, 11) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'59ff8eb0-4959-4c9f-88af-660e92ed1f39', E'admin5@test.hamkkebom.com', E'관리자5', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.784947+00:00', E'2026-02-23T14:23:45.784947+00:00', NULL, NULL, 19) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe', E'1210yesol@gmail.com', E'YeSol Kim', E'ys', '{"participant"}', NULL, E'plan-free', E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/avatars/5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe/avatar.png?t=1771937569040', E'active', E'2026-02-24T12:51:44.364268+00:00', E'2026-02-24T12:57:29.794+00:00', E'ddddfsdfsdfsdfsdfsdf', NULL, 22) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'6fdcf75c-f8b4-4bd6-8358-080722880fd2', E'admin1@test.hamkkebom.com', E'관리자1', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.10622+00:00', E'2026-02-23T14:23:45.10622+00:00', NULL, NULL, 15) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'70436f98-f12c-4818-bb6b-e9f39284cf21', E'judge4@test.hamkkebom.com', E'심사위원4', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.78338+00:00', E'2026-02-23T14:23:44.78338+00:00', NULL, NULL, 13) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'7f6dba97-5e1c-4805-a764-b60a4ea4844d', E'judge1@test.hamkkebom.com', E'심사위원1', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.225443+00:00', E'2026-02-23T14:23:44.225443+00:00', NULL, NULL, 10) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'82226932-5283-447b-897c-f0353ced9c9e', E'host5@test.hamkkebom.com', E'주최자5', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.055118+00:00', E'2026-02-23T14:23:44.055118+00:00', NULL, NULL, 9) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'8758b4d5-950a-46da-b48f-284bdf39aee6', E'admin4@test.hamkkebom.com', E'관리자4', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.62569+00:00', E'2026-02-23T14:23:45.62569+00:00', NULL, NULL, 18) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'8d9e4bc0-0ec9-4b4c-a789-0bcd9cbde4bf', E'participant4@test.hamkkebom.com', E'참가자4', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:42.877849+00:00', E'2026-02-23T14:23:42.877849+00:00', NULL, NULL, 4) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'8dd27e53-670b-4d68-baf7-f8c909b9bf4c', E'admin2@test.hamkkebom.com', E'관리자2', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.283837+00:00', E'2026-02-23T14:23:45.283837+00:00', NULL, NULL, 16) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'a62f0602-e2f2-4268-a094-d9eadaf0ccb3', E'participant1@test.hamkkebom.com', E'참가자1', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:42.116235+00:00', E'2026-02-23T14:23:42.116235+00:00', NULL, NULL, 1) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'ad0120f2-c230-4f5a-904f-d7d89dfbb551', E'ryan9505@naver.com', E'호이', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocKQQh3q-lcynT8bYuHhUTFact1q0VfLtOUIYgYCiDL0PclB3g=s96-c', E'active', E'2026-02-24T07:42:35.23536+00:00', E'2026-02-24T07:42:35.23536+00:00', NULL, NULL, 21) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'b4b2dede-cfe4-4196-94d9-47975ee5e0c7', E'admin3@test.hamkkebom.com', E'관리자3', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.451647+00:00', E'2026-02-23T14:23:45.451647+00:00', NULL, NULL, 17) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'd096d0b9-4522-4b31-a866-c9315abed63c', E'host3@test.hamkkebom.com', E'주최자3', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.610125+00:00', E'2026-02-23T14:23:43.610125+00:00', NULL, NULL, 7) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'f238f5ed-9ec3-4d86-95ab-bff403df64d6', E'ourearth0423@gmail.com', E'_subong수봉', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJg_Ed9OcyCEXRQV8FfhIugQhDJ8aJtZ3rIGwzPTyPKZkb2ZV7i=s96-c', E'active', E'2026-02-24T13:29:29.701236+00:00', E'2026-02-24T13:29:29.701236+00:00', NULL, NULL, 23) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "seq_id") VALUES (E'f98779b1-dfc9-4e0e-ab22-f98cc56754ab', E'exscape86@gmail.com', E'황승률', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJttIxcO-FlAK6AdOmIRB0YVTJXRyzm30TKaMCj9wxtm5Bfgg=s96-c', E'active', E'2026-02-24T17:23:16.424631+00:00', E'2026-02-24T17:23:16.424631+00:00', NULL, NULL, 24) ON CONFLICT DO NOTHING;

-- contests: 1행
INSERT INTO "contests" ("id", "title", "slug", "host_company_id", "host_user_id", "description", "region", "tags", "status", "submission_start_at", "submission_end_at", "judging_start_at", "judging_end_at", "result_announced_at", "judging_type", "review_policy", "max_submissions_per_user", "allowed_video_extensions", "prize_amount", "poster_url", "has_landing_page", "bonus_max_score", "bonus_percentage", "judge_weight_percent", "online_vote_weight_percent", "online_vote_type", "vote_likes_percent", "vote_views_percent", "judging_criteria", "created_at", "updated_at", "detail_content", "detail_image_urls", "result_format", "landing_page_url", "guidelines", "notes", "promotion_video_urls") VALUES (3, E'제1회 꿈꾸는 아리랑 AI 영상 공모전', E'제1회-꿈꾸는-아리랑-ai-영상-공모전-1771898097187', NULL, E'6fdcf75c-f8b4-4bd6-8358-080722880fd2', E'“아리랑은 한국인의 영원한 노래” - 호머 헐버트 (한국의 외국인 독립운동가)\n\n헐버트 박사의 아리랑 채보 130주년 기념!\n\n제1회 ‘꿈꾸는 아리랑’ AI 영상 공모전으로 우리 아리랑을 다시 한번 세계로 알립니다.\n\n이번 공모전은 한국의 전통 가락인 ‘아리랑’과 현대의 ‘AI 기술’, 그리고 여러분의 ‘꿈’을 하나로 연결하는 창의적인 시도를 목표로 합니다. 여러분만의 독창적인 시선으로 아리랑의 새로운 꿈을 보여주세요!', E'', '{"음악","예술","사회공헌","아리랑","AI 영상","생성형AI","롱폼","꿈꾸는아리랑","헐버트","함께봄"}', E'open', E'2026-02-25T00:00:00+00:00', E'2026-03-28T00:00:00+00:00', E'2026-03-29T00:00:00+00:00', E'2026-04-10T00:00:00+00:00', E'2026-04-11T00:00:00+00:00', E'both', E'manual', 1, '{"mp4"}', NULL, E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/posters/poster/6fdcf75c-f8b4-4bd6-8358-080722880fd2/1771933285019.png', TRUE, NULL, 3, 80, 17, E'likes', NULL, NULL, E'[{"label":"기술력","maxScore":30,"description":"AI 활용 수준"},{"label":"스토리","maxScore":30,"description":"전달력"},{"label":"완성도","maxScore":40,"description":"연출 및 편집"}]'::jsonb, E'2026-02-24T01:54:57.356445+00:00', E'2026-02-24T01:54:57.356445+00:00', E'1. 공모 개요\n- 주제: 자신의 꿈을 담은 나만의 아리랑\n- 콘텐츠 형태: 가로 영상\n- 분량: 30초~90초\n- 파일 형식: MP4\n\n· 제작 방식\n- 100% AI 영상 생성 도구를 활용한 콘텐츠\n- 참가자 본인 사진을 활용한 AI 영상은 사용 가능\n- 전통 민요 아리랑 가사를 일부 활용한 뮤직비디오 형식\n- “아리랑” 단어 필수 포함\n\n※ 아리랑은 전통 민요로 자유 활용 가능하나, 특정 편곡·음원·녹음본을 사용할 경우 해당 저작권 문제에 대한 책임은 참가자에게 있습니다.\n※ 타인의 저작물 무단 사용 시 실격 처리될 수 있습니다.\n\n---\n\n2. 상세 일정\n- 접수 기간: 2026년 2월 25일 ~ 3월 28일 23:59\n- 수상작 발표 및 온라인 시상식: 2026년 4월 11일\n\n※ 일정은 주최 측 사정에 따라 변경될 수 있습니다.\n\n---\n\n3. 참여 방법\n① 공식 홈페이지 가입\n② 공모전 접수 메뉴를 통해 영상 및 신청서 제출\n\n※ 1인 1작품 제출\n※ 중복 수상 불가\n\n---\n\n4. 시상 내역 (총 상금 1,300만 원)\n- 1등 “아리랑상” (1명): 300만 원\n- 2등 “메아리상” (2명): 각 150만 원\n- 3등 “울림상” (10명): 각 40만 원\n- 4등 “꿈꿈상” (30명): 각 10만 원\n\n· 상금 지급 안내\n- 상금은 관련 세법에 따라 제세공과금(8.8%) 공제 후 지급됩니다.\n- 상금 지급을 위해 수상자는 세무 처리를 위한 개인정보를 제출해야 합니다.\n\n---\n\n5. 심사 기준 및 가산점\n- 심사위원 평가 77%\n- 온라인 투표 20%\n- 가산점 3%\n\n· 온라인 투표 관련 안내\n- 좋아요 수 등 대중평가 점수가 반영됩니다.\n- 비정상적 트래픽·매크로·부정 행위 적발 시 점수 제외 또는 실격 처리될 수 있습니다.\n- 투표 운영 기준은 주최 측 정책에 따릅니다.\n\n· 가산점 항목 (항목당 1점 / 최대 3점)\n- 필수 해시태그:\n#아리랑 #광화문 #꿈꾸는아리랑 #헐버트 #아리랑챌린지 #함께봄 #AI공모전\n발표일까지 게시물 공개 유지 필수\n① 공모전 공식 포스터 SNS 업로드 후 공유 인증\n② 헐버트박사 기념사업회 링크 SNS 업로드 후 공유 인증\n③ 헐버트 아리랑 전시회 참여 인증샷 SNS 업로드 후 공유 인증\n\n※ 전시 참여는 선택 사항이며, 가산점 항목 중 하나입니다.\n※ 발표일까지 게시물이 유지되어야 가산점이 인정됩니다.\n\n---\n\n6. 작품 활용 및 게시\n- 제출된 작품은 행사 홍보·연출·SNS 게시 등 공모전 운영 목적에 활용될 수 있습니다.\n- 제출 작품은 공모전 페이지에 게시되며, 대중평가 점수가 심사에 반영됩니다.\n- 저작권은 창작자에게 귀속됩니다.\n\n---\n\n7. 유의사항\n- 제출 작품은 반드시 AI 활용 창작물이어야 합니다.\n- 저작권·초상권 문제 발생 시 실격 처리될 수 있으며, 모든 책임은 참가자에게 있습니다.\n- 허위 사실 기재 시 수상이 취소될 수 있습니다.\n- 공모 요강은 주최 측 사정에 따라 변경될 수 있습니다.', '{"https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/contest-assets/detail-image/6fdcf75c-f8b4-4bd6-8358-080722880fd2/1771933330214.png"}', E'website', E'https://ai-video-contest.vercel.app/contests/3/landing', E'1. 공모 개요\n- 주제: 자신의 꿈을 담은 나만의 아리랑\n- 콘텐츠 형태: 가로 영상\n- 분량: 30초~90초\n- 파일 형식: MP4\n\n· 제작 방식\n- 100% AI 영상 생성 도구를 활용한 콘텐츠\n- 참가자 본인 사진을 활용한 AI 영상은 사용 가능\n- 전통 민요 아리랑 가사를 일부 활용한 뮤직비디오 형식\n- “아리랑” 단어 필수 포함\n\n※ 아리랑은 전통 민요로 자유 활용 가능하나, 특정 편곡·음원·녹음본을 사용할 경우 해당 저작권 문제에 대한 책임은 참가자에게 있습니다.\n※ 타인의 저작물 무단 사용 시 실격 처리될 수 있습니다.\n\n---\n\n2. 참여 방법\n① 공식 홈페이지 가입\n② 공모전 접수 메뉴를 통해 영상 및 신청서 제출\n\n※ 1인 1작품 제출\n※ 중복 수상 불가', E'1. 출품 요건\n- 본 공모전의 출품작은 반드시 **AI툴을 활용하여 제작된 창작물**이어야 합니다.\n- 사용한 AI툴은 신청서에 반드시 기재해 주세요.\n- AI 활용 사실이 확인되지 않거나 허위로 기재한 경우 심사 제외 또는 실격 처리될 수 있습니다.\n- 직접 촬영 영상만으로 구성된 콘텐츠는 인정되지 않습니다.\n- 참가자 본인의 사진을 활용한 AI 생성은 가능합니다.\n\n---\n\n2. 저작권 안내\n- 출품작의 저작권은 원칙적으로 출품자에게 귀속됩니다.\n- 단, 아래 ‘출품작 활용’ 및 ‘수상작 권리’ 항목에 명시된 범위에 대해서는 이용권이 부여됩니다.\n\n---\n\n3. 출품작의 게시 및 홍보 활용\n- 응모자는 공모전 운영, 심사, 홍보, 전시회 개최 및 공익적 행사 진행을 위해 회사가 출품작을 무상으로 활용하는 것에 동의합니다.\n- 활용 범위에는 전시, 상영, 복제, 공중송신, 온라인 게시, 홍보물 제작 등이 포함됩니다.\n- 제출된 작품은 함께봄 공모전 페이지 및 관련 온라인 채널에 게시될 수 있습니다.\n- 수상 발표 이전에도 공모전 기간 중 전시회 및 행사에서 공개 상영 또는 전시될 수 있습니다.\n- 전시회는 무료로 운영되며, 출품작 자체를 독립적인 판매 대상으로 활용하지 않습니다.\n- 다만, 전시 공간 내 굿즈 판매 또는 공익적 모금 활동과 병행될 수 있습니다.\n- 수상 발표 전에는 출품작을 별도의 독립적인 상업 판매 또는 영리사업의 주된 콘텐츠로 활용하지 않습니다.\n\n---\n\n4. 수상작의 권리 및 상업적 활용\n- 수상자는 상금 수령과 동시에 회사에 해당 수상작에 대한 전 세계적, 독점적, 기간 제한 없는 이용권 및 2차적 저작물 작성권을 부여하는 것에 동의합니다.\n- 회사는 수상작을 수정·편집·재가공하여 광고, 홍보, 상품 제작, 온라인·오프라인 매체 게시 등 상업적 목적으로 활용할 수 있습니다.\n- 필요 시 제3자(광고대행사, 제작사, 유통사 등)에게 권리를 재허락할 수 있습니다.\n- 상금은 위 이용권 부여에 대한 정당한 대가로 지급됩니다.\n- 수상자는 동일 작품을 제3자에게 독점적으로 이용 허락할 수 없습니다.\n- 단, 수상자는 본인의 포트폴리오 및 개인 홍보 목적에 한하여 작품을 사용할 수 있습니다.\n\n---\n\n5. 심사 및 대중평가\n- 출품작은 공모전 페이지에 게시되며 ‘좋아요’ 수 등 대중 평가 요소가 심사에 일부 반영될 수 있습니다.\n- 대중 평가 반영 비율 및 최종 수상작 선정은 회사의 심사 기준에 따릅니다.\n- 비정상적 트래픽, 매크로, 자동화 프로그램, 조직적 투표 등 부정행위가 확인될 경우 해당 점수는 제외되거나 실격 처리될 수 있습니다.\n\n---\n\n6. AI 제작물 관련 책임\n- 응모자는 AI툴의 이용약관을 위반하지 않았으며, 상업적 이용에 법적 제한이 없음을 보증합니다.\n- AI 생성물의 저작권, 라이선스, 학습 데이터와 관련된 분쟁 발생 시 모든 책임은 출품자에게 있습니다.\n- 회사는 AI툴 약관 위반으로 인한 분쟁에 대해 책임을 부담하지 않습니다.\n\n---\n\n7. 제3자 권리 침해 금지\n- 출품작은 제3자의 저작권, 초상권, 상표권, 디자인권, 음원·폰트 라이선스 등을 침해하지 않는 창작물이어야 합니다.\n- 관련 분쟁 발생 시 모든 민·형사상 책임은 출품자에게 있습니다.\n\n---\n\n8. 참여 제한\n- 1인당 1작품만 응모 가능합니다.\n- 팀 단위 참여는 불가합니다.\n- 공동 제작 사실이 확인될 경우 수상이 취소될 수 있습니다.\n\n---\n\n9. 실격 및 수상 취소\n다음에 해당할 경우 실격 또는 수상 취소 처리됩니다.\n- 표절, 도용 등 권리 침해\n- 허위 정보 기재\n- AI툴 라이선스 위반\n- 사회적 물의를 일으킬 수 있는 내용\n- 법령 위반 또는 공모전 취지에 부합하지 않는 경우\n- 중복 또는 팀 참여 사실이 확인된 경우\n수상 이후라도 위 사유가 확인될 경우 상금 반환이 요구될 수 있으며, 회사는 필요한 법적 조치를 취할 수 있습니다.\n\n---\n\n10. 개인정보 수집·이용 안내\n- 수집 항목: 이름, 연락처, 이메일, (기업 참가 시) 사업자등록증 사본, (수상 시) 계좌 정보 및 주민등록번호\n- 이용 목적: 참가자 확인, 심사 진행, 결과 안내, 상금 지급 및 세무 처리\n- 보유 기간: 공모전 종료 후 3년간 보관 후 파기\n- 수상자의 경우 세무 관련 법령에 따라 보관 기간이 달라질 수 있습니다.\n- 개인정보 수집·이용에 동의하지 않을 경우 참여가 제한될 수 있습니다.\n\n---\n\n11. 상금 지급 및 세금\n- 상금은 「소득세법」에 따른 기타소득으로 분류됩니다.\n- 관련 세법에 따라 제세공과금(8.8%)이 원천징수된 후 지급됩니다.\n- 제세공과금은 수상자 본인 부담입니다.\n- 상금 지급을 위해 세무 처리에 필요한 정보 제출이 요구될 수 있으며, 미제출 시 지급이 제한될 수 있습니다.', '{"https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/contest-assets/promo-video/6fdcf75c-f8b4-4bd6-8358-080722880fd2/1771932847773.mp4","https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/contest-assets/promo-video/6fdcf75c-f8b4-4bd6-8358-080722880fd2/1771932856991.mp4"}') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('"contests"', 'id'), COALESCE((SELECT MAX(id) FROM "contests"), 0) + 1, false);

-- contest_award_tiers: 4행
INSERT INTO "contest_award_tiers" ("id", "contest_id", "label", "count", "prize_amount", "sort_order") VALUES (31, 3, E'아리랑상', 1, E'3000000', 1) ON CONFLICT DO NOTHING;
INSERT INTO "contest_award_tiers" ("id", "contest_id", "label", "count", "prize_amount", "sort_order") VALUES (32, 3, E'메아리상', 2, E'1500000', 2) ON CONFLICT DO NOTHING;
INSERT INTO "contest_award_tiers" ("id", "contest_id", "label", "count", "prize_amount", "sort_order") VALUES (33, 3, E'울림상', 10, E'400000', 3) ON CONFLICT DO NOTHING;
INSERT INTO "contest_award_tiers" ("id", "contest_id", "label", "count", "prize_amount", "sort_order") VALUES (34, 3, E'꿈꿈상', 30, E'100000', 4) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('"contest_award_tiers"', 'id'), COALESCE((SELECT MAX(id) FROM "contest_award_tiers"), 0) + 1, false);

-- contest_bonus_configs: 3행
INSERT INTO "contest_bonus_configs" ("id", "contest_id", "label", "description", "score", "requires_url", "requires_image", "sort_order") VALUES (23, 3, E'공모전 공식포스터 SNS 업로드 후 인증', NULL, 1, TRUE, TRUE, 1) ON CONFLICT DO NOTHING;
INSERT INTO "contest_bonus_configs" ("id", "contest_id", "label", "description", "score", "requires_url", "requires_image", "sort_order") VALUES (24, 3, E'헐버트박사 기념사업회 링크 SNS 업로드 후 인증', NULL, 1, TRUE, TRUE, 2) ON CONFLICT DO NOTHING;
INSERT INTO "contest_bonus_configs" ("id", "contest_id", "label", "description", "score", "requires_url", "requires_image", "sort_order") VALUES (25, 3, E'헐버트 아리랑 전시회 참여 인증샷 SNS 업로드 후 인증', NULL, 1, TRUE, TRUE, 3) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('"contest_bonus_configs"', 'id'), COALESCE((SELECT MAX(id) FROM "contest_bonus_configs"), 0) + 1, false);

-- submissions: 3행
INSERT INTO "submissions" ("id", "contest_id", "user_id", "title", "description", "video_url", "cloudflare_stream_uid", "thumbnail_url", "status", "submitted_at", "views", "like_count", "video_duration", "avg_watch_duration", "tags", "auto_rejected_reason", "ai_tools", "production_process", "created_at", "updated_at") VALUES (1, 3, E'5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe', E'atest', E'test', E'abb265808c12a17f9dfd8c7978876224', NULL, E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/thumbnails/3/dc963c7c-7581-4d4b-8f9d-bda4d003e5cf-_PB_260109_______________.png', E'pending_review', E'2026-02-24T13:00:29.578+00:00', 0, 0, 0, 0, '{}', NULL, E'Gemini, Perplexity, DeepSeek, Stable Diffusion, Adobe Firefly, Leonardo.Ai, Ideogram, Flux, Pika, Luma Dream Machine, HaiLuo', E'stes', E'2026-02-24T13:00:29.74027+00:00', E'2026-02-24T13:00:29.74027+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "submissions" ("id", "contest_id", "user_id", "title", "description", "video_url", "cloudflare_stream_uid", "thumbnail_url", "status", "submitted_at", "views", "like_count", "video_duration", "avg_watch_duration", "tags", "auto_rejected_reason", "ai_tools", "production_process", "created_at", "updated_at") VALUES (2, 3, E'5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe', E'두번쨰', E'두번쨰', E'6ecaa5038da76aa82cf16c9b51392563', NULL, E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/thumbnails/3/e1a09d5d-5a60-4b3a-82cf-fd95f6f47b34-261128_______________01.png', E'pending_review', E'2026-02-24T13:15:09.039+00:00', 0, 0, 0, 0, '{}', NULL, E'Claude, DALL·E 3, Kling', E'두번쨰', E'2026-02-24T13:15:09.194413+00:00', E'2026-02-24T13:15:09.194413+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "submissions" ("id", "contest_id", "user_id", "title", "description", "video_url", "cloudflare_stream_uid", "thumbnail_url", "status", "submitted_at", "views", "like_count", "video_duration", "avg_watch_duration", "tags", "auto_rejected_reason", "ai_tools", "production_process", "created_at", "updated_at") VALUES (3, 3, E'f238f5ed-9ec3-4d86-95ab-bff403df64d6', E'a', E'a', E'a738e4befd7d8744e5587f5a707b23bf', NULL, E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/thumbnails/3/4e83aa45-8e17-423b-a9f8-ec018afbab14-1.png', E'pending_review', E'2026-02-24T13:34:44.492+00:00', 0, 0, 0, 0, '{}', NULL, NULL, E'a', E'2026-02-24T13:34:44.643882+00:00', E'2026-02-24T13:34:44.643882+00:00') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('"submissions"', 'id'), COALESCE((SELECT MAX(id) FROM "submissions"), 0) + 1, false);

-- bonus_entries: 5행
INSERT INTO "bonus_entries" ("id", "submission_id", "bonus_config_id", "sns_url", "proof_image_url", "submitted_at") VALUES (1, 1, 23, E'https://higgsfield.ai/image/nano_banana_2', E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/proof-images/3/5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe/8d725ca3-8593-4716-81b2-25655eb0c571-____1.png', E'2026-02-24T13:00:29.904+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "bonus_entries" ("id", "submission_id", "bonus_config_id", "sns_url", "proof_image_url", "submitted_at") VALUES (2, 2, 25, E'https://www.google.com/search?q=%EB%B2%88%EC%97%AD%EA%B8%B0&rlz=1C1CHZN_koKR1030KR1030&oq=&gs_lcrp=EgZjaHJvbWUqCQgAECMYJxjqAjIJCAAQIxgnGOoCMgkIARAjGCcY6gIyCQgCECMYJxjqAjIJCAMQIxgnGOoCMgkIBBAjGCcY6gIyCQgFECMYJxjqAjIJCAYQIxgnGOoCMgkIBxAjGCcY6gLSAQs1NzQ1ODc1ajBqN6gCCLACAfEFqP-EOz6yUcw&sourceid=chrome&ie=UTF-8', E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/proof-images/3/5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe/187d3c7d-bd46-4bbb-b14b-3bda8f563e66-261128_______________05.png', E'2026-02-24T13:15:09.387+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "bonus_entries" ("id", "submission_id", "bonus_config_id", "sns_url", "proof_image_url", "submitted_at") VALUES (3, 3, 23, E'https://higgsfield.ai/image/nano_banana_2', E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/proof-images/3/f238f5ed-9ec3-4d86-95ab-bff403df64d6/ed570be0-c2ab-434f-9355-8c13c45a2efe-KakaoTalk_20251123_113153828.jpg', E'2026-02-24T13:34:44.829+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "bonus_entries" ("id", "submission_id", "bonus_config_id", "sns_url", "proof_image_url", "submitted_at") VALUES (4, 3, 24, E'https://higgsfield.ai/image/nano_banana_2', E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/proof-images/3/f238f5ed-9ec3-4d86-95ab-bff403df64d6/6e3d6bcd-a3a9-4915-8987-46624d403c58-KakaoTalk_20251123_113128266.jpg', E'2026-02-24T13:34:44.829+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "bonus_entries" ("id", "submission_id", "bonus_config_id", "sns_url", "proof_image_url", "submitted_at") VALUES (5, 3, 25, NULL, E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/proof-images/3/f238f5ed-9ec3-4d86-95ab-bff403df64d6/fa4ee71a-6369-41c1-92e1-9e84acdd112c-__.png', E'2026-02-24T13:34:44.829+00:00') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('"bonus_entries"', 'id'), COALESCE((SELECT MAX(id) FROM "bonus_entries"), 0) + 1, false);

-- utm_visits: 18행
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'09563726-3e0d-44b9-879e-87142e68698f', E'53861db5-2170-40d8-8714-eaadb593faba', NULL, NULL, NULL, NULL, NULL, NULL, E'https://contestkorea.com/', E'/contests/3/landing', E'211.197.218.187', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-24T09:43:29.053644+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'13662981-9590-4b4e-9ac4-7177b56ef35b', E'20d31a91-438a-4c71-9719-d78f1414d72f', E'f238f5ed-9ec3-4d86-95ab-bff403df64d6', NULL, NULL, NULL, NULL, NULL, E'https://accounts.google.com/', E'/contests/3/landing', E'121.160.186.70', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', E'2026-02-24T13:29:35.362176+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'1ac73014-b18f-44fb-a587-2c3ccb10bc5c', E'51f7d255-bcd4-4844-879b-c08d1bf9f1fb', NULL, NULL, NULL, NULL, NULL, NULL, E'https://blog.naver.com/PostView.naver?blogId=ryoonm38&logNo=224193167030&redirect=Dlog&widgetTypeCall=true&topReferer=https%3A%2F%2Fsearch.naver.com%2Fsearch.naver%3Fwhere%3Dnexearch%26sm%3Dtop_hty%26fbm%3D0%26ie%3Dutf8%26query%3D%25EC%25A0%259C1%25ED%259A%258C%2B%25EA%25BF%2588%25EA%25BE%25B8%25EB%258A%2594%2B%25EC%2595%2584%25EB%25A6%25AC%25EB%259E%2591%2BAI%2B%25EB%25AE%25A4%25EC%25A7%2581%25EB%25B9%2584%25EB%2594%2594%25EC%2598%25A4%2B%25EA%25B3%25B5%25EB%25AA%25A8%25EC%25A0%2584%26ackey%3D503jlaiy&trackingCode=nx&directAccess=false', E'/contests/contest-1/landing', E'182.229.224.182', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', E'2026-02-24T04:51:52.068822+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'289644e7-bc84-4b1c-9b5c-adb3b32e2449', E'03e769df-08f4-4ff8-a474-3af2e2820211', NULL, NULL, NULL, NULL, NULL, NULL, E'https://www.campuspick.com/', E'/contests/contest-1/landing', E'222.239.135.182', E'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) (campuspickApp; iOS/4.0.6 (iOS/26.2.1; iPhone))', E'2026-02-24T08:41:17.379045+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'2b31d2a5-c7cb-49f1-a465-222360f940d9', E'2e2ee724-6987-4f6d-9bef-4fda65d9252c', NULL, NULL, NULL, NULL, NULL, NULL, E'https://www.campuspick.com/', E'/contests/contest-1/landing', E'222.239.135.182', E'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) (campuspickApp; iOS/4.0.6 (iOS/26.2.1; iPhone))', E'2026-02-24T08:38:07.680609+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'735677d5-eb8e-4c15-bd66-95a244119fe4', E'aedab6cb-201c-488c-859d-2c31171aefac', NULL, NULL, NULL, NULL, NULL, NULL, E'https://ai-video-contest.vercel.app/contests/contest-1/landing', E'/contests/contest-1?tab=video', E'106.255.141.90', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-24T11:53:19.746108+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'776abb5f-6191-4cd8-a8c9-9560dabc6ff2', E'29c51ad4-7bf5-4f63-a207-d4e52ecafe0f', NULL, NULL, NULL, NULL, NULL, NULL, E'https://thinkyou.co.kr/', E'/contests/contest-1/landing', E'211.201.227.141', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-24T08:38:19.387187+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'807cbc96-ae84-4bb6-9b74-b53b25b143c7', E'8add1de2-1c3d-4359-b990-4ec4275cf508', E'6fdcf75c-f8b4-4bd6-8358-080722880fd2', NULL, NULL, NULL, NULL, NULL, E'https://ai-video-contest.vercel.app/admin/contests/new', E'/admin/contests/new', E'121.160.186.70', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-24T00:31:39.982593+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'9171e8f5-91d5-4871-a594-a2be7d0801c7', E'633cfbf2-494f-4db2-a4c2-9bb664e67c27', NULL, NULL, NULL, NULL, NULL, NULL, E'https://ai-video-contest.vercel.app/contests', E'/contests?status=open', E'121.160.186.70', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-24T22:41:18.986129+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'9730aa33-ad68-4060-ab55-305417f76d48', E'2902a790-0fc2-4678-8c77-e01ad8ffb8cd', E'6fdcf75c-f8b4-4bd6-8358-080722880fd2', NULL, NULL, NULL, NULL, NULL, E'https://ai-video-contest.vercel.app/contests/contest-1/landing', E'/my/submissions', E'121.160.186.70', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-23T23:17:48.680249+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'af16babb-b99c-48b5-bc55-2a8be8926de9', E'f8f3423c-4387-4fe9-b1c5-f83b9049c259', E'ad0120f2-c230-4f5a-904f-d7d89dfbb551', NULL, NULL, NULL, NULL, NULL, E'https://accounts.google.com/', E'/contests/3/landing', E'220.86.161.239', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-24T07:42:40.173827+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'c347eda8-5043-414c-aa94-ce143471f8a0', E'167e190d-6296-4953-bb5b-c7a3587e4f2f', NULL, NULL, NULL, NULL, NULL, NULL, E'https://thinkyou.co.kr/', E'/contests/contest-1/landing', E'118.216.92.7', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Whale/4.35.351.16 Safari/537.36', E'2026-02-24T12:30:08.2453+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'c8bb25c5-6674-4f98-98d5-111c0d6b3188', E'026c5a53-ec55-411e-b781-d83569fd33b8', E'f238f5ed-9ec3-4d86-95ab-bff403df64d6', NULL, NULL, NULL, NULL, NULL, E'https://ai-video-contest.vercel.app/gallery/3', E'/contests/3/landing', E'121.160.186.70', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', E'2026-02-24T13:36:04.88824+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'cbf35bcf-c173-41b1-8553-482d7c2c921a', E'8bffc864-8d20-404a-b46c-c00dcc81e30f', NULL, NULL, NULL, NULL, NULL, NULL, E'https://www.campuspick.com/', E'/contests/contest-1/landing', E'211.235.99.72', E'Mozilla/5.0 (Linux; Android 16; SM-S938N Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/144.0.7559.132 Mobile Safari/537.36 (everytimeApp; Android/8.1.64 (Android/16; SM-S938N))', E'2026-02-24T13:32:35.615103+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'd5ebab2a-a4fc-4bf4-8873-f11590ac95b0', E'38c69dd8-1bdf-4a87-848f-b323c04e7ec7', NULL, NULL, NULL, NULL, NULL, NULL, E'https://ai-video-contest.vercel.app/contests?status=open', E'/login', E'121.160.186.70', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-24T09:58:13.818569+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'dbd781eb-c04e-4e86-a3e5-862920e43541', E'd9bab416-0f03-4b51-a08e-68abf64cd66f', E'f98779b1-dfc9-4e0e-ab22-f98cc56754ab', NULL, NULL, NULL, NULL, NULL, E'https://accounts.google.com/', E'/contests/3/landing', E'121.162.173.118', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', E'2026-02-24T17:23:22.778441+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'e270848c-434c-4b72-92dc-0c8824cdf638', E'b3ca3c0e-3fd1-4881-bed8-137507adef38', NULL, NULL, NULL, NULL, NULL, NULL, E'https://www.code-c.kr/', E'/contests/contest-1/landing', E'182.229.224.182', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', E'2026-02-24T04:56:07.455017+00:00') ON CONFLICT DO NOTHING;
INSERT INTO "utm_visits" ("id", "session_id", "user_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page", "ip_address", "user_agent", "created_at") VALUES (E'fa952df4-25e2-4641-a304-058ac27c4d4e', E'eb1e4d08-d16e-4122-8088-05de67c856eb', NULL, NULL, NULL, NULL, NULL, NULL, E'https://thinkyou.co.kr/', E'/contests/contest-1/landing', E'119.64.156.130', E'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', E'2026-02-24T12:58:01.762288+00:00') ON CONFLICT DO NOTHING;

-- 프로필 자동 생성 트리거 복원
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

SELECT setval(pg_get_serial_sequence('"profiles"', 'seq_id'), COALESCE((SELECT MAX(seq_id) FROM profiles), 0) + 1, false);