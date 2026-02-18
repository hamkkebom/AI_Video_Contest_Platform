import {
  ARTICLE_TYPES,
  FAQ_CATEGORIES,
  JUDGING_TYPES,
  REGIONS_KR,
  REVIEW_TABS,
  VIDEO_EXTENSIONS
} from "@/config/constants";
import type {
  ActivityLog,
  AgencyRequest,
  Article,
  Contest,
  ContestFilters,
  ContestResult,
  Device,
  FAQ,
  Inquiry,
  IpLog,
  Judge,
  JudgingTemplate,
  Like,
  Score,
  SearchFilters,
  SearchResult,
  Submission,
  SubmissionFilters,
  User
} from "@/lib/types";

const baseDate = new Date("2026-01-01T00:00:00.000Z");

function atDay(offset: number): string {
  return new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000).toISOString();
}

const usersStore: User[] = Array.from({ length: 60 }, (_, index) => {
  const role = (["participant", "host", "judge", "admin"] as const)[index % 4];
  const hostNumber = Math.floor(index / 4) + 1;
  const companyName = role === "host" ? `기업 ${hostNumber}` : undefined;
  return {
    id: `user-${index + 1}`,
    email: `user${index + 1}@mockup.local`,
    name: `사용자 ${index + 1}`,
    nickname: index < 40 ? `닉네임${index + 1}` : undefined,
    role,
    companyName,
    region: REGIONS_KR[index % REGIONS_KR.length],
    createdAt: atDay(index),
    status: index % 11 === 0 ? "pending" : "active",
    avatarUrl: `https://picsum.photos/seed/user-${index + 1}/160/160`
  };
});

const devicesStore: Device[] = usersStore.flatMap((user, userIndex) =>
  Array.from({ length: (userIndex % 3) + 1 }, (_, deviceIndex) => ({
    id: `device-${user.id}-${deviceIndex + 1}`,
    userId: user.id,
    name: `기기 ${deviceIndex + 1}`,
    platform: (["windows", "macos", "ios", "android", "linux"] as const)[
      (userIndex + deviceIndex) % 5
    ],
    browser: (["chrome", "safari", "firefox", "edge"] as const)[(userIndex + deviceIndex) % 4],
    ipAddress: `203.0.113.${(userIndex * 3 + deviceIndex) % 255}`,
    lastActiveAt: atDay(40 + userIndex + deviceIndex),
    createdAt: atDay(userIndex + deviceIndex),
    isTrusted: deviceIndex !== 2
  }))
);

const templatesStore: JudgingTemplate[] = [
  {
    id: "template-1",
    name: "표준 영상 심사",
    description: "기술력, 스토리, 완성도 중심",
    criteria: [
      { id: "criterion-tech", label: "기술력", maxScore: 40, description: "AI 활용 수준" },
      { id: "criterion-story", label: "스토리", maxScore: 30, description: "전달력" },
      { id: "criterion-finish", label: "완성도", maxScore: 30, description: "연출 및 편집" }
    ],
    createdAt: atDay(1)
  },
  {
    id: "template-2",
    name: "브랜드 협업 심사",
    description: "브랜드 적합성과 화제성 중심",
    criteria: [
      { id: "criterion-fit", label: "브랜드 적합성", maxScore: 50, description: "메시지 정합성" },
      { id: "criterion-impact", label: "화제성", maxScore: 50, description: "확산 가능성" }
    ],
    createdAt: atDay(2)
  },
  {
    id: "template-3",
    name: "학생부 심사",
    description: "창의성과 성장 가능성 중심",
    criteria: [
      { id: "criterion-creative", label: "창의성", maxScore: 60, description: "아이디어 참신성" },
      { id: "criterion-growth", label: "성장 가능성", maxScore: 40, description: "발전 잠재력" }
    ],
    createdAt: atDay(3)
  }
];

const hostUsers = usersStore.filter((user) => user.role === "host");
const participantUsers = usersStore.filter((user) => user.role === "participant");
const judgeUsers = usersStore.filter((user) => user.role === "judge");

