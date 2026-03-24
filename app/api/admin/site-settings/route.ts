import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// GET: 전체 설정 조회
export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: '서버 오류' }, { status: 500 });

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ settings: data });
}

// PUT: 단일 설정 업데이트
export async function PUT(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: '서버 오류' }, { status: 500 });

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  // 관리자 역할 확인
  const { data: profile } = await supabase.from('profiles').select('roles').eq('id', user.id).maybeSingle();
  if (!profile?.roles?.includes('admin')) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { key, value } = body as { key: string; value: boolean };
  if (!key || typeof value !== 'boolean') {
    return NextResponse.json({ error: 'key(string)와 value(boolean) 필수' }, { status: 400 });
  }

  const { error } = await supabase
    .from('site_settings')
    .update({ value, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('key', key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag('site-settings');
  return NextResponse.json({ success: true });
}
