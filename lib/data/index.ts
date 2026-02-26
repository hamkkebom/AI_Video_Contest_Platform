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
import type {
  Article,
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
} from '@/lib/types';

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
    promotionVideoUrls: (row.promotion_video_urls as string[]) ?? undefined,
    hasLandingPage: (row.has_landing_page as boolean) ?? false,
    landingPageUrl: (row.landing_page_url as string) ?? undefined,
    bonusConfigs: bonusConfigs.length > 0 ? bonusConfigs : undefined,
    bonusMaxScore: (row.bonus_max_score as number) ?? undefined,
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
  promotionVideoUrls?: string[];
  hasLandingPage?: boolean;
  bonusMaxScore?: number;
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
    promotion_video_urls: input.promotionVideoUrls ?? [],
    has_landing_page: input.hasLandingPage ?? false,
    bonus_max_score: input.bonusMaxScore ?? null,
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
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
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
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  id: string,
): Promise<Contest | null> {
  const { data: contestRow, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !contestRow) return null;

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
    submittedAt: row.submitted_at as string,
    views: (row.views as number) ?? 0,
    likeCount: (row.like_count as number) ?? 0,
    videoDuration: (row.video_duration as number) ?? 0,
    avgWatchDuration: (row.avg_watch_duration as number) ?? 0,
    tags: (row.tags as string[]) ?? [],
    autoRejectedReason: (row.auto_rejected_reason as string) ?? undefined,
    aiTools: (row.ai_tools as string) ?? undefined,
    productionProcess: (row.production_process as string) ?? undefined,
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
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => toUser(row as Record<string, unknown>));
  },
  ['users'],
  { tags: ['users'], revalidate: 120 },
);

/** 단건 유저 조회 (profiles 테이블) */
export function getUserById(id: string): Promise<User | null> {
  return unstable_cache(
    async (): Promise<User | null> => {
      const supabase = createPublicClient();
      if (!supabase) return null;
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
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);
  if (error || !data) return [];
  return data.map((row) => toUser(row as Record<string, unknown>));
}

export async function getCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toCompany(row as Record<string, unknown>));
}

export async function getCompanyMembers(): Promise<CompanyMember[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('company_members')
    .select('*')
    .order('joined_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toCompanyMember(row as Record<string, unknown>));
}

export async function getDevices(): Promise<Device[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toDevice(row as Record<string, unknown>));
}

export async function getDevicesByUser(userId: string): Promise<Device[]> {
  const supabase = await createClient();
  if (!supabase) return [];
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
 */
export const getContests = unstable_cache(
  async (filters?: ContestFilters): Promise<Contest[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];

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
    if (error || !contestRows || contestRows.length === 0) return [];

    const contestIds = contestRows.map((c) => String(c.id));
    const { tiersMap, bonusMap } = await getContestRelationsByIds(supabase, contestIds);

    return contestRows.map((row) =>
      toContest(
        row as Record<string, unknown>,
        tiersMap.get(String(row.id)) ?? [],
        bonusMap.get(String(row.id)) ?? [],
      ),
    );
  },
  ['contests'],
  { tags: ['contests'], revalidate: 60 },
);

/** 공모전 단건 조회 (award_tiers, bonus_configs 포함) — 120초 캐시 */
export function getContestById(id: string): Promise<Contest | null> {
  return unstable_cache(
    async (): Promise<Contest | null> => {
      const supabase = createPublicClient();
      if (!supabase) return null;
      return getContestByIdInternal(supabase, id);
    },
    [`contest-${id}`],
    { tags: ['contests'], revalidate: 120 },
  )();
}

/** 슬러그로 공모전 ID 조회 (슬러그 → 숫자 ID 리다이렉트용) */
export async function getContestIdBySlug(slug: string): Promise<string | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
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
 * 동일 지역 우선, 부족하면 다른 지역으로 채움. 최대 limit개.
 */
