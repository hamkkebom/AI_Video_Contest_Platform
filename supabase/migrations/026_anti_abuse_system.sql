-- 026: 좋아요/조회수 부정사용 방지 시스템
-- 신규 테이블 4개 + RPC 함수 2개 + RLS 정책 + 인덱스
-- 설계 원칙: Vercel 서버리스 환경에서 DB가 단일 진실(Single Source of Truth)
--            레이트리밋, 중복제거, 카운터 갱신, 어뷰징 플래그를 모두 DB 레벨에서 원자적 처리

-- ============================================================
-- 1) submission_views — 조회수 중복 제거 (버킷 기반)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.submission_views (
  id BIGSERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  bucket_start TIMESTAMPTZ NOT NULL,  -- 6시간 버킷 시작 시각
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- viewer_key: 로그인 시 user_id, 비로그인 시 ip_hash
-- 같은 viewer가 같은 버킷 내에서 중복 조회 방지
CREATE UNIQUE INDEX IF NOT EXISTS submission_views_uniq
  ON public.submission_views (submission_id, COALESCE(user_id::text, ip_hash), bucket_start);

CREATE INDEX IF NOT EXISTS idx_submission_views_submission_time
  ON public.submission_views (submission_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submission_views_ip_time
  ON public.submission_views (ip_hash, created_at DESC);

-- ============================================================
-- 2) api_rate_limits — DB 기반 전역 레이트리밋
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key TEXT NOT NULL,               -- user_id 또는 ip_hash
  action TEXT NOT NULL,            -- 'like_toggle', 'view'
  bucket_start TIMESTAMPTZ NOT NULL,
  count INT NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key, action, bucket_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup
  ON public.api_rate_limits (bucket_start);

-- ============================================================
-- 3) like_events — 좋아요 감사 로그 (다계정/스파이크 탐지)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.like_events (
  id BIGSERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'unlike')),
  ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_like_events_submission_time
  ON public.like_events (submission_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_like_events_ip_time
  ON public.like_events (ip_hash, created_at DESC);

-- ============================================================
-- 4) abuse_flags — 부정사용 플래그 (관리자 확인용)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.abuse_flags (
  id BIGSERIAL PRIMARY KEY,
  flag_type TEXT NOT NULL,          -- 'multi_account', 'spike_like', 'spike_view', 'bot_suspect', 'anomaly_likes', 'anomaly_views'
  severity SMALLINT NOT NULL DEFAULT 1,   -- 1=낮음, 2=보통, 3=높음
  submission_id INT REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_abuse_flags_open
  ON public.abuse_flags (resolved_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_abuse_flags_submission
  ON public.abuse_flags (submission_id, created_at DESC);

-- ============================================================
-- 5) RLS 정책
-- ============================================================
ALTER TABLE public.submission_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.like_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_flags ENABLE ROW LEVEL SECURITY;

-- submission_views: 서비스 키(RPC SECURITY DEFINER)로만 쓰기, 관리자만 읽기
CREATE POLICY "submission_views: 관리자만 조회" ON public.submission_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roles::text LIKE '%admin%')
  );

-- api_rate_limits: RPC SECURITY DEFINER로만 접근
-- (사용자 직접 접근 불가)

-- like_events: 관리자만 조회
CREATE POLICY "like_events: 관리자만 조회" ON public.like_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roles::text LIKE '%admin%')
  );

-- abuse_flags: 관리자만 조회/수정
CREATE POLICY "abuse_flags: 관리자만 조회" ON public.abuse_flags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roles::text LIKE '%admin%')
  );
CREATE POLICY "abuse_flags: 관리자만 수정" ON public.abuse_flags
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roles::text LIKE '%admin%')
  );

