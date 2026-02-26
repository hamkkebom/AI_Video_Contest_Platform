import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/** 프로필 수정 API (PUT) */
export async function PUT(request: Request) {
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
    const body = await request.json();

    // 허용 필드만 추출
    const updateData: Record<string, unknown> = {};

    if (typeof body.name === 'string') updateData.name = body.name.trim();
    if (typeof body.nickname === 'string') updateData.nickname = body.nickname.trim();
    if (typeof body.phone === 'string') updateData.phone = body.phone.trim() || null;
    if (typeof body.introduction === 'string') updateData.introduction = body.introduction.trim() || null;
    if (typeof body.region === 'string') updateData.region = body.region.trim() || null;

    if (body.socialLinks && typeof body.socialLinks === 'object') {
      updateData.social_links = body.socialLinks;
    }

    if (Array.isArray(body.preferredChatAi)) {
      updateData.preferred_chat_ai = body.preferredChatAi;
    }
    if (Array.isArray(body.preferredImageAi)) {
      updateData.preferred_image_ai = body.preferredImageAi;
    }
    if (Array.isArray(body.preferredVideoAi)) {
      updateData.preferred_video_ai = body.preferredVideoAi;
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      console.error('프로필 수정 실패:', error);
      return NextResponse.json({ error: '프로필 수정에 실패했습니다.' }, { status: 500 });
    }

    // 활동 로그 기록
    await createActivityLog({
      userId: user.id,
      action: 'update_profile',
      targetType: 'profile',
      targetId: user.id,
      metadata: { updatedFields: Object.keys(updateData).filter(k => k !== 'updated_at') },
    });

    // 캐시 무효화
    revalidateTag('users');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('프로필 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