export async function getRelatedContests(excludeId: string, region: string, limit = 6): Promise<Contest[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  // 동일 지역 공모전 먼저 조회
  const { data: sameRegion } = await supabase
    .from('contests')
    .select('*')
    .neq('id', excludeId)
    .eq('region', region)
    .order('created_at', { ascending: false })
    .limit(limit);

  const sameRegionRows = sameRegion ?? [];

  // 부족하면 다른 지역에서 추가 조회
  let otherRows: typeof sameRegionRows = [];
  if (sameRegionRows.length < limit) {
    const remaining = limit - sameRegionRows.length;
    const { data: others } = await supabase
      .from('contests')
      .select('*')
      .neq('id', excludeId)
      .neq('region', region)
      .order('created_at', { ascending: false })
      .limit(remaining);
    otherRows = others ?? [];
  }

  const allRows = [...sameRegionRows, ...otherRows];
  if (allRows.length === 0) return [];

  const contestIds = allRows.map((c) => String(c.id));
  const { tiersMap, bonusMap } = await getContestRelationsByIds(supabase, contestIds);

  return allRows.map((row) =>
    toContest(
      row as Record<string, unknown>,
      tiersMap.get(String(row.id)) ?? [],
      bonusMap.get(String(row.id)) ?? [],
    ),
  );
}

/** 출품작 목록 조회 — 30초 캐시, 필터 지원 */
export const getSubmissions = unstable_cache(
  async (filters?: SubmissionFilters): Promise<Submission[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];

    let query = supabase
      .from('submissions')
      .select('*')
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
  },
  ['submissions'],
  { tags: ['submissions'], revalidate: 30 },
);

export async function getLikes(): Promise<Like[]> {
  const supabase = await createClient();
  if (!supabase) return [];
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
  if (!supabase) return { liked: false, totalLikes: 0 };

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

export async function getArticles(): Promise<Article[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => toArticle(row as Record<string, unknown>));
}

export async function getFaqs(): Promise<FAQ[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('updated_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toFaq(row as Record<string, unknown>));
}

export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toInquiry(row as Record<string, unknown>));
}

export async function getAgencyRequests(): Promise<AgencyRequest[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('agency_requests')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toAgencyRequest(row as Record<string, unknown>));
}

export async function getJudgingTemplates(): Promise<JudgingTemplate[]> {
  const supabase = await createClient();
  if (!supabase) return [];

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

export async function getJudges(): Promise<Judge[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('judges')
    .select('*')
    .order('invited_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toJudge(row as Record<string, unknown>));
}

export async function getScores(): Promise<Score[]> {
  const supabase = await createClient();
  if (!supabase) return [];

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
  }));
}

export async function getContestResults(): Promise<ContestResult[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('contest_results')
    .select('*')
    .order('rank', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toContestResult(row as Record<string, unknown>));
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*');
  if (error || !data) return [];
  return data.map((row) => toPricingPlan(row as Record<string, unknown>));
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => toActivityLog(row as Record<string, unknown>));
}

export async function getIpLogs(): Promise<IpLog[]> {
  const supabase = await createClient();
  if (!supabase) return [];
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
 * 전체 갤러리: 결과발표된 공모전의 모든 출품작
 */
export async function getGallerySubmissions(): Promise<GallerySubmission[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  // completed 상태 공모전 조회
  const { data: completedContests } = await supabase
    .from('contests')
    .select('id, title')
    .eq('status', 'completed');
  if (!completedContests || completedContests.length === 0) return [];

  const completedIds = completedContests.map((c) => String(c.id));
  const contestTitleMap = new Map(completedContests.map((c) => [String(c.id), c.title as string]));

  // 해당 공모전의 출품작 조회
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .in('contest_id', completedIds);
  if (!submissions || submissions.length === 0) return [];

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
    .in('contest_id', completedIds);
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
      creatorName: profileMap.get(sub.userId) ?? '익명',
      prizeLabel: result?.prizeLabel,
      rank: result?.rank,
    };
  });
}

/**
 * 수상작 갤러리: 결과발표된 공모전의 수상작만
 */
export async function getAwardedSubmissions(): Promise<GallerySubmission[]> {
  const supabase = await createClient();
  if (!supabase) return [];

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
        creatorName: profileMap.get(sub.userId) ?? '익명',
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
}

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
 * 단일 출품작 상세 조회
 */
