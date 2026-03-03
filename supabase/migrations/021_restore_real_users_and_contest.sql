-- ============================================================
-- 021: 전체 유저 + 공모전 + 필수 데이터 복원
-- 구 프로덕션(oyssfmocdihzqdsvysdi)에서 추출 — 2026-02-28T21:48:27.307Z
-- 020에서 전체 삭제 후, 모든 유저(테스트+실제) + 공모전 데이터 복원
-- 제외: submissions, bonus_entries, activity_logs, ip_logs, utm_visits
-- ============================================================

-- 프로필 자동 생성 트리거 비활성화 (auth.users INSERT 시 중복 방지)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 구 프로덕션에만 존재하는 profiles 컬럼 추가 (스키마 동기화)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_chat_ai text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_image_ai text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_video_ai text[] DEFAULT '{}';

-- ============================================================
-- 1. auth.users 복원 (45명)
-- ============================================================

-- kimyjung3414@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '033d6c7d-9dbc-456c-8a31-4e418556e162',
  'authenticated', 'authenticated',
  'kimyjung3414@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-28T11:44:18.621908Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIc8iOJOLAK3tDAeZa6w09k0y5jhobZk87npWpx1e2hlabIM9s=s96-c","email":"kimyjung3414@gmail.com","email_verified":true,"full_name":"저녀니","iss":"https://accounts.google.com","name":"저녀니","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIc8iOJOLAK3tDAeZa6w09k0y5jhobZk87npWpx1e2hlabIM9s=s96-c","provider_id":"103423370421999997632","sub":"103423370421999997632"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-28T11:44:18.592488Z', '2026-02-28T11:44:19.926473Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '033d6c7d-9dbc-456c-8a31-4e418556e162',
  '103423370421999997632',
  E'{"sub":"103423370421999997632","email":"kimyjung3414@gmail.com","full_name":"저녀니","provider_id":"103423370421999997632"}'::jsonb,
  'google',
  '2026-02-28T11:44:18.592488Z', '2026-02-28T11:44:18.592488Z', '2026-02-28T11:44:19.926473Z'
) ON CONFLICT DO NOTHING;
-- jimin20080103e@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '4a6a5e0b-6564-4ead-a886-2e9ebbdd76fb',
  'authenticated', 'authenticated',
  'jimin20080103e@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-27T12:02:57.839494Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJlJ90Gxm0geB7j7JlaVq7Rr4MEGRsSfGOBiiPRcBzUvgsyUw=s96-c","email":"jimin20080103e@gmail.com","email_verified":true,"full_name":"이지민","iss":"https://accounts.google.com","name":"이지민","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJlJ90Gxm0geB7j7JlaVq7Rr4MEGRsSfGOBiiPRcBzUvgsyUw=s96-c","provider_id":"106747483403404246020","sub":"106747483403404246020"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-27T12:02:57.770666Z', '2026-02-27T12:02:59.800161Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '4a6a5e0b-6564-4ead-a886-2e9ebbdd76fb',
  '106747483403404246020',
  E'{"sub":"106747483403404246020","email":"jimin20080103e@gmail.com","full_name":"이지민","provider_id":"106747483403404246020"}'::jsonb,
  'google',
  '2026-02-27T12:02:57.770666Z', '2026-02-27T12:02:57.770666Z', '2026-02-27T12:02:59.800161Z'
) ON CONFLICT DO NOTHING;
-- meroy8221@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '61fbc463-8cdc-42e5-a5d2-3fb079f6a5c3',
  'authenticated', 'authenticated',
  'meroy8221@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-27T08:28:03.584967Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLsnKNeSXa2c-cUcoj8kBc9xurJAyi3n9Ij6xvPvYPp78pRVA=s96-c","email":"meroy8221@gmail.com","email_verified":true,"full_name":"이지민","iss":"https://accounts.google.com","name":"이지민","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLsnKNeSXa2c-cUcoj8kBc9xurJAyi3n9Ij6xvPvYPp78pRVA=s96-c","provider_id":"103461906592793284352","sub":"103461906592793284352"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-27T08:28:03.51936Z', '2026-02-27T08:28:04.822517Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '61fbc463-8cdc-42e5-a5d2-3fb079f6a5c3',
  '103461906592793284352',
  E'{"sub":"103461906592793284352","email":"meroy8221@gmail.com","full_name":"이지민","provider_id":"103461906592793284352"}'::jsonb,
  'google',
  '2026-02-27T08:28:03.51936Z', '2026-02-27T08:28:03.51936Z', '2026-02-27T08:28:04.822517Z'
) ON CONFLICT DO NOTHING;
-- po8po72@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '5ddc169e-6601-45a8-b57a-d441a4b9f134',
  'authenticated', 'authenticated',
  'po8po72@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-27T06:03:04.388681Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKRerXJ_8Y3DjTZzq_hcwqw2Jysf9RNHlVp8q7UWX0j1W9Svh09=s96-c","email":"po8po72@gmail.com","email_verified":true,"full_name":"허희라","iss":"https://accounts.google.com","name":"허희라","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKRerXJ_8Y3DjTZzq_hcwqw2Jysf9RNHlVp8q7UWX0j1W9Svh09=s96-c","provider_id":"101444602116225909102","sub":"101444602116225909102"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-27T06:03:04.336308Z', '2026-02-27T07:23:31.017277Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '5ddc169e-6601-45a8-b57a-d441a4b9f134',
  '101444602116225909102',
  E'{"sub":"101444602116225909102","email":"po8po72@gmail.com","full_name":"허희라","provider_id":"101444602116225909102"}'::jsonb,
  'google',
  '2026-02-27T06:03:04.336308Z', '2026-02-27T06:03:04.336308Z', '2026-02-27T07:23:31.017277Z'
) ON CONFLICT DO NOTHING;
-- wldns031411@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '4c2aefbb-3123-467b-90a8-9acf12504303',
  'authenticated', 'authenticated',
  'wldns031411@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-27T05:39:46.270619Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJoGlgjZ-PTQvs3PlYf7yr9zA3qBY8rQDXYXvA_4fAm0jUSWYjK=s96-c","email":"wldns031411@gmail.com","email_verified":true,"full_name":"안지운","iss":"https://accounts.google.com","name":"안지운","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJoGlgjZ-PTQvs3PlYf7yr9zA3qBY8rQDXYXvA_4fAm0jUSWYjK=s96-c","provider_id":"101591585581451585053","sub":"101591585581451585053"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-27T05:39:46.200718Z', '2026-02-27T06:46:28.679441Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '4c2aefbb-3123-467b-90a8-9acf12504303',
  '101591585581451585053',
  E'{"sub":"101591585581451585053","email":"wldns031411@gmail.com","full_name":"안지운","provider_id":"101591585581451585053"}'::jsonb,
  'google',
  '2026-02-27T05:39:46.200718Z', '2026-02-27T05:39:46.200718Z', '2026-02-27T06:46:28.679441Z'
) ON CONFLICT DO NOTHING;
-- e832612@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'e38dd86b-d273-41d6-aa8d-562e0b630223',
  'authenticated', 'authenticated',
  'e832612@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-26T14:43:48.900238Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJP70uhMMXWhk0ixYiDGqHdvBn5yzDGyCB_txcJqyUEqA6gi28-=s96-c","email":"e832612@gmail.com","email_verified":true,"full_name":"유진","iss":"https://accounts.google.com","name":"유진","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJP70uhMMXWhk0ixYiDGqHdvBn5yzDGyCB_txcJqyUEqA6gi28-=s96-c","provider_id":"106434412738289610724","sub":"106434412738289610724"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-26T14:43:48.853968Z', '2026-02-26T14:43:49.497937Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'e38dd86b-d273-41d6-aa8d-562e0b630223',
  '106434412738289610724',
  E'{"sub":"106434412738289610724","email":"e832612@gmail.com","full_name":"유진","provider_id":"106434412738289610724"}'::jsonb,
  'google',
  '2026-02-26T14:43:48.853968Z', '2026-02-26T14:43:48.853968Z', '2026-02-26T14:43:49.497937Z'
) ON CONFLICT DO NOTHING;
-- ruggy1356@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2a4e192-5157-4484-8ebd-ba330bad6527',
  'authenticated', 'authenticated',
  'ruggy1356@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-26T14:30:21.054871Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLqfO9rSZ3tweQXJ0L1svymlPl2q7LuL24Uz9itj6qithsajAw=s96-c","email":"ruggy1356@gmail.com","email_verified":true,"full_name":"동현김","iss":"https://accounts.google.com","name":"동현김","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLqfO9rSZ3tweQXJ0L1svymlPl2q7LuL24Uz9itj6qithsajAw=s96-c","provider_id":"102328986643794052601","sub":"102328986643794052601"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-26T14:30:21.02445Z', '2026-02-26T14:30:21.461631Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'b2a4e192-5157-4484-8ebd-ba330bad6527',
  '102328986643794052601',
  E'{"sub":"102328986643794052601","email":"ruggy1356@gmail.com","full_name":"동현김","provider_id":"102328986643794052601"}'::jsonb,
  'google',
  '2026-02-26T14:30:21.02445Z', '2026-02-26T14:30:21.02445Z', '2026-02-26T14:30:21.461631Z'
) ON CONFLICT DO NOTHING;
-- stepbyjason@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b63e79c7-b2d9-4ba9-9415-fb55fc58eb81',
  'authenticated', 'authenticated',
  'stepbyjason@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-26T10:54:26.614837Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocK17TxnQBsq0bkBdAIfO7fFCfDiGStNZraTtfYwxRJouDYNAA=s96-c","email":"stepbyjason@gmail.com","email_verified":true,"full_name":"Jason","iss":"https://accounts.google.com","name":"Jason","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocK17TxnQBsq0bkBdAIfO7fFCfDiGStNZraTtfYwxRJouDYNAA=s96-c","provider_id":"100879389081918686184","sub":"100879389081918686184"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-26T10:54:26.567934Z', '2026-02-26T10:54:28.303627Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'b63e79c7-b2d9-4ba9-9415-fb55fc58eb81',
  '100879389081918686184',
  E'{"sub":"100879389081918686184","email":"stepbyjason@gmail.com","full_name":"Jason","provider_id":"100879389081918686184"}'::jsonb,
  'google',
  '2026-02-26T10:54:26.567934Z', '2026-02-26T10:54:26.567934Z', '2026-02-26T10:54:28.303627Z'
) ON CONFLICT DO NOTHING;
-- besteunkyu9@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '9fffa621-5010-4ace-8085-e3cfd3df2d8b',
  'authenticated', 'authenticated',
  'besteunkyu9@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-26T09:02:44.679822Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKVPCh4_NLMnBI7oNeoMe-regDeiSDs1DqRSOWUhBcMThfwmFZE=s96-c","email":"besteunkyu9@gmail.com","email_verified":true,"full_name":"cha cha","iss":"https://accounts.google.com","name":"cha cha","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKVPCh4_NLMnBI7oNeoMe-regDeiSDs1DqRSOWUhBcMThfwmFZE=s96-c","provider_id":"103983060095833769102","sub":"103983060095833769102"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-26T09:02:44.538671Z', '2026-02-26T09:02:46.610261Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '9fffa621-5010-4ace-8085-e3cfd3df2d8b',
  '103983060095833769102',
  E'{"sub":"103983060095833769102","email":"besteunkyu9@gmail.com","full_name":"cha cha","provider_id":"103983060095833769102"}'::jsonb,
  'google',
  '2026-02-26T09:02:44.538671Z', '2026-02-26T09:02:44.538671Z', '2026-02-26T09:02:46.610261Z'
) ON CONFLICT DO NOTHING;
-- jtm021818@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '6ce6e948-18b8-4b98-bfe9-ac8bf98a2d8d',
  'authenticated', 'authenticated',
  'jtm021818@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-26T01:40:03.683115Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocL1tOG4wA0nRp7fIKLBj94dAWYMfTKcqoMkSu2ikowcGWncL8U=s96-c","email":"jtm021818@gmail.com","email_verified":true,"full_name":"ᄋᄂᄆ","iss":"https://accounts.google.com","name":"ᄋᄂᄆ","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocL1tOG4wA0nRp7fIKLBj94dAWYMfTKcqoMkSu2ikowcGWncL8U=s96-c","provider_id":"103552221357314628657","sub":"103552221357314628657"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-26T01:40:03.661419Z', '2026-02-26T23:22:36.147017Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '6ce6e948-18b8-4b98-bfe9-ac8bf98a2d8d',
  '103552221357314628657',
  E'{"sub":"103552221357314628657","email":"jtm021818@gmail.com","full_name":"ᄋᄂᄆ","provider_id":"103552221357314628657"}'::jsonb,
  'google',
  '2026-02-26T01:40:03.661419Z', '2026-02-26T01:40:03.661419Z', '2026-02-26T23:22:36.147017Z'
) ON CONFLICT DO NOTHING;
-- yeasol1210@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '4cb11c09-1ce8-4dbe-94b1-94fb99b61e6a',
  'authenticated', 'authenticated',
  'yeasol1210@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-26T00:43:21.995056Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJsYCPiIEaWzRrjEvXneXI9DyUyryGWvkXAARHU_1t5yBbOJw=s96-c","email":"yeasol1210@gmail.com","email_verified":true,"full_name":"Ye Sol Kim","iss":"https://accounts.google.com","name":"Ye Sol Kim","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJsYCPiIEaWzRrjEvXneXI9DyUyryGWvkXAARHU_1t5yBbOJw=s96-c","provider_id":"115813371440000381851","sub":"115813371440000381851"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-26T00:43:21.968774Z', '2026-02-26T23:03:49.035043Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '4cb11c09-1ce8-4dbe-94b1-94fb99b61e6a',
  '115813371440000381851',
  E'{"sub":"115813371440000381851","email":"yeasol1210@gmail.com","full_name":"Ye Sol Kim","provider_id":"115813371440000381851"}'::jsonb,
  'google',
  '2026-02-26T00:43:21.968774Z', '2026-02-26T00:43:21.968774Z', '2026-02-26T23:03:49.035043Z'
) ON CONFLICT DO NOTHING;
-- rudtn466@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '1634fca4-7a2b-4cc4-b9cf-9baabb9d2738',
  'authenticated', 'authenticated',
  'rudtn466@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T13:10:23.8422Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJQTsgi9JcQfHWhE9B2bXctCK8o-8bvY1I-L70oNPXCB5cR3HQ=s96-c","email":"rudtn466@gmail.com","email_verified":true,"full_name":"이경수","iss":"https://accounts.google.com","name":"이경수","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJQTsgi9JcQfHWhE9B2bXctCK8o-8bvY1I-L70oNPXCB5cR3HQ=s96-c","provider_id":"113905298173818275211","sub":"113905298173818275211"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T13:10:23.82093Z', '2026-02-25T13:10:24.291986Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '1634fca4-7a2b-4cc4-b9cf-9baabb9d2738',
  '113905298173818275211',
  E'{"sub":"113905298173818275211","email":"rudtn466@gmail.com","full_name":"이경수","provider_id":"113905298173818275211"}'::jsonb,
  'google',
  '2026-02-25T13:10:23.82093Z', '2026-02-25T13:10:23.82093Z', '2026-02-25T13:10:24.291986Z'
) ON CONFLICT DO NOTHING;
-- hamkkebom12@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '5a150959-15b2-437f-b8c9-06b3d5bc6b03',
  'authenticated', 'authenticated',
  'hamkkebom12@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T12:50:27.581827Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocIxcAxK6MBc7J-JKjL5ihsUREkKfvZYcIpq4puCCX1JQjaXMg=s96-c","email":"hamkkebom12@gmail.com","email_verified":true,"full_name":"함께봄","iss":"https://accounts.google.com","name":"함께봄","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocIxcAxK6MBc7J-JKjL5ihsUREkKfvZYcIpq4puCCX1JQjaXMg=s96-c","provider_id":"112664677098447665211","sub":"112664677098447665211"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T12:50:27.555684Z', '2026-02-25T12:50:55.279509Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '5a150959-15b2-437f-b8c9-06b3d5bc6b03',
  '112664677098447665211',
  E'{"sub":"112664677098447665211","email":"hamkkebom12@gmail.com","full_name":"함께봄","provider_id":"112664677098447665211"}'::jsonb,
  'google',
  '2026-02-25T12:50:27.555684Z', '2026-02-25T12:50:27.555684Z', '2026-02-25T12:50:55.279509Z'
) ON CONFLICT DO NOTHING;
-- dokkaebimarketing1@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '0b416d44-6e4c-46a0-9ddf-4e5974179684',
  'authenticated', 'authenticated',
  'dokkaebimarketing1@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T09:11:31.850216Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKQJc7BUH_dk-P2IDKqC4va8ibVcETZZ-VQGqGaaKnJCm1Qig=s96-c","email":"dokkaebimarketing1@gmail.com","email_verified":true,"full_name":"도깨비마케팅","iss":"https://accounts.google.com","name":"도깨비마케팅","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKQJc7BUH_dk-P2IDKqC4va8ibVcETZZ-VQGqGaaKnJCm1Qig=s96-c","provider_id":"102416597468277575386","sub":"102416597468277575386"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T09:11:31.683306Z', '2026-02-26T23:23:02.673912Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '0b416d44-6e4c-46a0-9ddf-4e5974179684',
  '102416597468277575386',
  E'{"sub":"102416597468277575386","email":"dokkaebimarketing1@gmail.com","full_name":"도깨비마케팅","provider_id":"102416597468277575386"}'::jsonb,
  'google',
  '2026-02-25T09:11:31.683306Z', '2026-02-25T09:11:31.683306Z', '2026-02-26T23:23:02.673912Z'
) ON CONFLICT DO NOTHING;
-- kimeric109010@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '16c4ab7f-fd0b-4c2d-91e3-c3a68408b706',
  'authenticated', 'authenticated',
  'kimeric109010@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T09:06:28.277347Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJEg52FJAP8z331e_Mgj2JjLIqAVjQbP_C-c7CaZhFDOomjZg=s96-c","email":"kimeric109010@gmail.com","email_verified":true,"full_name":"Eric Kim","iss":"https://accounts.google.com","name":"Eric Kim","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJEg52FJAP8z331e_Mgj2JjLIqAVjQbP_C-c7CaZhFDOomjZg=s96-c","provider_id":"112771587173766477698","sub":"112771587173766477698"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T09:06:28.270618Z', '2026-02-25T09:06:29.214971Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '16c4ab7f-fd0b-4c2d-91e3-c3a68408b706',
  '112771587173766477698',
  E'{"sub":"112771587173766477698","email":"kimeric109010@gmail.com","full_name":"Eric Kim","provider_id":"112771587173766477698"}'::jsonb,
  'google',
  '2026-02-25T09:06:28.270618Z', '2026-02-25T09:06:28.270618Z', '2026-02-25T09:06:29.214971Z'
) ON CONFLICT DO NOTHING;
-- mentorbank.movie@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f1b29f12-1d40-4331-a143-94346c5308b3',
  'authenticated', 'authenticated',
  'mentorbank.movie@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T09:04:44.441066Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocI1iDMapnWadMKBdETHDmOzMDte_hPS9eIXswH-BzgEHlq66g=s96-c","email":"mentorbank.movie@gmail.com","email_verified":true,"full_name":"bank mentor","iss":"https://accounts.google.com","name":"bank mentor","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocI1iDMapnWadMKBdETHDmOzMDte_hPS9eIXswH-BzgEHlq66g=s96-c","provider_id":"108385755644200500848","sub":"108385755644200500848"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T09:04:44.386205Z', '2026-02-25T09:04:46.265845Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'f1b29f12-1d40-4331-a143-94346c5308b3',
  '108385755644200500848',
  E'{"sub":"108385755644200500848","email":"mentorbank.movie@gmail.com","full_name":"bank mentor","provider_id":"108385755644200500848"}'::jsonb,
  'google',
  '2026-02-25T09:04:44.386205Z', '2026-02-25T09:04:44.386205Z', '2026-02-25T09:04:46.265845Z'
) ON CONFLICT DO NOTHING;
-- usozukii@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '325880fc-e274-422c-9132-55269d594fd5',
  'authenticated', 'authenticated',
  'usozukii@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T08:18:24.957644Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJW2AXk44JtRPEPP9hAi4ktUYbJQr-hikOXq3MM6D5VSBQ28V_X=s96-c","email":"usozukii@gmail.com","email_verified":true,"full_name":"수월드","iss":"https://accounts.google.com","name":"수월드","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJW2AXk44JtRPEPP9hAi4ktUYbJQr-hikOXq3MM6D5VSBQ28V_X=s96-c","provider_id":"101812093106295144289","sub":"101812093106295144289"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T08:18:24.929426Z', '2026-02-26T08:35:54.123995Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '325880fc-e274-422c-9132-55269d594fd5',
  '101812093106295144289',
  E'{"sub":"101812093106295144289","email":"usozukii@gmail.com","full_name":"수월드","provider_id":"101812093106295144289"}'::jsonb,
  'google',
  '2026-02-25T08:18:24.929426Z', '2026-02-25T08:18:24.929426Z', '2026-02-26T08:35:54.123995Z'
) ON CONFLICT DO NOTHING;
-- jtm0218@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b748934e-ed06-4586-be0d-b099bd16af01',
  'authenticated', 'authenticated',
  'jtm0218@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T08:11:00.744664Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocK3gtV9t0i1pjbrovnTHeRhIDomMQjaL0rFHm5ydWqYil4ARQ=s96-c","email":"jtm0218@gmail.com","email_verified":true,"full_name":"정태민","iss":"https://accounts.google.com","name":"정태민","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocK3gtV9t0i1pjbrovnTHeRhIDomMQjaL0rFHm5ydWqYil4ARQ=s96-c","provider_id":"105092675112678667493","sub":"105092675112678667493"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T08:11:00.733286Z', '2026-02-26T23:22:24.790206Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'b748934e-ed06-4586-be0d-b099bd16af01',
  '105092675112678667493',
  E'{"sub":"105092675112678667493","email":"jtm0218@gmail.com","full_name":"정태민","provider_id":"105092675112678667493"}'::jsonb,
  'google',
  '2026-02-25T08:11:00.733286Z', '2026-02-25T08:11:00.733286Z', '2026-02-26T23:22:24.790206Z'
) ON CONFLICT DO NOTHING;
-- 1210yeasol@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '70b0d760-4847-48fd-9267-ef3667de9e21',
  'authenticated', 'authenticated',
  '1210yeasol@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T08:07:09.764785Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKfZUePLj2-lQTVKk7o7f0O6NABoNKMaY8i2Lpf1DXV5XD1PQ=s96-c","email":"1210yeasol@gmail.com","email_verified":true,"full_name":"김예솔","iss":"https://accounts.google.com","name":"김예솔","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKfZUePLj2-lQTVKk7o7f0O6NABoNKMaY8i2Lpf1DXV5XD1PQ=s96-c","provider_id":"104470131295027716238","sub":"104470131295027716238"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T08:07:09.729378Z', '2026-02-26T15:19:40.269098Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '70b0d760-4847-48fd-9267-ef3667de9e21',
  '104470131295027716238',
  E'{"sub":"104470131295027716238","email":"1210yeasol@gmail.com","full_name":"김예솔","provider_id":"104470131295027716238"}'::jsonb,
  'google',
  '2026-02-25T08:07:09.729378Z', '2026-02-25T08:07:09.729378Z', '2026-02-26T15:19:40.269098Z'
) ON CONFLICT DO NOTHING;
-- agadingo@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c2b7c821-93d1-4c30-b9f5-3e783fed33e1',
  'authenticated', 'authenticated',
  'agadingo@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T06:27:46.083426Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocInnM8IZkFQd5q00nuStgJariINfua2pSFscTTS4Blkvh3EmlM-=s96-c","email":"agadingo@gmail.com","email_verified":true,"full_name":"momile u","iss":"https://accounts.google.com","name":"momile u","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocInnM8IZkFQd5q00nuStgJariINfua2pSFscTTS4Blkvh3EmlM-=s96-c","provider_id":"105907599012214307430","sub":"105907599012214307430"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-25T06:27:46.077354Z', '2026-02-26T01:28:32.992704Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'c2b7c821-93d1-4c30-b9f5-3e783fed33e1',
  '105907599012214307430',
  E'{"sub":"105907599012214307430","email":"agadingo@gmail.com","full_name":"momile u","provider_id":"105907599012214307430"}'::jsonb,
  'google',
  '2026-02-25T06:27:46.077354Z', '2026-02-25T06:27:46.077354Z', '2026-02-26T01:28:32.992704Z'
) ON CONFLICT DO NOTHING;
-- agadingo@naver.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c42ccbf9-6897-484c-8062-be27f20dc463',
  'authenticated', 'authenticated',
  'agadingo@naver.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-25T06:27:02.613975Z',
  E'{"email":"agadingo@naver.com","email_verified":false,"name":"장유주","phone":"01037273246","phone_verified":false,"sub":"c42ccbf9-6897-484c-8062-be27f20dc463"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-25T06:27:02.613975Z', '2026-02-26T00:21:32.036725Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'c42ccbf9-6897-484c-8062-be27f20dc463',
  'agadingo@naver.com',
  '{"sub":"c42ccbf9-6897-484c-8062-be27f20dc463","email":"agadingo@naver.com"}'::jsonb,
  'email',
  '2026-02-25T06:27:02.613975Z', '2026-02-25T06:27:02.613975Z', '2026-02-26T00:21:32.036725Z'
) ON CONFLICT DO NOTHING;

