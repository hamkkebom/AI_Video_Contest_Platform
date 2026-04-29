/**
 * Supabase 데이터 레이어
 * lib/mock/index.ts 와 동일한 함수 시그니쳐를 유지하면서
 * Supabase에서 실제 데이터를 쿼리합니다.
 *
 * snake_case(DB) → camelCase(TypeScript) 변환을 포함합니다.
 *
 * unstable_cache로 래핑된 함수들은 요청 간 캐시를 제공하며,
 * revalidateTag()로 데이터 변경 시 캐시를 즉시 무효화합니다.
 * React.cache()는 인증 필수 함수(getAuthProfile)에만 유지합니다.
 */
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient, createPublicClient } from '@/lib/supabase/server';

/**
 * Supabase 기본 조회 제한(1000건) 우회 — 전체 데이터 페이지네이션 헬퍼
 * query는 .range() 호출 전 상태로 전달해야 합니다.
 */
async function fetchAll<T extends Record<string, unknown>>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const pageSize = 1000;
  const allData: T[] = [];
  let from = 0;
  let hasMore = true;
  while (hasMore) {
    const { data, error } = await buildQuery(from, from + pageSize - 1);
    if (error || !data || data.length === 0) break;
    allData.push(...data);
    from += pageSize;
    if (data.length < pageSize) hasMore = false;
  }
  return allData;
}
import type {
  Article,
  ArticleMutationInput,
  Company,
  CompanyMember,
  Contest,
  ContestFilters,
  ContestResult,
  Device,
  FAQ,
  Inquiry,
  Judge,
  Like,
  PricingPlan,
  Score,
  SearchFilters,
  SearchResult,
  Submission,
  SubmissionFilters,
  User,
  ActivityLog,
  AgencyRequest,
  IpLog,
  JudgingTemplate,
  AwardTier,
  BonusConfig,
  JudgingCriterion,
  JudgingStage,
  SimpleJudgment,
  SubmissionStageResult,
  StageResult,
} from '@/lib/types';
import type { Popup, PopupMutationInput } from '@/lib/types';

// ============================================================
// 유틸리티: snake_case → camelCase 변환
// ============================================================

/** DB profiles 행 → User 타입 */
function toUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: row.email as string,
    name: row.name as string,
    nickname: (row.nickname as string) ?? undefined,
    roles: (row.roles as User['roles']) ?? ['participant'],
    region: (row.region as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    introduction: (row.introduction as string) ?? undefined,
    socialLinks: (row.social_links as Record<string, string>) ?? undefined,
    preferredChatAi: (row.preferred_chat_ai as string[]) ?? undefined,
    preferredImageAi: (row.preferred_image_ai as string[]) ?? undefined,
    preferredVideoAi: (row.preferred_video_ai as string[]) ?? undefined,
    planId: (row.plan_id as string) ?? undefined,
    createdAt: row.created_at as string,
    status: row.status as User['status'],
    avatarUrl: (row.avatar_url as string) ?? undefined,
  };
}

/** DB contests 행 → Contest 타입 (award_tiers, bonus_configs는 별도 조인) */
function toContest(
  row: Record<string, unknown>,
  awardTiers: AwardTier[] = [],
  bonusConfigs: BonusConfig[] = [],
): Contest {
  return {
    id: String(row.id),
    title: row.title as string,
    slug: row.slug as string,
    hostCompanyId: (row.host_company_id ? String(row.host_company_id) : ''),
    hostUserId: ((row.host_user_id as string | null) ?? ''),
    description: row.description as string,
    region: (row.region as string) ?? '',
    tags: (row.tags as string[]) ?? [],
    status: row.status as Contest['status'],
    submissionStartAt: row.submission_start_at as string,
    submissionEndAt: row.submission_end_at as string,
    judgingStartAt: row.judging_start_at as string,
    judgingEndAt: row.judging_end_at as string,
    resultAnnouncedAt: row.result_announced_at as string,
    judgingType: row.judging_type as Contest['judgingType'],
    reviewPolicy: row.review_policy as Contest['reviewPolicy'],
    maxSubmissionsPerUser: row.max_submissions_per_user as number,
    allowedVideoExtensions: (row.allowed_video_extensions as string[]) ?? ['mp4'],
    prizeAmount: (row.prize_amount as string) ?? undefined,
    awardTiers,
    posterUrl: (row.poster_url as string) ?? undefined,
    heroImageUrl: (row.hero_image_url as string) ?? undefined,
    promotionVideoUrls: (row.promotion_video_urls as string[]) ?? undefined,
    hasLandingPage: (row.has_landing_page as boolean) ?? false,
    landingPageUrl: (row.landing_page_url as string) ?? undefined,
    bonusConfigs: bonusConfigs.length > 0 ? bonusConfigs : undefined,
    bonusMaxScore: (row.bonus_max_score as number) ?? undefined,
    bonusDeadlineAt: (row.bonus_deadline_at as string) ?? undefined,
    resultFormat: (row.result_format as string) ?? 'website',
    detailContent: (row.detail_content as string) ?? undefined,
    detailImageUrls: (row.detail_image_urls as string[]) ?? undefined,
    guidelines: (row.guidelines as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    bonusPercentage: (row.bonus_percentage as number) ?? undefined,
    judgeWeightPercent: (row.judge_weight_percent as number) ?? undefined,
    onlineVoteWeightPercent: (row.online_vote_weight_percent as number) ?? undefined,
    onlineVoteType: (row.online_vote_type as Contest['onlineVoteType']) ?? undefined,
    voteLikesPercent: (row.vote_likes_percent as number) ?? undefined,
    voteViewsPercent: (row.vote_views_percent as number) ?? undefined,
    judgingCriteria: (row.judging_criteria as JudgingCriterion[]) ?? undefined,
  };
}

/** contest_award_tiers 행 → AwardTier 타입 */
function toAwardTier(row: Record<string, unknown>): AwardTier {
  return {
    label: row.label as string,
    count: row.count as number,
    prizeAmount: (row.prize_amount as string) ?? undefined,
  };
}

/** contest_bonus_configs 행 → BonusConfig 타입 */
function toBonusConfig(row: Record<string, unknown>): BonusConfig {
  return {
    id: String(row.id),
    label: row.label as string,
    description: (row.description as string) ?? undefined,
    score: row.score as number,
    requiresUrl: row.requires_url as boolean,
    requiresImage: row.requires_image as boolean,
  };
}

/** 공모전 생성/수정 입력 payload (camelCase) */
export type ContestMutationInput = {
  title: string;
  description: string;
  region: string;
  tags: string[];
  status: Contest['status'];
  submissionStartAt: string;
  submissionEndAt: string;
  judgingStartAt: string;
  judgingEndAt: string;
  resultAnnouncedAt: string;
  judgingType: Contest['judgingType'];
  reviewPolicy: Contest['reviewPolicy'];
  maxSubmissionsPerUser: number;
  allowedVideoExtensions: string[];
  prizeAmount?: string;
  posterUrl?: string;
  heroImageUrl?: string;
  promotionVideoUrls?: string[];
  hasLandingPage?: boolean;
  bonusMaxScore?: number;
  bonusDeadlineAt?: string;
  awardTiers: AwardTier[];
  bonusConfigs?: Array<Omit<BonusConfig, 'id'>>;
  resultFormat?: string;
  landingPageUrl?: string;
  detailContent?: string;
  detailImageUrls?: string[];
  guidelines?: string;
  notes?: string;
  bonusPercentage?: number;
  judgeWeightPercent?: number;
  onlineVoteWeightPercent?: number;
  onlineVoteType?: 'likes' | 'views' | 'likes_and_views';
  voteLikesPercent?: number;
  voteViewsPercent?: number;
  judgingCriteria?: Array<{ label: string; maxScore: number; description?: string }>;
  judgingStages?: Array<{
    stageNumber: number;
    name: string;
    method: 'simple' | 'scored';
    criteria?: Array<{ label: string; maxScore: number; description?: string }>;
    judgeIds?: string[];
  }>;
};

function toContestRowPayload(input: ContestMutationInput): Record<string, unknown> {
  return {
    title: input.title,
    description: input.description,
    region: input.region,
    tags: input.tags,
    status: input.status,
    submission_start_at: input.submissionStartAt,
    submission_end_at: input.submissionEndAt,
    judging_start_at: input.judgingStartAt,
    judging_end_at: input.judgingEndAt,
    result_announced_at: input.resultAnnouncedAt,
    judging_type: input.judgingType,
    review_policy: input.reviewPolicy,
    max_submissions_per_user: input.maxSubmissionsPerUser,
    allowed_video_extensions: input.allowedVideoExtensions,
    prize_amount: input.prizeAmount ?? null,
    poster_url: input.posterUrl ?? null,
    hero_image_url: input.heroImageUrl ?? null,
    promotion_video_urls: input.promotionVideoUrls ?? [],
    has_landing_page: input.hasLandingPage ?? false,
    bonus_max_score: input.bonusMaxScore ?? null,
    bonus_deadline_at: input.bonusDeadlineAt ?? null,
    result_format: input.resultFormat ?? 'website',
    landing_page_url: input.landingPageUrl ?? null,
    detail_content: input.detailContent ?? null,
    detail_image_urls: input.detailImageUrls ?? [],
    guidelines: input.guidelines ?? null,
    notes: input.notes ?? null,
    bonus_percentage: input.bonusPercentage ?? null,
    judge_weight_percent: input.judgeWeightPercent ?? null,
    online_vote_weight_percent: input.onlineVoteWeightPercent ?? null,
    online_vote_type: input.onlineVoteType ?? 'likes',
    vote_likes_percent: input.voteLikesPercent ?? null,
    vote_views_percent: input.voteViewsPercent ?? null,
    judging_criteria: input.judgingCriteria ?? [],
  };
}

async function getContestRelationsByIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contestIds: string[],
) {
  if (contestIds.length === 0) {
    return {
      tiersMap: new Map<string, AwardTier[]>(),
      bonusMap: new Map<string, BonusConfig[]>(),
    };
  }

  const [tierResult, bonusResult] = await Promise.all([
    supabase
      .from('contest_award_tiers')
      .select('*')
      .in('contest_id', contestIds)
      .order('sort_order', { ascending: true }),
    supabase
      .from('contest_bonus_configs')
      .select('*')
      .in('contest_id', contestIds)
      .order('sort_order', { ascending: true }),
  ]);

  const tiersMap = new Map<string, AwardTier[]>();
  for (const tier of tierResult.data ?? []) {
    const contestId = String(tier.contest_id);
    if (!tiersMap.has(contestId)) tiersMap.set(contestId, []);
    tiersMap.get(contestId)!.push(toAwardTier(tier as Record<string, unknown>));
  }

  const bonusMap = new Map<string, BonusConfig[]>();
  for (const bonus of bonusResult.data ?? []) {
    const contestId = String(bonus.contest_id);
    if (!bonusMap.has(contestId)) bonusMap.set(contestId, []);
    bonusMap.get(contestId)!.push(toBonusConfig(bonus as Record<string, unknown>));
  }

  return { tiersMap, bonusMap };
}