export async function getSubmissionById(id: string): Promise<GallerySubmission | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: submissionRow } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!submissionRow) return null;

  const sub = toSubmission(submissionRow as Record<string, unknown>);

  // 공모전 제목
  const { data: contest } = await supabase
    .from('contests')
    .select('title')
    .eq('id', sub.contestId)
    .maybeSingle();

  // 크리에이터 이름
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, name')
    .eq('id', sub.userId)
    .maybeSingle();

  // 수상 결과
  const { data: result } = await supabase
    .from('contest_results')
    .select('prize_label, rank')
    .eq('submission_id', id)
    .maybeSingle();

  return {
    ...sub,
    contestTitle: (contest?.title as string) ?? '',
    creatorName: (profile?.nickname as string) ?? (profile?.name as string) ?? '익명',
    prizeLabel: result ? (result.prize_label as string) : undefined,
    rank: result ? (result.rank as number) : undefined,
  };
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
  if (!supabase) return { contests: [], submissions: [], users: [], articles: [] };

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
  if (!supabase) return {};

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
  if (!supabase) return null;

  const { data: { user: authUser } } = await supabase.auth.getUser();
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
  if (!supabase) return [];
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
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => toInquiry(row as Record<string, unknown>));
}

/** admin 전용: 모든 활동로그 조회 */
export async function getAllActivityLogs(): Promise<ActivityLog[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => toActivityLog(row as Record<string, unknown>));
}

/** admin 전용: 모든 IP 로그 조회 */
export async function getAllIpLogs(): Promise<IpLog[]> {
  const supabase = await createClient();
  if (!supabase) return [];
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
  if (!supabase) return [];
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
  if (!supabase) return null;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

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
    throw new Error(`contests insert 실패: ${insertError.message}`);
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
      throw new Error(`award_tiers insert 실패: ${tierError.message}`);
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
      throw new Error(`bonus_configs insert 실패: ${bonusError.message}`);
    }
  }

  const result = await getContestByIdInternal(supabase, contestId);
  // 캐시 무효화: 공모전 데이터 변경
  const { revalidateTag } = await import('next/cache');
  revalidateTag('contests');
  return result;
}

/** admin 전용: 공모전 수정 */
export async function updateContest(id: string, input: ContestMutationInput): Promise<Contest | null> {
  const supabase = await createClient();
  if (!supabase) return null;

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

  const { error: deleteBonusError } = await supabase
    .from('contest_bonus_configs')
    .delete()
    .eq('contest_id', id);
  if (deleteBonusError) return null;

  const bonusRows = (input.bonusConfigs ?? [])
    .filter((config) => config.label.trim().length > 0)
    .map((config, index) => ({
      contest_id: id,
      label: config.label.trim(),
      description: config.description?.trim() || null,
      score: config.score,
      requires_url: config.requiresUrl,
      requires_image: config.requiresImage,
      sort_order: index + 1,
    }));

  if (bonusRows.length > 0) {
    const { error: insertBonusError } = await supabase.from('contest_bonus_configs').insert(bonusRows);
    if (insertBonusError) return null;
  }

  const result = await getContestByIdInternal(supabase, id);
  // 캐시 무효화: 공모전 데이터 변경
  const { revalidateTag } = await import('next/cache');
  revalidateTag('contests');
  return result;
}

/** admin 전용: 공모전 삭제 */
export async function deleteContest(id: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

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
export async function getContestsByHost(hostUserId: string): Promise<Contest[]> {
  const supabase = await createClient();
  if (!supabase) return [];

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
}

/** 특정 심사위원(judge user)에게 배정된 공모전 ID 목록 조회 */
export async function getJudgeAssignments(judgeUserId: string): Promise<Judge[]> {
  const supabase = await createClient();
  if (!supabase) return [];
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
  if (!supabase) return [];
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
  if (!supabase) return [];

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
  }));
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
  if (!supabase) return;
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
  if (!supabase) return;
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
  if (!supabase) return;
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