const contestsStore: Contest[] = Array.from({ length: 60 }, (_, index) => ({
  id: `contest-${index + 1}`,
  title: `AI 영상 공모전 ${index + 1}`,
  slug: `ai-video-contest-${index + 1}`,
  hostId: hostUsers[index % hostUsers.length].id,
  description: `AI 영상 공모전 ${index + 1} 설명`,
  region: REGIONS_KR[index % REGIONS_KR.length],
  tags: ["ai", "video", `season-${(index % 4) + 1}`],
  status: (["draft", "open", "closed", "judging", "completed"] as const)[index % 5],
  startAt: atDay(10 + index),
  endAt: atDay(30 + index),
  submissionDeadline: atDay(25 + index),
  judgingType: JUDGING_TYPES[index % JUDGING_TYPES.length].value,
  reviewPolicy: index % 2 === 0 ? "manual" : "auto_then_manual",
  maxSubmissionsPerUser: 3,
  allowedVideoExtensions: VIDEO_EXTENSIONS.map((item) => item.value)
}));

const submissionsStore: Submission[] = Array.from({ length: 240 }, (_, index) => {
  const contest = contestsStore[index % contestsStore.length];
  const creator = participantUsers[index % participantUsers.length];
  const status = REVIEW_TABS[index % REVIEW_TABS.length].value;
  return {
    id: `submission-${index + 1}`,
    contestId: contest.id,
    userId: creator.id,
    title: `출품작 ${index + 1}`,
    description: `출품작 ${index + 1} 설명`,
    videoUrl: `https://cdn.mockup.local/video-${index + 1}.mp4`,
    thumbnailUrl: `https://picsum.photos/seed/submission-${index + 1}/640/360`,
    status,
    submittedAt: atDay(15 + index),
    views: 100 + index * 3,
    likeCount: 0,
    tags: ["ai", "creator", `batch-${(index % 12) + 1}`],
    autoRejectedReason: status === "auto_rejected" ? "형식 검수 실패" : undefined
  };
});

let likesStore: Like[] = Array.from({ length: 360 }, (_, index) => ({
  id: `like-${index + 1}`,
  userId: usersStore[index % usersStore.length].id,
  submissionId: submissionsStore[index % submissionsStore.length].id,
  createdAt: atDay(20 + index)
}));

const articlesStore: Article[] = Array.from({ length: 12 }, (_, index) => ({
  id: `article-${index + 1}`,
  type: ARTICLE_TYPES[index % ARTICLE_TYPES.length].value,
  title: `아티클 ${index + 1}`,
  slug: `article-${index + 1}`,
  excerpt: `아티클 ${index + 1} 요약`,
  content: `아티클 ${index + 1} 본문 내용`,
  authorId: usersStore[(index + 2) % usersStore.length].id,
  tags: ["news", "trend", `group-${(index % 3) + 1}`],
  publishedAt: atDay(5 + index),
  isPublished: true,
  thumbnailUrl: `https://picsum.photos/seed/article-${index + 1}/1200/630`
}));

const faqStore: FAQ[] = Array.from({ length: 18 }, (_, index) => ({
  id: `faq-${index + 1}`,
  category: FAQ_CATEGORIES[index % FAQ_CATEGORIES.length].value,
  question: `FAQ 질문 ${index + 1}`,
  answer: `FAQ 답변 ${index + 1}`,
  isPinned: index < 4,
  updatedAt: atDay(8 + index)
}));

const inquiriesStore: Inquiry[] = Array.from({ length: 14 }, (_, index) => ({
  id: `inquiry-${index + 1}`,
  userId: usersStore[index % usersStore.length].id,
  type: (["general", "support", "agency"] as const)[index % 3],
  title: `문의 ${index + 1}`,
  content: `문의 ${index + 1} 내용`,
  status: (["pending", "in_progress", "resolved"] as const)[index % 3],
  createdAt: atDay(18 + index),
  updatedAt: atDay(19 + index)
}));

const agencyRequestsStore: AgencyRequest[] = Array.from({ length: 12 }, (_, index) => ({
  id: `agency-request-${index + 1}`,
  companyName: `브랜드사 ${index + 1}`,
  contactName: `담당자 ${index + 1}`,
  contactEmail: `agency-${index + 1}@mockup.local`,
  phoneNumber: `010-2000-${String(1000 + index)}`,
  budgetRange: ["500만원 이하", "500-1000만원", "1000만원 이상"][index % 3],
  message: `대행 의뢰 상세 내용 ${index + 1}`,
  status: (["new", "reviewing", "quoted", "closed"] as const)[index % 4],
  createdAt: atDay(16 + index)
}));