async function getContestByIdInternal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  attempt = 1,
): Promise<Contest | null> {
  const { data: contestRow, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`[getContestById] Supabase 쿼리 실패 (시도 ${attempt}/2, id=${id}):`, error.message);
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 500));
      const retrySupa = createPublicClient();
      return getContestByIdInternal(retrySupa, id, attempt + 1);
    }
    // throw하여 unstable_cache가 에러를 캐싱하지 않도록 함
    throw new Error(`getContestById failed after retries: ${error.message}`);
  }

  if (!contestRow) return null;

  const { tiersMap, bonusMap } = await getContestRelationsByIds(supabase, [id]);

  return toContest(
    contestRow as Record<string, unknown>,
    tiersMap.get(id) ?? [],
    bonusMap.get(id) ?? [],
  );
}

/** DB submissions 행 → Submission 타입 */
function toSubmission(row: Record<string, unknown>): Submission {
  return {
    id: String(row.id),
    contestId: String(row.contest_id),
    userId: row.user_id as string,
    title: row.title as string,
    description: row.description as string,
    videoUrl: (row.video_url as string) ?? '',
    thumbnailUrl: (row.thumbnail_url as string) ?? '',
    status: row.status as Submission['status'],
    isPublic: row.is_public !== false, // 컬럼이 없거나 null이면 공개로 간주(하위호환)
    submittedAt: row.submitted_at as string,
    views: (row.views as number) ?? 0,
    likeCount: (row.like_count as number) ?? 0,
    videoDuration: (row.video_duration as number) ?? 0,
    avgWatchDuration: (row.avg_watch_duration as number) ?? 0,
    tags: (row.tags as string[]) ?? [],
    autoRejectedReason: (row.auto_rejected_reason as string) ?? undefined,
    rejectionReason: (row.rejection_reason as string) ?? undefined,
    aiTools: (row.ai_tools as string) ?? undefined,
    productionProcess: (row.production_process as string) ?? undefined,
    submitterName: (row.submitter_name as string) ?? undefined,
    submitterPhone: (row.submitter_phone as string) ?? undefined,
    resubmissionCount: (row.resubmission_count as number) ?? 0,
    resubmissionAllowedAt: (row.resubmission_allowed_at as string) ?? undefined,
  };
}

/** DB articles 행 → Article 타입 */
function toArticle(row: Record<string, unknown>): Article {
  return {
    id: String(row.id),
    type: row.type as Article['type'],
    title: row.title as string,
    slug: row.slug as string,
    excerpt: (row.excerpt as string) ?? '',
    content: (row.content as string) ?? '',
    authorId: (row.author_id as string) ?? '',
    tags: (row.tags as string[]) ?? [],
    publishedAt: row.published_at as string,
    isPublished: row.is_published as boolean,
    thumbnailUrl: (row.thumbnail_url as string) ?? undefined,
  };
}

/** DB faqs 행 → FAQ 타입 */
function toFaq(row: Record<string, unknown>): FAQ {
  return {
    id: String(row.id),
    category: row.category as FAQ['category'],
    topic: row.topic as FAQ['topic'],
    question: row.question as string,
    answer: row.answer as string,
    isPinned: row.is_pinned as boolean,
    updatedAt: row.updated_at as string,
  };
}

/** DB companies 행 → Company 타입 */
function toCompany(row: Record<string, unknown>): Company {
  return {
    id: String(row.id),
    name: row.name as string,
    businessNumber: row.business_number as string,
    representativeName: row.representative_name as string,
    address: (row.address as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    logoUrl: (row.logo_url as string) ?? undefined,
    website: (row.website as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    businessLicenseImageUrl: (row.business_license_image_url as string) ?? undefined,
    status: row.status as Company['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** DB company_members 행 → CompanyMember 타입 */
function toCompanyMember(row: Record<string, unknown>): CompanyMember {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    userId: row.user_id as string,
    role: row.role as CompanyMember['role'],
    companyEmail: (row.company_email as string) ?? undefined,
    joinedAt: row.joined_at as string,
  };
}

/** DB likes 행 → Like 타입 */
function toLike(row: Record<string, unknown>): Like {
  return {
    id: String(row.id),
    userId: row.user_id as string,
    submissionId: String(row.submission_id),
    createdAt: row.created_at as string,
  };
}

/** DB contest_results 행 → ContestResult 타입 */
function toContestResult(row: Record<string, unknown>): ContestResult {
  return {
    contestId: String(row.contest_id),
    submissionId: String(row.submission_id),
    rank: row.rank as number,
    prizeLabel: row.prize_label as string,
    awardedAt: row.awarded_at as string,
  };
}

/** DB devices 행 → Device 타입 */
function toDevice(row: Record<string, unknown>): Device {
  return {
    id: String(row.id),
    userId: row.user_id as string,
    name: row.name as string,
    platform: row.platform as Device['platform'],
    browser: row.browser as Device['browser'],
    ipAddress: (row.ip_address as string) ?? '',
    lastActiveAt: row.last_active_at as string,
    createdAt: row.created_at as string,
    isTrusted: row.is_trusted as boolean,
  };
}

/** DB judges 행 → Judge 타입 */
function toJudge(row: Record<string, unknown>): Judge {
  return {
    id: String(row.id),
    userId: row.user_id as string,
    contestId: String(row.contest_id),
    isExternal: row.is_external as boolean,
    email: (row.email as string) ?? undefined,
    invitedAt: row.invited_at as string,
    acceptedAt: (row.accepted_at as string) ?? undefined,
  };
}

/** DB pricing_plans 행 → PricingPlan 타입 */
function toPricingPlan(row: Record<string, unknown>): PricingPlan {
  return {
    id: String(row.id),
    role: row.role as PricingPlan['role'],
    name: row.name as string,
    monthlyPrice: (row.monthly_price as number) ?? 0,
    yearlyPrice: (row.yearly_price as number) ?? 0,
    active: row.active as boolean,
    featureKeys: (row.feature_keys as string[]) ?? [],
  };
}

/** DB inquiries 행 → Inquiry 타입 */
function toInquiry(row: Record<string, unknown>): Inquiry {
  return {
    id: String(row.id),
    userId: row.user_id as string,
    type: row.type as Inquiry['type'],
    title: row.title as string,
    content: row.content as string,
    status: row.status as Inquiry['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** DB agency_requests 행 → AgencyRequest 타입 */
function toAgencyRequest(row: Record<string, unknown>): AgencyRequest {
  return {
    id: String(row.id),
    companyName: row.company_name as string,
    contactName: row.contact_name as string,
    contactEmail: row.contact_email as string,
    phoneNumber: (row.phone_number as string) ?? undefined,
    budgetRange: (row.budget_range as string) ?? undefined,
    message: row.message as string,
    status: row.status as AgencyRequest['status'],
    createdAt: row.created_at as string,
  };
}

/** DB activity_logs 행 → ActivityLog 타입 */
function toActivityLog(row: Record<string, unknown>): ActivityLog {
  return {
    id: String(row.id),
    userId: row.user_id as string,
    action: row.action as string,
    targetType: row.target_type as ActivityLog['targetType'],
    targetId: row.target_id as string,
    createdAt: row.created_at as string,
    metadata: (row.metadata as Record<string, string | number | boolean>) ?? undefined,
  };
}

/** DB ip_logs 행 → IpLog 타입 */
function toIpLog(row: Record<string, unknown>): IpLog {
  return {
    id: String(row.id),
    userId: row.user_id as string,
    ipAddress: row.ip_address as string,
    country: (row.country as string) ?? '',
    region: (row.region as string) ?? '',
    riskLevel: row.risk_level as IpLog['riskLevel'],
    createdAt: row.created_at as string,
  };
}

// ============================================================
// 공개 API 함수 — mock과 동일한 시그니처
// ============================================================

export const getUsers = unstable_cache(
  async (): Promise<User[]> => {
    const supabase = createPublicClient();
    const allData = await fetchAll((from, to) =>
      supabase.from('profiles').select('*').order('created_at', { ascending: true }).range(from, to),
    );
    return allData.map((row) => toUser(row));
  },
  ['users'],
  { tags: ['users'], revalidate: 120 },
);

/** 단건 유저 조회 (profiles 테이블) */
export function getUserById(id: string): Promise<User | null> {
  return unstable_cache(
    async (): Promise<User | null> => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) return null;
      return toUser(data as Record<string, unknown>);
    },
    [`user-${id}`],
    { tags: ['users'], revalidate: 120 },
  )();
}

/** 여러 유저 ID로 벌크 조회 (usersMap 생성용) */
export async function getUsersByIds(ids: string[]): Promise<User[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);
  if (error || !data) return [];
  return data.map((row) => toUser(row as Record<string, unknown>));
}

export async function getCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toCompany(row as Record<string, unknown>));
}

export async function getCompanyMembers(): Promise<CompanyMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('company_members')
    .select('*')
    .order('joined_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toCompanyMember(row as Record<string, unknown>));
}

export async function getDevices(): Promise<Device[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toDevice(row as Record<string, unknown>));
}

export async function getDevicesByUser(userId: string): Promise<Device[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toDevice(row as Record<string, unknown>));
}

