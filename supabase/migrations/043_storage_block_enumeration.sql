-- ============================================================
-- 043: Storage 익명 열거(enumeration) 차단 — 1단계
--
-- 문제: storage.objects 의 SELECT 정책이 `USING (true)` 여서
--       익명 키로 POST /storage/v1/object/list/proof-images 를 호출하면
--       가산점 증빙 이미지(참가자 SNS 인증 스크린샷) 574건의 경로를
--       전부 열거할 수 있었다. 042 로 bonus_entries 조회는 막았지만
--       이 경로로는 여전히 파일 목록을 훑을 수 있다.
--
-- 이 마이그레이션(1단계): 익명 열거를 차단한다.
--   공개 버킷(썸네일·포스터·아바타 등)은 그대로 열어두므로
--   기존 이미지 표시는 전혀 영향받지 않는다.
--   proof-images 버킷은 아직 public=true 이므로 URL 을 이미 아는 사람은
--   파일을 열 수 있다. 다만 042 로 DB 노출이 막혔고 경로에 UUID 가 들어가
--   추측이 불가능하므로 실질적 발견 경로는 사라진다.
--
-- 2단계(044): proof-images 를 비공개 버킷으로 전환.
--   서명 URL 을 쓰는 코드가 먼저 배포된 뒤에 적용해야 한다.
-- ============================================================

-- 기존의 전체 허용 정책 제거
DROP POLICY IF EXISTS "storage: 누구나 조회" ON storage.objects;

-- 공개 버킷 — 익명 조회·열거 허용 (기존 동작 유지)
DROP POLICY IF EXISTS "storage: 공개 버킷 조회" ON storage.objects;
CREATE POLICY "storage: 공개 버킷 조회" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('thumbnails', 'posters', 'avatars', 'company-assets', 'contest-assets')
);

-- 증빙 이미지 — 업로더 본인만
-- 경로 규칙: proof-images/{contestId}/{userId}/{uuid}.{ext}
--   → foldername(name)[1] = contestId, [2] = userId
DROP POLICY IF EXISTS "storage: 증빙 이미지 본인 조회" ON storage.objects;
CREATE POLICY "storage: 증빙 이미지 본인 조회" ON storage.objects
FOR SELECT USING (
  bucket_id = 'proof-images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 증빙 이미지 — 관리자·주최자 (검수용)
DROP POLICY IF EXISTS "storage: 증빙 이미지 관리자 조회" ON storage.objects;
CREATE POLICY "storage: 증빙 이미지 관리자 조회" ON storage.objects
FOR SELECT USING (
  bucket_id = 'proof-images'
  AND public.is_admin_or_host()
);
