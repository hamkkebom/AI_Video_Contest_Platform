import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aikkumhub.com';

/**
 * Next.js 동적 사이트맵
 * 정적 페이지 + Supabase에서 조회한 동적 페이지(공모전, 갤러리, 스토리)를 포함합니다.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // --- 정적 페이지 ---
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/contests`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/gallery`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/gallery/all`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/gallery/awards`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/creators`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/story`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/search`, changeFrequency: 'weekly', priority: 0.5 },
    /* /pricing은 수익화 동결(D-005) 상태 — 내비 미연결 페이지를 검색엔진에만 광고하지 않는다 (IA.md §5) */
    { url: `${BASE_URL}/support`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/support/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/support/inquiry`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/support/agency`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // --- 동적 페이지 (Supabase 조회) ---
  const supabase = createPublicClient();

  /* 공모전 — 미공개 초안(draft)은 제외한다.
     공개 목록에서 빼면서 sitemap 에는 남겨두면 "내비와 sitemap 양쪽에서 뺀다"는
     원칙(docs/IA.md §1-2)이 반쪽이 된다. */
  const { data: contests } = await supabase
    .from('contests')
    .select('id, updated_at, status')
    .neq('status', 'draft')
    .order('created_at', { ascending: false });

  /* landing 은 상세와 같은 공모전을 다루는 마케팅용 보조 진입점이라 sitemap 에 넣지 않는다.
     정본은 /contests/[id] 이고 landing 은 canonical 로 상세를 가리킨다 (SEO 중복 해소) */
  const contestRoutes: MetadataRoute.Sitemap = (contests ?? []).map((c) => ({
    url: `${BASE_URL}/contests/${c.id}`,
    lastModified: c.updated_at ? new Date(c.updated_at as string) : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  /* 수상작 — 결과가 나온 공모전만 (접수중·심사중은 수상작 페이지가 비어 있다) */
  const awardRoutes: MetadataRoute.Sitemap = (contests ?? [])
    .filter((c) => c.status === 'completed' || c.status === 'closed')
    .map((c) => ({
      url: `${BASE_URL}/gallery/awards/${c.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  // 갤러리 (승인 + 공개된 출품작 — 비공개는 SEO에서도 제외)
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, submitted_at')
    .eq('status', 'approved')
    .eq('is_public', true)
    .order('submitted_at', { ascending: false })
    .limit(1000);

  const galleryRoutes: MetadataRoute.Sitemap = (submissions ?? []).map((s) => ({
    url: `${BASE_URL}/gallery/${s.id}`,
    lastModified: s.submitted_at ? new Date(s.submitted_at as string) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 스토리 (게시된 아티클)
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const storyRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/story/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at as string) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 크리에이터 (활성 사용자)
  const { data: creators } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .contains('roles', ['participant'])
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(500);

  const creatorRoutes: MetadataRoute.Sitemap = (creators ?? []).map((u) => ({
    url: `${BASE_URL}/creators/${u.id}`,
    lastModified: u.updated_at ? new Date(u.updated_at as string) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // 주최자 (승인된 기업만 — public_companies 뷰가 status 조건을 담고 있다)
  const { data: hosts } = await supabase
    .from('public_companies')
    .select('id');

  const hostRoutes: MetadataRoute.Sitemap = (hosts ?? []).map((h) => ({
    url: `${BASE_URL}/hosts/${h.id}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...contestRoutes, ...awardRoutes, ...galleryRoutes, ...storyRoutes, ...creatorRoutes, ...hostRoutes];
}
