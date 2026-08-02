import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getArticleByIdForAdmin, updateArticle } from '@/lib/data';
import type { ArticleMutationInput, ArticleType } from '@/lib/types';

/** 관리자 확인 — 통과 시 null, 실패 시 에러 응답 */
async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.roles?.includes('admin')) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }
  return null;
}

/**
 * 아티클 발행 상태 변경 (PATCH /api/admin/articles/[id])
 * 목록의 발행/비공개 토글이 여기로 온다. 쓰기 허용은 마이그레이션 050 이 연다.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const denied = await requireAdmin(supabase);
  if (denied) return denied;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  if (typeof body.isPublished !== 'boolean') {
    return NextResponse.json({ error: 'isPublished 는 boolean 이어야 합니다.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('articles')
    .update({ is_published: body.isPublished })
    .eq('id', Number(id))
    .select('id');

  if (error) {
    console.error('[admin/articles] 발행 상태 변경 실패:', error);
    return NextResponse.json({ error: '변경에 실패했습니다.' }, { status: 500 });
  }
  /* RLS 가 막으면 에러 없이 0행이 돌아온다 — 조용한 실패를 그대로 통과시키지 않는다 */
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: '변경 권한이 없거나 아티클을 찾을 수 없습니다. (마이그레이션 050 적용 여부 확인)' },
      { status: 403 },
    );
  }

  revalidateTag('articles');
  return NextResponse.json({ ok: true });
}

/** 아티클 삭제 (DELETE /api/admin/articles/[id]) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const denied = await requireAdmin(supabase);
  if (denied) return denied;

  const { id } = await params;
  const { data, error } = await supabase
    .from('articles')
    .delete()
    .eq('id', Number(id))
    .select('id');

  if (error) {
    console.error('[admin/articles] 삭제 실패:', error);
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: '삭제 권한이 없거나 아티클을 찾을 수 없습니다. (마이그레이션 050 적용 여부 확인)' },
      { status: 403 },
    );
  }

  revalidateTag('articles');
  return NextResponse.json({ ok: true });
}

/** articles.type CHECK 제약과 같은 값 */
const ARTICLE_TYPES_ALLOWED = ['notice', 'program', 'insight'] as const;

/**
 * 아티클 전체 수정 (PUT /api/admin/articles/[id])
 * slug 는 바꾸지 않는다 — 이미 공유된 /story/[slug] 링크를 지키기 위해서다.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const denied = await requireAdmin(supabase);
  if (denied) return denied;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const type = typeof body.type === 'string' ? body.type : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';

  if (!ARTICLE_TYPES_ALLOWED.includes(type as (typeof ARTICLE_TYPES_ALLOWED)[number])) {
    return NextResponse.json({ error: '허용되지 않는 유형입니다.' }, { status: 400 });
  }
  if (!title) return NextResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
  if (!content.trim()) return NextResponse.json({ error: '본문은 필수입니다.' }, { status: 400 });

  /* 처음 발행되는 순간에만 published_at 을 찍기 위해 이전 상태가 필요하다 */
  const existing = await getArticleByIdForAdmin(id);
  if (!existing) {
    return NextResponse.json({ error: '아티클을 찾을 수 없습니다.' }, { status: 404 });
  }

  const input: ArticleMutationInput = {
    type: type as ArticleType,
    title,
    excerpt: typeof body.excerpt === 'string' ? body.excerpt : undefined,
    content,
    tags: Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string') : [],
    isPublished: Boolean(body.isPublished),
    thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : undefined,
  };

  const article = await updateArticle(id, input, Boolean(existing.isPublished));
  if (!article) {
    return NextResponse.json(
      { error: '수정에 실패했습니다. 권한 또는 마이그레이션 050 적용 여부를 확인하세요.' },
      { status: 403 },
    );
  }

  revalidateTag('articles');
  return NextResponse.json({ article });
}
