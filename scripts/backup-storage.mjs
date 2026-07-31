/**
 * Supabase Storage 파일 백업 — 버킷의 모든 객체를 로컬로 내려받는다.
 *
 * ⚠️ Supabase 의 자동 백업(일일 백업·PITR)은 **데이터베이스만** 대상으로 하며
 *    Storage 에 올라간 파일 자체는 포함하지 않는다.
 *    복원해도 버킷 메타데이터만 살아나고 실제 파일은 사라진다.
 *    → 출품작 썸네일·가산점 증빙 이미지는 이 스크립트로 따로 받아둬야 한다.
 *    참고: https://supabase.com/docs/guides/platform/backups
 *
 * ⚠️ proof-images 에는 참가자가 올린 SNS 인증 스크린샷이 들어 있다.
 *    받은 파일을 저장소 안이나 공유 폴더에 두지 말 것.
 *
 * 사용법:
 *   node scripts/backup-storage.mjs <출력디렉터리> [버킷명 ...]
 *   node scripts/backup-storage.mjs D:/backups/storage-2026-07-31
 *   node scripts/backup-storage.mjs D:/backups/proof proof-images
 *
 * 이미 받은 파일은 크기가 같으면 건너뛰므로 중단 후 재실행해도 이어받는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const [OUT_DIR, ...bucketArgs] = process.argv.slice(2);
if (!OUT_DIR) {
  console.error('사용법: node scripts/backup-storage.mjs <출력디렉터리> [버킷명 ...]');
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
const STORAGE = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1`;
const AUTH = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

const DEFAULT_BUCKETS = ['thumbnails', 'proof-images', 'posters', 'avatars', 'company-assets', 'contest-assets'];
const BUCKETS = bucketArgs.length > 0 ? bucketArgs : DEFAULT_BUCKETS;

const LIST_PAGE = 100;
/** 폴더 중첩 상한 — 경로 규칙상 {contestId}/{userId}/{file} 이 최대 깊이다 */
const MAX_DEPTH = 5;

/** 한 폴더의 항목을 페이지네이션으로 모두 나열한다 */
async function listFolder(bucket, prefix) {
  const items = [];
  for (let offset = 0; ; offset += LIST_PAGE) {
    const res = await fetch(`${STORAGE}/object/list/${bucket}`, {
      method: 'POST',
      headers: { ...AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: LIST_PAGE, offset }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`list ${bucket}/${prefix} → ${res.status}`);
    const page = await res.json();
    items.push(...page);
    if (page.length < LIST_PAGE) break;
  }
  return items;
}

/** 버킷 전체를 재귀 탐색해 파일 목록(경로·크기)을 만든다 */
async function collectFiles(bucket, prefix = '', depth = 0) {
  const found = [];
  for (const item of await listFolder(bucket, prefix)) {
    /* id 와 metadata 가 모두 없으면 폴더다 */
    const isFolder = item.id === null && item.metadata === null;
    if (isFolder) {
      if (depth < MAX_DEPTH) found.push(...(await collectFiles(bucket, `${prefix}${item.name}/`, depth + 1)));
    } else {
      found.push({ key: `${prefix}${item.name}`, size: item.metadata?.size ?? 0 });
    }
  }
  return found;
}

async function download(bucket, key, dest) {
  const res = await fetch(`${STORAGE}/object/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`, {
    headers: AUTH,
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

const manifest = { takenAt: new Date().toISOString(), supabaseUrl: SUPABASE_URL, buckets: {} };
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const bucket of BUCKETS) {
  let files;
  try {
    files = await collectFiles(bucket);
  } catch (error) {
    console.log(`  ✗ ${bucket}: ${error.message}`);
    manifest.buckets[bucket] = { error: error.message };
    continue;
  }

  let saved = 0, skipped = 0, failed = 0, bytes = 0;
  for (const file of files) {
    const dest = path.join(OUT_DIR, bucket, ...file.key.split('/'));
    /* 이미 같은 크기로 받아둔 파일은 건너뛴다 (재실행 시 이어받기) */
    if (fs.existsSync(dest) && fs.statSync(dest).size === file.size && file.size > 0) {
      skipped += 1; bytes += file.size;
      continue;
    }
    try {
      await download(bucket, file.key, dest);
      saved += 1; bytes += fs.statSync(dest).size;
    } catch (error) {
      failed += 1;
      console.log(`      ✗ ${bucket}/${file.key} — ${error.message}`);
    }
  }
  manifest.buckets[bucket] = { files: files.length, saved, skipped, failed, sizeMb: +(bytes / 1024 / 1024).toFixed(1) };
  console.log(`  ✓ ${bucket.padEnd(16)} ${String(files.length).padStart(5)}개 (신규 ${saved} / 기존 ${skipped} / 실패 ${failed})  ${(bytes / 1024 / 1024).toFixed(1)}MB`);
}

fs.writeFileSync(path.join(OUT_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

const totals = Object.values(manifest.buckets);
const totalFiles = totals.reduce((s, b) => s + (b.files ?? 0), 0);
const totalMb = totals.reduce((s, b) => s + (b.sizeMb ?? 0), 0);
const totalFailed = totals.reduce((s, b) => s + (b.failed ?? 0), 0);
console.log(`\n총 ${totalFiles}개 · ${totalMb.toFixed(1)}MB → ${OUT_DIR}`);
if (totalFailed > 0) {
  console.log(`실패 ${totalFailed}건 — 다시 실행하면 실패분만 재시도합니다.`);
  process.exit(1);
}