-- exscape86@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f98779b1-dfc9-4e0e-ab22-f98cc56754ab',
  'authenticated', 'authenticated',
  'exscape86@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-24T17:23:16.595628Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJttIxcO-FlAK6AdOmIRB0YVTJXRyzm30TKaMCj9wxtm5Bfgg=s96-c","email":"exscape86@gmail.com","email_verified":true,"full_name":"황승률","iss":"https://accounts.google.com","name":"황승률","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJttIxcO-FlAK6AdOmIRB0YVTJXRyzm30TKaMCj9wxtm5Bfgg=s96-c","provider_id":"116589928207640781705","sub":"116589928207640781705"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-24T17:23:16.51019Z', '2026-02-24T17:23:18.529739Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'f98779b1-dfc9-4e0e-ab22-f98cc56754ab',
  '116589928207640781705',
  E'{"sub":"116589928207640781705","email":"exscape86@gmail.com","full_name":"황승률","provider_id":"116589928207640781705"}'::jsonb,
  'google',
  '2026-02-24T17:23:16.51019Z', '2026-02-24T17:23:16.51019Z', '2026-02-24T17:23:18.529739Z'
) ON CONFLICT DO NOTHING;
-- ourearth0423@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f238f5ed-9ec3-4d86-95ab-bff403df64d6',
  'authenticated', 'authenticated',
  'ourearth0423@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-24T13:29:29.723233Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocJg_Ed9OcyCEXRQV8FfhIugQhDJ8aJtZ3rIGwzPTyPKZkb2ZV7i=s96-c","email":"ourearth0423@gmail.com","email_verified":true,"full_name":"_subong수봉","iss":"https://accounts.google.com","name":"_subong수봉","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocJg_Ed9OcyCEXRQV8FfhIugQhDJ8aJtZ3rIGwzPTyPKZkb2ZV7i=s96-c","provider_id":"112869667824586596711","sub":"112869667824586596711"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-24T13:29:29.707273Z', '2026-02-26T08:38:43.582666Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'f238f5ed-9ec3-4d86-95ab-bff403df64d6',
  '112869667824586596711',
  E'{"sub":"112869667824586596711","email":"ourearth0423@gmail.com","full_name":"_subong수봉","provider_id":"112869667824586596711"}'::jsonb,
  'google',
  '2026-02-24T13:29:29.707273Z', '2026-02-24T13:29:29.707273Z', '2026-02-26T08:38:43.582666Z'
) ON CONFLICT DO NOTHING;
-- 1210yesol@gmail.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe',
  'authenticated', 'authenticated',
  '1210yesol@gmail.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-24T12:51:44.435797Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocLN_YUerkEhcJuoVAZ-YbTxTqMpbUaOg3dSErRFS747WUM8MA=s96-c","email":"1210yesol@gmail.com","email_verified":true,"full_name":"YeSol Kim","iss":"https://accounts.google.com","name":"YeSol Kim","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocLN_YUerkEhcJuoVAZ-YbTxTqMpbUaOg3dSErRFS747WUM8MA=s96-c","provider_id":"111160597313867202611","sub":"111160597313867202611"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-24T12:51:44.389032Z', '2026-02-26T14:58:46.540862Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe',
  '111160597313867202611',
  E'{"sub":"111160597313867202611","email":"1210yesol@gmail.com","full_name":"YeSol Kim","provider_id":"111160597313867202611"}'::jsonb,
  'google',
  '2026-02-24T12:51:44.389032Z', '2026-02-24T12:51:44.389032Z', '2026-02-26T14:58:46.540862Z'
) ON CONFLICT DO NOTHING;
-- ryan9505@naver.com (Google OAuth)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'ad0120f2-c230-4f5a-904f-d7d89dfbb551',
  'authenticated', 'authenticated',
  'ryan9505@naver.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-24T07:42:35.288192Z',
  E'{"avatar_url":"https://lh3.googleusercontent.com/a/ACg8ocKQQh3q-lcynT8bYuHhUTFact1q0VfLtOUIYgYCiDL0PclB3g=s96-c","email":"ryan9505@naver.com","email_verified":true,"full_name":"호이","iss":"https://accounts.google.com","name":"호이","phone_verified":false,"picture":"https://lh3.googleusercontent.com/a/ACg8ocKQQh3q-lcynT8bYuHhUTFact1q0VfLtOUIYgYCiDL0PclB3g=s96-c","provider_id":"108264138267020675700","sub":"108264138267020675700"}'::jsonb,
  E'{"provider":"google","providers":["google"]}'::jsonb,
  '2026-02-24T07:42:35.25033Z', '2026-02-24T07:42:36.014852Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'ad0120f2-c230-4f5a-904f-d7d89dfbb551',
  '108264138267020675700',
  E'{"sub":"108264138267020675700","email":"ryan9505@naver.com","full_name":"호이","provider_id":"108264138267020675700"}'::jsonb,
  'google',
  '2026-02-24T07:42:35.25033Z', '2026-02-24T07:42:35.25033Z', '2026-02-24T07:42:36.014852Z'
) ON CONFLICT DO NOTHING;
-- admin5@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '59ff8eb0-4959-4c9f-88af-660e92ed1f39',
  'authenticated', 'authenticated',
  'admin5@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.788456Z',
  E'{"email_verified":true,"name":"관리자5"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.785247Z', '2026-02-25T16:29:53.626239Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '59ff8eb0-4959-4c9f-88af-660e92ed1f39',
  'admin5@test.hamkkebom.com',
  '{"sub":"59ff8eb0-4959-4c9f-88af-660e92ed1f39","email":"admin5@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:45.785247Z', '2026-02-23T14:23:45.785247Z', '2026-02-25T16:29:53.626239Z'
) ON CONFLICT DO NOTHING;

