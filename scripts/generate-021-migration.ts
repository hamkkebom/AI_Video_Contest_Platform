/**
 * 구 프로덕션 DB에서 전체 유저 + 공모전 데이터를 추출하여 021 마이그레이션 생성
 * 제외: submissions, bonus_entries, activity_logs, ip_logs, utm_visits
 * 실행: bun run scripts/generate-021-migration.ts
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

// 구 프로덕션 (oyssfmocdihzqdsvysdi)
const PROD_URL = 'https://oyssfmocdihzqdsvysdi.supabase.co';
const PROD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95c3NmbW9jZGloenFkc3Z5c2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzNzk3NSwiZXhwIjoyMDg3NDEzOTc1fQ.3ItBbVsSDFyo_41FBRJfdaypqqB5X07sn17oHRiXPg0';

// 신 프로덕션 (ulnrfzlpfffapkvpkegv) — 컬럼 목록 조회용
const NEW_PROD_URL = 'https://ulnrfzlpfffapkvpkegv.supabase.co';
const NEW_PROD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbnJmemxwZmZmYXBrdnBrZWd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDcyNzYzMCwiZXhwIjoyMDU2MzAzNjMwfQ.YOUR_KEY_HERE';

const prod = createClient(PROD_URL, PROD_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// SQL 값 이스케이프
function esc(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    const hasObjects = val.some(v => typeof v === 'object' && v !== null);
    if (hasObjects) {
      return escStr(JSON.stringify(val)) + '::jsonb';
    }
    if (val.length === 0) return "'{}'";
    const items = val.map(v => typeof v === 'string' ? `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : String(v));
    return `'{${items.join(',')}}'`;
  }
  if (typeof val === 'object') {
    return escStr(JSON.stringify(val)) + '::jsonb';
  }
  return escStr(String(val));
}

function escStr(s: string): string {
  const escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `E'${escaped}'`;
}

// 신 프로덕션 컬럼 목록 조회 (스키마 호환성 보장)
async function getTargetColumns(table: string): Promise<string[]> {
  try {
    const r = await fetch(`${NEW_PROD_URL}/rest/v1/`, {
      headers: { Authorization: `Bearer ${NEW_PROD_KEY}`, apikey: NEW_PROD_KEY, Accept: 'application/openapi+json' },
    });
    if (!r.ok) {
      // 키가 없으면 구 프로덕션 컬럼 사용
      return [];
    }
    const spec = await r.json() as { definitions?: Record<string, { properties?: Record<string, unknown> }> };
    return Object.keys(spec.definitions?.[table]?.properties ?? {});
  } catch { return []; }
}

// 테이블 데이터를 SQL INSERT 문으로 변환
async function generateInserts(table: string, targetCols: string[]): Promise<string> {
  const { data, error } = await prod.from(table).select('*').order('id' in {} ? 'id' : 'created_at', { ascending: true }).limit(10000);
  if (error) {
    // id 컬럼이 없을 수 있으므로 created_at으로 재시도
    const retry = await prod.from(table).select('*').limit(10000);
    if (retry.error || !retry.data?.length) return '';
    return formatInserts(table, retry.data, targetCols);
  }
  if (!data?.length) return '';
  return formatInserts(table, data, targetCols);
}

function formatInserts(table: string, data: Record<string, unknown>[], targetCols: string[]): string {
  const colSet = targetCols.length > 0 ? new Set(targetCols) : null;
  const lines: string[] = [];
  lines.push(`-- ${table}: ${data.length}행`);

  for (const row of data) {
    const entries = colSet
      ? Object.entries(row).filter(([k]) => colSet.has(k))
      : Object.entries(row);
    const cols = entries.map(([k]) => `"${k}"`).join(', ');
    const vals = entries.map(([, v]) => esc(v)).join(', ');
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
  console.log('=== 021 마이그레이션 생성: 구 프로덕션 → 신 프로덕션 ===\n');

  const sql: string[] = [];
  sql.push('-- ============================================================');
  sql.push('-- 021: 전체 유저 + 공모전 + 필수 데이터 복원');
  sql.push(`-- 구 프로덕션(oyssfmocdihzqdsvysdi)에서 추출 — ${new Date().toISOString()}`);
  sql.push('-- 020에서 전체 삭제 후, 모든 유저(테스트+실제) + 공모전 데이터 복원');
  sql.push('-- 제외: submissions, bonus_entries, activity_logs, ip_logs, utm_visits');
  sql.push('-- ============================================================');
  sql.push('');

  // ============================================================
  // 1. auth.users + identities
  // ============================================================
  console.log('auth.users 데이터 조회...');
  const { data: usersData } = await prod.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const users = usersData?.users || [];
  console.log(`  → ${users.length}명 발견`);

  if (users.length) {
    sql.push('-- 프로필 자동 생성 트리거 비활성화 (auth.users INSERT 시 중복 방지)');
    sql.push('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
    sql.push('');
    sql.push('-- ============================================================');
    sql.push(`-- 1. auth.users 복원 (${users.length}명)`);
    sql.push('-- ============================================================');
    sql.push('');

    for (const u of users) {
      const isGoogle = u.app_metadata?.provider === 'google';
      const label = isGoogle
        ? `${u.email} (Google OAuth)`
        : `${u.email} (이메일/비밀번호)`;

      sql.push(`-- ${label}`);

      // user_metadata를 E'' 리터럴로 이스케이프
      const meta = JSON.stringify(u.user_metadata || {})
        .replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n');
      const appMeta = JSON.stringify(u.app_metadata || {})
        .replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n');

      const createdAt = u.created_at || new Date().toISOString();
      const updatedAt = u.updated_at || createdAt;
      const confirmedAt = u.email_confirmed_at || createdAt;

      sql.push(`INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, is_super_admin) VALUES (`);
      sql.push(`  '00000000-0000-0000-0000-000000000000',`);
      sql.push(`  '${u.id}',`);
      sql.push(`  'authenticated', 'authenticated',`);
      sql.push(`  '${(u.email || '').replace(/'/g, "''")}',`);
      // 테스트 계정은 기존 bcrypt hash, 실제 유저는 dummy (Google OAuth로 로그인하므로 무관)
      sql.push(`  '$2b$10$gFKEieuQj7gWh8Ok8OgkEuk0rdSWb3BjiEbC62vuEHhhWrVa5kTG6',`);
      sql.push(`  '${confirmedAt}',`);
      sql.push(`  E'${meta}'::jsonb,`);
      sql.push(`  E'${appMeta}'::jsonb,`);
      sql.push(`  '${createdAt}', '${updatedAt}', '', '', FALSE`);
      sql.push(`) ON CONFLICT (id) DO NOTHING;`);
      sql.push('');

      // identities: Google OAuth 유저는 google provider + Google sub ID로, 이메일 유저는 email provider로
      if (isGoogle) {
        // Google OAuth — user_metadata에서 Google sub ID 추출
        const googleSub = (u.user_metadata as Record<string, unknown>)?.sub as string
          || (u.user_metadata as Record<string, unknown>)?.provider_id as string
          || u.id;
        const idData = JSON.stringify({
          sub: googleSub,
          email: u.email,
          full_name: (u.user_metadata as Record<string, unknown>)?.full_name || (u.user_metadata as Record<string, unknown>)?.name || '',
          provider_id: googleSub,
        }).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n');
        sql.push(`INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (`);
        sql.push(`  gen_random_uuid(), '${u.id}',`);
        sql.push(`  '${googleSub}',`);
        sql.push(`  E'${idData}'::jsonb,`);
        sql.push(`  'google',`);
        sql.push(`  '${createdAt}', '${createdAt}', '${updatedAt}'`);
        sql.push(`) ON CONFLICT DO NOTHING;`);
      } else {
        // 이메일/비밀번호 — email provider
        sql.push(`INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (`);
        sql.push(`  gen_random_uuid(), '${u.id}',`);
        sql.push(`  '${(u.email || '').replace(/'/g, "''")}',`);
        sql.push(`  '{"sub":"${u.id}","email":"${(u.email || '').replace(/"/g, '\\"')}"}'::jsonb,`);
        sql.push(`  'email',`);
        sql.push(`  '${createdAt}', '${createdAt}', '${updatedAt}'`);
        sql.push(`) ON CONFLICT DO NOTHING;`);
        sql.push('');
      }
    }
  }

  // ============================================================
  // 2. public 테이블 (필요한 것만)
  // ============================================================
  const TABLES = [
    'pricing_plans',
    'profiles',
    'contests',
    'contest_award_tiers',
    'contest_bonus_configs',
  ];

  console.log('\npublic 테이블 데이터 추출...');
  for (const table of TABLES) {
    console.log(`  ${table} 처리중...`);
    const targetCols = await getTargetColumns(table);
    const { data, error } = await prod.from(table).select('*').limit(10000);
    if (error) {
      console.log(`    ⚠ 에러: ${error.message}`);
      continue;
    }
    if (!data?.length) {
      console.log(`    → 0행 (건너뜀)`);
      continue;
    }
    console.log(`    → ${data.length}행`);

    sql.push('-- ============================================================');
    const sectionNum = TABLES.indexOf(table) + 2;
    sql.push(`-- ${sectionNum}. ${table} 복원`);
    sql.push('-- ============================================================');

    const colSet = targetCols.length > 0 ? new Set(targetCols) : null;
    for (const row of data) {
      const entries = colSet
        ? Object.entries(row).filter(([k]) => colSet.has(k))
        : Object.entries(row);
      const cols = entries.map(([k]) => `"${k}"`).join(', ');
      const vals = entries.map(([, v]) => esc(v)).join(', ');
      sql.push(`INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;`);
    }

    // 시퀀스 리셋
    const UUID_PK_TABLES = ['pricing_plans', 'profiles', 'utm_visits'];
    if (!UUID_PK_TABLES.includes(table)) {
      sql.push(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false);`);
    }
    sql.push('');
  }

  // profiles seq_id 시퀀스 리셋
  sql.push(`SELECT setval(pg_get_serial_sequence('profiles', 'seq_id'), COALESCE((SELECT MAX(seq_id) FROM profiles), 0) + 1, false);`);
  sql.push('');

  // ============================================================
  // 트리거 복원
  // ============================================================
  sql.push('-- 프로필 자동 생성 트리거 복원');
  sql.push('CREATE TRIGGER on_auth_user_created');
  sql.push('  AFTER INSERT ON auth.users');
  sql.push('  FOR EACH ROW EXECUTE FUNCTION handle_new_user();');

  const outPath = 'supabase/migrations/021_restore_real_users_and_contest.sql';
  writeFileSync(outPath, sql.join('\n'), 'utf-8');
  console.log(`\n✅ 완료! ${outPath} 생성됨 (${sql.length}줄)`);
}

main().catch(console.error);
