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
    { url: `${BASE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/support`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/support/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/support/inquiry`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/support/agency`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // --- 동적 페이지 (Supabase 조회) ---
  const supabase = createPublicClient();

  // 공모전
  const { data: contests } = await supabase
    .from('contests')
    .select('id, updated_at')
    .order('created_at', { ascending: false });

  const contestRoutes: MetadataRoute.Sitemap = (contests ?? []).flatMap((c) => [
    {
      url: `${BASE_URL}/contests/${c.id}`,
      lastModified: c.updated_at ? new Date(c.updated_at as string) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contests/${c.id}/landing`,
      lastModified: c.updated_at ? new Date(c.updated_at as string) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]);

  // 수상작 (공모전별)
  const awardRoutes: MetadataRoute.Sitemap = (contests ?? []).map((c) => ({
    url: `${BASE_URL}/gallery/awards/${c.id}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 갤러리 (승인된 출품작)
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, submitted_at')
    .eq('status', 'approved')
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

  return [...staticRoutes, ...contestRoutes, ...awardRoutes, ...galleryRoutes, ...storyRoutes, ...creatorRoutes];
}