const activityLogsStore: ActivityLog[] = Array.from({ length: 80 }, (_, index) => ({
  id: `activity-${index + 1}`,
  userId: usersStore[index % usersStore.length].id,
  action: index % 2 === 0 ? "create_submission" : "like_submission",
  targetType: index % 2 === 0 ? "submission" : "contest",
  targetId:
    index % 2 === 0
      ? submissionsStore[index % submissionsStore.length].id
      : contestsStore[index % contestsStore.length].id,
  createdAt: atDay(21 + index),
  metadata: { source: "mock-data", index }
}));

const ipLogsStore: IpLog[] = Array.from({ length: 45 }, (_, index) => ({
  id: `ip-log-${index + 1}`,
  userId: usersStore[index % usersStore.length].id,
  ipAddress: `198.51.100.${index + 10}`,
  country: "KR",
  region: REGIONS_KR[index % REGIONS_KR.length],
  riskLevel: (["low", "medium", "high"] as const)[index % 3],
  createdAt: atDay(12 + index)
}));

const judgesStore: Judge[] = Array.from({ length: 30 }, (_, index) => ({
  id: `judge-${index + 1}`,
  userId: judgeUsers[index % judgeUsers.length].id,
  contestId: contestsStore[index % contestsStore.length].id,
  isExternal: index % 2 === 1,
  email: index % 2 === 1 ? `external-judge-${index + 1}@mockup.local` : undefined,
  invitedAt: atDay(14 + index),
  acceptedAt: atDay(15 + index)
}));

const scoresStore: Score[] = Array.from({ length: 120 }, (_, index) => {
  const template = templatesStore[index % templatesStore.length];
  const criteriaScores = template.criteria.map((criterion) => ({
    criterionId: criterion.id,
    score: Math.min(criterion.maxScore, (index % criterion.maxScore) + 1)
  }));
  const total = criteriaScores.reduce((sum, criterion) => sum + criterion.score, 0);
  return {
    id: `score-${index + 1}`,
    submissionId: submissionsStore[index % submissionsStore.length].id,
    judgeId: judgesStore[index % judgesStore.length].id,
    templateId: template.id,
    total,
    criteriaScores,
    comment: `심사 코멘트 ${index + 1}`,
    createdAt: atDay(25 + index)
  };
});

const resultsStore: ContestResult[] = Array.from({ length: 20 }, (_, index) => ({
  contestId: contestsStore[index].id,
  submissionId: submissionsStore[index].id,
  rank: (index % 3) + 1,
  prizeLabel: ["대상", "최우수상", "우수상"][index % 3],
  awardedAt: atDay(40 + index)
}));

function includeText(source: string, search: string): boolean {
  return source.toLowerCase().includes(search.toLowerCase());
}

function asyncReturn<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

export async function getUsers(): Promise<User[]> {
  return asyncReturn(usersStore);
}

export async function getDevices(): Promise<Device[]> {
  return asyncReturn(devicesStore);
}

export async function getDevicesByUser(userId: string): Promise<Device[]> {
  return asyncReturn(devicesStore.filter((device) => device.userId === userId));
}

export async function getContests(filters?: ContestFilters): Promise<Contest[]> {
  const filtered = contestsStore.filter((contest) => {
    if (filters?.status && contest.status !== filters.status) {
      return false;
    }
    if (filters?.region && contest.region !== filters.region) {
      return false;
    }
    if (filters?.search && !includeText(`${contest.title} ${contest.description}`, filters.search)) {
      return false;
    }
    return true;
  });
  return asyncReturn(filtered);
}

export async function getSubmissions(filters?: SubmissionFilters): Promise<Submission[]> {
  const filtered = submissionsStore.filter((submission) => {
    if (filters?.contestId && submission.contestId !== filters.contestId) {
      return false;
    }
    if (filters?.userId && submission.userId !== filters.userId) {
      return false;
    }
    if (filters?.status && submission.status !== filters.status) {
      return false;
    }
    if (filters?.search && !includeText(`${submission.title} ${submission.description}`, filters.search)) {
      return false;
    }
    return true;
  });
  return asyncReturn(filtered);
}

