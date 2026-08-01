import { NextResponse } from 'next/server';
import { getGallerySubmissions } from '@/lib/data';

const PAGE_SIZE = 12;

/**
 * 갤러리 서버 사이드 페이지네이션 API
 * GET /api/gallery?page=1&sort=random&seed=12345&search=keyword&contest=3
 *
 * seed 기반 랜덤: 같은 seed면 같은 순서 → 더보기 시 중복/누락 없음
 *
 * 공모전 필터(contest)는 여러 공모전이 동시에 열리는 구조의 1차 축이다.
 * 예전에는 "최근 N일" 기간 필터가 그 역할을 대신했지만(공모전이 하나뿐이라
 * 시간=공모전이 성립했다), 회차가 겹치면 성립하지 않는다.
 *
 * [캐시 전략]
 * getGallerySubmissions()는 unstable_cache(30초 + gallery/submissions 태그)로 래핑됨.
 * 출품작 추가·변경 시 revalidateTag('gallery')로 즉시 무효화되므로
 * 이 API는 대부분의 요청에서 Supabase DB를 조회하지 않는다.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sort = searchParams.get('sort') || 'random';
  const seed = Number(searchParams.get('seed')) || Date.now();
  const search = searchParams.get('search')?.trim() || '';
  const contest = searchParams.get('contest')?.trim() || '';

  /* 캐시된 전체 갤러리 데이터 조회 — getGallerySubmissions는 approved + is_public=true 필터 포함 */
  const allData = await getGallerySubmissions();

  /* 공모전 필터 */
  let filtered = allData;
  if (contest) {
    filtered = filtered.filter(s => String(s.contestId) === contest);
  }

  /* 검색 필터 (제목·설명·크리에이터명) */
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.creatorName?.toLowerCase().includes(q),
    );
  }

  /* 정렬 */
  if (sort === 'latest') {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  } else if (sort === 'oldest') {
    filtered = [...filtered].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );
  } else {
    /* random — seed 기반 Fisher-Yates 셔플 (결정적: 같은 seed면 같은 순서) */
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };
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

  const items = paged.map(s => ({
    id: String(s.id),
    title: s.title,
    creatorName: s.creatorName,
    thumbnailUrl: s.thumbnailUrl ?? null,
    views: s.views ?? 0,
    likeCount: s.likeCount ?? 0,
    contestId: String(s.contestId),
    contestTitle: s.contestTitle,
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
