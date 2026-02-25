-- ============================================================
-- 🔍 영상 제출 문제 진단 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- 각 쿼리를 하나씩 선택해서 실행하면 됩니다
-- ============================================================


-- ============================================================
-- 1️⃣ 전체 유저 목록 + 프로필 존재 여부 + 제출 수 한눈에 보기
-- → 프로필이 없는 유저가 있으면 트리거 문제!
-- ============================================================
SELECT 
  au.id AS user_id,
  au.email,
  au.created_at AS 가입일,
  au.last_sign_in_at AS 마지막로그인,
  CASE WHEN p.id IS NOT NULL THEN '✅ 있음' ELSE '❌ 없음' END AS 프로필,
  p.name AS 이름,
  COALESCE(sub_count.cnt, 0) AS 제출수
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS cnt 
  FROM submissions 
  GROUP BY user_id
) sub_count ON sub_count.user_id = au.id
ORDER BY au.created_at DESC;


-- ============================================================
-- 2️⃣ 프로필이 없는 유저 찾기 (트리거 실패 케이스)
-- → 결과가 있으면 handle_new_user 트리거가 실패한 유저!
-- ============================================================
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' AS google_name,
  au.raw_user_meta_data->>'avatar_url' AS google_avatar,
  au.created_at AS 가입일,
  au.last_sign_in_at AS 마지막로그인
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;


-- ============================================================
-- 3️⃣ 공모전별 제출 현황 (공모전 설정 + 현재 제출 수)
-- ============================================================
SELECT 
  c.id AS contest_id,
  c.title AS 공모전명,
  c.status AS 상태,
  c.max_submissions_per_user AS 최대제출수,
  c.submission_start_at AS 접수시작,
  c.submission_end_at AS 접수마감,
  COUNT(s.id) AS 총제출수,
  COUNT(DISTINCT s.user_id) AS 참여자수
FROM contests c
LEFT JOIN submissions s ON s.contest_id = c.id
GROUP BY c.id, c.title, c.status, c.max_submissions_per_user, 
         c.submission_start_at, c.submission_end_at
ORDER BY c.id;


-- ============================================================
-- 4️⃣ 유저별 제출 상세 (누가 언제 제출했는지)
-- ============================================================
SELECT 
  s.id AS submission_id,
  s.contest_id,
  s.user_id,
  p.name AS 이름,
  p.email AS 이메일,
  s.title AS 작품제목,
  s.status AS 상태,
  s.submitted_at AS 제출시각,
  s.video_url,
  s.thumbnail_url,
  s.ai_tools AS 사용AI도구
FROM submissions s
LEFT JOIN profiles p ON p.id = s.user_id
ORDER BY s.submitted_at DESC;


-- ============================================================
-- 5️⃣ 최대 출품 수 초과로 제출 불가능한 유저 찾기
-- → 이미 최대치를 제출한 유저 목록
-- ============================================================
SELECT 
  s.user_id,
  p.name AS 이름,
  p.email AS 이메일,
  s.contest_id,
  c.title AS 공모전명,
  c.max_submissions_per_user AS 최대허용,
  COUNT(s.id) AS 현재제출수,
  CASE 
    WHEN COUNT(s.id) >= c.max_submissions_per_user THEN '🚫 제출불가 (초과)'
    ELSE '✅ 제출가능'
  END AS 제출가능여부
FROM submissions s
JOIN contests c ON c.id = s.contest_id
LEFT JOIN profiles p ON p.id = s.user_id
GROUP BY s.user_id, p.name, p.email, s.contest_id, c.title, c.max_submissions_per_user
ORDER BY 제출가능여부 DESC, s.contest_id;


-- ============================================================
-- 6️⃣ 가입했지만 한 번도 제출하지 않은 유저 목록
-- → 제출 시도했으나 실패했을 가능성
-- ============================================================
SELECT 
  au.id AS user_id,
  au.email,
  p.name AS 이름,
  au.created_at AS 가입일,
  au.last_sign_in_at AS 마지막로그인,
  CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌ 프로필없음' END AS 프로필상태
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN submissions s ON s.user_id = au.id
WHERE s.id IS NULL
ORDER BY au.last_sign_in_at DESC;


-- ============================================================
-- 7️⃣ 활동 로그에서 제출 시도 확인
-- → create_submission 또는 upload_video 액션 로그
-- ============================================================
SELECT 
  al.id,
  al.user_id,
  p.name AS 이름,
  p.email AS 이메일,
  al.action AS 액션,
  al.target_type,
  al.target_id,
  al.metadata,
  al.created_at AS 시각
FROM activity_logs al
LEFT JOIN profiles p ON p.id = al.user_id
WHERE al.action IN ('create_submission', 'upload_video')
ORDER BY al.created_at DESC
LIMIT 50;


-- ============================================================
-- 8️⃣ 특정 이메일로 유저 상태 상세 조회
-- → 문제가 되는 유저의 이메일을 넣어서 확인
-- ============================================================
-- 아래 'problem@email.com' 을 해당 유저 이메일로 바꿔서 실행하세요
/*
SELECT 
  au.id AS user_id,
  au.email,
  au.email_confirmed_at,
  au.last_sign_in_at,
  au.created_at,
  au.raw_user_meta_data,
  p.name AS profile_name,
  p.avatar_url,
  (SELECT COUNT(*) FROM submissions WHERE user_id = au.id) AS 총제출수
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'problem@email.com';
*/


-- ============================================================
-- 9️⃣ 프로필 없는 유저 자동 복구 (필요시 실행)
-- → 2️⃣에서 프로필 없는 유저가 발견되면 이걸로 수동 생성
-- ============================================================
/*
INSERT INTO profiles (id, email, name, avatar_url)
SELECT 
  au.id,
  COALESCE(au.email, ''),
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1),
    '사용자'
  ),
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  )
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/
