/**
 * 운영 DB 데이터를 SQL INSERT 문으로 변환
 * 출력: supabase/migrations/011_seed_production_data.sql
 * 실행: bun run scripts/generate-seed-sql.ts
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const PROD_URL = 'https://oyssfmocdihzqdsvysdi.supabase.co';
const PROD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95c3NmbW9jZGloenFkc3Z5c2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzNzk3NSwiZXhwIjoyMDg3NDEzOTc1fQ.3ItBbVsSDFyo_41FBRJfdaypqqB5X07sn17oHRiXPg0';

const prod = createClient(PROD_URL, PROD_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 테스트 DB 컬럼 목록 (마이그레이션 기준)
const TEST_URL = 'https://kanganxnalihuejfvbaq.supabase.co';
const TEST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbmdhbnhuYWxpaHVlamZ2YmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzODg3MywiZXhwIjoyMDg3NDE0ODczfQ.7uNKVX5KIQayf5y_FO4DJFu02707jagG2HfjQERC4hw';

// SQL 값 이스케이프
function esc(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    // 배열 안에 객체가 있으면 JSONB로 처리
    const hasObjects = val.some(v => typeof v === 'object' && v !== null);
    if (hasObjects) {
      return escStr(JSON.stringify(val)) + '::jsonb';
    }
    // 순수 문자열/숫자 배열 → PostgreSQL 배열
    if (val.length === 0) return "'{}'";
    const items = val.map(v => typeof v === 'string' ? `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : String(v));
    return `'{${items.join(',')}}'`;
  }
  if (typeof val === 'object') {
    // JSONB 객체
    return escStr(JSON.stringify(val)) + '::jsonb';
  }
  // 문자열
  return escStr(String(val));
}

// 문자열을 PostgreSQL E'' 리터럴로 이스케이프 (줄바꿈 포함)
function escStr(s: string): string {
  const escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `E'${escaped}'`;
}

// 테이블 컬럼 조회
async function getTestColumns(table: string): Promise<string[]> {
  try {
    const r = await fetch(`${TEST_URL}/rest/v1/`, {
      headers: { Authorization: `Bearer ${TEST_KEY}`, apikey: TEST_KEY, Accept: 'application/openapi+json' },
    });
    if (!r.ok) return [];
    const spec = await r.json() as { definitions?: Record<string, { properties?: Record<string, unknown> }> };
    return Object.keys(spec.definitions?.[table]?.properties ?? {});
  } catch { return []; }
}

// 테이블 데이터를 SQL INSERT 문으로 변환
async function generateInserts(table: string, testCols: string[]): Promise<string> {
  const { data, error } = await prod.from(table).select('*').order('id', { ascending: true }).limit(10000);
  if (error || !data?.length) return '';

  const colSet = new Set(testCols);
  const lines: string[] = [];
  lines.push(`-- ${table}: ${data.length}행`);

  for (const row of data) {
    const filtered = Object.entries(row).filter(([k]) => colSet.has(k));
    const cols = filtered.map(([k]) => `"${k}"`).join(', ');
    const vals = filtered.map(([, v]) => esc(v)).join(', ');
    lines.push(`INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;`);
  }

  // SERIAL 시퀀스 리셋 (UUID PK 테이블 제외)
  const UUID_PK_TABLES = ['pricing_plans', 'profiles', 'utm_visits'];
  if (!UUID_PK_TABLES.includes(table)) {
    lines.push(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false);`);
  }

  lines.push('');
  return lines.join('\n');
}

async function main() {
  console.log('운영 DB 데이터를 SQL로 변환 중...\n');

  // bcrypt 해시를 TypeScript에서 미리 생성 (pgcrypto 의존성 제거)
  const bcryptHash = await Bun.password.hash('TestMigration2026!', { algorithm: 'bcrypt', cost: 10 });

  const sql: string[] = [];
  sql.push('-- ============================================================');
  sql.push('-- 운영 DB 데이터 시드 (자동 생성)');
  sql.push(`-- 생성일: ${new Date().toISOString()}`);
  sql.push('-- ============================================================');
  sql.push('');

  // 1. auth.users 마이그레이션
  console.log('auth.users 데이터 조회...');
  const { data: users } = await prod.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users?.users.length) {
    sql.push('-- 프로필 자동 생성 트리거 비활성화');
    sql.push('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
    sql.push('');
    sql.push(`-- auth.users: ${users.users.length}명`);

    for (const u of users.users) {
      const meta = JSON.stringify(u.user_metadata || {}).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n');
      const appMeta = JSON.stringify(u.app_metadata || {}).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n');
      const createdAt = u.created_at || new Date().toISOString();
      const updatedAt = u.updated_at || createdAt;
      const confirmedAt = u.email_confirmed_at || createdAt;

      sql.push(`INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (`);
      sql.push(`  '00000000-0000-0000-0000-000000000000',`);
      sql.push(`  '${u.id}',`);
      sql.push(`  'authenticated',`);
      sql.push(`  'authenticated',`);
      sql.push(`  '${(u.email || '').replace(/'/g, "''")}',`);
      sql.push(`  '${bcryptHash}',`);
      sql.push(`  '${confirmedAt}',`);
      sql.push(`  E'${meta}'::jsonb,`);
      sql.push(`  E'${appMeta}'::jsonb,`);
      sql.push(`  '${createdAt}',`);
      sql.push(`  '${updatedAt}',`);
      sql.push(`  '',`);
      sql.push(`  '',`);
      sql.push(`  FALSE`);
      sql.push(`) ON CONFLICT (id) DO NOTHING;`);
      sql.push('');

      // auth.identities도 필요 (이메일 로그인용)
      sql.push(`INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (`);
      sql.push(`  gen_random_uuid(),`);
      sql.push(`  '${u.id}',`);
      sql.push(`  '${(u.email || '').replace(/'/g, "''")}',`);
      sql.push(`  json_build_object('sub', '${u.id}', 'email', '${(u.email || '').replace(/'/g, "''")}')::jsonb,`);
      sql.push(`  'email',`);
      sql.push(`  '${createdAt}',`);
      sql.push(`  '${createdAt}',`);
      sql.push(`  '${updatedAt}'`);
      sql.push(`) ON CONFLICT DO NOTHING;`);
      sql.push('');
    }
    sql.push('');
  }

  // 2. public 테이블 데이터
  const TABLES = [
    'pricing_plans', 'profiles', 'companies', 'company_members',
    'contests', 'contest_award_tiers', 'contest_bonus_configs',
    'submissions', 'bonus_entries', 'likes', 'judges',
    'judging_templates', 'judging_criteria', 'scores', 'score_criteria',
    'contest_results', 'articles', 'faqs', 'inquiries',
    'agency_requests', 'activity_logs', 'devices', 'ip_logs',
    'utm_visits', 'account_withdrawals',
  ];

  // 테스트 DB 컬럼 목록 조회
  console.log('테스트 DB 컬럼 목록 조회...');
  const testColsMap: Record<string, string[]> = {};
  for (const t of TABLES) {
    testColsMap[t] = await getTestColumns(t);
  }

  for (const table of TABLES) {
    console.log(`${table} 처리중...`);
    const inserts = await generateInserts(table, testColsMap[table] || []);
    if (inserts) sql.push(inserts);
  }

  // 3. 트리거 복원
  sql.push('-- 프로필 자동 생성 트리거 복원');
  sql.push(`CREATE TRIGGER on_auth_user_created`);
  sql.push(`  AFTER INSERT ON auth.users`);
  sql.push(`  FOR EACH ROW EXECUTE FUNCTION handle_new_user();`);
  sql.push('');

  // profiles seq_id 시퀀스 리셋
  sql.push(`SELECT setval(pg_get_serial_sequence('"profiles"', 'seq_id'), COALESCE((SELECT MAX(seq_id) FROM profiles), 0) + 1, false);`);

  const outPath = 'supabase/migrations/011_seed_production_data.sql';
  writeFileSync(outPath, sql.join('\n'), 'utf-8');
  console.log(`\n완료! ${outPath} 생성됨 (${sql.length}줄)`);
}

main().catch(console.error);
