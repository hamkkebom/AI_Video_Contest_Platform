import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 범용 활동 로그 기록 API
 * POST /api/log
 * Body: { action, targetType?, targetId?, metadata? }
 *
 * action 종류:
 * - login: 로그인 (이메일/Google)
 * - logout: 본인 의지 로그아웃
 * - session_out: 세션 만료 또는 브라우저 닫기로 인한 로그아웃
 * - create_submission, create_contest, update_contest, delete_contest 등
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'DB 연결 실패' }, { status: 500 });
    }

    // sendBeacon 요청은 Content-Type이 text/plain일 수 있음
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      // sendBeacon Blob 파싱 실패 시
      const text = await request.text();
      body = JSON.parse(text);
    }

    const { action, targetType, targetId, metadata } = body;

    if (!action) {
      return NextResponse.json({ error: 'action은 필수입니다' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    // 인증된 사용자가 있으면 정상 기록
    if (user) {
      const { error: logError } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: action as string,
        target_type: (targetType as string) ?? '',
        target_id: (targetId as string) ?? '',
        metadata: (metadata as Record<string, unknown>) ?? null,
      });

      if (logError) {
        console.error('활동 로그 기록 실패:', logError.message);
      }

      // IP 로그도 함께 기록
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
        ?? 'unknown';
      const userAgent = request.headers.get('user-agent') ?? '';

      await supabase.from('ip_logs').insert({
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
        country: null,
        region: null,
        risk_level: 'low',
      });

      return NextResponse.json({ success: true });
    }

    // 비인증 상태에서 session_out은 기록 허용 (세션 만료 후 sendBeacon으로 옴)
    if (action === 'session_out') {
      // 유저 ID를 알 수 없으므로 IP/UA만 기록
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
        ?? 'unknown';
      const userAgent = request.headers.get('user-agent') ?? '';

      await supabase.from('activity_logs').insert({
        user_id: null,
        action: 'session_out',
        target_type: '',
        target_id: '',
        metadata: {
          ...(metadata as Record<string, unknown> ?? {}),
          ip_address: ip,
          user_agent: userAgent,
        },
      });

      return NextResponse.json({ success: true });
    }

    // 그 외 비인증 요청은 거부
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