-- admin4@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8758b4d5-950a-46da-b48f-284bdf39aee6',
  'authenticated', 'authenticated',
  'admin4@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.629672Z',
  E'{"email_verified":true,"name":"관리자4"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.626027Z', '2026-02-23T14:23:45.63057Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '8758b4d5-950a-46da-b48f-284bdf39aee6',
  'admin4@test.hamkkebom.com',
  '{"sub":"8758b4d5-950a-46da-b48f-284bdf39aee6","email":"admin4@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:45.626027Z', '2026-02-23T14:23:45.626027Z', '2026-02-23T14:23:45.63057Z'
) ON CONFLICT DO NOTHING;

-- admin3@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b4b2dede-cfe4-4196-94d9-47975ee5e0c7',
  'authenticated', 'authenticated',
  'admin3@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.457324Z',
  E'{"email_verified":true,"name":"관리자3"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.454063Z', '2026-02-23T14:23:45.459064Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'b4b2dede-cfe4-4196-94d9-47975ee5e0c7',
  'admin3@test.hamkkebom.com',
  '{"sub":"b4b2dede-cfe4-4196-94d9-47975ee5e0c7","email":"admin3@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:45.454063Z', '2026-02-23T14:23:45.454063Z', '2026-02-23T14:23:45.459064Z'
) ON CONFLICT DO NOTHING;

