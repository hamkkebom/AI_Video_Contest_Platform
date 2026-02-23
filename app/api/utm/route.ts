import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * UTM 방문 기록 API
 * POST /api/utm
 * Body: { sessionId?, utmSource?, utmMedium?, utmCampaign?, utmTerm?, utmContent?, referrer?, landingPage? }
 * 
 * 비로그인 사용자도 기록 가능 (RLS: utm_insert_anyone)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'DB 연결 실패' }, { status: 500 });
    }

    const body = await request.json();
    const {
      sessionId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      referrer,
      landingPage,
    } = body;

    // UTM 파라미터가 하나도 없고 referrer도 없으면 기록하지 않음
    if (!utmSource && !utmMedium && !utmCampaign && !referrer) {
      return NextResponse.json({ success: false, reason: 'UTM 파라미터 없음' });
    }

    // 현재 로그인 사용자 확인 (선택)
    const { data: { user } } = await supabase.auth.getUser();

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';
    const userAgent = request.headers.get('user-agent') ?? '';

    const { error } = await supabase.from('utm_visits').insert({
      session_id: sessionId ?? null,
      user_id: user?.id ?? null,
      utm_source: utmSource ?? null,
      utm_medium: utmMedium ?? null,
      utm_campaign: utmCampaign ?? null,
      utm_term: utmTerm ?? null,
      utm_content: utmContent ?? null,
      referrer: referrer ?? null,
      landing_page: landingPage ?? null,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (error) {
      console.error('UTM 기록 실패:', error.message);
      return NextResponse.json({ error: 'UTM 기록 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
