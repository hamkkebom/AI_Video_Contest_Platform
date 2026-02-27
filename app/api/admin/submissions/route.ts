import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createActivityLog } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

interface BonusEntryBody {
  bonusConfigId: string;
  snsUrl?: string;
  proofImageUrl?: string;
}

interface AdminCreateSubmissionBody {
  contestId?: string;
  userId?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  submittedAt?: string;
  aiTools?: string;
  productionProcess?: string;
  tags?: string[];
  bonusEntries?: BonusEntryBody[];
  termsAgreed?: boolean;
}

function hasAdminRole(roles: unknown): boolean {
  if (Array.isArray(roles)) {
    return roles.includes('admin');
  }

  if (typeof roles === 'string') {
    return roles.split(',').map((role) => role.trim()).includes('admin');
  }

  return false;
}

/** 관리자 출품작 수동 등록 API */
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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !hasAdminRole(profile.roles)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as AdminCreateSubmissionBody;

    const contestId = body.contestId?.trim();
    const targetUserId = body.userId?.trim();
    const title = body.title?.trim();
    const description = body.description?.trim();
    const videoUrl = body.videoUrl?.trim();
    const thumbnailUrl = body.thumbnailUrl?.trim();
    const aiTools = body.aiTools?.trim();
    const productionProcess = body.productionProcess?.trim();
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag) => tag.trim()).filter(Boolean)
      : [];

    if (!contestId || !targetUserId || !title || !description || !videoUrl || !thumbnailUrl || !productionProcess) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    const submittedAt = body.submittedAt ? new Date(body.submittedAt) : new Date();
    if (Number.isNaN(submittedAt.getTime())) {
      return NextResponse.json({ error: '출품일시 형식이 올바르지 않습니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        contest_id: contestId,
        user_id: targetUserId,
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: 'pending_review',
        submitted_at: submittedAt.toISOString(),
        views: 0,
        like_count: 0,
        video_duration: 0,
        avg_watch_duration: 0,
        tags,
        ai_tools: aiTools || null,
        production_process: productionProcess,
        terms_agreed: body.termsAgreed ?? true,
        registered_by: user.id,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('[POST /api/admin/submissions] INSERT 실패:', error?.message, error?.details, error?.hint);
      return NextResponse.json({ error: `출품작 등록에 실패했습니다: ${error?.message ?? 'unknown'}` }, { status: 500 });
    }

    /* 가산점 인증 저장 */
    if (Array.isArray(body.bonusEntries) && body.bonusEntries.length > 0) {
      const bonusInserts = body.bonusEntries
        .filter((e) => e.bonusConfigId && (e.snsUrl || e.proofImageUrl))
        .map((e) => ({
          submission_id: data.id,
          bonus_config_id: e.bonusConfigId,
          sns_url: e.snsUrl || null,
          proof_image_url: e.proofImageUrl || null,
          submitted_at: new Date().toISOString(),
        }));

      if (bonusInserts.length > 0) {
        const { error: bonusError } = await supabase
          .from('bonus_entries')
          .insert(bonusInserts);

        if (bonusError) {
          console.error('[POST /api/admin/submissions] 가산점 인증 저장 실패 (출품작은 생성됨):', bonusError);
        }
      }
    }

    await createActivityLog({
      userId: user.id,
      action: 'admin_create_submission',
      targetType: 'submission',
      targetId: data.id,
      metadata: { contestId, targetUserId, role: 'admin' },
    });

    revalidateTag('submissions');
    revalidateTag('users');

    return NextResponse.json({ submission: { id: data.id } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('[POST /api/admin/submissions] 실패:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