-- admin2@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8dd27e53-670b-4d68-baf7-f8c909b9bf4c',
  'authenticated', 'authenticated',
  'admin2@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.29042Z',
  E'{"email_verified":true,"name":"관리자2"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.284983Z', '2026-02-26T00:57:11.91772Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '8dd27e53-670b-4d68-baf7-f8c909b9bf4c',
  'admin2@test.hamkkebom.com',
  '{"sub":"8dd27e53-670b-4d68-baf7-f8c909b9bf4c","email":"admin2@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:45.284983Z', '2026-02-23T14:23:45.284983Z', '2026-02-26T00:57:11.91772Z'
) ON CONFLICT DO NOTHING;

-- admin1@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '6fdcf75c-f8b4-4bd6-8358-080722880fd2',
  'authenticated', 'authenticated',
  'admin1@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:45.112554Z',
  E'{"email_verified":true,"name":"관리자1"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:45.107326Z', '2026-02-28T21:46:48.901366Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '6fdcf75c-f8b4-4bd6-8358-080722880fd2',
  'admin1@test.hamkkebom.com',
  '{"sub":"6fdcf75c-f8b4-4bd6-8358-080722880fd2","email":"admin1@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:45.107326Z', '2026-02-23T14:23:45.107326Z', '2026-02-28T21:46:48.901366Z'
) ON CONFLICT DO NOTHING;

-- judge5@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '4eaade73-4d4f-4ad2-8822-bb011d39b0bb',
  'authenticated', 'authenticated',
  'judge5@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.949426Z',
  E'{"email_verified":true,"name":"심사위원5"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.94374Z', '2026-02-25T16:39:27.316804Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '4eaade73-4d4f-4ad2-8822-bb011d39b0bb',
  'judge5@test.hamkkebom.com',
  '{"sub":"4eaade73-4d4f-4ad2-8822-bb011d39b0bb","email":"judge5@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:44.94374Z', '2026-02-23T14:23:44.94374Z', '2026-02-25T16:39:27.316804Z'
) ON CONFLICT DO NOTHING;

-- judge4@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '70436f98-f12c-4818-bb6b-e9f39284cf21',
  'authenticated', 'authenticated',
  'judge4@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.789479Z',
  E'{"email_verified":true,"name":"심사위원4"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.784574Z', '2026-02-23T14:23:44.792203Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '70436f98-f12c-4818-bb6b-e9f39284cf21',
  'judge4@test.hamkkebom.com',
  '{"sub":"70436f98-f12c-4818-bb6b-e9f39284cf21","email":"judge4@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:44.784574Z', '2026-02-23T14:23:44.784574Z', '2026-02-23T14:23:44.792203Z'
) ON CONFLICT DO NOTHING;

-- judge3@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '55d156f8-df31-4478-8db0-42538cac51b5',
  'authenticated', 'authenticated',
  'judge3@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.580032Z',
  E'{"email_verified":true,"name":"심사위원3"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.577752Z', '2026-02-23T14:23:44.581397Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '55d156f8-df31-4478-8db0-42538cac51b5',
  'judge3@test.hamkkebom.com',
  '{"sub":"55d156f8-df31-4478-8db0-42538cac51b5","email":"judge3@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:44.577752Z', '2026-02-23T14:23:44.577752Z', '2026-02-23T14:23:44.581397Z'
) ON CONFLICT DO NOTHING;

-- judge2@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '58d1c315-dea7-4014-b51f-d70338908336',
  'authenticated', 'authenticated',
  'judge2@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.415288Z',
  E'{"email_verified":true,"name":"심사위원2"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.412966Z', '2026-02-23T14:23:44.415933Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '58d1c315-dea7-4014-b51f-d70338908336',
  'judge2@test.hamkkebom.com',
  '{"sub":"58d1c315-dea7-4014-b51f-d70338908336","email":"judge2@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:44.412966Z', '2026-02-23T14:23:44.412966Z', '2026-02-23T14:23:44.415933Z'
) ON CONFLICT DO NOTHING;

-- judge1@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '7f6dba97-5e1c-4805-a764-b60a4ea4844d',
  'authenticated', 'authenticated',
  'judge1@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.231232Z',
  E'{"email_verified":true,"name":"심사위원1"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.22578Z', '2026-02-23T14:23:44.234514Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '7f6dba97-5e1c-4805-a764-b60a4ea4844d',
  'judge1@test.hamkkebom.com',
  '{"sub":"7f6dba97-5e1c-4805-a764-b60a4ea4844d","email":"judge1@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:44.22578Z', '2026-02-23T14:23:44.22578Z', '2026-02-23T14:23:44.234514Z'
) ON CONFLICT DO NOTHING;

-- host5@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '82226932-5283-447b-897c-f0353ced9c9e',
  'authenticated', 'authenticated',
  'host5@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:44.058671Z',
  E'{"email_verified":true,"name":"주최자5"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:44.056217Z', '2026-02-25T16:38:25.688013Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '82226932-5283-447b-897c-f0353ced9c9e',
  'host5@test.hamkkebom.com',
  '{"sub":"82226932-5283-447b-897c-f0353ced9c9e","email":"host5@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:44.056217Z', '2026-02-23T14:23:44.056217Z', '2026-02-25T16:38:25.688013Z'
) ON CONFLICT DO NOTHING;

-- host4@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '45a76d98-7016-4f60-9573-6553c2933fc8',
  'authenticated', 'authenticated',
  'host4@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.886078Z',
  E'{"email_verified":true,"name":"주최자4"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.882522Z', '2026-02-23T14:23:43.886723Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '45a76d98-7016-4f60-9573-6553c2933fc8',
  'host4@test.hamkkebom.com',
  '{"sub":"45a76d98-7016-4f60-9573-6553c2933fc8","email":"host4@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:43.882522Z', '2026-02-23T14:23:43.882522Z', '2026-02-23T14:23:43.886723Z'
) ON CONFLICT DO NOTHING;

