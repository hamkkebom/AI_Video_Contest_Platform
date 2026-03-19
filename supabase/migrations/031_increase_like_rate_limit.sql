-- 031: 좋아요 레이트리밋 완화 (5회/시간 → 30회/시간)
-- 기존 5회는 공모전 갤러리 탐색 시 정상 사용자도 쉽게 초과하여
-- 좋아요가 조용히 롤백되는 문제 발생. 30회로 상향.

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
