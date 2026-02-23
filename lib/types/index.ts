export type UserRole = "guest" | "participant" | "host" | "judge" | "admin";

export type UserStatus = "active" | "pending" | "suspended";

/**
 * 목업 데모용 역할 전환 인터페이스
 * 실 서비스에서는 roles 배열로 대체됨
 */
export interface DemoRoles {
  isGuest: boolean;
  isParticipant: boolean;
  isHost: boolean;
  isJudge: boolean;
  isAdmin: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  role: UserRole;
  companyName?: string;
  region: string;
  createdAt: string;
  status: UserStatus;
  avatarUrl?: string;
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

export interface Contest {
  id: string;
  title: string;
  slug: string;
  hostId: string;
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
  /** 프리미엄 랜딩페이지 보유 여부 (유료 부가 서비스) */
  hasLandingPage?: boolean;
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