-- host3@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd096d0b9-4522-4b31-a866-c9315abed63c',
  'authenticated', 'authenticated',
  'host3@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.717654Z',
  E'{"email_verified":true,"name":"주최자3"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.611238Z', '2026-02-23T14:23:43.722345Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'd096d0b9-4522-4b31-a866-c9315abed63c',
  'host3@test.hamkkebom.com',
  '{"sub":"d096d0b9-4522-4b31-a866-c9315abed63c","email":"host3@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:43.611238Z', '2026-02-23T14:23:43.611238Z', '2026-02-23T14:23:43.722345Z'
) ON CONFLICT DO NOTHING;

-- host2@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '560e19e0-36fe-4f87-8b19-642dbd0ab7f2',
  'authenticated', 'authenticated',
  'host2@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.401083Z',
  E'{"email_verified":true,"name":"주최자2"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.39477Z', '2026-02-23T14:23:43.40345Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '560e19e0-36fe-4f87-8b19-642dbd0ab7f2',
  'host2@test.hamkkebom.com',
  '{"sub":"560e19e0-36fe-4f87-8b19-642dbd0ab7f2","email":"host2@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:43.39477Z', '2026-02-23T14:23:43.39477Z', '2026-02-23T14:23:43.40345Z'
) ON CONFLICT DO NOTHING;

-- host1@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '05112cda-d7fb-4ea6-901a-013848be02a6',
  'authenticated', 'authenticated',
  'host1@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.241561Z',
  E'{"email_verified":true,"name":"주최자1"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.230555Z', '2026-02-23T14:23:43.243677Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '05112cda-d7fb-4ea6-901a-013848be02a6',
  'host1@test.hamkkebom.com',
  '{"sub":"05112cda-d7fb-4ea6-901a-013848be02a6","email":"host1@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:43.230555Z', '2026-02-23T14:23:43.230555Z', '2026-02-23T14:23:43.243677Z'
) ON CONFLICT DO NOTHING;

-- participant5@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '0b6a6e0f-bdc0-40b1-a5b5-529df66f341f',
  'authenticated', 'authenticated',
  'participant5@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:43.05029Z',
  E'{"email_verified":true,"name":"참가자5"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:43.043462Z', '2026-02-25T16:35:24.372124Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '0b6a6e0f-bdc0-40b1-a5b5-529df66f341f',
  'participant5@test.hamkkebom.com',
  '{"sub":"0b6a6e0f-bdc0-40b1-a5b5-529df66f341f","email":"participant5@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:43.043462Z', '2026-02-23T14:23:43.043462Z', '2026-02-25T16:35:24.372124Z'
) ON CONFLICT DO NOTHING;

-- participant4@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8d9e4bc0-0ec9-4b4c-a789-0bcd9cbde4bf',
  'authenticated', 'authenticated',
  'participant4@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:42.886476Z',
  E'{"email_verified":true,"name":"참가자4"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:42.87942Z', '2026-02-23T14:23:42.889424Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '8d9e4bc0-0ec9-4b4c-a789-0bcd9cbde4bf',
  'participant4@test.hamkkebom.com',
  '{"sub":"8d9e4bc0-0ec9-4b4c-a789-0bcd9cbde4bf","email":"participant4@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:42.87942Z', '2026-02-23T14:23:42.87942Z', '2026-02-23T14:23:42.889424Z'
) ON CONFLICT DO NOTHING;

-- participant3@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '17088fc7-c078-4d6d-b573-9e0899980b92',
  'authenticated', 'authenticated',
  'participant3@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:42.62458Z',
  E'{"email_verified":true,"name":"참가자3"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:42.614799Z', '2026-02-23T14:23:42.628879Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '17088fc7-c078-4d6d-b573-9e0899980b92',
  'participant3@test.hamkkebom.com',
  '{"sub":"17088fc7-c078-4d6d-b573-9e0899980b92","email":"participant3@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:42.614799Z', '2026-02-23T14:23:42.614799Z', '2026-02-23T14:23:42.628879Z'
) ON CONFLICT DO NOTHING;

-- participant2@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '1b955c07-ada1-4b14-b17e-7cc67e568a6c',
  'authenticated', 'authenticated',
  'participant2@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:42.435972Z',
  E'{"email_verified":true,"name":"참가자2"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:42.426058Z', '2026-02-23T14:23:42.438657Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), '1b955c07-ada1-4b14-b17e-7cc67e568a6c',
  'participant2@test.hamkkebom.com',
  '{"sub":"1b955c07-ada1-4b14-b17e-7cc67e568a6c","email":"participant2@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:42.426058Z', '2026-02-23T14:23:42.426058Z', '2026-02-23T14:23:42.438657Z'
) ON CONFLICT DO NOTHING;

-- participant1@test.hamkkebom.com (이메일/비밀번호)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a62f0602-e2f2-4268-a094-d9eadaf0ccb3',
  'authenticated', 'authenticated',
  'participant1@test.hamkkebom.com',
  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',
  '2026-02-23T14:23:42.133157Z',
  E'{"email_verified":true,"name":"참가자1"}'::jsonb,
  E'{"provider":"email","providers":["email"]}'::jsonb,
  '2026-02-23T14:23:42.116609Z', '2026-02-24T04:59:44.792795Z', '', '', FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(), 'a62f0602-e2f2-4268-a094-d9eadaf0ccb3',
  'participant1@test.hamkkebom.com',
  '{"sub":"a62f0602-e2f2-4268-a094-d9eadaf0ccb3","email":"participant1@test.hamkkebom.com"}'::jsonb,
  'email',
  '2026-02-23T14:23:42.116609Z', '2026-02-23T14:23:42.116609Z', '2026-02-24T04:59:44.792795Z'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. pricing_plans 복원
