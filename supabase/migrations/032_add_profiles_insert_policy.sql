-- 032: profiles INSERT RLS 정책 추가
-- 기존: SELECT(누구나), UPDATE(본인만) — INSERT 정책 누락
-- handle_new_user 트리거(SECURITY DEFINER)가 프로필을 생성하지만
-- 트리거 실패 시 fallback 코드(auth-context, submissions API)가
-- RLS에 막혀 프로필 생성 불가 → 신규 사용자 제출 실패

CREATE POLICY "profiles: 본인 생성" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);