/**
 * 공모전 목록 조회 (award_tiers, bonus_configs 포함)
 * 필터 지원: status, region, search
 * 60초 캐시 — 데이터 변경 시 revalidateTag('contests')로 무효화
 * 필터 조합별 캐시 키 분리로 캐시 충돌 방지
 * Supabase 일시 장애 시 1회 자동 재시도
 */
export function getContests(filters?: ContestFilters): Promise<Contest[]> {
  const keyParts = [
    'contests',
    filters?.status ?? 'all',
    filters?.region ?? 'all',
    filters?.search ?? '',
  ];

  return unstable_cache(
    async (): Promise<Contest[]> => {
      const fetchContests = async (attempt: number): Promise<Contest[]> => {
        const supabase = createPublicClient();

        let query = supabase
          .from('contests')
          .select('*')
          .order('created_at', { ascending: true });

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.region) {
          query = query.eq('region', filters.region);
        }
        if (filters?.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
          );
        }

        const { data: contestRows, error } = await query;
        if (error) {
          console.error(`[getContests] Supabase 쿼리 실패 (시도 ${attempt}/2):`, error.message, { filters });
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 500));
            return fetchContests(attempt + 1);
          }
          throw new Error(`getContests failed: ${error.message}`);
        }
        if (!contestRows || contestRows.length === 0) return [];

        const contestIds = contestRows.map((c) => String(c.id));
        const { tiersMap, bonusMap } = await getContestRelationsByIds(supabase, contestIds);

        return contestRows.map((row) =>
          toContest(
            row as Record<string, unknown>,
            tiersMap.get(String(row.id)) ?? [],
            bonusMap.get(String(row.id)) ?? [],
          ),
        );
      };

      return fetchContests(1);
    },
    keyParts,
    { tags: ['contests'], revalidate: 60 },
  )();
}

/** 공모전 단건 조회 (award_tiers, bonus_configs 포함) — 120초 캐시 */
export function getContestById(id: string): Promise<Contest | null> {
  return unstable_cache(
    async (): Promise<Contest | null> => {
      const supabase = createPublicClient();
      return getContestByIdInternal(supabase, id);
    },
    [`contest-${id}`],
    { tags: ['contests'], revalidate: 120 },
  )();
}

/** 슬러그로 공모전 ID 조회 (슬러그 → 숫자 ID 리다이렉트용) */
export async function getContestIdBySlug(slug: string): Promise<string | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('contests')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return String(data.id);
}

/**
 * 관련 공모전 조회 (경량 버전)
 * 최신 공모전 순으로 현재 공모전 제외 후 limit개 반환 — 120초 캐시
 */
export function getRelatedContests(excludeId: string, limit = 6): Promise<Contest[]> {
  return unstable_cache(
    async (): Promise<Contest[]> => {
      const supabase = createPublicClient();

      const { data } = await supabase
        .from('contests')
        .select('*')
        .neq('id', excludeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const rows = data ?? [];
      if (rows.length === 0) return [];

      const contestIds = rows.map((c) => String(c.id));
      const { tiersMap, bonusMap } = await getContestRelationsByIds(supabase, contestIds);

      return rows.map((row) =>
        toContest(
          row as Record<string, unknown>,
          tiersMap.get(String(row.id)) ?? [],
          bonusMap.get(String(row.id)) ?? [],
        ),
      );
    },
    [`related-contests-${excludeId}-${limit}`],
    { tags: ['contests'], revalidate: 120 },
  )();
}

/** 출품작 목록 조회 — 30초 캐시, 필터 지원 */
export function getSubmissions(filters?: SubmissionFilters): Promise<Submission[]> {
  const keyParts = ['submissions'];
  if (filters?.contestId) keyParts.push(`contest:${filters.contestId}`);
  if (filters?.userId) keyParts.push(`user:${filters.userId}`);
  if (filters?.status) keyParts.push(`status:${filters.status}`);

  return unstable_cache(
    async (filters?: SubmissionFilters): Promise<Submission[]> => {
      const supabase = createPublicClient();

      const allData = await fetchAll((from, to) => {
        let query = supabase
          .from('submissions')
          .select('*')
          .order('submitted_at', { ascending: true })
          .range(from, to);
        if (filters?.contestId) query = query.eq('contest_id', filters.contestId);
        if (filters?.userId) query = query.eq('user_id', filters.userId);
        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        return query;
      });
      return allData.map((row) => toSubmission(row));
    },
    keyParts,
    { tags: ['submissions'], revalidate: 30 },
  )(filters);
}

/** 관리자/인증 세션 기반 출품작 목록 조회 (RLS 세션 의존 이슈 대응) */
export async function getAdminSubmissions(filters?: SubmissionFilters): Promise<Submission[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  /* 목록에 필요한 컬럼만 조회 (description, production_process 등 긴 텍스트 제외) */
  let query = supabase
    .from('submissions')
    .select('id, contest_id, user_id, title, video_url, thumbnail_url, status, submitted_at, views, like_count, video_duration, avg_watch_duration, tags, submitter_name, submitter_phone, rejection_reason, ai_tools, resubmission_count, resubmission_allowed_at, terms_agreed, created_at')
    .order('submitted_at', { ascending: true });

  if (filters?.contestId) {
    query = query.eq('contest_id', filters.contestId);
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => toSubmission(row as Record<string, unknown>));
}

export async function getLikes(): Promise<Like[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toLike(row as Record<string, unknown>));
}

export async function toggleLike(
  userId: string,
  submissionId: string,
): Promise<{ liked: boolean; totalLikes: number }> {
  const supabase = await createClient();

  // 기존 좋아요 확인
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('submission_id', submissionId)
    .maybeSingle();

  if (existing) {
    // 좋아요 삭제
    await supabase.from('likes').delete().eq('id', existing.id);
  } else {
    // 좋아요 추가
    await supabase.from('likes').insert({ user_id: userId, submission_id: submissionId });
  }

  // 현재 좋아요 수 조회 (트리거가 like_count 자동 갱신하지만, 즉시 반영 확인)
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('submission_id', submissionId);

  // 캐시 무효화: 좋아요 수 변경으로 submissions 캐시 갱신
  const { revalidateTag } = await import('next/cache');
  revalidateTag('submissions');
  return { liked: !existing, totalLikes: count ?? 0 };
}

/** 특정 유저가 특정 출품작에 좋아요했는지 확인 */
export async function hasUserLiked(userId: string, submissionId: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('submission_id', submissionId)
    .maybeSingle();
  return !!data;
}

export const getArticles = unstable_cache(
  async (): Promise<Article[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => toArticle(row as Record<string, unknown>));
  },
  ['articles'],
  { tags: ['articles'], revalidate: 60 },
);

export const getFaqs = unstable_cache(
  async (): Promise<FAQ[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('updated_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => toFaq(row as Record<string, unknown>));
  },
  ['faqs'],
  { tags: ['faqs'], revalidate: 60 },
);

export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toInquiry(row as Record<string, unknown>));
}

export async function getAgencyRequests(): Promise<AgencyRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('agency_requests')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toAgencyRequest(row as Record<string, unknown>));
}

