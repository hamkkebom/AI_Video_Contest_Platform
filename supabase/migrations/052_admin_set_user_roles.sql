-- ============================================================
-- 052: 관리자 회원 역할 부여 RPC
--
-- 배경: 멀티테넌트에서 주최자는 심사위원을 지정해야 하고, 운영자는 host 역할을
--       부여해야 한다. 그런데 profiles 는 "본인만 수정" 정책뿐이라 관리자가
--       남의 역할을 바꿀 수 없다. 050 은 status 만 여는 좁은 RPC 였다.
--
-- 위험: roles 는 권한 자체다. 테이블에 관리자 UPDATE 를 열거나 RPC 가 임의 배열을
--       그대로 받으면, 관리자 세션이 탈취될 때 영구 관리자 계정이 생겨 복구가 어렵다.
--
-- 결정: 다음 세 가지를 함수 안에 못박는다.
--       ① admin 역할은 이 경로로 부여·회수할 수 없다 — 관리자 승격은 DB 직접 작업으로 남긴다.
--          UI 클릭 한 번으로 영구 권한이 생기는 경로를 만들지 않는다.
--       ② 본인의 역할은 바꿀 수 없다 — 자기 발등을 찍는 사고와 자기 승격을 동시에 막는다.
--       ③ 허용 역할 화이트리스트 밖의 값은 거부한다.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_set_user_roles(
  target_user_id UUID,
  new_roles TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  allowed TEXT[] := ARRAY['participant', 'host', 'judge'];
  target_is_admin BOOLEAN;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'CANNOT_EDIT_SELF';
  END IF;

  IF new_roles IS NULL OR array_length(new_roles, 1) IS NULL THEN
    RAISE EXCEPTION 'ROLES_REQUIRED';
  END IF;

  -- 화이트리스트 밖 역할(admin 포함)은 거부
  IF EXISTS (SELECT 1 FROM unnest(new_roles) r WHERE r <> ALL(allowed)) THEN
    RAISE EXCEPTION 'ROLE_NOT_ALLOWED';
  END IF;

  -- 이미 관리자인 계정은 이 경로로 건드리지 않는다 (admin 회수 방지)
  SELECT 'admin' = ANY(roles) INTO target_is_admin FROM profiles WHERE id = target_user_id;
  IF target_is_admin IS NULL THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;
  IF target_is_admin THEN
    RAISE EXCEPTION 'CANNOT_EDIT_ADMIN';
  END IF;

  UPDATE profiles
  SET roles = new_roles, updated_at = NOW()
  WHERE id = target_user_id;
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_set_user_roles(UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_roles(UUID, TEXT[]) TO authenticated;

COMMENT ON FUNCTION public.admin_set_user_roles IS
  '관리자 전용 회원 역할 변경. participant/host/judge 만 허용하며 admin 은 부여·회수 불가(승격은 DB 직접 작업). 본인·기존 관리자 계정은 대상이 될 수 없다.';