-- ============================================================
-- 6) RPC: rpc_toggle_like — 좋아요 토글 (레이트리밋 + 토글 + 감사로그 + 다계정 감지)
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_toggle_like(
  p_submission_id INT,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_bucket TIMESTAMPTZ;
  v_count INT;
  v_existing_id INT;
  v_liked BOOLEAN;
  v_total_likes INT;
  v_distinct_users INT;
BEGIN
  -- 인증 확인
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'AUTH_REQUIRED', 'message', '로그인이 필요합니다.');
  END IF;

  -- 레이트리밋: 1시간 버킷, 최대 30회 (like만 카운트)
  v_bucket := date_trunc('hour', NOW());

  SELECT COALESCE(count, 0) INTO v_count
  FROM api_rate_limits
  WHERE key = v_user_id::text AND action = 'like_toggle' AND bucket_start = v_bucket;

  IF v_count >= 30 THEN
    RETURN jsonb_build_object('error', 'RATE_LIMITED', 'message', '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
  END IF;

  -- 좋아요 토글
  SELECT id INTO v_existing_id
  FROM likes
  WHERE user_id = v_user_id AND submission_id = p_submission_id;

  IF v_existing_id IS NOT NULL THEN
    DELETE FROM likes WHERE id = v_existing_id;
    v_liked := FALSE;
  ELSE
    INSERT INTO likes (user_id, submission_id) VALUES (v_user_id, p_submission_id);
    v_liked := TRUE;
  END IF;

  -- 감사 로그
  INSERT INTO like_events (submission_id, user_id, action, ip_hash, user_agent_hash)
  VALUES (p_submission_id, v_user_id, CASE WHEN v_liked THEN 'like' ELSE 'unlike' END, p_ip_hash, p_user_agent_hash);

  -- like인 경우에만 레이트리밋 카운터 증가
  IF v_liked THEN
    INSERT INTO api_rate_limits (key, action, bucket_start, count, first_seen_at, last_seen_at)
    VALUES (v_user_id::text, 'like_toggle', v_bucket, 1, NOW(), NOW())
    ON CONFLICT (key, action, bucket_start) DO UPDATE
      SET count = api_rate_limits.count + 1, last_seen_at = NOW();
  END IF;

  -- 현재 좋아요 수 (트리거가 like_count 갱신하지만 즉시 반영 확인)
  SELECT like_count INTO v_total_likes FROM submissions WHERE id = p_submission_id;

  -- 다계정 감지: 같은 IP(+UA) + 같은 영상에서 1시간 내 3개 이상 고유 계정이 좋아요
  IF p_ip_hash IS NOT NULL AND v_liked THEN
    SELECT COUNT(DISTINCT user_id) INTO v_distinct_users
    FROM like_events
    WHERE submission_id = p_submission_id
      AND ip_hash = p_ip_hash
      AND (p_user_agent_hash IS NULL OR user_agent_hash = p_user_agent_hash)
      AND action = 'like'
      AND created_at > NOW() - INTERVAL '1 hour';

    IF v_distinct_users >= 3 THEN
      -- 24시간 내 같은 플래그 없을 때만 생성
      IF NOT EXISTS (
        SELECT 1 FROM abuse_flags
        WHERE flag_type = 'multi_account'
          AND submission_id = p_submission_id
          AND resolved_at IS NULL
          AND created_at > NOW() - INTERVAL '24 hours'
      ) THEN
        INSERT INTO abuse_flags (flag_type, severity, submission_id, ip_hash, details)
        VALUES (
          'multi_account', 2, p_submission_id, p_ip_hash,
          jsonb_build_object(
            'distinct_users', v_distinct_users,
            'user_agent_hash', p_user_agent_hash,
            'window', '1h',
            'detected_at', NOW()
          )
        );
      END IF;
    END IF;
  END IF;

  -- 스파이크 감지: 최근 20분 내 같은 영상 좋아요 20건 이상
  IF v_liked THEN
    SELECT COUNT(*) INTO v_count
    FROM like_events
    WHERE submission_id = p_submission_id
      AND action = 'like'
      AND created_at > NOW() - INTERVAL '20 minutes';

    IF v_count >= 20 THEN
      -- 24시간 내 같은 플래그 없을 때만 생성
      IF NOT EXISTS (
        SELECT 1 FROM abuse_flags
        WHERE flag_type = 'spike_like'
          AND submission_id = p_submission_id
          AND resolved_at IS NULL
          AND created_at > NOW() - INTERVAL '24 hours'
      ) THEN
        INSERT INTO abuse_flags (flag_type, severity, submission_id, details)
        VALUES (
          'spike_like', 3, p_submission_id,
          jsonb_build_object(
            'count_20min', v_count,
            'detected_at', NOW()
          )
        );
      END IF;
    END IF;
  END IF;

  -- 누적 이상 감지: 같은 공모전 내 승인된 출품작 평균의 3배 이상
  -- 성능 최적화: 최소 절대값(20) 미달 시 AVG 쿼리 스킵
  IF v_liked AND COALESCE(v_total_likes, 0) > 20 THEN
    DECLARE
      v_contest_id INT;
      v_submission_count INT;
      v_avg_likes NUMERIC;
    BEGIN
      -- 해당 출품작의 공모전 조회
      SELECT contest_id INTO v_contest_id
      FROM submissions WHERE id = p_submission_id;

      IF v_contest_id IS NOT NULL THEN
        -- 승인된 출품작 수 및 평균 좋아요 계산
        SELECT COUNT(*), AVG(like_count)
        INTO v_submission_count, v_avg_likes
        FROM submissions
        WHERE contest_id = v_contest_id AND status = 'approved';

        -- 10개 이상일 때만 + 3배 초과 + 절대 20건 초과
        IF v_submission_count >= 10 AND v_avg_likes > 0
           AND v_total_likes > 3.0 * v_avg_likes AND v_total_likes > 20 THEN
          -- 24시간 내 같은 플래그 없을 때만 생성
          IF NOT EXISTS (
            SELECT 1 FROM abuse_flags
            WHERE flag_type = 'anomaly_likes'
              AND submission_id = p_submission_id
              AND resolved_at IS NULL
              AND created_at > NOW() - INTERVAL '24 hours'
          ) THEN
            INSERT INTO abuse_flags (flag_type, severity, submission_id, details)
            VALUES (
              'anomaly_likes', 2, p_submission_id,
              jsonb_build_object(
                'avg_likes', ROUND(v_avg_likes::numeric, 2),
                'current_likes', v_total_likes,
                'multiplier', ROUND((v_total_likes / v_avg_likes)::numeric, 2),
                'contest_id', v_contest_id,
                'submission_count', v_submission_count,
                'detected_at', NOW()
              )
            );
          END IF;
        END IF;
      END IF;
    END;
  END IF;

  RETURN jsonb_build_object('liked', v_liked, 'totalLikes', COALESCE(v_total_likes, 0));
END;
$$;

-- ============================================================
-- 7) RPC: rpc_record_view — 조회수 기록 (레이트리밋 + 중복제거 + 카운터 + 스파이크 감지)
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_record_view(
  p_submission_id INT,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_viewer_key TEXT;
  v_bucket TIMESTAMPTZ;
  v_rate_count INT;
  v_inserted BOOLEAN;
  v_total_views INT;
  v_recent_views INT;
BEGIN
  v_user_id := auth.uid();  -- NULL 허용 (비로그인도 조회 가능)

  -- viewer_key: 로그인 시 user_id, 비로그인 시 ip_hash
  v_viewer_key := COALESCE(v_user_id::text, p_ip_hash);
  IF v_viewer_key IS NULL THEN
    -- IP도 없으면 카운트 불가 (프록시/봇 의심)
    RETURN jsonb_build_object('counted', FALSE, 'reason', 'NO_IDENTIFIER');
  END IF;

  -- 레이트리밋: 1분 버킷, 최대 60회 (IP 기반)
  IF p_ip_hash IS NOT NULL THEN
    v_bucket := date_trunc('minute', NOW());
    INSERT INTO api_rate_limits (key, action, bucket_start, count, first_seen_at, last_seen_at)
    VALUES (p_ip_hash, 'view', v_bucket, 1, NOW(), NOW())
    ON CONFLICT (key, action, bucket_start) DO UPDATE
      SET count = api_rate_limits.count + 1, last_seen_at = NOW();

    SELECT count INTO v_rate_count
    FROM api_rate_limits
    WHERE key = p_ip_hash AND action = 'view' AND bucket_start = v_bucket;

    IF v_rate_count > 60 THEN
      RETURN jsonb_build_object('counted', FALSE, 'reason', 'RATE_LIMITED');
    END IF;
  END IF;

  -- 6시간 버킷으로 중복 제거
  v_bucket := date_trunc('hour', NOW()) - (EXTRACT(HOUR FROM NOW())::int % 6) * INTERVAL '1 hour';

  BEGIN
    INSERT INTO submission_views (submission_id, user_id, ip_hash, user_agent_hash, bucket_start)
    VALUES (p_submission_id, v_user_id, p_ip_hash, p_user_agent_hash, v_bucket);
    v_inserted := TRUE;
  EXCEPTION WHEN unique_violation THEN
    v_inserted := FALSE;
  END;

  -- 실제 새 조회인 경우에만 카운터 증가
  IF v_inserted THEN
    UPDATE submissions SET views = views + 1 WHERE id = p_submission_id;

    -- 스파이크 감지: 5분 내 같은 영상 조회 50건 이상
    SELECT COUNT(*) INTO v_recent_views
    FROM submission_views
    WHERE submission_id = p_submission_id
      AND created_at > NOW() - INTERVAL '5 minutes';

    IF v_recent_views >= 50 THEN
      -- 24시간 내 같은 플래그 없을 때만 생성
      IF NOT EXISTS (
        SELECT 1 FROM abuse_flags
        WHERE flag_type = 'spike_view'
          AND submission_id = p_submission_id
          AND resolved_at IS NULL
          AND created_at > NOW() - INTERVAL '24 hours'
      ) THEN
        INSERT INTO abuse_flags (flag_type, severity, submission_id, details)
        VALUES (
          'spike_view', 2, p_submission_id,
          jsonb_build_object(
            'count_5min', v_recent_views,
            'detected_at', NOW()
          )
        );
      END IF;
    END IF;
  END IF;

  SELECT views INTO v_total_views FROM submissions WHERE id = p_submission_id;

  -- 누적 이상 감지: 같은 공모전 내 승인된 출품작 평균의 3배 이상
  -- 성능 최적화: 최소 절대값(50) 미달 시 AVG 쿼리 스킵
  IF v_inserted AND COALESCE(v_total_views, 0) > 50 THEN
    DECLARE
      v_contest_id INT;
      v_submission_count INT;
      v_avg_views NUMERIC;
    BEGIN
      -- 해당 출품작의 공모전 조회
      SELECT contest_id INTO v_contest_id
      FROM submissions WHERE id = p_submission_id;

      IF v_contest_id IS NOT NULL THEN
        -- 승인된 출품작 수 및 평균 조회수 계산
        SELECT COUNT(*), AVG(views)
        INTO v_submission_count, v_avg_views
        FROM submissions
        WHERE contest_id = v_contest_id AND status = 'approved';

        -- 10개 이상일 때만 + 3배 초과 + 절대 50건 초과
        IF v_submission_count >= 10 AND v_avg_views > 0
           AND v_total_views > 3.0 * v_avg_views AND v_total_views > 50 THEN
          -- 24시간 내 같은 플래그 없을 때만 생성
          IF NOT EXISTS (
            SELECT 1 FROM abuse_flags
            WHERE flag_type = 'anomaly_views'
              AND submission_id = p_submission_id
              AND resolved_at IS NULL
              AND created_at > NOW() - INTERVAL '24 hours'
          ) THEN
            INSERT INTO abuse_flags (flag_type, severity, submission_id, details)
            VALUES (
              'anomaly_views', 2, p_submission_id,
              jsonb_build_object(
                'avg_views', ROUND(v_avg_views::numeric, 2),
                'current_views', v_total_views,
                'multiplier', ROUND((v_total_views / v_avg_views)::numeric, 2),
                'contest_id', v_contest_id,
                'submission_count', v_submission_count,
                'detected_at', NOW()
              )
            );
          END IF;
        END IF;
      END IF;
    END;
  END IF;

  RETURN jsonb_build_object('counted', v_inserted, 'totalViews', COALESCE(v_total_views, 0));
END;
$$;

-- ============================================================
-- 8) 오래된 레이트리밋 데이터 정리 함수 (주기적 호출용)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 2시간 이상 지난 레이트리밋 버킷 삭제
  DELETE FROM api_rate_limits WHERE bucket_start < NOW() - INTERVAL '2 hours';
  -- 7일 이상 지난 조회 로그 삭제 (중복 제거 목적 달성 후)
  DELETE FROM submission_views WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- ============================================================
-- 9) RPC 실행 권한 부여
-- ============================================================
GRANT EXECUTE ON FUNCTION public.rpc_toggle_like(INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_record_view(INT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits() TO service_role;