export async function getJudgingTemplates(): Promise<JudgingTemplate[]> {
  const supabase = await createClient();

  const { data: templates, error } = await supabase
    .from('judging_templates')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !templates) return [];

  const templateIds = templates.map((t) => String(t.id));
  const { data: criteria } = await supabase
    .from('judging_criteria')
    .select('*')
    .in('template_id', templateIds)
    .order('sort_order', { ascending: true });

  const criteriaMap = new Map<string, JudgingTemplate['criteria']>();
  for (const c of criteria ?? []) {
    const tid = String(c.template_id);
    if (!criteriaMap.has(tid)) criteriaMap.set(tid, []);
    criteriaMap.get(tid)!.push({
      id: String(c.id),
      label: c.label as string,
      maxScore: c.max_score as number,
      description: (c.description as string) ?? '',
    });
  }

  return templates.map((row) => ({
    id: String(row.id),
    name: row.name as string,
    description: (row.description as string) ?? '',
    criteria: criteriaMap.get(String(row.id)) ?? [],
    createdAt: row.created_at as string,
  }));
}

/**
 * 공모전의 심사 기준 템플릿 조회 (읽기 전용)
 * 공모전 생성/수정 시 syncContestJudgingTemplate으로 동기화됨
 */
export async function getContestTemplate(contestId: string): Promise<JudgingTemplate | null> {
  const supabase = await createClient();
  const templateName = `contest-${contestId}`;

  const { data: existing } = await supabase
    .from('judging_templates')
    .select('*')
    .eq('name', templateName)
    .maybeSingle();

  if (!existing) return null;

  const { data: criteria } = await supabase
    .from('judging_criteria')
    .select('*')
    .eq('template_id', existing.id)
    .order('sort_order', { ascending: true });

  return {
    id: String(existing.id),
    name: existing.name as string,
    description: (existing.description as string) ?? '',
    criteria: (criteria ?? []).map((c) => ({
      id: String(c.id),
      label: c.label as string,
      maxScore: c.max_score as number,
      description: (c.description as string) ?? '',
    })),
    createdAt: existing.created_at as string,
  };
}

/**
 * 공모전 생성/수정 시 judgingCriteria JSONB → judging_templates + judging_criteria 동기화
 */
async function syncContestJudgingTemplate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contestId: string,
  judgingCriteria?: Array<{ label: string; maxScore: number; description?: string }>,
): Promise<void> {
  if (!supabase) return;
  const templateName = `contest-${contestId}`;

  // 기존 템플릿 조회
  const { data: existing } = await supabase
    .from('judging_templates')
    .select('id')
    .eq('name', templateName)
    .maybeSingle();

  // 심사 기준이 없으면 기존 템플릿 삭제
  if (!judgingCriteria || judgingCriteria.length === 0) {
    if (existing) {
      await supabase.from('judging_criteria').delete().eq('template_id', existing.id);
      await supabase.from('judging_templates').delete().eq('id', existing.id);
    }
    return;
  }

  let templateId: number;

  if (existing) {
    // 기존 기준 삭제 후 재생성
    templateId = existing.id as number;
    await supabase.from('judging_criteria').delete().eq('template_id', templateId);
  } else {
    // 공모전 제목 조회
    const { data: contest } = await supabase
      .from('contests')
      .select('title')
      .eq('id', contestId)
      .maybeSingle();

    const { data: newTemplate } = await supabase
      .from('judging_templates')
      .insert({
        name: templateName,
        description: `${contest?.title ?? contestId} 심사 기준`,
      })
      .select('id')
      .single();

    if (!newTemplate) return;
    templateId = newTemplate.id as number;
  }

  // 기준 항목 생성
  const criteriaInserts = judgingCriteria.map((c, i) => ({
    template_id: templateId,
    label: c.label,
    max_score: c.maxScore,
    description: c.description ?? '',
    sort_order: i,
  }));

  await supabase.from('judging_criteria').insert(criteriaInserts);
}

/**
 * 공모전 생성/수정 시 다단계 심사 설정 동기화
 * judgingStages 배열 → judging_stages + judging_templates + judging_criteria + stage_judges
 */
async function syncContestJudgingStages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contestId: string,
  stages?: ContestMutationInput['judgingStages'],
): Promise<void> {
  if (!supabase) return;

  // 기존 단계 조회
  const { data: existingStages } = await supabase
    .from('judging_stages')
    .select('id, template_id')
    .eq('contest_id', contestId);

  // 기존 단계 삭제 (cascade로 stage_judges, submission_stage_results도 삭제)
  if (existingStages && existingStages.length > 0) {
    // 기존 단계별 템플릿 삭제
    for (const es of existingStages) {
      if (es.template_id) {
        await supabase.from('judging_criteria').delete().eq('template_id', es.template_id);
        await supabase.from('judging_templates').delete().eq('id', es.template_id);
      }
    }
    await supabase.from('judging_stages').delete().eq('contest_id', contestId);
  }

  if (!stages || stages.length === 0) return;

  // 공모전 제목 조회
  const { data: contest } = await supabase
    .from('contests')
    .select('title')
    .eq('id', contestId)
    .maybeSingle();

  for (const stage of stages) {
    let templateId: number | null = null;

    // scored 단계면 템플릿 생성
    if (stage.method === 'scored' && stage.criteria && stage.criteria.length > 0) {
      const tName = `contest-${contestId}-stage-${stage.stageNumber}`;
      const { data: newTemplate } = await supabase
        .from('judging_templates')
        .insert({
          name: tName,
          description: `${contest?.title ?? contestId} ${stage.name} 심사 기준`,
        })
        .select('id')
        .single();

      if (newTemplate) {
        templateId = newTemplate.id as number;
        const criteriaInserts = stage.criteria.map((c, i) => ({
          template_id: templateId!,
          label: c.label,
          max_score: c.maxScore,
          description: c.description ?? '',
          sort_order: i,
        }));
        await supabase.from('judging_criteria').insert(criteriaInserts);
      }
    }

    // 단계 생성
    const { data: newStage } = await supabase
      .from('judging_stages')
      .insert({
        contest_id: contestId,
        stage_number: stage.stageNumber,
        name: stage.name,
        method: stage.method,
        template_id: templateId,
        is_active: stage.stageNumber === 1,
        sort_order: stage.stageNumber - 1,
      })
      .select('id')
      .single();

    // 단계별 심사위원 배정
    if (newStage && stage.judgeIds && stage.judgeIds.length > 0) {
      const sjInserts = stage.judgeIds.map((jid) => ({
        stage_id: newStage.id as number,
        judge_id: Number(jid),
      }));
      await supabase.from('stage_judges').insert(sjInserts);
    }
  }
}

export const getJudges = unstable_cache(
  async (): Promise<Judge[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('judges')
      .select('*')
      .order('invited_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => toJudge(row as Record<string, unknown>));
  },
  ['judges'],
  { tags: ['judges'], revalidate: 120 },
);

export async function getScores(): Promise<Score[]> {
  const supabase = await createClient();

  const { data: scores, error } = await supabase
    .from('scores')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !scores) return [];

  const scoreIds = scores.map((s) => String(s.id));
  const { data: scoreCriteria } = await supabase
    .from('score_criteria')
    .select('*')
    .in('score_id', scoreIds);

  const criteriaMap = new Map<string, Array<{ criterionId: string; score: number }>>();
  for (const sc of scoreCriteria ?? []) {
    const sid = String(sc.score_id);
    if (!criteriaMap.has(sid)) criteriaMap.set(sid, []);
    criteriaMap.get(sid)!.push({
      criterionId: String(sc.criterion_id),
      score: sc.score as number,
    });
  }

  return scores.map((row) => ({
    id: String(row.id),
    submissionId: String(row.submission_id),
    judgeId: String(row.judge_id),
    templateId: row.template_id ? String(row.template_id) : '',
    total: row.total as number,
    criteriaScores: criteriaMap.get(String(row.id)) ?? [],
    comment: (row.comment as string) ?? undefined,
    createdAt: row.created_at as string,
    stageId: row.stage_id ? String(row.stage_id) : undefined,
  }));
}

export const getContestResults = unstable_cache(
  async (): Promise<ContestResult[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('contest_results')
      .select('*')
      .order('rank', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => toContestResult(row as Record<string, unknown>));
  },
  ['contest-results'],
  { tags: ['results'], revalidate: 30 },
);

export const getPricingPlans = unstable_cache(
  async (): Promise<PricingPlan[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*');
    if (error || !data) return [];
    return data.map((row) => toPricingPlan(row as Record<string, unknown>));
  },
  ['pricing-plans'],
  { tags: ['pricing'], revalidate: 120 },
);

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toActivityLog(row as Record<string, unknown>));
}

export async function getIpLogs(): Promise<IpLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ip_logs')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toIpLog(row as Record<string, unknown>));
}

// ============================================================
// 갤러리용 복합 쿼리 함수
// ============================================================

/** 갤러리 타입: 출품작 + 공모전/크리에이터/수상 정보 결합 */
export interface GallerySubmission extends Submission {
  contestTitle: string;
  creatorName: string;
  prizeLabel?: string;
  rank?: number;
}

/**
 * 전체 갤러리: 검토 승인(approved)된 모든 출품작 — 5분 캐시
 */
