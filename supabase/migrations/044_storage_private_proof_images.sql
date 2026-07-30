-- ============================================================
-- 044: proof-images 버킷 비공개 전환 — 2단계
--
-- ⚠️ 적용 순서: 서명 URL 을 사용하는 코드가 **먼저 배포된 뒤**에 실행한다.
--    (lib/supabase/proof-image.ts 의 signProofImageUrl 을 쓰는 커밋)
--    순서를 어기면 관리자 검수 화면에서 증빙 이미지가 깨진다.
--
-- 043 은 익명 열거(list)를 막았지만 버킷이 public=true 인 동안에는
-- URL 을 아는 사람이 파일을 그대로 열 수 있다.
-- 이 마이그레이션은 버킷 자체를 비공개로 돌려 공개 URL 경로
-- (/storage/v1/object/public/proof-images/...) 를 무효화한다.
-- 이후 접근은 043 에서 만든 RLS 정책 + 서명 URL 로만 가능하다.
-- ============================================================

UPDATE storage.buckets
SET public = false
WHERE id = 'proof-images';

-- 확인용
-- SELECT id, public FROM storage.buckets ORDER BY id;
--   proof-images 만 public=false 여야 정상
