/**
 * 운영 -> 테스트 DB 마이그레이션 스크립트
 * 실행: bun run scripts/migrate-prod-to-test.ts
 */
import { createClient } from '@supabase/supabase-js';

const PROD_URL = 'https://oyssfmocdihzqdsvysdi.supabase.co';
const PROD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95c3NmbW9jZGloenFkc3Z5c2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzNzk3NSwiZXhwIjoyMDg3NDEzOTc1fQ.3ItBbVsSDFyo_41FBRJfdaypqqB5X07sn17oHRiXPg0';
const TEST_URL = 'https://kanganxnalihuejfvbaq.supabase.co';
const TEST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbmdhbnhuYWxpaHVlamZ2YmFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzODg3MywiZXhwIjoyMDg3NDE0ODczfQ.7uNKVX5KIQayf5y_FO4DJFu02707jagG2HfjQERC4hw';

const prod = createClient(PROD_URL, PROD_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const testDb = createClient(TEST_URL, TEST_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// FK 의존 순서
const TABLES = [
  'pricing_plans', 'profiles', 'companies', 'company_members',
  'contests', 'contest_award_tiers', 'contest_bonus_configs',
  'submissions', 'bonus_entries', 'likes', 'judges',
  'judging_templates', 'judging_criteria', 'scores', 'score_criteria',
  'contest_results', 'articles', 'faqs', 'inquiries',
  'agency_requests', 'activity_logs', 'devices', 'ip_logs',
  'utm_visits', 'account_withdrawals',
];

function log(msg: string) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

// PostgREST OpenAPI 스펙에서 테이블 컬럼 조회
async function getColumns(url: string, key: string, table: string): Promise<string[]> {
  try {
    const r = await fetch(`${url}/rest/v1/`, {
      headers: { Authorization: `Bearer ${key}`, apikey: key, Accept: 'application/openapi+json' },
    });
    if (!r.ok) return [];
    const spec = await r.json() as { definitions?: Record<string, { properties?: Record<string, unknown> }> };
    return Object.keys(spec.definitions?.[table]?.properties ?? {});
  } catch { return []; }
}

// 운영 데이터에서 테스트에 없는 컬럼 제거
function filterCols(rows: Record<string, unknown>[], cols: string[]): Record<string, unknown>[] {
  if (!cols.length) return rows;
  const set = new Set(cols);
  return rows.map(r => {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) { if (set.has(k)) o[k] = v; }
    return o;
  });
}

// auth.users 마이그레이션
async function migrateUsers() {
  log('auth.users 마이그레이션...');
  const { data: pu, error } = await prod.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !pu) { log(`  실패: ${error?.message}`); return 0; }
  log(`  운영 ${pu.users.length}명`);

  const { data: tu } = await testDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const exists = new Set(tu?.users.map(u => u.id) ?? []);
  let ok = 0, fail = 0;

  for (const u of pu.users) {
    if (exists.has(u.id)) continue;
    try {
      const r = await fetch(`${TEST_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TEST_KEY}`, apikey: TEST_KEY },
        body: JSON.stringify({
          id: u.id, email: u.email, phone: u.phone || undefined,
          email_confirm: true, phone_confirm: !!u.phone,
          user_metadata: u.user_metadata || {}, app_metadata: u.app_metadata || {},
          password: 'TestMigration2026!',
        }),
      });
      if (r.ok) ok++; else {
        const t = await r.text();
        console.error(`  ${u.email}: ${t.slice(0, 150)}`);
        fail++;
      }
    } catch (e) { console.error(`  ${u.email}: ${e}`); fail++; }
    await new Promise(r => setTimeout(r, 80));
  }
  log(`  auth.users: ${ok} 생성, ${fail} 실패`);
  return ok;
}

// 테이블 데이터 마이그레이션
async function migrateTable(table: string, cols: string[]) {
  const { data: rows, error } = await prod.from(table).select('*').order('id', { ascending: true }).limit(10000);
  if (error) { if (!error.message.includes('does not exist')) console.error(`  ${table}: ${error.message}`); return; }
  if (!rows?.length) { return; }

  log(`  ${table}: ${rows.length}행`);
  const data = filterCols(rows as Record<string, unknown>[], cols);

  if (table === 'pricing_plans') {
    const { error: e } = await testDb.from(table).upsert(data, { onConflict: 'id' });
    if (e) console.error(`  ${table} upsert: ${e.message}`);
    else log(`    -> ${data.length}행 upsert`);
    return;
  }

  if (table === 'profiles') {
    const { data: ex } = await testDb.from('profiles').select('id');
    const ids = new Set(ex?.map(p => p.id) ?? []);
    const ins = data.filter(r => !ids.has(r.id as string));
    const upd = data.filter(r => ids.has(r.id as string));

    if (ins.length) {
      const { error: e } = await testDb.from('profiles').insert(ins);
      if (e) console.error(`    insert: ${e.message}`);
      else log(`    -> ${ins.length}행 삽입`);
    }
    for (const p of upd) {
      const { id, ...d } = p;
      const { error: e } = await testDb.from('profiles').update(d).eq('id', id as string);
      if (e) console.error(`    update ${id}: ${e.message}`);
    }
    if (upd.length) log(`    -> ${upd.length}행 업데이트`);
    return;
  }

  // SERIAL 테이블
  await testDb.from(table).delete().gte('id', 0);
  let ok = 0;
  for (let i = 0; i < data.length; i += 50) {
    const batch = data.slice(i, i + 50);
    const { error: e } = await testDb.from(table).insert(batch);
    if (e) console.error(`    ${table} batch ${i}: ${e.message}`);
    else ok += batch.length;
  }
  log(`    -> ${ok}/${rows.length}행 삽입`);
}

async function main() {
  console.log('\n=== 운영 -> 테스트 DB 마이그레이션 ===\n');

  // 컬럼 조회
  log('테스트 DB 컬럼 조회...');
  const cm: Record<string, string[]> = {};
  for (const t of TABLES) {
    cm[t] = await getColumns(TEST_URL, TEST_KEY, t);
  }
  log(`  ${Object.values(cm).filter(c => c.length > 0).length}/${TABLES.length} 테이블 확인\n`);

  // auth.users
  const n = await migrateUsers();
  if (n > 0) { log('트리거 대기 3초...'); await new Promise(r => setTimeout(r, 3000)); }
  console.log('');

  // 테이블 데이터
  log('테이블 데이터 마이그레이션...');
  for (const t of TABLES) await migrateTable(t, cm[t] || []);
  console.log('');

  // 검증
  log('검증...');
  let total = 0;
  for (const t of TABLES) {
    const { count: pc } = await prod.from(t).select('*', { count: 'exact', head: true });
    const { count: tc } = await testDb.from(t).select('*', { count: 'exact', head: true });
    const p = pc ?? 0, tt = tc ?? 0;
    total += tt;
    if (p > 0 || tt > 0) log(`  ${p === tt ? 'OK' : '!!'} ${t}: ${p} -> ${tt}`);
  }
  const { data: pau } = await prod.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const { data: tau } = await testDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  log(`  auth.users: ${pau?.users.length ?? '?'} -> ${tau?.users.length ?? '?'}`);
  log(`\n완료! 테스트 DB ${total}행\n`);
}

main().catch(console.error);