export const getGallerySubmissions = unstable_cache(
  async (): Promise<GallerySubmission[]> => {
    const supabase = createPublicClient();

    // 승인된 출품작 조회 (먼저 제출한 작품이 앞에 오도록 오래된순 정렬)
    // is_public=true 만 노출 (관리자가 비공개 처리한 작품 제외)
    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'approved')
      .eq('is_public', true)
      .order('submitted_at', { ascending: true });
    if (!submissions || submissions.length === 0) return [];

    // 관련 공모전 제목 조회
    const contestIds = [...new Set(submissions.map((s) => s.contest_id as string))];
    const { data: contests } = await supabase
      .from('contests')
      .select('id, title')
      .in('id', contestIds);
    const contestTitleMap = new Map(
      (contests ?? []).map((c) => [String(c.id), c.title as string]),
    );

    // 크리에이터 정보 조회
    const userIds = [...new Set(submissions.map((s) => s.user_id as string))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nickname, name')
      .in('id', userIds);
    const profileMap = new Map(
      (profiles ?? []).map((p) => [
        p.id as string,
        (p.nickname as string) ?? (p.name as string) ?? '익명',
      ]),
    );

    // 수상 결과 조회
    const { data: results } = await supabase
      .from('contest_results')
      .select('submission_id, prize_label, rank')
      .in('contest_id', contestIds);
    const resultMap = new Map(
      (results ?? []).map((r) => [
        String(r.submission_id),
        { prizeLabel: r.prize_label as string, rank: r.rank as number },
      ]),
    );

    return submissions.map((row) => {
      const sub = toSubmission(row as Record<string, unknown>);
      const result = resultMap.get(sub.id);
      return {
        ...sub,
        contestTitle: contestTitleMap.get(sub.contestId) ?? '',
        creatorName: sub.submitterName || profileMap.get(sub.userId) || '익명',
        prizeLabel: result?.prizeLabel,
        rank: result?.rank,
      };
    });
  },
  ['gallery-submissions'],
  { tags: ['gallery', 'submissions'], revalidate: 30 },
);

/**
 * 수상작 갤러리: 결과발표된 공모전의 수상작만 — 30초 캐시
 */
export const getAwardedSubmissions = unstable_cache(
  async (): Promise<GallerySubmission[]> => {
    const supabase = createPublicClient();

    // completed 공모전
    const { data: completedContests } = await supabase
      .from('contests')
      .select('id, title')
      .eq('status', 'completed');
    if (!completedContests || completedContests.length === 0) return [];

    const completedIds = completedContests.map((c) => String(c.id));
    const contestTitleMap = new Map(completedContests.map((c) => [String(c.id), c.title as string]));

    // 수상 결과 조회
    const { data: results } = await supabase
      .from('contest_results')
      .select('*')
      .in('contest_id', completedIds)
      .order('rank', { ascending: true });
    if (!results || results.length === 0) return [];

    // 해당 submission 조회
    const submissionIds = results.map((r) => String(r.submission_id));
    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .in('id', submissionIds);

    const submissionMap = new Map(
      (submissions ?? []).map((s) => [String(s.id), s]),
    );

    // 크리에이터 정보 조회
    const userIds = [...new Set((submissions ?? []).map((s) => s.user_id as string))];
    const { data: profiles } = userIds.length > 0
      ? await supabase.from('profiles').select('id, nickname, name').in('id', userIds)
      : { data: [] };
    const profileMap = new Map(
      (profiles ?? []).map((p) => [
        p.id as string,
        (p.nickname as string) ?? (p.name as string) ?? '익명',
      ]),
    );

    return results.map((r) => {
      const submissionRow = submissionMap.get(String(r.submission_id));
      if (submissionRow) {
        const sub = toSubmission(submissionRow as Record<string, unknown>);
        return {
          ...sub,
          contestTitle: contestTitleMap.get(String(r.contest_id)) ?? '',
          creatorName: sub.submitterName || profileMap.get(sub.userId) || '익명',
          prizeLabel: r.prize_label as string,
          rank: r.rank as number,
        };
      }
      // submission이 삭제된 경우 빈 껍데기
      return {
        id: String(r.submission_id),
        contestId: String(r.contest_id),
        userId: '',
        title: '수상작',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        status: 'judged' as const,
        isPublic: true,
        submittedAt: r.awarded_at as string,
        views: 0,
        likeCount: 0,
        videoDuration: 180,
        avgWatchDuration: 90,
        tags: [],
        contestTitle: contestTitleMap.get(String(r.contest_id)) ?? '',
        creatorName: '익명',
        prizeLabel: r.prize_label as string,
        rank: r.rank as number,
      };
    });
  },
  ['awarded-submissions'],
  { tags: ['gallery'], revalidate: 30 },
);

/** 시청 유지율 승수: 0.5 + retentionRate × 0.5 (범위 0.5 ~ 1.0) */
function retentionMultiplier(s: { videoDuration: number; avgWatchDuration: number }): number {
  const rate = s.videoDuration > 0 ? Math.min(s.avgWatchDuration / s.videoDuration, 1) : 0;
  return 0.5 + rate * 0.5;
}

/**
 * 주목할 작품: (조회수 × 0.3 + 좋아요 × 0.7) × 시청유지율 승수
 */
export async function getFeaturedSubmissions(limit = 12): Promise<GallerySubmission[]> {
  const all = await getGallerySubmissions();
  const score = (s: GallerySubmission) =>
    (s.views * 0.3 + s.likeCount * 0.7) * retentionMultiplier(s);
  return all.sort((a, b) => score(b) - score(a)).slice(0, limit);
}

/**
 * 단일 출품작 상세 조회 — 5분 캐시
 */
export function getSubmissionById(id: string): Promise<GallerySubmission | null> {
  return unstable_cache(
    async (): Promise<GallerySubmission | null> => {
      const supabase = createPublicClient();

      const { data: submissionRow } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!submissionRow) return null;

      const sub = toSubmission(submissionRow as Record<string, unknown>);

      // 병렬 조회: 공모전 제목, 크리에이터, 수상 결과
      const [contestRes, profileRes, resultRes] = await Promise.all([
        supabase.from('contests').select('title').eq('id', sub.contestId).maybeSingle(),
        supabase.from('profiles').select('nickname, name').eq('id', sub.userId).maybeSingle(),
        supabase.from('contest_results').select('prize_label, rank').eq('submission_id', id).maybeSingle(),
      ]);

      return {
        ...sub,
        contestTitle: (contestRes.data?.title as string) ?? '',
        creatorName: sub.submitterName || (profileRes.data?.nickname as string) || (profileRes.data?.name as string) || '익명',
        prizeLabel: resultRes.data ? (resultRes.data.prize_label as string) : undefined,
        rank: resultRes.data ? (resultRes.data.rank as number) : undefined,
      };
    },
    [`submission-${id}`],
    { tags: ['submissions', 'gallery'], revalidate: 30 },
  )();
}

/**
 * 같은 공모전의 다른 출품작 조회 (상세 페이지 관련 작품용) — 5분 캐시
 * getGallerySubmissions 전체 로드 대신 필요한 데이터만 조회
 */
export function getRelatedSubmissions(
  contestId: string,
  excludeId: string,
  limit = 4,
): Promise<GallerySubmission[]> {
  return unstable_cache(
    async (): Promise<GallerySubmission[]> => {
      const supabase = createPublicClient();

      // 같은 공모전의 승인된 출품작만 조회 (현재 작품 제외, 오래된순)
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('contest_id', contestId)
        .eq('status', 'approved')
        .neq('id', excludeId)
        .order('submitted_at', { ascending: true })
        .limit(limit);
      if (!submissions || submissions.length === 0) return [];

      // 크리에이터 정보 병렬 조회
      const userIds = [...new Set(submissions.map((s) => s.user_id as string))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, name')
        .in('id', userIds);
      const profileMap = new Map(
        (profiles ?? []).map((p) => [
          p.id as string,
          (p.nickname as string) ?? (p.name as string) ?? '익명',
        ]),
      );

      // 수상 결과 조회
      const subIds = submissions.map((s) => String(s.id));
      const { data: results } = await supabase
        .from('contest_results')
        .select('submission_id, prize_label, rank')
        .in('submission_id', subIds);
      const resultMap = new Map(
        (results ?? []).map((r) => [String(r.submission_id), r]),
      );

      return submissions.map((row) => {
        const sub = toSubmission(row as Record<string, unknown>);
        const result = resultMap.get(sub.id);
        return {
          ...sub,
          contestTitle: '',
          creatorName: sub.submitterName || profileMap.get(sub.userId) || '익명',
          prizeLabel: result ? (result.prize_label as string) : undefined,
          rank: result ? (result.rank as number) : undefined,
        };
      });
    },
    [`related-submissions-${contestId}-${excludeId}`],
    { tags: ['submissions', 'gallery'], revalidate: 30 },
  )();
}

/**
 * 결과발표 완료된 공모전 목록
 */
export async function getCompletedContests(): Promise<Contest[]> {
  return getContests({ status: 'completed' });
}

/**
 * 통합 검색 (서버사이드)
 */
export async function searchData(filters: SearchFilters): Promise<SearchResult> {
  const normalized = filters.query.trim().toLowerCase();
  if (!normalized) {
    return { contests: [], submissions: [], users: [], articles: [] };
  }

  const supabase = await createClient();

  // 탭별 필터링 (all이면 모두 조회)
  const tab = filters.tab ?? 'all';

  const [contestsRes, submissionsRes, usersRes, articlesRes] = await Promise.all([
    tab === 'all' || tab === 'contests'
      ? supabase
          .from('contests')
          .select('*')
          .or(`title.ilike.%${normalized}%,description.ilike.%${normalized}%`)
      : Promise.resolve({ data: [], error: null }),
    tab === 'all' || tab === 'submissions'
      ? supabase
          .from('submissions')
          .select('*')
          .or(`title.ilike.%${normalized}%,description.ilike.%${normalized}%`)
      : Promise.resolve({ data: [], error: null }),
    tab === 'all' || tab === 'creators'
      ? supabase
          .from('profiles')
          .select('*')
          .or(`name.ilike.%${normalized}%,nickname.ilike.%${normalized}%`)
      : Promise.resolve({ data: [], error: null }),
    tab === 'all' || tab === 'articles'
      ? supabase
          .from('articles')
          .select('*')
          .eq('is_published', true)
          .or(`title.ilike.%${normalized}%,excerpt.ilike.%${normalized}%,content.ilike.%${normalized}%`)
      : Promise.resolve({ data: [], error: null }),
  ]);

  // contests는 award_tiers 없이 간략하게 반환 (검색 결과 용도)
  const contests = (contestsRes.data ?? []).map((row) =>
    toContest(row as Record<string, unknown>),
  );
  const submissions = (submissionsRes.data ?? []).map((row) =>
    toSubmission(row as Record<string, unknown>),
  );
  const users = (usersRes.data ?? []).map((row) =>
    toUser(row as Record<string, unknown>),
  );
  const articles = (articlesRes.data ?? []).map((row) =>
    toArticle(row as Record<string, unknown>),
  );

  return { contests, submissions, users, articles };
}

/**
 * 데이터 카운트 (관리자 대시보드용)
 */
export async function getDataCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();

  const tables = [
    'contests', 'submissions', 'profiles', 'companies',
    'company_members', 'likes', 'faqs', 'articles',
    'inquiries', 'agency_requests', 'activity_logs',
    'ip_logs', 'judging_templates', 'devices', 'pricing_plans',
  ];

  const counts: Record<string, number> = {};
  await Promise.all(
    tables.map(async (table) => {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      counts[table] = count ?? 0;
    }),
  );

  return counts;
}

