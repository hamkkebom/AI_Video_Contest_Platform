export type UserRole = "guest" | "participant" | "host" | "judge" | "admin";
export type UserStatus = "active" | "pending" | "suspended";
export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  roles: UserRole[];               // 복수 역할 지원 (admin은 모든 페이지 접근 가능)
  region?: string;                 // 선택 — 미입력 시 null
  phone?: string;                  // 전화번호
  introduction?: string;           // 자기소개
  socialLinks?: Record<string, string>; // 소셜 링크 (instagram, youtube, portfolio 등)
  preferredChatAi?: string[];      // 선호 채팅 AI 도구
  preferredImageAi?: string[];     // 선호 이미지 AI 도구
  preferredVideoAi?: string[];     // 선호 영상 AI 도구
  planId?: string;                 // FK → pricing_plans.id (가입 시 free 자동 부여)
  createdAt: string;
  status: UserStatus;
  avatarUrl?: string;
}

export type CompanyStatus = "pending" | "approved" | "rejected";

export type CompanyMemberRole = "owner" | "manager" | "staff";
/** 기업 (사업자 단위) */
export interface Company {
  id: string;
  name: string;                    // 기업명
  businessNumber: string;           // 사업자등록번호
  representativeName: string;       // 대표자명
  address?: string;                 // 사업장 소재지
  phone?: string;                   // 대표 전화번호
  logoUrl?: string;                 // 기업 로고 URL
  website?: string;                 // 기업 홈페이지 URL
  description?: string;             // 기업 소개
  businessLicenseImageUrl?: string; // 사업자등록증 사본 이미지 URL
  status: CompanyStatus;            // 기업 승인 상태
  createdAt: string;
  updatedAt: string;
}
/** 기업-사용자 매핑 (N:M) */
export interface CompanyMember {
  id: string;
  companyId: string;                // FK → companies.id
  userId: string;                   // FK → users.id
  role: CompanyMemberRole;          // 기업 내 역할
  companyEmail?: string;            // 회사 업무용 이메일
  joinedAt: string;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  platform: "windows" | "macos" | "ios" | "android" | "linux";
  browser: "chrome" | "safari" | "firefox" | "edge";
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
  isTrusted: boolean;
}

export interface Like {
  id: string;
  userId: string;
  submissionId: string;
  createdAt: string;
}

export type ArticleType = "notice" | "program" | "insight";

export interface Article {
  id: string;
  type: ArticleType;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: string;
  tags: string[];
  publishedAt: string;
  isPublished: boolean;
  thumbnailUrl?: string;
}

export type InquiryType = "general" | "support" | "agency";

export type InquiryStatus = "pending" | "in_progress" | "resolved";

