-- 041: submissions.is_public 컬럼 추가
-- 관리자가 공모전 갤러리에 출품작을 공개/비공개 처리할 수 있도록 함
-- 기존 행은 모두 공개(TRUE)로 기본 설정 (기존 동작 유지)
-- 갤러리 노출 조건: status='approved' AND is_public=TRUE

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;

-- 갤러리 조회 가속을 위한 부분 인덱스 (approved + is_public 조합)
CREATE INDEX IF NOT EXISTS idx_submissions_public_approved
  ON submissions(contest_id, submitted_at DESC)
  WHERE status = 'approved' AND is_public = TRUE;

COMMENT ON COLUMN submissions.is_public IS
  '관리자가 갤러리 노출 여부 토글. FALSE면 status=approved여도 갤러리에서 숨김.';
