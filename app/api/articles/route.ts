import { NextResponse } from 'next/server';
import { createArticle, createActivityLog, getArticles } from '@/lib/data';
import type { ArticleMutationInput, ArticleType } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { ARTICLE_TYPES } from '@/config/constants';

const ALLOWED_TYPES = ARTICLE_TYPES.map((t) => t.value) as ReadonlyArray<ArticleType>;

/** 아티클 목록 API */
export async function GET() {
  try {
    const data = await getArticles();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/** 관리자 아티클 생성 API */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  /* 1) 인증 확인 */
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  /* 2) 관리자 권한 확인 */
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  const roles = Array.isArray(profile?.roles) ? profile.roles : [];
  if (!roles.includes('admin')) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<ArticleMutationInput>;

    /* 3) 입력 검증 */
    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
    }
    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json({ error: '본문을 입력해주세요.' }, { status: 400 });
    }
    if (!body.type || !ALLOWED_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: `유효하지 않은 유형입니다. 허용: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    const input: ArticleMutationInput = {
      type: body.type,
      title: body.title.trim(),
      excerpt: typeof body.excerpt === 'string' ? body.excerpt : undefined,
      content: body.content,
      tags: Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === 'string') : [],
      isPublished: !!body.isPublished,
      thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : undefined,
    };

    /* 4) 생성 */
    const article = await createArticle(input, user.id);
    if (!article) {
      return NextResponse.json({ error: '아티클 생성에 실패했습니다.' }, { status: 500 });
    }

    /* 5) 활동 로그 */
    createActivityLog({
      userId: user.id,
      action: 'create_article',
      targetType: 'article',
      targetId: article.id,
      metadata: { title: article.title, type: article.type, isPublished: article.isPublished },
    }).catch(console.error);

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/articles] 실패:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: '아티클 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 },
    );
  }
}