export async function getLikes(): Promise<Like[]> {
  return asyncReturn(likesStore);
}

export async function toggleLike(
  userId: string,
  submissionId: string
): Promise<{ liked: boolean; totalLikes: number }> {
  const existingIndex = likesStore.findIndex(
    (like) => like.userId === userId && like.submissionId === submissionId
  );
  if (existingIndex >= 0) {
    likesStore = likesStore.filter((_, index) => index !== existingIndex);
    return asyncReturn({
      liked: false,
      totalLikes: likesStore.filter((like) => like.submissionId === submissionId).length
    });
  }

  const nextLike: Like = {
    id: `like-${likesStore.length + 1}`,
    userId,
    submissionId,
    createdAt: new Date().toISOString()
  };
  likesStore = [...likesStore, nextLike];
  return asyncReturn({
    liked: true,
    totalLikes: likesStore.filter((like) => like.submissionId === submissionId).length
  });
}

export async function getArticles(): Promise<Article[]> {
  return asyncReturn(articlesStore);
}

export async function getFaqs(): Promise<FAQ[]> {
  return asyncReturn(faqStore);
}

export async function getInquiries(): Promise<Inquiry[]> {
  return asyncReturn(inquiriesStore);
}

export async function getAgencyRequests(): Promise<AgencyRequest[]> {
  return asyncReturn(agencyRequestsStore);
}

export async function getJudgingTemplates(): Promise<JudgingTemplate[]> {
  return asyncReturn(templatesStore);
}

export async function getJudges(): Promise<Judge[]> {
  return asyncReturn(judgesStore);
}

export async function getScores(): Promise<Score[]> {
  return asyncReturn(scoresStore);
}

export async function getContestResults(): Promise<ContestResult[]> {
  return asyncReturn(resultsStore);
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  return asyncReturn(activityLogsStore);
}

export async function getIpLogs(): Promise<IpLog[]> {
  return asyncReturn(ipLogsStore);
}

export async function searchMockData(filters: SearchFilters): Promise<SearchResult> {
  const normalized = filters.query.trim().toLowerCase();
  if (!normalized) {
    return asyncReturn({ contests: [], submissions: [], users: [], articles: [] });
  }

  const contests = contestsStore.filter((contest) =>
    includeText(`${contest.title} ${contest.description}`, normalized)
  );
  const submissions = submissionsStore.filter((submission) =>
    includeText(`${submission.title} ${submission.description}`, normalized)
  );
  const users = usersStore.filter((user) =>
    includeText(`${user.name} ${user.nickname ?? ""} ${user.companyName ?? ""}`, normalized)
  );
  const articles = articlesStore.filter((article) =>
    includeText(`${article.title} ${article.excerpt} ${article.content}`, normalized)
  );

  if (filters.tab === "contests") {
    return asyncReturn({ contests, submissions: [], users: [], articles: [] });
  }
  if (filters.tab === "submissions") {
    return asyncReturn({ contests: [], submissions, users: [], articles: [] });
  }
  if (filters.tab === "creators") {
    return asyncReturn({ contests: [], submissions: [], users, articles: [] });
  }
  if (filters.tab === "articles") {
    return asyncReturn({ contests: [], submissions: [], users: [], articles });
  }

  return asyncReturn({ contests, submissions, users, articles });
}

export async function getMockDataCounts(): Promise<Record<string, number>> {
  return asyncReturn({
    contests: contestsStore.length,
    submissions: submissionsStore.length,
    users: usersStore.length,
    usersWithNickname: usersStore.filter((user) => typeof user.nickname === "string").length,
    usersWithCompany: usersStore.filter((user) => typeof user.companyName === "string").length,
    likes: likesStore.length,
    faq: faqStore.length,
    articles: articlesStore.length,
    inquiries: inquiriesStore.length,
    agencyRequests: agencyRequestsStore.length,
    activityLogs: activityLogsStore.length,
    ip_logs: ipLogsStore.length,
    judging_templates: templatesStore.length,
    devices: devicesStore.length
  });
}
