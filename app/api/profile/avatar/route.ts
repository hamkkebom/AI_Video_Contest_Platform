import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createActivityLog } from '@/lib/data';

/** 아바타 업로드 API (POST) — multipart/form-data */
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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 2MB 이하여야 합니다.' }, { status: 400 });
    }

    // 이미지 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '지원하지 않는 이미지 형식입니다. (JPG, PNG, WebP, GIF)' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/avatar.${ext}`;

    // Storage에 업로드 (덮어쓰기)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('아바타 업로드 실패:', uploadError);
      return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 });
    }

    // 공개 URL 생성
    const { data: publicUrl } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 캐시 방지를 위한 타임스탬프 추가
    const avatarUrl = `${publicUrl.publicUrl}?t=${Date.now()}`;

    // profiles 테이블 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('아바타 URL 업데이트 실패:', updateError);
      return NextResponse.json({ error: '프로필 업데이트에 실패했습니다.' }, { status: 500 });
    }

    // 활동 로그 기록
    await createActivityLog({
      userId: user.id,
      action: 'update_avatar',
      targetType: 'profile',
      targetId: user.id,
    });

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error('아바타 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
