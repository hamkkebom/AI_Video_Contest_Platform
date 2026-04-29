import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';

const PAGE_SIZE = 12;

/**
 * 갤러리 서버 사이드 페이지네이션 API
 * GET /api/gallery?page=1&sort=random&seed=12345&search=keyword&period=7
 *
 * seed 기반 랜덤: 같은 seed면 같은 순서 → 더보기 시 중복/누락 없음
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sort = searchParams.get('sort') || 'random';
  const seed = Number(searchParams.get('seed')) || Date.now();
  const search = searchParams.get('search')?.trim() || '';
  const period = Number(searchParams.get('period')) || 0;

  const supabase = createPublicClient();

  /* 승인 + 공개된 출품작 ID + 정렬에 필요한 최소 필드만 조회 */
  let query = supabase
    .from('submissions')
    .select('id, title, description, user_id, thumbnail_url, views, like_count, submitted_at, submitter_name')
    .eq('status', 'approved')
    .eq('is_public', true);

  /* 기간 필터 */
  if (period > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    query = query.gte('submitted_at', cutoff.toISOString());
  }

  /* 정렬 (random은 클라이언트에서 seed 기반 셔플) */
  if (sort === 'oldest') {
    query = query.order('submitted_at', { ascending: true });
  } else if (sort === 'latest') {
    query = query.order('submitted_at', { ascending: false });
  } else {
    /* random — 일단 전체를 가져와서 seed 기반 셔플 */
    query = query.order('id', { ascending: true });
  }

  const { data: allSubmissions, error } = await query;

  if (error || !allSubmissions) {
    return NextResponse.json({ error: '갤러리 데이터를 불러올 수 없습니다.' }, { status: 500 });
  }

  /* 검색 필터 (DB 레벨이 아닌 앱 레벨 — submitterName, creatorName 포함) */
  let filtered = allSubmissions;
  if (search) {
    const q = search.toLowerCase();
    filtered = allSubmissions.filter(s =>
      (s.title as string)?.toLowerCase().includes(q) ||
      (s.description as string)?.toLowerCase().includes(q) ||
      (s.submitter_name as string)?.toLowerCase().includes(q)
    );
  }

  /* seed 기반 랜덤 셔플 (결정적) */
  if (sort === 'random') {
    const seededRandom = (i: number) => {
      let x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };
    /* Fisher-Yates 셔플 with seed */
    const arr = [...filtered];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(i) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    filtered = arr;
  }

  const total = filtered.length;
  const start = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  /* 크리에이터 정보 조회 (현재 페이지 유저만) */
  const userIds = [...new Set(paged.map(s => s.user_id as string))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nickname, name')
    .in('id', userIds);

  const profileMap = new Map(
    (profiles ?? []).map(p => [p.id as string, (p.nickname as string) || (p.name as string) || '익명'])
  );

  const items = paged.map(s => ({
    id: String(s.id),
    title: s.title as string,
    creatorName: profileMap.get(s.user_id as string) ?? '익명',
    thumbnailUrl: s.thumbnail_url as string | null,
    views: (s.views as number) ?? 0,
    likeCount: (s.like_count as number) ?? 0,
  }));

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    hasMore: start + PAGE_SIZE < total,
    seed,
  });
}
