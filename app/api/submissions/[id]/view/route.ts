import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { extractClientIp, hashForAntiAbuse } from '@/lib/utils';

/**
 * 조회수 기록 API
 * POST /api/submissions/[id]/view
 *
 * 인증 불필요 (비로그인도 조회 가능).
 * RPC(rpc_record_view)가 레이트리밋, 30분 버킷 중복제거, 카운터 증가, 스파이크 감지를 원자적으로 처리.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const submissionId = parseInt(id, 10);
  if (isNaN(submissionId)) {
    return NextResponse.json({ error: '유효하지 않은 출품작 ID입니다.' }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase가 설정되지 않았습니다.' }, { status: 500 });
  }

  // IP + UA 해시
  const headers = request.headers;
  const clientIp = extractClientIp(headers);
  const userAgent = headers.get('user-agent') ?? '';

  // 봇 기본 감지: UA가 비어있거나 명백한 봇
  if (!userAgent || /bot|crawler|spider|curl|wget|python|http/i.test(userAgent)) {
    return NextResponse.json({ counted: false, reason: 'BOT_DETECTED' });
  }

  const ipHash = clientIp ? await hashForAntiAbuse(clientIp) : null;
  const uaHash = await hashForAntiAbuse(userAgent);

  // RPC 호출 — DB에서 원자적 처리
  const { data, error } = await supabase.rpc('rpc_record_view', {
    p_submission_id: submissionId,
    p_ip_hash: ipHash,
    p_user_agent_hash: uaHash,
  });

  if (error) {
    console.error('[POST /api/submissions/[id]/view] RPC 실패:', error.message);
    return NextResponse.json({ counted: false, reason: 'SERVER_ERROR' });
  }

  const result = data as { counted?: boolean; totalViews?: number; reason?: string };

  if (result.counted) {
    revalidateTag('submissions');
    revalidateTag('gallery');
  }

  return NextResponse.json({
    counted: result.counted ?? false,
    totalViews: result.totalViews ?? 0,
  });
}
