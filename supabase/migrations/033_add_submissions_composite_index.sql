-- 033: submissions 복합 인덱스 추가
-- 기존: contest_id, user_id 각각 단독 인덱스만 존재
-- 쿼터 체크 쿼리(WHERE contest_id = ? AND user_id = ?)에 복합 인덱스 없어 성능 저하
-- maxSubmissionsPerUser > 1 공모전이 있을 수 있으므로 UNIQUE 제약 대신 인덱스만 추가

CREATE INDEX IF NOT EXISTS idx_submissions_contest_user
ON submissions (contest_id, user_id);
