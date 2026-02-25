/**
 * 🔍 영상 제출 문제 진단 스크립트
 * 운영 Supabase DB를 REST API로 직접 조회
 *
 * 사용법: node scripts/debug-submissions.mjs
 */

// ===== 운영 환경 설정 (vercel-check에서 가져옴) =====
const SUPABASE_URL = 'https://oyssfmocdihzqdsvysdi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3ikij0gzLRHAtmI-bdHyYg_eZQSNBd_';

const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
};

async function query(table, params = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
        console.error(`❌ ${table} 조회 실패:`, res.status, await res.text());
        return [];
    }
    return res.json();
}

function divider(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`  ${title}`);
    console.log('='.repeat(60));
}

async function main() {
    console.log('🔍 운영 서버 DB 제출 현황 진단 시작...\n');
    console.log(`📡 Supabase: ${SUPABASE_URL}`);
    console.log(`⏰ 조회 시각: ${new Date().toLocaleString('ko-KR')}\n`);

    // ---- 1. 프로필 전체 목록 ----
    divider('1️⃣  전체 프로필 목록');
    const profiles = await query('profiles', 'select=id,email,name,created_at&order=created_at.desc');
    if (profiles.length === 0) {
        console.log('⚠️  프로필이 없습니다.');
    } else {
        console.log(`총 ${profiles.length}명 가입\n`);
        profiles.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name || '(이름없음)'} | ${p.email || '(이메일없음)'}`);
            console.log(`     ID: ${p.id}`);
            console.log(`     가입일: ${new Date(p.created_at).toLocaleString('ko-KR')}`);
        });
    }

    // ---- 2. 공모전 목록 + 제출 제한 ----
    divider('2️⃣  공모전 현황');
    const contests = await query('contests', 'select=id,title,status,max_submissions_per_user,submission_start_at,submission_end_at');
    if (contests.length === 0) {
        console.log('⚠️  공모전이 없습니다.');
    } else {
        contests.forEach(c => {
            const now = new Date();
            const start = new Date(c.submission_start_at);
            const end = new Date(c.submission_end_at);
            const accepting = c.status === 'open' && now >= start && now <= end;
            console.log(`\n  📌 [${c.id}] ${c.title}`);
            console.log(`     상태: ${c.status} | 최대 제출: ${c.max_submissions_per_user}개/인`);
            console.log(`     접수: ${start.toLocaleDateString('ko-KR')} ~ ${end.toLocaleDateString('ko-KR')}`);
            console.log(`     현재 접수 가능: ${accepting ? '✅ 예' : '❌ 아니오'}`);
        });
    }

    // ---- 3. 제출물 전체 목록 ----
    divider('3️⃣  전체 제출물 목록');
    const submissions = await query('submissions', 'select=id,contest_id,user_id,title,status,submitted_at,video_url,thumbnail_url,ai_tools&order=submitted_at.desc');
    if (submissions.length === 0) {
        console.log('⚠️  제출물이 없습니다.');
    } else {
        console.log(`총 ${submissions.length}개 제출\n`);
        // 프로필 매핑
        const profileMap = {};
        profiles.forEach(p => { profileMap[p.id] = p; });

        submissions.forEach((s, i) => {
            const profile = profileMap[s.user_id];
            const name = profile?.name || '(프로필없음)';
            const email = profile?.email || '';
            console.log(`  ${i + 1}. "${s.title}" — ${name} (${email})`);
            console.log(`     제출ID: ${s.id} | 공모전ID: ${s.contest_id} | 상태: ${s.status}`);
            console.log(`     제출일: ${new Date(s.submitted_at).toLocaleString('ko-KR')}`);
            console.log(`     영상: ${s.video_url ? '✅' : '❌없음'} | 썸네일: ${s.thumbnail_url ? '✅' : '❌없음'}`);
            if (s.ai_tools) console.log(`     AI도구: ${s.ai_tools}`);
        });
    }

    // ---- 4. 유저별 제출 수 vs 최대 제출 가능 수 체크 ----
    divider('4️⃣  유저별 제출 가능 여부');
    const contestMap = {};
    contests.forEach(c => { contestMap[c.id] = c; });
    const profileMap2 = {};
    profiles.forEach(p => { profileMap2[p.id] = p; });

    // 유저+공모전 조합별 제출 수 계산
    const userContestCount = {};
    submissions.forEach(s => {
        const key = `${s.user_id}__${s.contest_id}`;
        userContestCount[key] = (userContestCount[key] || 0) + 1;
    });

    let blockedFound = false;
    for (const [key, count] of Object.entries(userContestCount)) {
        const [userId, contestId] = key.split('__');
        const contest = contestMap[Number(contestId)] || contestMap[contestId];
        const max = contest?.max_submissions_per_user ?? 1;
        const profile = profileMap2[userId];
        if (count >= max) {
            blockedFound = true;
            console.log(`\n  🚫 ${profile?.name || userId} (${profile?.email || ''})`);
            console.log(`     공모전: ${contest?.title || contestId}`);
            console.log(`     현재 ${count}개 제출 / 최대 ${max}개 → 추가 제출 불가!`);
        }
    }
    if (!blockedFound) {
        console.log('  ✅ 최대 출품 수를 초과한 유저가 없습니다.');
    }

    // ---- 5. 가입했지만 제출하지 않은 유저 ----
    divider('5️⃣  가입했지만 제출하지 않은 유저');
    const submittedUserIds = new Set(submissions.map(s => s.user_id));
    const notSubmitted = profiles.filter(p => !submittedUserIds.has(p.id));
    if (notSubmitted.length === 0) {
        console.log('  ✅ 모든 가입자가 제출했습니다.');
    } else {
        console.log(`  ${notSubmitted.length}명이 아직 미제출\n`);
        notSubmitted.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name || '(이름없음)'} | ${p.email || '(이메일없음)'}`);
            console.log(`     ID: ${p.id}`);
            console.log(`     가입일: ${new Date(p.created_at).toLocaleString('ko-KR')}`);
        });
    }

    // ---- 6. 활동 로그 (업로드/제출 시도 기록) ----
    divider('6️⃣  최근 활동 로그 (업로드/제출 시도)');
    const logs = await query(
        'activity_logs',
        'select=id,user_id,action,target_type,target_id,metadata,created_at&order=created_at.desc&limit=30'
    );
    if (logs.length === 0) {
        console.log('  ⚠️  활동 로그가 없거나 접근이 제한되었습니다.');
    } else {
        const uploadLogs = logs.filter(l =>
            l.action === 'upload_video' || l.action === 'create_submission'
        );
        if (uploadLogs.length === 0) {
            console.log('  ⚠️  업로드/제출 관련 로그가 없습니다.');
            console.log(`  (전체 로그 ${logs.length}건 중 다른 액션만 있음)`);
        } else {
            console.log(`  제출 관련 로그 ${uploadLogs.length}건\n`);
            uploadLogs.forEach((l, i) => {
                const profile = profileMap2[l.user_id];
                const emoji = l.action === 'upload_video' ? '📹' : '📝';
                console.log(`  ${i + 1}. ${emoji} ${l.action} — ${profile?.name || l.user_id}`);
                console.log(`     시각: ${new Date(l.created_at).toLocaleString('ko-KR')}`);
                if (l.metadata) console.log(`     메타: ${JSON.stringify(l.metadata)}`);
            });
        }
    }

    divider('✅ 진단 완료');
    console.log('\n💡 위 결과를 보고:');
    console.log('   - 5️⃣에서 미제출자 중 문제 유저가 있는지 확인');
    console.log('   - 4️⃣에서 이미 최대 제출 수를 초과한 건 아닌지 확인');
    console.log('   - 6️⃣에서 업로드 시도는 했는데 제출 완료가 안 된 건 아닌지 확인\n');
}

main().catch(err => {
    console.error('❌ 스크립트 실행 오류:', err);
    process.exit(1);
});
