import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

interface CreateSubmissionBody {
  contestId?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  aiTools?: string;
  productionProcess?: string;
}

/** 출품작 생성 API */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateSubmissionBody;

    const contestId = body.contestId?.trim();
    const title = body.title?.trim();
    const description = body.description?.trim();
    const videoUrl = body.videoUrl?.trim();
    const thumbnailUrl = body.thumbnailUrl?.trim();
    const aiTools = body.aiTools?.trim();
    const productionProcess = body.productionProcess?.trim();
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag) => tag.trim()).filter(Boolean)
      : [];

    if (!contestId || !title || !description || !videoUrl || !thumbnailUrl || !productionProcess) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        contest_id: contestId,
        user_id: user.id,
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
        views: 0,
        like_count: 0,
        video_duration: 0,
        avg_watch_duration: 0,
        tags,
        ai_tools: aiTools || null,
        production_process: productionProcess,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('출품작 생성 실패:', error);
      return NextResponse.json({ error: '출품작 생성에 실패했습니다.' }, { status: 500 });
    }

    // 활동 로그 기록
    await createActivityLog({
      userId: user.id,
      action: 'create_submission',
      targetType: 'submission',
      targetId: data.id,
      metadata: { contestId, title: title ?? '', role: 'participant' },
    });

    return NextResponse.json({ submission: { id: data.id } }, { status: 201 });
  } catch (error) {
    console.error('출품작 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
