-- storage.objects UPDATE 정책 추가
-- 기존: SELECT(누구나), INSERT(인증 사용자), DELETE(본인 폴더) — UPDATE 정책 누락
-- upsert(x-upsert: true) 사용 시 INSERT + UPDATE 정책 모두 필요

DROP POLICY IF EXISTS "storage: 인증 사용자 파일 수정" ON storage.objects;
CREATE POLICY "storage: 인증 사용자 파일 수정" ON storage.objects
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
