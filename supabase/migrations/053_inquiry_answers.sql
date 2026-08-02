-- ============================================================
-- 053: 문의 답변을 플랫폼 안에서 주고받는다
--
-- 배경: 비회원 문의 접수는 D-011 로 동작하고 관리자가 상태도 바꿀 수 있게 됐지만
--       (2026-08-02), **답변 내용을 담을 컬럼이 없다.** 그래서 답변은 전화·카톡 등
--       플랫폼 밖으로 나가고, 문의자는 자기 문의가 어떻게 처리됐는지 볼 수 없다.
--
--       이메일 발송을 붙이는 대신 내부 문의창으로 해결한다 — 회원 문의와 주최자
--       승인 통지는 이것으로 충분하다. 계정이 없는 비회원 문의만 여전히 밖으로
--       나가야 하며, 그건 이메일 도입 전까지 남는 구멍이다.
--
-- 조회 권한: 046 이 만든 "inquiries: 본인만 조회"(auth.uid() = user_id)를 그대로 쓴다.
--            회원은 자기 문의와 답변을 읽을 수 있고, 관리자는 "관리자 조회"로 전부 본다.
-- 쓰기 권한: "inquiries: 관리자 처리"(UPDATE) 가 이미 있으므로 새 정책은 필요 없다.
-- ============================================================

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS answer TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS answered_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN inquiries.answer IS '관리자 답변 본문. 회원은 /my/inquiries 에서 읽는다.';
COMMENT ON COLUMN inquiries.answered_at IS '답변이 처음 등록된 시각. 수정해도 갱신하지 않는다.';
COMMENT ON COLUMN inquiries.answered_by IS '답변한 관리자. 계정이 지워져도 답변은 남긴다.';

/* 회원이 자기 문의 목록을 볼 때 최신순으로 읽는다 */
CREATE INDEX IF NOT EXISTS idx_inquiries_user_created
  ON inquiries (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
