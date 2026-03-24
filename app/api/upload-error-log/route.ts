import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 업로드 에러 로그 API
 * 클라이언트에서 업로드 실패 시 에러 정보를 기록
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase 미설정' }, { status: 500 });
  }

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  try {
    const body = await request.json();
    const {
      step,        // 'preparing' | 'video' | 'thumbnail' | 'proof-images' | 'submission'
      errorMessage,
      errorCode,
      details,     // any extra info (xhr status, response text, etc.)
    } = body;

    const logEntry = {
      user_id: user?.id ?? null,
      action: 'upload_error',
      target_type: step ?? 'unknown',
      target_id: null,
      details: JSON.stringify({
        errorMessage,
        errorCode,
        details,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      }),
    };

    // activity_logs 테이블에 기록
    const { error } = await supabase.from('activity_logs').insert(logEntry);
    if (error) {
      console.error('[upload-error-log] DB 기록 실패:', error.message);
    } else {
      console.error('[upload-error-log]', step, errorMessage, errorCode, details);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[upload-error-log] 처리 실패:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
