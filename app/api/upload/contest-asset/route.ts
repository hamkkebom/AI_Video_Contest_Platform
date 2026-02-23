import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** 공모전 에셋 업로드 API (POST) — multipart/form-data
 *  type: 'poster' | 'promo-video' | 'detail-image'
 *  파일을 Supabase Storage에 업로드하고 공개 URL을 반환한다.
 */
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
    const assetType = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (!assetType || !['poster', 'promo-video', 'detail-image'].includes(assetType)) {
      return NextResponse.json({ error: '유효하지 않은 에셋 타입입니다.' }, { status: 400 });
    }

    // 타입별 검증
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    if (assetType === 'poster' || assetType === 'detail-image') {
      // 이미지: 10MB 제한
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: '이미지 파일은 10MB 이하여야 합니다.' }, { status: 400 });
      }
      if (!imageTypes.includes(file.type)) {
        return NextResponse.json({ error: '지원하지 않는 이미지 형식입니다. (JPG, PNG, WebP, GIF)' }, { status: 400 });
      }
    } else if (assetType === 'promo-video') {
      // 영상: 100MB 제한
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json({ error: '영상 파일은 100MB 이하여야 합니다.' }, { status: 400 });
      }
      if (![...videoTypes, ...imageTypes].includes(file.type)) {
        return NextResponse.json({ error: '지원하지 않는 파일 형식입니다.' }, { status: 400 });
      }
    }

    // 버킷 결정: 포스터는 posters 버킷, 나머지는 contest-assets 버킷
    const bucket = assetType === 'poster' ? 'posters' : 'contest-assets';
    const ext = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const filePath = `${assetType}/${user.id}/${timestamp}.${ext}`;

    // Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('에셋 업로드 실패:', uploadError);
      return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 });
    }

    // 공개 URL 생성
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl.publicUrl });
  } catch (error) {
    console.error('에셋 업로드 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