export interface Inquiry {
  id: string;
  userId: string;
  type: InquiryType;
  title: string;
  content: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export type FaqCategory = "participant" | "host" | "judge" | "general";

export type FaqTopic = "contest" | "service" | "payment" | "technical" | "account";

export interface FAQ {
  id: string;
  category: FaqCategory;
  topic: FaqTopic;
  question: string;
  answer: string;
  isPinned: boolean;
  updatedAt: string;
}

export interface JudgingCriterion {
  id: string;
  label: string;
  maxScore: number;
  description: string;
}

export interface JudgingTemplate {
  id: string;
  name: string;
  description: string;
  criteria: JudgingCriterion[];
  createdAt: string;
}

export type ContestStatus = "draft" | "open" | "closed" | "judging" | "completed";

/** 수상 티어 (상 종류별 인원 설정) */
export interface AwardTier {
  label: string;       // 예: "대상", "최우수상", "우수상", "장려상"
  count: number;       // 해당 상의 수상 인원
  prizeAmount?: string; // 해당 상의 개인 상금 (선택)
}


/** 공모전별 가산점 항목 설정 (주최자가 정의) */
export interface BonusConfig {
  id: string;
  label: string;            // 예: "공모전 공식포스터 SNS 공유 인증"
  description?: string;     // 상세 안내 문구
  score: number;            // 부여 점수 (보통 1)
  requiresUrl: boolean;     // SNS URL 제출 필요 여부
  requiresImage: boolean;   // 인증 이미지 제출 필요 여부
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  hostCompanyId: string;           // FK → companies.id (주최 기업)
  hostUserId: string;              // FK → users.id (주최 담당자)
  description: string;
  region: string;
  tags: string[];
  status: ContestStatus;
  submissionStartAt: string;
  submissionEndAt: string;
  judgingStartAt: string;
  judgingEndAt: string;
  resultAnnouncedAt: string;
  judgingType: "internal" | "external" | "both";
  reviewPolicy: "manual" | "auto_then_manual";
  maxSubmissionsPerUser: number;
  allowedVideoExtensions: string[];
  prizeAmount?: string;
  awardTiers: AwardTier[];
  posterUrl?: string;
  promotionVideoUrl?: string;
  /** 랜딩페이지 보유 여부 */
  hasLandingPage?: boolean;
  /** 랜딩페이지 URL */
  landingPageUrl?: string;
  /** 가산점 항목 설정 (없으면 가산점 미사용 공모전) */
  bonusConfigs?: BonusConfig[];
  /** 가산점 총 배점 */
  bonusMaxScore?: number;
  /** 가산점 반영 비율 (%) */
  bonusPercentage?: number;
  /** 심사위원 평가 비율 (%) */
  judgeWeightPercent?: number;
  /** 온라인 투표 비율 (%) */
  onlineVoteWeightPercent?: number;
  /** 온라인 투표 방식 (likes | views | likes_and_views) */
  onlineVoteType?: 'likes' | 'views' | 'likes_and_views';
  /** 조회수+좋아요 모드일 때 좋아요 비율 (%) */
  voteLikesPercent?: number;
  /** 조회수+좋아요 모드일 때 조회수 비율 (%) */
  voteViewsPercent?: number;
  /** 심사기준 배열 */
  judgingCriteria?: JudgingCriterion[];
  /** 결과 발표 형태 (website, email, sns, offline) */
  resultFormat?: string;
  /** 상세 안내 텍스트 */
  detailContent?: string;
  /** 상세 안내 이미지 URL 배열 */
  detailImageUrls?: string[];
  /** 참가 규정 및 가이드라인 (공모전별 개별 입력) */
  guidelines?: string;
}

export type SubmissionStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "auto_rejected"
  | "judging"
  | "judged";

export interface Submission {
  id: string;
  contestId: string;
  userId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  status: SubmissionStatus;
  submittedAt: string;
  views: number;
  likeCount: number;
  /** 영상 길이 (초) */
  videoDuration: number;
  /** 평균 시청 시간 (초) */
  avgWatchDuration: number;
  tags: string[];
  autoRejectedReason?: string;
  /** 사용한 AI 도구 (예: Sora, Runway, Midjourney) */
  aiTools?: string;
  /** 제작과정 설명 (긴 서술형) */
  productionProcess?: string;
  /** 가산점 인증 내역 */
  bonusEntries?: BonusEntry[];
}

/** 참가자가 제출하는 가산점 인증 */
export interface BonusEntry {
  bonusConfigId: string;     // Contest.bonusConfigs[].id 참조
  snsUrl?: string;           // SNS 게시물 URL
  proofImageUrl?: string;    // 캡처 이미지 URL
  submittedAt: string;       // 인증 제출 시각
}

export interface Score {
  id: string;
  submissionId: string;
  judgeId: string;
  templateId: string;
  total: number;
  criteriaScores: Array<{ criterionId: string; score: number }>;
  comment?: string;
  createdAt: string;
}

export interface ContestResult {
  contestId: string;
  submissionId: string;
  rank: number;
  prizeLabel: string;
  awardedAt: string;
}

export interface Judge {
  id: string;
  userId: string;
  contestId: string;
  isExternal: boolean;
  email?: string;
  invitedAt: string;
  acceptedAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  targetType: "contest" | "submission" | "user" | "article" | "inquiry";
  targetId: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface IpLog {
  id: string;
  userId: string;
  ipAddress: string;
  country: string;
  region: string;
  riskLevel: "low" | "medium" | "high";
  createdAt: string;
}

export interface ContestFilters {
  status?: ContestStatus;
  region?: string;
  search?: string;
}

export interface SubmissionFilters {
  contestId?: string;
  userId?: string;
  status?: SubmissionStatus;
  search?: string;
}

export interface SearchFilters {
  query: string;
  tab?: "all" | "contests" | "submissions" | "creators" | "articles";
}

export interface SearchResult {
  contests: Contest[];
  submissions: Submission[];
  users: User[];
  articles: Article[];
}

export type AgencyRequestStatus = "new" | "reviewing" | "quoted" | "closed";

export interface AgencyRequest {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phoneNumber?: string;
  budgetRange?: string;
  message: string;
  status: AgencyRequestStatus;
  createdAt: string;
}

export interface UTMTemplate {
  id: string;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  createdAt: string;
}

export interface RegionalMetric {
  region: string;
  userCount: number;
  contestCount: number;
  submissionCount: number;
}

export interface PlanFeatureAccess {
  free: boolean;
  label: string;
}

export type FeatureAccessByRole = {
  guest: Record<string, PlanFeatureAccess>;
  participant: Record<string, PlanFeatureAccess>;
  host: Record<string, PlanFeatureAccess>;
  judge: Record<string, PlanFeatureAccess>;
  admin: "all-free";
};

export interface PricingPlan {
  id: string;
  role: UserRole;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  active: boolean;
  featureKeys: string[];
}
