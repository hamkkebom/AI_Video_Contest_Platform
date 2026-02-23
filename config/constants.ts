export const JUDGING_TYPES = [
  { value: "internal", label: "내부 심사 (주최측 팀원)" },
  { value: "external", label: "외부 심사 (이메일 초대)" },
  { value: "both", label: "내부 + 외부 병행" }
] as const;

export const REVIEW_TABS = [
  { value: "pending_review", label: "검수대기" },
  { value: "approved", label: "검수승인" },
  { value: "rejected", label: "반려" },
  { value: "auto_rejected", label: "자동반려 (재검토 가능)" },
  { value: "judging", label: "심사중" },
  { value: "judged", label: "심사완료" }
] as const;

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
