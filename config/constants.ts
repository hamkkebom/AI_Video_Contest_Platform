export const JUDGING_TYPES = [
  { value: "internal", label: "내부 심사 (주최측 팀원)" },
  { value: "external", label: "외부 심사 (이메일 초대)" },
  { value: "both", label: "내부 + 외부 병행" }
] as const;

export const REVIEW_TABS = [
  { value: "pending_review", label: "검수대기" },
  { value: "approved", label: "검수승인" },
  { value: "rejected", label: "반려" },
  { value: "needs_resubmission", label: "재제출 필요" },
  { value: "judging", label: "심사중" },
  { value: "judged", label: "심사완료" }
] as const;

export const CONTEST_STATUS_TABS = [
  { value: "all", label: "전체" },
  { value: "draft", label: "초안" },
  { value: "open", label: "접수중" },
  { value: "closed", label: "마감" },
  { value: "judging", label: "심사중" },
  { value: "completed", label: "완료" }
] as const;

/** 공모전 내부 상태 5종 (statusFlow: draft → open → closed → judging → completed) */
export type ContestStatusValue = "draft" | "open" | "closed" | "judging" | "completed";

/** 공개 페이지용 공모전 상태 라벨 — 페이지마다 로컬 매핑을 재정의하지 말고 이것만 쓴다 (docs/IA.md G007).
    closed는 접수 마감·심사 시작 전 상태이므로 "결과발표"가 아니라 "마감"이다.
    관리자 화면은 내부 어휘인 CONTEST_STATUS_TABS를 쓴다 */
export const PUBLIC_CONTEST_STATUS_LABELS: Record<ContestStatusValue, string> = {
  draft: "접수전",
  open: "접수중",
  closed: "마감",
  judging: "심사중",
  completed: "결과발표",
};

/** 공개 상태 라벨 조회 — 미지의 상태는 중립값(진행중)으로 취급 */
export function publicContestStatusLabel(status: string): string {
  return PUBLIC_CONTEST_STATUS_LABELS[status as ContestStatusValue] ?? "진행중";
}

export const FAQ_CATEGORIES = [
  { value: "participant", label: "참가자" },
  { value: "host", label: "주최자" },
  { value: "judge", label: "심사위원" },
  { value: "general", label: "일반" }
] as const;

export const FAQ_TOPICS = [
  { value: "contest", label: "공모전 관련" },
  { value: "service", label: "서비스 이용" },
  { value: "payment", label: "결제/환불" },
  { value: "technical", label: "기술 지원" },
  { value: "account", label: "계정/회원" }
] as const;

export const ARTICLE_TYPES = [
  { value: "notice", label: "공지" },
  { value: "program", label: "프로그램" },
  { value: "insight", label: "인사이트" }
] as const;

export const VIDEO_EXTENSIONS = [
  { value: "mp4", label: "MP4" },
  { value: "mov", label: "MOV" },
  { value: "webm", label: "WebM" },
  { value: "avi", label: "AVI" }
] as const;

export const REGIONS_KR = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주"
] as const;

export const DEFAULT_FEATURE_ACCESS = {
  guest: {
    "work-performance": { free: false, label: "작품 성과" },
    "category-competition": { free: false, label: "카테고리 경쟁률" },
    "ai-tool-trends": { free: false, label: "AI 도구 트렌드" },
    "detailed-analysis": { free: false, label: "상세 분석" }
  },
  participant: {
    "work-performance": { free: true, label: "작품 성과" },
    "category-competition": { free: false, label: "카테고리 경쟁률" },
    "ai-tool-trends": { free: false, label: "AI 도구 트렌드" },
    "detailed-analysis": { free: false, label: "상세 분석" }
  },
  host: {
    "submission-status": { free: true, label: "접수 현황" },
    "participant-distribution": { free: false, label: "참가자 분포" },
    "channel-performance": { free: false, label: "채널별 성과" },
    "detailed-analysis": { free: false, label: "상세 분석" }
  },
  judge: {
    progress: { free: true, label: "진행률" },
    "score-distribution": { free: false, label: "채점 분포" }
  },
  admin: "all-free"
} as const;

/** AI 채팅 도구 */
export const CHAT_AI_TOOLS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Copilot",
  "Perplexity",
  "DeepSeek",
  "Grok",
  "HyperCLOVA X",
  "뤼튼",
  "Llama",
  "Mistral",
  "Qwen",
  "Pi",
  "Cohere",
  "Le Chat",
] as const;

/** AI 이미지 생성 도구 */
export const IMAGE_AI_TOOLS = [
  "나노바나나",
  "Midjourney",
  "DALL·E 3",
  "Stable Diffusion",
  "Adobe Firefly",
  "Leonardo.Ai",
  "Ideogram",
  "Flux",
  "Playground",
  "Google Whisk",
  "Krea AI",
  "Canva AI",
  "Recraft",
  "Tensor.Art",
  "NightCafe",
  "Magnific",
  "Bing Image Creator",
  "Imagine Art",
] as const;

/** AI 영상 생성 도구 */
export const VIDEO_AI_TOOLS = [
  "Sora",
  "Runway Gen-3",
  "Kling",
  "Pika",
  "Luma Dream Machine",
  "Veo 2",
  "Hailuo AI",
  "Synthesia",
  "Wan",
  "Google Flow",
  "PixVerse",
  "Haiper",
  "Viggle",
  "D-ID",
  "Fliki",
  "InVideo AI",
  "Domo AI",
  "Genmo",
  "Morph Studio",
] as const;


/** 공모전 태그 (프리디파인드) */
export const CONTEST_TAGS = [
  "AI 영상",
  "생성형AI",
  "숏폼",
  "롱폼",
  "다큐멘터리",
  "뮤직비디오",
  "애니메이션",
  "광고",
  "교육",
  "환경",
  "사회공헌",
  "여행",
  "음악",
  "예술",
] as const;

/** 결과 발표 형태 */
export const RESULT_FORMATS = [
  { value: "website", label: "홈페이지 발표" },
  { value: "email", label: "이메일 개별 통보" },
  { value: "sns", label: "SNS 발표" },
  { value: "offline", label: "오프라인 시상식" },
] as const;

/** 공모전 상태 라벨 (전체 공통) */
export const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '초안',
  open: '접수중',
  closed: '마감',
  judging: '심사중',
  completed: '완료',
};

/**
 * 공모전 상태 뱃지 — solid (진한 배경 + 흰 글자).
 * 색은 app/globals.css 의 --status-* 토큰이 단일 소스이며 테마별 명도 보정도 거기서 한다.
 * 그래서 여기에는 dark: 변형이 필요 없다 (예전에는 상태마다 4개씩 달려 있었다).
 */
export const STATUS_BADGE_CLASS_MAP: Record<string, string> = {
  draft: 'bg-status-draft text-white',
  open: 'bg-status-open text-white',
  closed: 'bg-status-closed text-white',
  judging: 'bg-status-judging text-white',
  completed: 'bg-status-completed text-white',
};

/**
 * 공모전 상태 뱃지 — soft (연한 배경 + 상태색 글자).
 * 카드 위 오버레이가 아니라 흰 배경에 얹을 때 쓴다.
 */
export const STATUS_BADGE_SOFT_CLASS_MAP: Record<string, string> = {
  draft: 'bg-status-draft/10 text-status-draft',
  open: 'bg-status-open/10 text-status-open',
  closed: 'bg-status-closed/10 text-status-closed',
  judging: 'bg-status-judging/10 text-status-judging',
  completed: 'bg-status-completed/10 text-status-completed',
};
