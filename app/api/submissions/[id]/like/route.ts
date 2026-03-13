import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { extractClientIp, hashForAntiAbuse } from '@/lib/utils';

/**
 * 좋아요 토글 API
 * POST /api/submissions/[id]/like
 *
 * 인증 필수. RPC(rpc_toggle_like)가 레이트리밋, 토글, 감사로그, 다계정 감지를 원자적으로 처리.
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

  // 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.', code: 'AUTH_REQUIRED' }, { status: 401 });
  }

  // IP + UA 해시
  const headers = request.headers;
  const clientIp = extractClientIp(headers);
  const userAgent = headers.get('user-agent') ?? '';

  // 봇 기본 감지: UA가 비어있거나 명백한 봇
  if (!userAgent || /bot|crawler|spider|curl|wget|python|http/i.test(userAgent)) {
    return NextResponse.json({ error: '요청이 거부되었습니다.' }, { status: 403 });
  }

  const ipHash = clientIp ? await hashForAntiAbuse(clientIp) : null;
  const uaHash = await hashForAntiAbuse(userAgent);

  // RPC 호출 — DB에서 원자적 처리
  const { data, error } = await supabase.rpc('rpc_toggle_like', {
    p_submission_id: submissionId,
    p_ip_hash: ipHash,
    p_user_agent_hash: uaHash,
  });

  if (error) {
    console.error('[POST /api/submissions/[id]/like] RPC 실패:', error.message);
    return NextResponse.json({ error: '좋아요 처리에 실패했습니다.' }, { status: 500 });
  }

  // RPC 내부 에러 (레이트리밋 등)
  const result = data as { error?: string; message?: string; liked?: boolean; totalLikes?: number };
  if (result.error) {
    const statusMap: Record<string, number> = {
      AUTH_REQUIRED: 401,
      RATE_LIMITED: 429,
    };
    return NextResponse.json(
      { error: result.message, code: result.error },
      { status: statusMap[result.error] ?? 400 },
    );
  }

  // 캐시 무효화
  revalidateTag('submissions');

  return NextResponse.json({
    liked: result.liked,
    totalLikes: result.totalLikes,
  });
}
