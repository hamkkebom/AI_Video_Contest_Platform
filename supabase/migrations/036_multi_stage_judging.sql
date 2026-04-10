-- ============================================================
-- 036: 다단계 심사 시스템
-- ============================================================

-- 1. judging_stages: 공모전별 심사 단계 설정
CREATE TABLE IF NOT EXISTS judging_stages (
  id SERIAL PRIMARY KEY,
  contest_id INT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  stage_number INT NOT NULL,
  name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('simple', 'scored')),
  template_id INT REFERENCES judging_templates(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(contest_id, stage_number)
);
CREATE INDEX IF NOT EXISTS idx_judging_stages_contest ON judging_stages(contest_id);

-- 2. stage_judges: 단계별 심사위원 배정
CREATE TABLE IF NOT EXISTS stage_judges (
  id SERIAL PRIMARY KEY,
  stage_id INT NOT NULL REFERENCES judging_stages(id) ON DELETE CASCADE,
  judge_id INT NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(stage_id, judge_id)
);
CREATE INDEX IF NOT EXISTS idx_stage_judges_stage ON stage_judges(stage_id);

-- 3. submission_stage_results: 출품작별 단계 결과
CREATE TABLE IF NOT EXISTS submission_stage_results (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  stage_id INT NOT NULL REFERENCES judging_stages(id) ON DELETE CASCADE,
  result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('pass', 'fail', 'hold', 'pending')),
  decided_by UUID REFERENCES profiles(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(submission_id, stage_id)
);
CREATE INDEX IF NOT EXISTS idx_submission_stage_results_stage ON submission_stage_results(stage_id);
CREATE INDEX IF NOT EXISTS idx_submission_stage_results_submission ON submission_stage_results(submission_id);

-- 4. simple_judgments: 간편 심사 개별 투표
CREATE TABLE IF NOT EXISTS simple_judgments (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  stage_id INT NOT NULL REFERENCES judging_stages(id) ON DELETE CASCADE,
  judge_id INT NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  judgment TEXT NOT NULL CHECK (judgment IN ('pass', 'fail', 'hold')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(submission_id, stage_id, judge_id)
);
CREATE INDEX IF NOT EXISTS idx_simple_judgments_stage ON simple_judgments(stage_id);

-- 5. scores 테이블에 stage_id 추가
ALTER TABLE scores ADD COLUMN IF NOT EXISTS stage_id INT REFERENCES judging_stages(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_scores_stage ON scores(stage_id);

-- unique constraint 변경: (submission_id, judge_id) → (submission_id, judge_id, stage_id)
-- 기존 제약 조건 삭제 (auto-generated name)
DO $$
BEGIN
  -- 기존 unique constraint 찾아서 삭제
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'scores'::regclass
      AND contype = 'u'
      AND array_length(conkey, 1) = 2
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE scores DROP CONSTRAINT ' || quote_ident(conname)
      FROM pg_constraint
      WHERE conrelid = 'scores'::regclass
        AND contype = 'u'
        AND array_length(conkey, 1) = 2
      LIMIT 1
    );
  END IF;
END $$;

-- 새 unique constraint 추가
ALTER TABLE scores ADD CONSTRAINT scores_submission_judge_stage_key
  UNIQUE(submission_id, judge_id, stage_id);

-- ============================================================
-- RLS 정책
-- ============================================================

ALTER TABLE judging_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_stage_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_judgments ENABLE ROW LEVEL SECURITY;

-- judging_stages: 누구나 읽기, admin만 쓰기
CREATE POLICY "judging_stages_select" ON judging_stages FOR SELECT USING (true);
CREATE POLICY "judging_stages_insert" ON judging_stages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "judging_stages_update" ON judging_stages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "judging_stages_delete" ON judging_stages FOR DELETE USING (auth.uid() IS NOT NULL);

-- stage_judges: 누구나 읽기, admin만 쓰기
CREATE POLICY "stage_judges_select" ON stage_judges FOR SELECT USING (true);
CREATE POLICY "stage_judges_insert" ON stage_judges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "stage_judges_update" ON stage_judges FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "stage_judges_delete" ON stage_judges FOR DELETE USING (auth.uid() IS NOT NULL);

-- submission_stage_results: 누구나 읽기, admin/judge 쓰기
CREATE POLICY "submission_stage_results_select" ON submission_stage_results FOR SELECT USING (true);
CREATE POLICY "submission_stage_results_insert" ON submission_stage_results FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "submission_stage_results_update" ON submission_stage_results FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "submission_stage_results_delete" ON submission_stage_results FOR DELETE USING (auth.uid() IS NOT NULL);

-- simple_judgments: 누구나 읽기, 인증된 사용자 쓰기
CREATE POLICY "simple_judgments_select" ON simple_judgments FOR SELECT USING (true);
CREATE POLICY "simple_judgments_insert" ON simple_judgments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "simple_judgments_update" ON simple_judgments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "simple_judgments_delete" ON simple_judgments FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 기존 데이터 backfill: 기존 공모전 → 단일 단계(stage_number=1)로 자동 생성
-- ============================================================
DO $$
DECLARE
  contest_row RECORD;
  new_stage_id INT;
  template_row RECORD;
BEGIN
  FOR contest_row IN
    SELECT id FROM contests
    WHERE NOT EXISTS (
      SELECT 1 FROM judging_stages WHERE contest_id = contests.id
    )
  LOOP
    -- 기존 템플릿 확인
    SELECT id INTO template_row FROM judging_templates WHERE name = 'contest-' || contest_row.id LIMIT 1;

    INSERT INTO judging_stages (contest_id, stage_number, name, method, template_id, is_active, sort_order)
    VALUES (
      contest_row.id,
      1,
      '1차 심사',
      CASE WHEN template_row.id IS NOT NULL THEN 'scored' ELSE 'simple' END,
      template_row.id,
      TRUE,
      0
    )
    RETURNING id INTO new_stage_id;

    -- 기존 scores에 stage_id 연결
    UPDATE scores SET stage_id = new_stage_id
    WHERE submission_id IN (SELECT id FROM submissions WHERE contest_id = contest_row.id)
      AND stage_id IS NULL;

    -- 기존 judges → stage_judges 매핑
    INSERT INTO stage_judges (stage_id, judge_id)
    SELECT new_stage_id, j.id FROM judges j WHERE j.contest_id = contest_row.id
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