// ============================================================
// 서버사이드 인증 헬퍼
// ============================================================

/** 현재 로그인 사용자의 profile 정보 (서버 컴포넌트용) */
export const getAuthProfile = cache(async function getAuthProfile(): Promise<User | null> {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const authUser = session?.user ?? null;
  if (!authUser) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();
  if (!data) return null;
  return toUser(data as Record<string, unknown>);
});

// ============================================================
// Admin 전용 함수 (is_admin() RLS 정책 적용됨)
// ============================================================

/** admin 전용: 모든 아티클 조회 (비공개 포함) */
export async function getAllArticles(): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => toArticle(row as Record<string, unknown>));
}

/** admin 전용: 모든 문의 조회 */
export async function getAllInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => toInquiry(row as Record<string, unknown>));
}

/** admin 전용: 활동로그 조회 (limit 미지정 시 전체, 60초 캐시) */
export const getAllActivityLogs = unstable_cache(
  async (limit?: number): Promise<ActivityLog[]> => {
    const supabase = createPublicClient();
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row) => toActivityLog(row as Record<string, unknown>));
  },
  ['activity-logs'],
  { tags: ['activity-logs'], revalidate: 60 },
);

/** admin 전용: 특정 상태의 문의 건수 조회 (count-only, 120초 캐시) */
export const getInquiryCountByStatus = unstable_cache(
  async (status: string): Promise<number> => {
    const supabase = createPublicClient();
    const { count, error } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    if (error) return 0;
    return count ?? 0;
  },
  ['inquiry-count'],
  { tags: ['inquiries'], revalidate: 120 },
);

/** admin 전용: 모든 IP 로그 조회 */
export async function getAllIpLogs(): Promise<IpLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ip_logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => toIpLog(row as Record<string, unknown>));
}

/** admin 전용: 모든 대행의뢰 조회 */
export async function getAllAgencyRequests(): Promise<AgencyRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('agency_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => toAgencyRequest(row as Record<string, unknown>));
}

/** admin 전용: 공모전 생성 */
export async function createContest(input: ContestMutationInput): Promise<Contest | null> {
  const supabase = await createClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (authError || !user) return null;

  const normalizedTitle = input.title.trim();
  const slugPrefix = normalizedTitle
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .slice(0, 36);
  const slug = `${slugPrefix || 'contest'}-${Date.now()}`;

  const contestRow = {
    ...toContestRowPayload(input),
    slug,
    host_company_id: null,
    host_user_id: user.id,
  };


  const { data: insertedContest, error: insertError } = await supabase
    .from('contests')
    .insert(contestRow)
    .select('id')
    .single();

  if (insertError) {
    console.error('[createContest] insert 실패:', insertError.message, insertError.details, insertError.hint);
    throw new Error('공모전 등록에 실패했습니다.');
  }
  if (!insertedContest) {
    throw new Error('contests insert 후 데이터 없음');
  }

  const contestId = String(insertedContest.id);

  const awardRows = input.awardTiers
    .filter((tier) => tier.label.trim().length > 0)
    .map((tier, index) => ({
      contest_id: contestId,
      label: tier.label.trim(),
      count: Math.max(1, tier.count),
      prize_amount: tier.prizeAmount?.trim() || null,
      sort_order: index + 1,
    }));

  if (awardRows.length > 0) {
    const { error: tierError } = await supabase.from('contest_award_tiers').insert(awardRows);
    if (tierError) {
      console.error('[createContest] award_tiers insert 실패:', tierError.message, tierError.details);
      await supabase.from('contests').delete().eq('id', contestId);
      throw new Error('시상 부문 등록에 실패했습니다.');
    }
  }

  const bonusRows = (input.bonusConfigs ?? [])
    .filter((config) => config.label.trim().length > 0)
    .map((config, index) => ({
      contest_id: contestId,
      label: config.label.trim(),
      description: config.description?.trim() || null,
      score: config.score,
      requires_url: config.requiresUrl,
      requires_image: config.requiresImage,
      sort_order: index + 1,
    }));

  if (bonusRows.length > 0) {
    const { error: bonusError } = await supabase.from('contest_bonus_configs').insert(bonusRows);
    if (bonusError) {
      console.error('[createContest] bonus_configs insert 실패:', bonusError.message, bonusError.details);
      await supabase.from('contest_award_tiers').delete().eq('contest_id', contestId);
      await supabase.from('contests').delete().eq('id', contestId);
      throw new Error('가산점 설정 등록에 실패했습니다.');
    }
  }

  // 심사 기준 → judging_templates + judging_criteria 동기화
  // 심사 기준 동기화 (단일 단계 하위 호환 + 다단계)
  await syncContestJudgingTemplate(supabase, contestId, input.judgingCriteria);
  if (input.judgingStages && input.judgingStages.length > 0) {
    await syncContestJudgingStages(supabase, contestId, input.judgingStages);
  }

  const result = await getContestByIdInternal(supabase, contestId);
  const { revalidateTag } = await import('next/cache');
  revalidateTag('contests');
  return result;
}

