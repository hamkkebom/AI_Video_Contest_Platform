/**
 * 운영 DB 스냅샷 — 전 테이블을 JSON 으로 내려받는다.
 *
 * Supabase 플랜의 자동 백업과 별개로, 필요할 때 직접 시점 스냅샷을 뜨기 위한 도구다.
 * Storage 파일(썸네일·증빙 이미지)과 Cloudflare Stream 영상은 포함되지 않는다 — DB 메타데이터만이다.
 *
 * ⚠️ 출력물에는 회원 이메일·전화번호가 평문으로 담긴다.
 *    저장소 안이나 클라우드 동기화 폴더에 두지 말고, 외부로 공유하지 말 것.
 *
 * 사용법:
 *   node scripts/backup-db.mjs <출력디렉터리>
 *   node scripts/backup-db.mjs D:/backups/aikkum-2026-07-31
 *
 * .env.local 의 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 사용한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const OUT_DIR = process.argv[2];
if (!OUT_DIR) {
  console.error('사용법: node scripts/backup-db.mjs <출력디렉터리>');
  process.exit(1);
}

const ENV_PATH = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(ENV_PATH)) {
  console.error('.env.local 을 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요.');
  process.exit(1);
}
const env = fs.readFileSync(ENV_PATH, 'utf8');
const readEnv = (key) => (env.match(new RegExp(`^${key}=(.+)$`, 'm')) ?? [])[1]?.trim();

const SUPABASE_URL = readEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = readEnv('SUPABASE_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 필요합니다.');
  process.exit(1);
}
const REST = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;

/** 백업 대상 — 새 테이블을 추가하면 여기에도 등록할 것 */
const TABLES = [
  'profiles', 'submissions', 'contests', 'bonus_entries', 'contest_results',
  'scores', 'simple_judgments', 'judges', 'judging_stages', 'stage_judges',
  'submission_stage_results', 'contest_award_tiers', 'contest_bonus_configs',
  'judging_criteria', 'judging_templates', 'score_criteria', 'companies',
  'company_members', 'articles', 'faqs', 'popups', 'site_settings',
  'pricing_plans', 'inquiries', 'agency_requests', 'likes', 'devices',
  'account_withdrawals', 'abuse_flags', 'activity_logs', 'ip_logs', 'utm_visits',
];

const PAGE_SIZE = 1000;

async function fetchRange(table, offset, ordered) {
  const order = ordered ? '&order=id.asc' : '';
  const url = `${REST}/${table}?select=*${order}&offset=${offset}&limit=${PAGE_SIZE}`;
  const res = await fetch(url, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 150)}`);
  return res.json();
}

/** 테이블 하나를 페이지네이션으로 전부 가져온다. id 컬럼이 없으면 정렬 없이 재시도한다. */
async function fetchTable(table) {
  const rows = [];
  let ordered = true;
  for (let offset = 0; ; offset += PAGE_SIZE) {
    let batch;
    try {
      batch = await fetchRange(table, offset, ordered);
    } catch (error) {
      if (ordered && /42703|does not exist/.test(error.message)) {
        ordered = false;
        offset -= PAGE_SIZE; /* 같은 offset 으로 재시도 */
        continue;
      }
      throw error;
    }
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return rows;
}

const manifest = {
  takenAt: new Date().toISOString(),
  supabaseUrl: SUPABASE_URL,
  tables: {},
};

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const table of TABLES) {
  try {
    const rows = await fetchTable(table);
    const file = path.join(OUT_DIR, `${table}.json`);
    fs.writeFileSync(file, JSON.stringify(rows), 'utf8');
    const kb = Math.round(fs.statSync(file).size / 1024);
    manifest.tables[table] = { rows: rows.length, sizeKb: kb };
    console.log(`  ✓ ${table.padEnd(26)} ${String(rows.length).padStart(7)}행  ${String(kb).padStart(6)}KB`);
  } catch (error) {
    manifest.tables[table] = { error: error.message };
    console.log(`  ✗ ${table.padEnd(26)} ${error.message}`);
  }
}

fs.writeFileSync(path.join(OUT_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

const totalRows = Object.values(manifest.tables).reduce((sum, t) => sum + (t.rows ?? 0), 0);
const failed = Object.entries(manifest.tables).filter(([, t]) => t.error);
console.log(`\n총 ${totalRows.toLocaleString()}행 저장 → ${OUT_DIR}`);
if (failed.length > 0) {
  console.log(`실패한 테이블 ${failed.length}개: ${failed.map(([name]) => name).join(', ')}`);
  process.exit(1);
}