-- ============================================================
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-free', E'participant', E'무료', 0, 0, TRUE, '{"work-performance"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-participant-premium', E'participant', E'참가자 프리미엄', 9900, 99000, TRUE, '{"work-performance","category-competition","ai-tool-trends","detailed-analysis"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-host-basic', E'host', E'주최자 기본', 0, 0, TRUE, '{"submission-status"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-host-premium', E'host', E'주최자 프리미엄', 29900, 299000, TRUE, '{"submission-status","participant-distribution","channel-performance","detailed-analysis"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-judge-basic', E'judge', E'심사위원 기본', 0, 0, TRUE, '{"progress"}') ON CONFLICT DO NOTHING;
INSERT INTO "pricing_plans" ("id", "role", "name", "monthly_price", "yearly_price", "active", "feature_keys") VALUES (E'plan-judge-premium', E'judge', E'심사위원 프리미엄', 0, 0, TRUE, '{"progress","score-distribution"}') ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. profiles 복원
-- ============================================================
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'a62f0602-e2f2-4268-a094-d9eadaf0ccb3', E'participant1@test.hamkkebom.com', E'참가자1', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:42.116235+00:00', E'2026-02-23T14:23:42.116235+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 1) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'1b955c07-ada1-4b14-b17e-7cc67e568a6c', E'participant2@test.hamkkebom.com', E'참가자2', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:42.425702+00:00', E'2026-02-23T14:23:42.425702+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 2) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'17088fc7-c078-4d6d-b573-9e0899980b92', E'participant3@test.hamkkebom.com', E'참가자3', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:42.614459+00:00', E'2026-02-23T14:23:42.614459+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 3) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'8d9e4bc0-0ec9-4b4c-a789-0bcd9cbde4bf', E'participant4@test.hamkkebom.com', E'참가자4', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:42.877849+00:00', E'2026-02-23T14:23:42.877849+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 4) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'0b6a6e0f-bdc0-40b1-a5b5-529df66f341f', E'participant5@test.hamkkebom.com', E'참가자5', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.043118+00:00', E'2026-02-23T14:23:43.043118+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 5) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'560e19e0-36fe-4f87-8b19-642dbd0ab7f2', E'host2@test.hamkkebom.com', E'주최자2', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.39371+00:00', E'2026-02-23T14:23:43.39371+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 6) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'd096d0b9-4522-4b31-a866-c9315abed63c', E'host3@test.hamkkebom.com', E'주최자3', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.610125+00:00', E'2026-02-23T14:23:43.610125+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 7) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'45a76d98-7016-4f60-9573-6553c2933fc8', E'host4@test.hamkkebom.com', E'주최자4', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.882195+00:00', E'2026-02-23T14:23:43.882195+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 8) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'82226932-5283-447b-897c-f0353ced9c9e', E'host5@test.hamkkebom.com', E'주최자5', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.055118+00:00', E'2026-02-23T14:23:44.055118+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 9) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'7f6dba97-5e1c-4805-a764-b60a4ea4844d', E'judge1@test.hamkkebom.com', E'심사위원1', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.225443+00:00', E'2026-02-23T14:23:44.225443+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 10) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'58d1c315-dea7-4014-b51f-d70338908336', E'judge2@test.hamkkebom.com', E'심사위원2', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.411952+00:00', E'2026-02-23T14:23:44.411952+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 11) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'55d156f8-df31-4478-8db0-42538cac51b5', E'judge3@test.hamkkebom.com', E'심사위원3', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.577404+00:00', E'2026-02-23T14:23:44.577404+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 12) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'70436f98-f12c-4818-bb6b-e9f39284cf21', E'judge4@test.hamkkebom.com', E'심사위원4', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.78338+00:00', E'2026-02-23T14:23:44.78338+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 13) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'4eaade73-4d4f-4ad2-8822-bb011d39b0bb', E'judge5@test.hamkkebom.com', E'심사위원5', NULL, '{"judge"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:44.943416+00:00', E'2026-02-23T14:23:44.943416+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 14) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'6fdcf75c-f8b4-4bd6-8358-080722880fd2', E'admin1@test.hamkkebom.com', E'관리자1', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.10622+00:00', E'2026-02-23T14:23:45.10622+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 15) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'8dd27e53-670b-4d68-baf7-f8c909b9bf4c', E'admin2@test.hamkkebom.com', E'관리자2', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.283837+00:00', E'2026-02-23T14:23:45.283837+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 16) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'b4b2dede-cfe4-4196-94d9-47975ee5e0c7', E'admin3@test.hamkkebom.com', E'관리자3', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.451647+00:00', E'2026-02-23T14:23:45.451647+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 17) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'8758b4d5-950a-46da-b48f-284bdf39aee6', E'admin4@test.hamkkebom.com', E'관리자4', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.62569+00:00', E'2026-02-23T14:23:45.62569+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 18) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'59ff8eb0-4959-4c9f-88af-660e92ed1f39', E'admin5@test.hamkkebom.com', E'관리자5', NULL, '{"admin"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:45.784947+00:00', E'2026-02-23T14:23:45.784947+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 19) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'05112cda-d7fb-4ea6-901a-013848be02a6', E'host1@test.hamkkebom.com', E'주최자1', NULL, '{"host"}', NULL, E'plan-free', NULL, E'active', E'2026-02-23T14:23:43.229502+00:00', E'2026-02-23T14:23:43.229502+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 20) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'ad0120f2-c230-4f5a-904f-d7d89dfbb551', E'ryan9505@naver.com', E'호이', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocKQQh3q-lcynT8bYuHhUTFact1q0VfLtOUIYgYCiDL0PclB3g=s96-c', E'active', E'2026-02-24T07:42:35.23536+00:00', E'2026-02-24T07:42:35.23536+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 21) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'c42ccbf9-6897-484c-8062-be27f20dc463', E'agadingo@naver.com', E'장유주', NULL, '{"participant"}', NULL, E'plan-free', NULL, E'active', E'2026-02-25T06:27:02.613562+00:00', E'2026-02-25T06:27:02.613562+00:00', E'01037273246', NULL, E'{}'::jsonb, '{}', '{}', '{}', 25) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'70b0d760-4847-48fd-9267-ef3667de9e21', E'1210yeasol@gmail.com', E'김예솔', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocKfZUePLj2-lQTVKk7o7f0O6NABoNKMaY8i2Lpf1DXV5XD1PQ=s96-c', E'active', E'2026-02-25T08:07:09.726229+00:00', E'2026-02-25T08:07:09.726229+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 27) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'b748934e-ed06-4586-be0d-b099bd16af01', E'jtm0218@gmail.com', E'정태민', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocK3gtV9t0i1pjbrovnTHeRhIDomMQjaL0rFHm5ydWqYil4ARQ=s96-c', E'active', E'2026-02-25T08:11:00.730475+00:00', E'2026-02-25T08:11:00.730475+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 28) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'f238f5ed-9ec3-4d86-95ab-bff403df64d6', E'ourearth0423@gmail.com', E'_subong수봉', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJg_Ed9OcyCEXRQV8FfhIugQhDJ8aJtZ3rIGwzPTyPKZkb2ZV7i=s96-c', E'active', E'2026-02-24T13:29:29.701236+00:00', E'2026-02-24T13:29:29.701236+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 23) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'f98779b1-dfc9-4e0e-ab22-f98cc56754ab', E'exscape86@gmail.com', E'황승률', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJttIxcO-FlAK6AdOmIRB0YVTJXRyzm30TKaMCj9wxtm5Bfgg=s96-c', E'active', E'2026-02-24T17:23:16.424631+00:00', E'2026-02-24T17:23:16.424631+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 24) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'325880fc-e274-422c-9132-55269d594fd5', E'usozukii@gmail.com', E'수월드', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJW2AXk44JtRPEPP9hAi4ktUYbJQr-hikOXq3MM6D5VSBQ28V_X=s96-c', E'active', E'2026-02-25T08:18:24.896573+00:00', E'2026-02-25T08:18:24.896573+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 29) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'f1b29f12-1d40-4331-a143-94346c5308b3', E'mentorbank.movie@gmail.com', E'bank mentor', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocI1iDMapnWadMKBdETHDmOzMDte_hPS9eIXswH-BzgEHlq66g=s96-c', E'active', E'2026-02-25T09:04:44.339315+00:00', E'2026-02-25T09:04:44.339315+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 30) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'16c4ab7f-fd0b-4c2d-91e3-c3a68408b706', E'kimeric109010@gmail.com', E'Eric Kim', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJEg52FJAP8z331e_Mgj2JjLIqAVjQbP_C-c7CaZhFDOomjZg=s96-c', E'active', E'2026-02-25T09:06:28.26834+00:00', E'2026-02-25T09:06:28.26834+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 31) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'0b416d44-6e4c-46a0-9ddf-4e5974179684', E'dokkaebimarketing1@gmail.com', E'도깨비마케팅', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocKQJc7BUH_dk-P2IDKqC4va8ibVcETZZ-VQGqGaaKnJCm1Qig=s96-c', E'active', E'2026-02-25T09:11:31.584545+00:00', E'2026-02-25T09:11:31.584545+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 32) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'c2b7c821-93d1-4c30-b9f5-3e783fed33e1', E'agadingo@gmail.com', E'momile u', E'유모마일', '{"participant"}', NULL, E'plan-free', E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/avatars/c2b7c821-93d1-4c30-b9f5-3e783fed33e1/avatar.jpg?t=1772065427852', E'active', E'2026-02-25T06:27:46.075139+00:00', E'2026-02-26T00:23:50.965+00:00', E'010-3727-3246', E'안녕하세요.', E'{"youtube":"","instagram":"","portfolio":""}'::jsonb, '{"ChatGPT","Gemini","Perplexity"}', '{"나노바나나","Midjourney"}', '{"Kling"}', 26) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'5a150959-15b2-437f-b8c9-06b3d5bc6b03', E'hamkkebom12@gmail.com', E'함께봄', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocIxcAxK6MBc7J-JKjL5ihsUREkKfvZYcIpq4puCCX1JQjaXMg=s96-c', E'active', E'2026-02-25T12:50:27.54351+00:00', E'2026-02-25T12:50:27.54351+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 33) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'1634fca4-7a2b-4cc4-b9cf-9baabb9d2738', E'rudtn466@gmail.com', E'이경수', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJQTsgi9JcQfHWhE9B2bXctCK8o-8bvY1I-L70oNPXCB5cR3HQ=s96-c', E'active', E'2026-02-25T13:10:23.814092+00:00', E'2026-02-25T13:10:23.814092+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 34) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe', E'1210yesol@gmail.com', E'YeSol Kim', E'ys', '{"participant"}', NULL, E'plan-free', E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/avatars/5d4bbf2a-a587-461d-ae17-5f2ac7c58bfe/avatar.png?t=1771937569040', E'active', E'2026-02-24T12:51:44.364268+00:00', E'2026-02-25T16:17:43.534+00:00', E'010-1234-5656', NULL, E'{"youtube":"","instagram":"","portfolio":""}'::jsonb, '{"ChatGPT","Claude","Gemini"}', '{"나노바나나","Google Whisk"}', '{"Kling"}', 22) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'4cb11c09-1ce8-4dbe-94b1-94fb99b61e6a', E'yeasol1210@gmail.com', E'Ye Sol Kim', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJsYCPiIEaWzRrjEvXneXI9DyUyryGWvkXAARHU_1t5yBbOJw=s96-c', E'active', E'2026-02-26T00:43:21.956284+00:00', E'2026-02-26T00:43:21.956284+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 35) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'6ce6e948-18b8-4b98-bfe9-ac8bf98a2d8d', E'jtm021818@gmail.com', E'ᄋᄂᄆ', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocL1tOG4wA0nRp7fIKLBj94dAWYMfTKcqoMkSu2ikowcGWncL8U=s96-c', E'active', E'2026-02-26T01:40:03.653456+00:00', E'2026-02-26T01:40:03.653456+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 36) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'9fffa621-5010-4ace-8085-e3cfd3df2d8b', E'besteunkyu9@gmail.com', E'cha cha', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocKVPCh4_NLMnBI7oNeoMe-regDeiSDs1DqRSOWUhBcMThfwmFZE=s96-c', E'active', E'2026-02-26T09:02:44.426016+00:00', E'2026-02-26T09:02:44.426016+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 37) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'b63e79c7-b2d9-4ba9-9415-fb55fc58eb81', E'stepbyjason@gmail.com', E'Jason', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocK17TxnQBsq0bkBdAIfO7fFCfDiGStNZraTtfYwxRJouDYNAA=s96-c', E'active', E'2026-02-26T10:54:26.528286+00:00', E'2026-02-26T10:54:26.528286+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 38) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'b2a4e192-5157-4484-8ebd-ba330bad6527', E'ruggy1356@gmail.com', E'동현김', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocLqfO9rSZ3tweQXJ0L1svymlPl2q7LuL24Uz9itj6qithsajAw=s96-c', E'active', E'2026-02-26T14:30:21.005744+00:00', E'2026-02-26T14:30:21.005744+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 39) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'e38dd86b-d273-41d6-aa8d-562e0b630223', E'e832612@gmail.com', E'유진', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJP70uhMMXWhk0ixYiDGqHdvBn5yzDGyCB_txcJqyUEqA6gi28-=s96-c', E'active', E'2026-02-26T14:43:48.823298+00:00', E'2026-02-26T14:43:48.823298+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 40) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'4c2aefbb-3123-467b-90a8-9acf12504303', E'wldns031411@gmail.com', E'안지운', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJoGlgjZ-PTQvs3PlYf7yr9zA3qBY8rQDXYXvA_4fAm0jUSWYjK=s96-c', E'active', E'2026-02-27T05:39:46.124466+00:00', E'2026-02-27T05:39:46.124466+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 41) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'5ddc169e-6601-45a8-b57a-d441a4b9f134', E'po8po72@gmail.com', E'허희라', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocKRerXJ_8Y3DjTZzq_hcwqw2Jysf9RNHlVp8q7UWX0j1W9Svh09=s96-c', E'active', E'2026-02-27T06:03:04.286652+00:00', E'2026-02-27T06:03:04.286652+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 42) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'61fbc463-8cdc-42e5-a5d2-3fb079f6a5c3', E'meroy8221@gmail.com', E'이지민', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocLsnKNeSXa2c-cUcoj8kBc9xurJAyi3n9Ij6xvPvYPp78pRVA=s96-c', E'active', E'2026-02-27T08:28:03.445372+00:00', E'2026-02-27T08:28:03.445372+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 43) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'4a6a5e0b-6564-4ead-a886-2e9ebbdd76fb', E'jimin20080103e@gmail.com', E'이지민', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocJlJ90Gxm0geB7j7JlaVq7Rr4MEGRsSfGOBiiPRcBzUvgsyUw=s96-c', E'active', E'2026-02-27T12:02:57.706193+00:00', E'2026-02-27T12:02:57.706193+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 44) ON CONFLICT DO NOTHING;
INSERT INTO "profiles" ("id", "email", "name", "nickname", "roles", "region", "plan_id", "avatar_url", "status", "created_at", "updated_at", "phone", "introduction", "social_links", "preferred_chat_ai", "preferred_image_ai", "preferred_video_ai", "seq_id") VALUES (E'033d6c7d-9dbc-456c-8a31-4e418556e162', E'kimyjung3414@gmail.com', E'저녀니', NULL, '{"participant"}', NULL, E'plan-free', E'https://lh3.googleusercontent.com/a/ACg8ocIc8iOJOLAK3tDAeZa6w09k0y5jhobZk87npWpx1e2hlabIM9s=s96-c', E'active', E'2026-02-28T11:44:18.576328+00:00', E'2026-02-28T11:44:18.576328+00:00', NULL, NULL, E'{}'::jsonb, '{}', '{}', '{}', 45) ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. contests 복원
-- ============================================================
INSERT INTO "contests" ("id", "title", "slug", "host_company_id", "host_user_id", "description", "region", "tags", "status", "submission_start_at", "submission_end_at", "judging_start_at", "judging_end_at", "result_announced_at", "judging_type", "review_policy", "max_submissions_per_user", "allowed_video_extensions", "prize_amount", "poster_url", "has_landing_page", "bonus_max_score", "bonus_percentage", "judge_weight_percent", "online_vote_weight_percent", "online_vote_type", "vote_likes_percent", "vote_views_percent", "judging_criteria", "created_at", "updated_at", "detail_content", "detail_image_urls", "result_format", "landing_page_url", "guidelines", "notes", "promotion_video_urls", "hero_image_url") VALUES (3, E'제1회 꿈꾸는 아리랑 AI 영상 공모전', E'제1회-꿈꾸는-아리랑-ai-영상-공모전-1771898097187', NULL, E'6fdcf75c-f8b4-4bd6-8358-080722880fd2', E'“아리랑은 한국인의 영원한 노래” - 호머 헐버트 (한국의 외국인 독립운동가)\n\n헐버트 박사의 아리랑 채보 130주년 기념!\n\n제1회 ‘꿈꾸는 아리랑’ AI 영상 공모전으로 우리 아리랑을 다시 한번 세계로 알립니다.\n\n이번 공모전은 한국의 전통 가락인 ‘아리랑’과 현대의 ‘AI 기술’, 그리고 여러분의 ‘꿈’을 하나로 연결하는 창의적인 시도를 목표로 합니다. 여러분만의 독창적인 시선으로 아리랑의 새로운 꿈을 보여주세요!', E'', '{"음악","예술","사회공헌","아리랑","AI 영상","생성형AI","롱폼","꿈꾸는아리랑","헐버트","함께봄"}', E'open', E'2026-02-25T00:00:00+00:00', E'2026-03-28T00:00:00+00:00', E'2026-03-29T00:00:00+00:00', E'2026-04-10T00:00:00+00:00', E'2026-04-11T00:00:00+00:00', E'both', E'manual', 1, '{"mp4"}', NULL, E'https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/posters/poster/6fdcf75c-f8b4-4bd6-8358-080722880fd2/1771933285019.png', TRUE, NULL, 3, 80, 17, E'likes', NULL, NULL, E'[{"label":"기술력","maxScore":30,"description":"AI 활용 수준"},{"label":"스토리","maxScore":30,"description":"전달력"},{"label":"완성도","maxScore":40,"description":"연출 및 편집"}]'::jsonb, E'2026-02-24T01:54:57.356445+00:00', E'2026-02-24T01:54:57.356445+00:00', E'1. 공모 개요\n- 주제: 자신의 꿈을 담은 나만의 아리랑\n- 콘텐츠 형태: 가로 영상\n- 분량: 30초~90초\n- 파일 형식: MP4\n\n· 제작 방식\n- 100% AI 영상 생성 도구를 활용한 콘텐츠\n- 참가자 본인 사진을 활용한 AI 영상은 사용 가능\n- 전통 민요 아리랑 가사를 일부 활용한 뮤직비디오 형식\n- “아리랑” 단어 필수 포함\n\n※ 아리랑은 전통 민요로 자유 활용 가능하나, 특정 편곡·음원·녹음본을 사용할 경우 해당 저작권 문제에 대한 책임은 참가자에게 있습니다.\n※ 타인의 저작물 무단 사용 시 실격 처리될 수 있습니다.\n\n---\n\n2. 상세 일정\n- 접수 기간: 2026년 2월 25일 ~ 3월 28일 23:59\n- 수상작 발표 및 온라인 시상식: 2026년 4월 11일\n\n※ 일정은 주최 측 사정에 따라 변경될 수 있습니다.\n\n---\n\n3. 참여 방법\n① 공식 홈페이지 가입\n② 공모전 접수 메뉴를 통해 영상 및 신청서 제출\n\n※ 1인 1작품 제출\n※ 중복 수상 불가\n\n---\n\n4. 시상 내역 (총 상금 1,300만 원)\n- 1등 “아리랑상” (1명): 300만 원\n- 2등 “메아리상” (2명): 각 150만 원\n- 3등 “울림상” (10명): 각 40만 원\n- 4등 “꿈꿈상” (30명): 각 10만 원\n※ 심사 결과에 따라 적격자가 없을 경우, 당선작을 선정하지 않을 수 있습니다.\n\n· 상금 지급 안내\n- 상금은 관련 세법에 따라 제세공과금(8.8%) 공제 후 지급됩니다.\n- 상금 지급을 위해 수상자는 세무 처리를 위한 개인정보를 제출해야 합니다.\n\n---\n\n5. 심사 기준 및 가산점\n- 심사위원 평가 77%\n- 온라인 투표 20%\n- 가산점 3%\n\n· 온라인 투표 관련 안내\n- 좋아요 수 등 대중평가 점수가 반영됩니다.\n- 비정상적 트래픽·매크로·부정 행위 적발 시 점수 제외 또는 실격 처리될 수 있습니다.\n- 투표 운영 기준은 주최 측 정책에 따릅니다.\n\n· 가산점 항목 (항목당 1점 / 최대 3점)\n- 필수 해시태그:\n#아리랑 #광화문 #꿈꾸는아리랑 #헐버트 #아리랑챌린지 #함께봄 #AI공모전\n발표일까지 게시물 공개 유지 필수\n① 공모전 공식 포스터 SNS 업로드 후 공유 인증\n② 헐버트박사 기념사업회 링크 SNS 업로드 후 공유 인증\n③ 헐버트 아리랑 전시회 참여 인증샷 SNS 업로드 후 공유 인증\n\n※ 전시 참여는 선택 사항이며, 가산점 항목 중 하나입니다.\n※ 발표일까지 게시물이 유지되어야 가산점이 인정됩니다.\n\n---\n\n6. 작품 활용 및 게시\n- 제출된 작품은 행사 홍보·연출·SNS 게시 등 공모전 운영 목적에 활용될 수 있습니다.\n- 제출 작품은 공모전 페이지에 게시되며, 대중평가 점수가 심사에 반영됩니다.\n- 저작권은 창작자에게 귀속됩니다.\n\n---\n\n7. 유의사항\n- 제출 작품은 반드시 AI 활용 창작물이어야 합니다.\n- 저작권·초상권 문제 발생 시 실격 처리될 수 있으며, 모든 책임은 참가자에게 있습니다.\n- 허위 사실 기재 시 수상이 취소될 수 있습니다.\n- 공모 요강은 주최 측 사정에 따라 변경될 수 있습니다.', '{"https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/contest-assets/detail-image/6fdcf75c-f8b4-4bd6-8358-080722880fd2/1771933330214.png"}', E'website', E'https://ai-video-contest.vercel.app/contests/3/landing', E'1. 공모 개요\n- 주제: 자신의 꿈을 담은 나만의 아리랑\n- 콘텐츠 형태: 가로 영상\n- 분량: 30초~90초\n- 파일 형식: MP4\n\n· 제작 방식\n- 100% AI 영상 생성 도구를 활용한 콘텐츠\n- 참가자 본인 사진을 활용한 AI 영상은 사용 가능\n- 전통 민요 아리랑 가사를 일부 활용한 뮤직비디오 형식\n- “아리랑” 단어 필수 포함\n\n※ 아리랑은 전통 민요로 자유 활용 가능하나, 특정 편곡·음원·녹음본을 사용할 경우 해당 저작권 문제에 대한 책임은 참가자에게 있습니다.\n※ 타인의 저작물 무단 사용 시 실격 처리될 수 있습니다.\n\n---\n\n2. 참여 방법\n① 공식 홈페이지 가입\n② 공모전 접수 메뉴를 통해 영상 및 신청서 제출\n\n※ 1인 1작품 제출\n※ 중복 수상 불가', E'1. 출품 요건\n- 본 공모전의 출품작은 반드시 AI툴을 활용하여 제작된 창작물이어야 합니다.\n- 사용한 AI툴은 신청서에 반드시 기재해 주세요.\n- AI 활용 사실이 확인되지 않거나 허위로 기재한 경우 심사 제외 또는 실격 처리될 수 있습니다.\n- 직접 촬영 영상만으로 구성된 콘텐츠는 인정되지 않습니다.\n- 참가자 본인의 사진을 활용한 AI 생성은 가능합니다.\n\n---\n\n2. 저작권 안내\n- 출품작의 저작권은 원칙적으로 출품자에게 귀속됩니다.\n- 단, 아래 ‘출품작 활용’ 및 ‘수상작 권리’ 항목에 명시된 범위에 대해서는 이용권이 부여됩니다.\n\n---\n\n3. 출품작의 게시 및 홍보 활용\n- 응모자는 공모전 운영, 심사, 홍보, 전시회 개최 및 공익적 행사 진행을 위해 회사가 출품작을 무상으로 활용하는 것에 동의합니다.\n- 활용 범위에는 전시, 상영, 복제, 공중송신, 온라인 게시, 홍보물 제작 등이 포함됩니다.\n- 제출된 작품은 함께봄 공모전 페이지 및 관련 온라인 채널에 게시될 수 있습니다.\n- 수상 발표 이전에도 공모전 기간 중 전시회 및 행사에서 공개 상영 또는 전시될 수 있습니다.\n- 전시회는 무료로 운영되며, 출품작 자체를 독립적인 판매 대상으로 활용하지 않습니다.\n- 다만, 전시 공간 내 굿즈 판매 또는 공익적 모금 활동과 병행될 수 있습니다.\n- 수상 발표 전에는 출품작을 별도의 독립적인 상업 판매 또는 영리사업의 주된 콘텐츠로 활용하지 않습니다.\n\n---\n\n4. 수상작의 권리 및 상업적 활용\n- 수상자는 상금 수령과 동시에 회사에 해당 수상작에 대한 전 세계적, 독점적, 기간 제한 없는 이용권 및 2차적 저작물 작성권을 부여하는 것에 동의합니다.\n- 회사는 수상작을 수정·편집·재가공하여 광고, 홍보, 상품 제작, 온라인·오프라인 매체 게시 등 상업적 목적으로 활용할 수 있습니다.\n- 필요 시 제3자(광고대행사, 제작사, 유통사 등)에게 권리를 재허락할 수 있습니다.\n- 상금은 위 이용권 부여에 대한 정당한 대가로 지급됩니다.\n- 수상자는 동일 작품을 제3자에게 독점적으로 이용 허락할 수 없습니다.\n- 단, 수상자는 본인의 포트폴리오 및 개인 홍보 목적에 한하여 작품을 사용할 수 있습니다.\n※ 심사 결과에 따라 적격자가 없을 경우, 당선작을 선정하지 않을 수 있습니다.\n---\n\n5. 심사 및 대중평가\n- 출품작은 공모전 페이지에 게시되며 ‘좋아요’ 수 등 대중 평가 요소가 심사에 일부 반영될 수 있습니다.\n- 대중 평가 반영 비율 및 최종 수상작 선정은 회사의 심사 기준에 따릅니다.\n- 비정상적 트래픽, 매크로, 자동화 프로그램, 조직적 투표 등 부정행위가 확인될 경우 해당 점수는 제외되거나 실격 처리될 수 있습니다.\n\n---\n\n6. AI 제작물 관련 책임\n- 응모자는 AI툴의 이용약관을 위반하지 않았으며, 상업적 이용에 법적 제한이 없음을 보증합니다.\n- AI 생성물의 저작권, 라이선스, 학습 데이터와 관련된 분쟁 발생 시 모든 책임은 출품자에게 있습니다.\n- 회사는 AI툴 약관 위반으로 인한 분쟁에 대해 책임을 부담하지 않습니다.\n\n---\n\n7. 제3자 권리 침해 금지\n- 출품작은 제3자의 저작권, 초상권, 상표권, 디자인권, 음원·폰트 라이선스 등을 침해하지 않는 창작물이어야 합니다.\n- 관련 분쟁 발생 시 모든 민·형사상 책임은 출품자에게 있습니다.\n\n---\n\n8. 참여 제한\n- 1인당 1작품만 응모 가능합니다.\n- 팀 단위 참여는 불가합니다.\n- 공동 제작 사실이 확인될 경우 수상이 취소될 수 있습니다.\n\n---\n\n9. 실격 및 수상 취소\n다음에 해당할 경우 실격 또는 수상 취소 처리됩니다.\n- 표절, 도용 등 권리 침해\n- 허위 정보 기재\n- AI툴 라이선스 위반\n- 사회적 물의를 일으킬 수 있는 내용\n- 법령 위반 또는 공모전 취지에 부합하지 않는 경우\n- 중복 또는 팀 참여 사실이 확인된 경우\n수상 이후라도 위 사유가 확인될 경우 상금 반환이 요구될 수 있으며, 회사는 필요한 법적 조치를 취할 수 있습니다.\n\n---\n\n10. 개인정보 수집·이용 안내\n- 수집 항목: 이름, 연락처, 이메일, (기업 참가 시) 사업자등록증 사본, (수상 시) 계좌 정보 및 주민등록번호\n- 이용 목적: 참가자 확인, 심사 진행, 결과 안내, 상금 지급 및 세무 처리\n- 보유 기간: 공모전 종료 후 3년간 보관 후 파기\n- 수상자의 경우 세무 관련 법령에 따라 보관 기간이 달라질 수 있습니다.\n- 개인정보 수집·이용에 동의하지 않을 경우 참여가 제한될 수 있습니다.\n\n---\n\n11. 상금 지급 및 세금\n- 상금은 「소득세법」에 따른 기타소득으로 분류됩니다.\n- 관련 세법에 따라 제세공과금(8.8%)이 원천징수된 후 지급됩니다.\n- 제세공과금은 수상자 본인 부담입니다.\n- 상금 지급을 위해 세무 처리에 필요한 정보 제출이 요구될 수 있으며, 미제출 시 지급이 제한될 수 있습니다.', '{"https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/contest-assets/promo-video/6fdcf75c-f8b4-4bd6-8358-080722880fd2/1771932847773.mp4","https://oyssfmocdihzqdsvysdi.supabase.co/storage/v1/object/public/contest-assets/promo-video/6fdcf75c-f8b4-4bd6-8358-080722880fd2/1771932856991.mp4"}', NULL) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('"contests"', 'id'), COALESCE((SELECT MAX(id) FROM "contests"), 0) + 1, false);