/** admin 전용: 공모전 수정 */
export async function updateContest(id: string, input: ContestMutationInput): Promise<Contest | null> {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from('contests')
    .update(toContestRowPayload(input))
    .eq('id', id);

  if (updateError) return null;

  const { error: deleteTierError } = await supabase
    .from('contest_award_tiers')
    .delete()
    .eq('contest_id', id);
  if (deleteTierError) return null;

  const awardRows = input.awardTiers
    .filter((tier) => tier.label.trim().length > 0)
    .map((tier, index) => ({
      contest_id: id,
      label: tier.label.trim(),
      count: Math.max(1, tier.count),
      prize_amount: tier.prizeAmount?.trim() || null,
      sort_order: index + 1,
    }));

  if (awardRows.length > 0) {
    const { error: insertTierError } = await supabase.from('contest_award_tiers').insert(awardRows);
    if (insertTierError) return null;
  }

  /* 가산점 항목(contest_bonus_configs) 안전한 upsert 처리.
   * 이전에 delete→insert 하던 방식은 FK ON DELETE CASCADE 때문에
   * bonus_entries 전체를 전멸시키는 치명적 버그였음.
   * 이제는 label 기준으로 기존 행을 식별해 UPDATE하고, 신규만 INSERT.
   * 기존 입력에서 제거된 항목도 bonus_entries가 걸려있으면 보존. */
  const { data: existingBonusConfigs, error: fetchBonusError } = await supabase
    .from('contest_bonus_configs')
    .select('id, label')
    .eq('contest_id', id);

  if (fetchBonusError) return null;

  const incomingBonusConfigs = (input.bonusConfigs ?? [])
    .filter((config) => config.label.trim().length > 0);

  const existingByLabel = new Map<string, { id: number; label: string }>(
    (existingBonusConfigs ?? []).map((c) => [
      (c.label as string).trim(),
      { id: c.id as number, label: c.label as string },
    ]),
  );
  const matchedExistingIds = new Set<number>();

  for (let index = 0; index < incomingBonusConfigs.length; index += 1) {
    const config = incomingBonusConfigs[index];
    const trimmedLabel = config.label.trim();
    const payload: Record<string, unknown> = {
      contest_id: id,
      label: trimmedLabel,
      description: config.description?.trim() || null,
      score: config.score,
      requires_url: config.requiresUrl,
      requires_image: config.requiresImage,
      sort_order: index + 1,
    };

    const existing = existingByLabel.get(trimmedLabel);
    if (existing) {
      matchedExistingIds.add(existing.id);
      const { error: updateBonusError } = await supabase
        .from('contest_bonus_configs')
        .update(payload)
        .eq('id', existing.id);
      if (updateBonusError) return null;
    } else {
      const { error: insertBonusError } = await supabase
        .from('contest_bonus_configs')
        .insert(payload);
      if (insertBonusError) return null;
    }
  }

  /* 입력에서 빠진 기존 항목: bonus_entries가 없을 때만 DELETE.
   * 있으면 고아 config로 남겨두지만 실제 가산점 데이터는 보존. */
  for (const existing of existingBonusConfigs ?? []) {
    const existingId = existing.id as number;
    if (matchedExistingIds.has(existingId)) continue;

    const { count: entriesCount } = await supabase
      .from('bonus_entries')
      .select('id', { count: 'exact', head: true })
      .eq('bonus_config_id', existingId);

    if ((entriesCount ?? 0) === 0) {
      await supabase
        .from('contest_bonus_configs')
        .delete()
        .eq('id', existingId);
    }
    /* entries 존재 시: 유지 (데이터 유실 방지) */
  }

  // 심사 기준 → judging_templates + judging_criteria 동기화
  // 심사 기준 동기화 (단일 단계 하위 호환 + 다단계)
  await syncContestJudgingTemplate(supabase, id, input.judgingCriteria);
  if (input.judgingStages && input.judgingStages.length > 0) {
    await syncContestJudgingStages(supabase, id, input.judgingStages);
  }

  const result = await getContestByIdInternal(supabase, id);
  const { revalidateTag } = await import('next/cache');
  revalidateTag('contests');
  return result;
}

/** admin 전용: 공모전 삭제 */
export async function deleteContest(id: string): Promise<boolean> {
  const supabase = await createClient();

  await supabase.from('contest_bonus_configs').delete().eq('contest_id', id);
  await supabase.from('contest_award_tiers').delete().eq('contest_id', id);

  const { error } = await supabase
    .from('contests')
    .delete()
    .eq('id', id);

  // 캐시 무효화: 공모전 데이터 변경
  const { revalidateTag } = await import('next/cache');
  revalidateTag('contests');
  return !error;
}

// ============================================================
// Host / Judge 전용 함수
// ============================================================

/** 특정 주최자(host)의 공모전만 조회 */
export function getContestsByHost(hostUserId: string): Promise<Contest[]> {
  return unstable_cache(
    async (): Promise<Contest[]> => {
      const supabase = await createClient();

      const { data: contestRows, error } = await supabase
        .from('contests')
        .select('*')
        .eq('host_user_id', hostUserId)
        .order('created_at', { ascending: false });
      if (error || !contestRows) return [];

      const contestIds = contestRows.map((c) => String(c.id));
      if (contestIds.length === 0) return [];
      const { tiersMap, bonusMap } = await getContestRelationsByIds(supabase, contestIds);

      return contestRows.map((row) =>
        toContest(
          row as Record<string, unknown>,
          tiersMap.get(String(row.id)) ?? [],
          bonusMap.get(String(row.id)) ?? [],
        ),
      );
    },
    ['contests-by-host', hostUserId],
    { tags: ['contests'], revalidate: 60 },
  )();
}

/** 특정 심사위원(judge user)에게 배정된 공모전 ID 목록 조회 */
export async function getJudgeAssignments(judgeUserId: string): Promise<Judge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('judges')
    .select('*')
    .eq('user_id', judgeUserId)
    .order('invited_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toJudge(row as Record<string, unknown>));
}

/** 특정 공모전의 심사위원 목록 조회 */
export async function getJudgesByContest(contestId: string): Promise<Judge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('judges')
    .select('*')
    .eq('contest_id', contestId)
    .order('invited_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toJudge(row as Record<string, unknown>));
}

/** 특정 공모전의 점수 목록 조회 */
export async function getScoresByContest(contestId: string): Promise<Score[]> {
  const supabase = await createClient();

  // 해당 공모전의 submission ID 목록 먼저 조회
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id')
    .eq('contest_id', contestId);
  if (!submissions || submissions.length === 0) return [];

  const submissionIds = submissions.map((s) => String(s.id));
  const { data: scores, error } = await supabase
    .from('scores')
    .select('*')
    .in('submission_id', submissionIds)
    .order('created_at', { ascending: true });
  if (error || !scores) return [];

  const scoreIds = scores.map((s) => String(s.id));
  const { data: scoreCriteria } = await supabase
    .from('score_criteria')
    .select('*')
    .in('score_id', scoreIds);

  const criteriaMap = new Map<string, Array<{ criterionId: string; score: number }>>();
  for (const sc of scoreCriteria ?? []) {
    const sid = String(sc.score_id);
    if (!criteriaMap.has(sid)) criteriaMap.set(sid, []);
    criteriaMap.get(sid)!.push({
      criterionId: String(sc.criterion_id),
      score: sc.score as number,
    });
  }

  return scores.map((row) => ({
    id: String(row.id),
    submissionId: String(row.submission_id),
    judgeId: String(row.judge_id),
    templateId: row.template_id ? String(row.template_id) : '',
    total: row.total as number,
    criteriaScores: criteriaMap.get(String(row.id)) ?? [],
    comment: (row.comment as string) ?? undefined,
    createdAt: row.created_at as string,
    stageId: row.stage_id ? String(row.stage_id) : undefined,
  }));
}

// ============================================================
// 다단계 심사 함수
// ============================================================

/** 공모전의 심사 단계 목록 조회 (템플릿 + 심사위원 포함) */
export async function getJudgingStages(contestId: string): Promise<JudgingStage[]> {
  const supabase = await createClient();

  const { data: stages, error } = await supabase
    .from('judging_stages')
    .select('*')
    .eq('contest_id', contestId)
    .order('stage_number', { ascending: true });
  if (error || !stages) return [];

  // 템플릿 조회 (scored 단계)
  const templateIds = stages.map((s) => s.template_id).filter(Boolean) as number[];
  let templatesMap = new Map<string, JudgingTemplate>();
  if (templateIds.length > 0) {
    const { data: templates } = await supabase
      .from('judging_templates')
      .select('*')
      .in('id', templateIds);
    const tIds = (templates ?? []).map((t) => String(t.id));
    const { data: criteria } = await supabase
      .from('judging_criteria')
      .select('*')
      .in('template_id', tIds.map(Number))
      .order('sort_order', { ascending: true });

    for (const t of templates ?? []) {
      const tid = String(t.id);
      const tCriteria = (criteria ?? []).filter((c) => String(c.template_id) === tid).map((c) => ({
        id: String(c.id),
        label: c.label as string,
        maxScore: c.max_score as number,
        description: (c.description as string) ?? '',
      }));
      templatesMap.set(tid, {
        id: tid,
        name: t.name as string,
        description: (t.description as string) ?? '',
        criteria: tCriteria,
        createdAt: t.created_at as string,
      });
    }
  }

  // 단계별 심사위원 조회
  const stageIds = stages.map((s) => s.id as number);
  const { data: stageJudges } = await supabase
    .from('stage_judges')
    .select('stage_id, judge_id')
    .in('stage_id', stageIds);

  const judgeIdsMap = new Map<string, string[]>();
  for (const sj of stageJudges ?? []) {
    const sid = String(sj.stage_id);
    if (!judgeIdsMap.has(sid)) judgeIdsMap.set(sid, []);
    judgeIdsMap.get(sid)!.push(String(sj.judge_id));
  }

  return stages.map((row) => {
    const sid = String(row.id);
    const tid = row.template_id ? String(row.template_id) : undefined;
    return {
      id: sid,
      contestId: String(row.contest_id),
      stageNumber: row.stage_number as number,
      name: row.name as string,
      method: row.method as JudgingStage['method'],
      templateId: tid,
      template: tid ? templatesMap.get(tid) : undefined,
      isActive: row.is_active as boolean,
      sortOrder: row.sort_order as number,
      judgeIds: judgeIdsMap.get(sid) ?? [],
    };
  });
}

/** 특정 단계의 심사 대상 출품작 조회 (1단계: approved 출품작, N>1단계: 이전 단계 pass) */
export async function getSubmissionsForStage(contestId: string, _stageId: string, stageNumber: number): Promise<Submission[]> {
  const supabase = await createClient();

  if (stageNumber === 1) {
    // 1단계: 승인된 출품작 전부
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('contest_id', contestId)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => toSubmission(row as Record<string, unknown>));
  }

  // N>1단계: 이전 단계에서 pass한 출품작
  const { data: stages } = await supabase
    .from('judging_stages')
    .select('id')
    .eq('contest_id', contestId)
    .eq('stage_number', stageNumber - 1)
    .maybeSingle();

  if (!stages) return [];

  const { data: passedResults } = await supabase
    .from('submission_stage_results')
    .select('submission_id')
    .eq('stage_id', stages.id)
    .eq('result', 'pass');

  if (!passedResults || passedResults.length === 0) return [];

  const passedIds = passedResults.map((r) => r.submission_id as number);
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .in('id', passedIds)
    .order('submitted_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toSubmission(row as Record<string, unknown>));
}

