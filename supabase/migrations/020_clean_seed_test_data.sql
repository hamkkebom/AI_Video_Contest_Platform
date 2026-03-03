-- ============================================================
-- 020: 새 프로덕션용 시드/테스트 데이터 정리
-- 011_seed_production_data.sql로 들어간 이전 프로덕션 데이터 제거
-- 스키마는 유지하고 데이터만 삭제
-- ============================================================

-- 1. 종속 데이터 먼저 삭제 (FK 순서)
DELETE FROM bonus_entries;
DELETE FROM submissions;
DELETE FROM contest_award_tiers;
DELETE FROM contest_bonus_configs;
DELETE FROM contests;

-- 2. 로그/방문 데이터 삭제
DELETE FROM activity_logs;
DELETE FROM ip_logs;
DELETE FROM utm_visits;

-- 3. 테스트 프로필 삭제 (@test.hamkkebom.com)
DELETE FROM profiles WHERE email LIKE '%@test.hamkkebom.com';

-- 4. 이전 프로덕션 실제 유저 프로필 삭제 (새 프로덕션에서 재가입 필요)
DELETE FROM profiles;

-- 5. auth 테이블 정리 (이전 프로덕션 유저 — 새 프로덕션에서 로그인 불가)
DELETE FROM auth.identities;
DELETE FROM auth.users;

-- 6. 시퀀스 리셋
SELECT setval(pg_get_serial_sequence('profiles', 'seq_id'), 1, false);
SELECT setval(pg_get_serial_sequence('contests', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('submissions', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('contest_award_tiers', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('contest_bonus_configs', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('bonus_entries', 'id'), 1, false);
