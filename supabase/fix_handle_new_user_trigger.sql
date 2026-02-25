-- ============================================================
-- handle_new_user() 트리거 수정
-- Supabase Dashboard > SQL Editor에서 실행하세요
--
-- 문제: Google OAuth 로그인 시 "Database error saving new user" 에러
-- 원인: profiles 테이블에 INSERT 시 NOT NULL 제약 위반 또는
--       이미 존재하는 PK로 인한 중복 에러
-- ============================================================

-- 1단계: 기존 트리거 확인 (결과를 먼저 확인하세요)
-- SELECT tgname, tgrelid::regclass, tgenabled
-- FROM pg_trigger
-- WHERE tgrelid = 'auth.users'::regclass;

-- 2단계: profiles 테이블 현재 컬럼 확인
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- ============================================================
-- 3단계: handle_new_user() 함수 재생성 (안전한 버전)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      CASE
        WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1)
        ELSE '사용자'
      END
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 트리거 에러가 사용자 생성을 막지 않도록 로그만 남기고 계속 진행
    RAISE WARNING 'handle_new_user() 에러: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4단계: 트리거 재생성 (혹시 없으면 만들기)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 완료! 이제 Google 로그인을 다시 시도해보세요.
-- ============================================================