/** 특정 단계의 간편 심사 투표 조회 */
export async function getSimpleJudgments(stageId: string): Promise<SimpleJudgment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('simple_judgments')
    .select('*')
    .eq('stage_id', stageId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    submissionId: String(row.submission_id),
    stageId: String(row.stage_id),
    judgeId: String(row.judge_id),
    judgment: row.judgment as SimpleJudgment['judgment'],
    comment: (row.comment as string) ?? undefined,
    createdAt: row.created_at as string,
  }));
}

/** 특정 단계의 출품작별 결과 조회 */
export async function getStageResults(stageId: string): Promise<SubmissionStageResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('submission_stage_results')
    .select('*')
    .eq('stage_id', stageId);
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    submissionId: String(row.submission_id),
    stageId: String(row.stage_id),
    result: row.result as SubmissionStageResult['result'],
    decidedBy: (row.decided_by as string) ?? undefined,
    decidedAt: (row.decided_at as string) ?? undefined,
  }));
}

/** 출품작 단계 결과 설정 (upsert) */
export async function setSubmissionStageResult(
  submissionId: string, stageId: string, result: StageResult, decidedBy: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('submission_stage_results')
    .upsert({
      submission_id: submissionId,
      stage_id: stageId,
      result,
      decided_by: decidedBy,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'submission_id,stage_id' });
  return !error;
}

// ============================================================
// 로그 기록 함수
// ============================================================

/** activity_logs 테이블에 활동 로그 기록 */
export async function createActivityLog(params: {
  userId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('activity_logs').insert({
    user_id: params.userId,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    metadata: params.metadata ?? null,
  });
  if (error) {
    console.error('활동 로그 기록 실패:', error.message);
  }
}

/** ip_logs 테이블에 IP 로그 기록 */
export async function createIpLog(params: {
  userId: string;
  ipAddress: string;
  userAgent?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('ip_logs').insert({
    user_id: params.userId,
    ip_address: params.ipAddress,
    user_agent: params.userAgent ?? null,
    country: null,
    region: null,
    risk_level: 'low',
  });
  if (error) {
    console.error('IP 로그 기록 실패:', error.message);
  }
}

/** utm_visits 테이블에 UTM 방문 기록 */
export async function createUtmVisit(params: {
  sessionId?: string;
  userId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPage?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('utm_visits').insert({
    session_id: params.sessionId ?? null,
    user_id: params.userId ?? null,
    utm_source: params.utmSource ?? null,
    utm_medium: params.utmMedium ?? null,
    utm_campaign: params.utmCampaign ?? null,
    utm_term: params.utmTerm ?? null,
    utm_content: params.utmContent ?? null,
    referrer: params.referrer ?? null,
    landing_page: params.landingPage ?? null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  });
  if (error) {
    console.error('UTM 방문 기록 실패:', error.message);
  }
}

// ============================================================
// 팝업 관리
// ============================================================

/** DB row → Popup 변환 */
function toPopup(row: Record<string, unknown>): Popup {
  return {
    id: String(row.id),
    title: row.title as string,
    content: (row.content as string) ?? undefined,
    imageUrl: (row.image_url as string) ?? undefined,
    linkUrl: (row.link_url as string) ?? undefined,
    linkTarget: (row.link_target as string) ?? '_self',
    status: row.status as Popup['status'],
    displayStartAt: row.display_start_at as string,
    displayEndAt: row.display_end_at as string,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** 팝업 전체 목록 (관리자용, 캐시 없음) */
export async function getAllPopups(): Promise<Popup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => toPopup(row as Record<string, unknown>));
}

/** 활성 팝업 목록 (공개용, 5분 캐시) */
export const getActivePopups = unstable_cache(
  async (): Promise<Popup[]> => {
    const supabase = createPublicClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('popups')
      .select('*')
      .eq('status', 'active')
      .lte('display_start_at', now)
      .gte('display_end_at', now)
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => toPopup(row as Record<string, unknown>));
  },
  ['active-popups'],
  { tags: ['popups'], revalidate: 30 },
);

/** 팝업 상세 조회 */
export async function getPopupById(id: string): Promise<Popup | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return toPopup(data as Record<string, unknown>);
}

/** 팝업 생성 */
/** admin 전용: 아티클 생성 */
export async function createArticle(
  input: ArticleMutationInput,
  authorId: string,
): Promise<Article | null> {
  const supabase = await createClient();

  const normalizedTitle = input.title.trim();
  const slugPrefix = normalizedTitle
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .slice(0, 36);
  const slug = `${slugPrefix || 'article'}-${Date.now()}`;

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('articles')
    .insert({
      type: input.type,
      title: normalizedTitle,
      slug,
      excerpt: input.excerpt?.trim() || null,
      content: input.content,
      author_id: authorId,
      tags: input.tags ?? [],
      is_published: input.isPublished,
      published_at: input.isPublished ? nowIso : null,
      thumbnail_url: input.thumbnailUrl?.trim() || null,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('[createArticle] 실패:', error?.message, error?.details, error?.hint);
    return null;
  }

  const { revalidateTag } = await import('next/cache');
  revalidateTag('articles');
  return toArticle(data as Record<string, unknown>);
}

export async function createPopup(input: PopupMutationInput): Promise<Popup | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('popups')
    .insert({
      title: input.title,
      content: input.content ?? null,
      image_url: input.imageUrl ?? null,
      link_url: input.linkUrl ?? null,
      link_target: input.linkTarget ?? '_self',
      status: input.status,
      display_start_at: input.displayStartAt,
      display_end_at: input.displayEndAt,
      sort_order: input.sortOrder ?? 0,
    })
    .select('*')
    .single();
  if (error || !data) {
    console.error('[createPopup] 실패:', error?.message);
    return null;
  }
  const { revalidateTag } = await import('next/cache');
  revalidateTag('popups');
  return toPopup(data as Record<string, unknown>);
}

/** 팝업 수정 */
export async function updatePopup(id: string, input: PopupMutationInput): Promise<Popup | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('popups')
    .update({
      title: input.title,
      content: input.content ?? null,
      image_url: input.imageUrl ?? null,
      link_url: input.linkUrl ?? null,
      link_target: input.linkTarget ?? '_self',
      status: input.status,
      display_start_at: input.displayStartAt,
      display_end_at: input.displayEndAt,
      sort_order: input.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) {
    console.error('[updatePopup] 실패:', error?.message);
    return null;
  }
  const { revalidateTag } = await import('next/cache');
  revalidateTag('popups');
  return toPopup(data as Record<string, unknown>);
}

/** 팝업 삭제 */
export async function deletePopup(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from('popups').delete().eq('id', id);
  if (error) {
    console.error('[deletePopup] 실패:', error.message);
    return false;
  }
  const { revalidateTag } = await import('next/cache');
  revalidateTag('popups');
  return true;
}

/* ─── 부정사용 플래그 (abuse_flags) ─── */

export type AbuseFlag = {
  id: string;
  flagType: string;
  severity: number;
  submissionId: string | null;
  userId: string | null;
  ipHash: string | null;
  details: Record<string, unknown>;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
};

/** 부정사용 플래그 목록 조회 (관리자 전용) */
export async function getAbuseFlags(): Promise<AbuseFlag[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('abuse_flags')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    flagType: row.flag_type as string,
    severity: (row.severity as number) ?? 1,
    submissionId: row.submission_id ? String(row.submission_id) : null,
    userId: (row.user_id as string) ?? null,
    ipHash: (row.ip_hash as string) ?? null,
    details: (row.details as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    resolvedAt: (row.resolved_at as string) ?? null,
    resolvedBy: (row.resolved_by as string) ?? null,
  }));
}

/** 부정사용 플래그 해결 처리 */
export async function resolveAbuseFlag(flagId: string, resolvedByUserId: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from('abuse_flags')
    .update({ resolved_at: new Date().toISOString(), resolved_by: resolvedByUserId })
    .eq('id', flagId);
  if (error) {
    console.error('[resolveAbuseFlag] 실패:', error.message);
    return false;
  }
  return true;
}

/**
 * 사이트 설정 전체 조회 (캐시)
 * @returns Record<string, boolean> 형태의 key-value 맵
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<Record<string, boolean>> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from('site_settings').select('key, value');
    if (error || !data) return {};
    return Object.fromEntries(
      data.map((row) => [row.key, row.value === true || row.value === 'true']),
    );
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 60 },
);

/** 사이트 설정 단일 업데이트 */
export async function updateSiteSetting(
  key: string,
  value: boolean,
  updatedBy?: string,
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('site_settings')
    .update({ value, updated_at: new Date().toISOString(), updated_by: updatedBy ?? null })
    .eq('key', key);

  if (error) {
    console.error('[updateSiteSetting] 실패:', error.message);
    return false;
  }

  const { revalidateTag } = await import('next/cache');
  revalidateTag('site-settings');
  return true;
}
