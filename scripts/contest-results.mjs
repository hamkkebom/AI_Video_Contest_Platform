/**
 * 공모전 수상 결과 등록 — 외부에서 확정된 결과를 플랫폼에 반영한다.
 *
 * 심사를 시스템 밖(엑셀 등)에서 진행한 경우, calculate-results API 는 쓸 수 없다.
 * (그 API 는 scores 테이블의 채점 기록으로 순위를 계산하는데 기록이 없다.)
 * 이 스크립트는 확정된 수상자 명단을 CSV 로 받아 contest_results 에 등록한다.
 *
 * ⚠️ 실수로 잘못 등록하면 참가자에게 그대로 노출된다.
 *    apply 는 반드시 check 로 매칭 결과를 눈으로 확인한 뒤 실행할 것.
 *
 * 사용법:
 *   1) 템플릿 생성 — 승인된 출품작 목록을 CSV 로 뽑는다
 *      node scripts/contest-results.mjs template <공모전ID> <출력.csv>
 *
 *   2) CSV 의 prize_label / rank 열을 채운다 (빈 행은 무시된다)
 *      prize_label 은 공모전에 등록된 수상 등급명과 정확히 일치해야 한다
 *
 *   3) 검증 — 무엇이 등록될지 확인만 한다 (DB 변경 없음)
 *      node scripts/contest-results.mjs check <공모전ID> <입력.csv>
 *
 *   4) 등록 — 실제로 반영한다
 *      node scripts/contest-results.mjs apply <공모전ID> <입력.csv>
 *
 *   5) 발표 — 수상작 페이지에 공개한다 (되돌리려면 unpublish)
 *      node scripts/contest-results.mjs publish <공모전ID>
 *      node scripts/contest-results.mjs unpublish <공모전ID>
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const [MODE, CONTEST_ID, FILE] = process.argv.slice(2);
const MODES = ['template', 'check', 'apply', 'publish', 'unpublish'];
if (!MODES.includes(MODE) || !CONTEST_ID) {
  console.error(`사용법: node scripts/contest-results.mjs <${MODES.join('|')}> <공모전ID> [CSV경로]`);
  process.exit(1);
}
if (['template', 'check', 'apply'].includes(MODE) && !FILE) {
  console.error('CSV 경로가 필요합니다.');
  process.exit(1);
}

const ENV_PATH = path.resolve(process.cwd(), '.env.local');
const env = fs.readFileSync(ENV_PATH, 'utf8');
const readEnv = (k) => (env.match(new RegExp(`^${k}=(.+)$`, 'm')) ?? [])[1]?.trim();
const SUPABASE_URL = readEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = readEnv('SUPABASE_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 필요합니다.');
  process.exit(1);
}
const REST = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;
const HEAD = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

async function api(pathname, init = {}) {
  const res = await fetch(`${REST}${pathname}`, {
    ...init,
    headers: { ...HEAD, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

/** 큰따옴표 이스케이프를 포함한 최소 CSV 파서 */
function parseCsv(raw) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length > 0) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.some((v) => v.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/* ── 공통 조회 ── */
async function loadContext() {
  const [contest] = await api(`/contests?select=id,title,results_published&id=eq.${CONTEST_ID}`);
  if (!contest) throw new Error(`공모전 ${CONTEST_ID} 을 찾을 수 없습니다.`);
  const tiers = await api(`/contest_award_tiers?select=label,count,sort_order&contest_id=eq.${CONTEST_ID}&order=sort_order.asc`);
  return { contest, tiers };
}

if (MODE === 'template') {
  const { contest, tiers } = await loadContext();
  const subs = await api(
    `/submissions?select=id,title,submitter_name,like_count,views,submitted_at&contest_id=eq.${CONTEST_ID}&status=eq.approved&order=id.asc`,
  );
  const header = ['submission_id', 'title', 'submitter_name', 'like_count', 'views', 'prize_label', 'rank'];
  const lines = [header.join(',')];
  for (const s of subs) {
    lines.push([s.id, s.title, s.submitter_name ?? '', s.like_count ?? 0, s.views ?? 0, '', ''].map(csvCell).join(','));
  }
  fs.mkdirSync(path.dirname(path.resolve(FILE)), { recursive: true });
  fs.writeFileSync(FILE, '﻿' + lines.join('\n'), 'utf8');
  console.log(`템플릿 생성: ${FILE}`);
  console.log(`  공모전: ${contest.title}`);
  console.log(`  승인 출품작 ${subs.length}건`);
  console.log(`\n  prize_label 에 쓸 수 있는 값 (정확히 일치해야 함):`);
  for (const t of tiers) console.log(`    ${t.label} (정원 ${t.count}명)`);
  console.log(`\n  수상하지 않은 행은 prize_label 을 비워두면 됩니다.`);
  process.exit(0);
}

if (MODE === 'publish' || MODE === 'unpublish') {
  const { contest } = await loadContext();
  const publish = MODE === 'publish';
  if (publish) {
    const existing = await api(`/contest_results?select=id&contest_id=eq.${CONTEST_ID}`);
    if (existing.length === 0) {
      console.error('등록된 수상 결과가 없습니다. apply 를 먼저 실행하세요.');
      process.exit(1);
    }
    console.log(`수상 결과 ${existing.length}건 확인됨`);
  }
  await api(`/contests?id=eq.${CONTEST_ID}`, {
    method: 'PATCH',
    body: JSON.stringify({ results_published: publish }),
  });
  console.log(`${contest.title} → results_published = ${publish}`);
  console.log(publish ? '수상작 페이지에 공개되었습니다.' : '공개가 취소되었습니다.');
  process.exit(0);
}

/* ── check / apply 공통: CSV 검증 ── */
const { contest, tiers } = await loadContext();
const rows = parseCsv(fs.readFileSync(FILE, 'utf8'));
const winners = rows.filter((r) => r.prize_label);

const approved = await api(
  `/submissions?select=id,title,submitter_name&contest_id=eq.${CONTEST_ID}&status=eq.approved`,
);
const approvedById = new Map(approved.map((s) => [String(s.id), s]));
const tierByLabel = new Map(tiers.map((t) => [t.label, t]));

const errors = [];
const parsed = [];
const seen = new Set();

for (const [i, r] of winners.entries()) {
  const line = i + 2;
  const id = String(r.submission_id ?? '').trim();
  const sub = approvedById.get(id);
  if (!sub) { errors.push(`${line}행: submission_id "${id}" 가 이 공모전의 승인 출품작에 없습니다`); continue; }
  if (seen.has(id)) { errors.push(`${line}행: submission_id ${id} 중복`); continue; }
  seen.add(id);
  if (!tierByLabel.has(r.prize_label)) {
    errors.push(`${line}행: prize_label "${r.prize_label}" 이 등록된 수상 등급이 아닙니다 (${[...tierByLabel.keys()].join(' / ')})`);
    continue;
  }
  const rank = Number(r.rank);
  if (!Number.isInteger(rank) || rank < 1) { errors.push(`${line}행: rank 는 1 이상의 정수여야 합니다 (입력: "${r.rank}")`); continue; }
  parsed.push({ contest_id: Number(CONTEST_ID), submission_id: Number(id), rank, prize_label: r.prize_label, _title: sub.title, _who: sub.submitter_name });
}

/* 등급별 정원 초과 검사 */
const byLabel = new Map();
for (const p of parsed) byLabel.set(p.prize_label, (byLabel.get(p.prize_label) ?? 0) + 1);
for (const [label, n] of byLabel) {
  const tier = tierByLabel.get(label);
  if (tier && n > tier.count) errors.push(`"${label}" 정원 초과: 정원 ${tier.count}명, 입력 ${n}명`);
}
/* rank 중복 검사 */
const rankSeen = new Map();
for (const p of parsed) {
  if (rankSeen.has(p.rank)) errors.push(`rank ${p.rank} 중복: ${rankSeen.get(p.rank)} / ${p._title}`);
  rankSeen.set(p.rank, p._title);
}

console.log(`공모전: ${contest.title} (현재 발표 상태: ${contest.results_published})`);
console.log(`CSV 행 ${rows.length}개 중 수상 지정 ${winners.length}건 → 검증 통과 ${parsed.length}건\n`);
for (const [label, n] of byLabel) {
  const tier = tierByLabel.get(label);
  console.log(`  ${label.padEnd(10)} ${n}명 / 정원 ${tier?.count ?? '?'}명`);
}
console.log();
for (const p of [...parsed].sort((a, b) => a.rank - b.rank).slice(0, 15)) {
  console.log(`  ${String(p.rank).padStart(3)}위  ${p.prize_label.padEnd(10)} ${(p._title ?? '').slice(0, 30).padEnd(32)} ${p._who ?? ''}`);
}
if (parsed.length > 15) console.log(`  ... 외 ${parsed.length - 15}건`);

if (errors.length > 0) {
  console.log(`\n❌ 오류 ${errors.length}건 — 수정 후 다시 실행하세요:`);
  for (const e of errors) console.log(`  · ${e}`);
  process.exit(1);
}

if (MODE === 'check') {
  console.log('\n✅ 검증 통과. 실제 등록하려면 apply 로 다시 실행하세요.');
  process.exit(0);
}

/* ── apply ── */
const existing = await api(`/contest_results?select=id&contest_id=eq.${CONTEST_ID}`);
if (existing.length > 0) {
  console.log(`\n기존 결과 ${existing.length}건을 삭제하고 다시 등록합니다.`);
  await api(`/contest_results?contest_id=eq.${CONTEST_ID}`, { method: 'DELETE' });
}
const payload = parsed.map(({ _title, _who, ...keep }) => keep);
await api('/contest_results', { method: 'POST', body: JSON.stringify(payload) });
console.log(`\n✅ 수상 결과 ${payload.length}건 등록 완료.`);
console.log('   아직 공개되지 않았습니다. 확인 후 publish 를 실행하세요:');
console.log(`   node scripts/contest-results.mjs publish ${CONTEST_ID}`);