-- ============================================================
-- 5. contest_award_tiers 복원
-- ============================================================
INSERT INTO "contest_award_tiers" ("id", "contest_id", "label", "count", "prize_amount", "sort_order") VALUES (39, 3, E'아리랑상', 1, E'3000000', 1) ON CONFLICT DO NOTHING;
INSERT INTO "contest_award_tiers" ("id", "contest_id", "label", "count", "prize_amount", "sort_order") VALUES (40, 3, E'메아리상', 2, E'1500000', 2) ON CONFLICT DO NOTHING;
INSERT INTO "contest_award_tiers" ("id", "contest_id", "label", "count", "prize_amount", "sort_order") VALUES (41, 3, E'울림상', 10, E'400000', 3) ON CONFLICT DO NOTHING;
INSERT INTO "contest_award_tiers" ("id", "contest_id", "label", "count", "prize_amount", "sort_order") VALUES (42, 3, E'꿈꿈상', 30, E'100000', 4) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('"contest_award_tiers"', 'id'), COALESCE((SELECT MAX(id) FROM "contest_award_tiers"), 0) + 1, false);

-- ============================================================
-- 6. contest_bonus_configs 복원
-- ============================================================
INSERT INTO "contest_bonus_configs" ("id", "contest_id", "label", "description", "score", "requires_url", "requires_image", "sort_order") VALUES (29, 3, E'공모전 공식포스터 SNS 업로드 후 인증', NULL, 1, TRUE, TRUE, 1) ON CONFLICT DO NOTHING;
INSERT INTO "contest_bonus_configs" ("id", "contest_id", "label", "description", "score", "requires_url", "requires_image", "sort_order") VALUES (30, 3, E'헐버트박사 기념사업회 링크 SNS 업로드 후 인증', NULL, 1, TRUE, TRUE, 2) ON CONFLICT DO NOTHING;
INSERT INTO "contest_bonus_configs" ("id", "contest_id", "label", "description", "score", "requires_url", "requires_image", "sort_order") VALUES (31, 3, E'헐버트 아리랑 전시회 참여 인증샷 SNS 업로드 후 인증', NULL, 1, TRUE, TRUE, 3) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('"contest_bonus_configs"', 'id'), COALESCE((SELECT MAX(id) FROM "contest_bonus_configs"), 0) + 1, false);

SELECT setval(pg_get_serial_sequence('profiles', 'seq_id'), COALESCE((SELECT MAX(seq_id) FROM profiles), 0) + 1, false);

-- 프로필 자동 생성 트리거 복원
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();