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
  AwardTier,
  BonusConfig,
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

const contestTitles = [
  '제1회 AI 영상 페스티벌',
  'AI 단편영화제',
  '크리에이터 챌린지 SEASON 3',
  'AI 아트 영상 대전',
  '대학생 AI 영상 공모전',
  '2026 글로벌 AI 영상 크리에이터 어워드',
  'AI 숏폼 콘텐츠 챌린지',
  '지자체와 함께하는 AI 관광 홍보영상 공모전',
  'AI 뮤직비디오 대전',
  'AI 브랜드 필름 어워드 2026 - 기업과 크리에이터의 만남',
  'MZ세대 AI 영상 페스티벌',
  '제2회 전국 AI 영상 크리에이터 경진대회 with 문화체육관광부',
];

const contestDescriptions = [
  'AI 영상 제작 기술의 무한한 가능성을 탐구하는 페스티벌입니다. 인공지능을 활용한 혁신적 영상 콘텐츠를 자유롭게 출품해 주세요.',
  '기획부터 편집까지 AI를 활용한 단편 영화를 제작해 보세요. 장르 제한 없이 누구나 참가할 수 있습니다.',
  '크리에이터라면 누구나 도전 가능한 숏폼 챌린지! 60초 이내의 매력적인 영상으로 당신의 창의력을 증명하세요. 심사 기준은 기술력, 독창성, 대중성이며 총 상금 2,000만 원이 걸려 있습니다.',
  '예술과 기술의 경계를 허무는 AI 아트 영상을 모집합니다.',
  '전국 대학생을 대상으로 하는 AI 영상 공모전입니다. AI 도구를 적극 활용하여 사회적 메시지가 담긴 3분 이내의 영상을 제작해 주세요. 심사위원단은 영화감독, 미디어 아트 교수, AI 연구원 등으로 구성됩니다.',
  '전 세계 크리에이터를 대상으로 AI 영상 제작 역량을 겨루는 글로벌 어워드. 어떤 언어, 어떤 주제든 상관없이 AI가 핵심 제작 도구로 사용된 영상이면 참가 가능합니다. 대상 수상자에게는 해외 영화제 출품 지원 혜택이 주어집니다.',
  '틱톡, 릴스, 쇼츠 등 숏폼 플랫폼에 최적화된 AI 콘텐츠를 만들어 보세요.',
  '지자체의 관광 명소와 문화유산을 AI 기술로 재해석한 홍보 영상을 제작하는 공모전입니다. 지역 경제 활성화와 디지털 관광 콘텐츠 제작을 동시에 경험할 수 있으며, 우수작은 해당 지자체 공식 홍보 채널에 게시됩니다.',
  'AI로 만든 뮤직비디오를 공모합니다. 음악과 영상의 조화를 평가합니다.',
  '브랜드 메시지를 AI 영상으로 전달하는 새로운 형태의 브랜드 필름을 모집합니다. 참가 기업의 브랜드 가이드라인에 맞추되, 크리에이터만의 독창적 해석을 더해 주세요. 우수작은 실제 브랜드 캠페인에 활용될 수 있습니다.',
  'MZ세대가 주도하는 AI 영상 문화를 만들어 갑니다! 밈, 브이로그, 드라마 패러디 등 자유 형식으로 참여 가능하며, SNS 공유 수도 심사에 반영됩니다.',
  '문화체육관광부가 후원하는 전국 규모의 AI 영상 크리에이터 경진대회입니다. 총 상금 5,000만 원, 예선부터 본선까지 온라인으로 진행되며, 결선 발표회는 서울 코엑스에서 오프라인으로 개최됩니다. 한국 AI 영상 산업의 미래를 이끌 인재를 찾습니다.',
];

const submissionTitles = [
  '빛의 도시를 걷다',
  '서울의 밤거리에서 만난 AI',
  '잃어버린 시간을 찾아서 - AI로 복원한 1920년대 경성의 거리풍경',
  '바다의 노래',
  '폐공장에서 피어난 꽃 이야기',
  '디지털 유목민의 하루 - 카페에서 세계를 여행하는 프리랜서의 브이로그',
  '할머니의 레시피',
  '미래 도시 서울 2050 비전 - 한강 위를 나는 자율주행 드론과 옥상 정원의 풍경',
  '우리 동네 고양이의 모험',
  '비 오는 날의 재즈 카페',
  '전통과 미래의 만남 - AI가 재해석한 한복 패션쇼 풀 버전',
  '아이가 꿈꾸는 우주여행',
  '봄날의 산책로에서',
  '한강 노을 타임랩스',
  '인공지능이 그린 제주도 풍경화를 영상으로 재탄생시킨 4K 아트 다큐멘터리',
  '도시의 리듬',
  '오래된 골목길의 기억과 현재 - 을지로 을지로3가 골목 탐방 시리즈',
  '숲속의 작은 음악회',
  '새벽 배달 라이더',
  '가을 단풍 여행 with AI',
  '엄마의 손맛을 AI로 기록하다 - 3대째 이어져 온 손두부 만들기의 모든 과정',
  '미래의 교실 풍경',
  '별이 빛나는 밤에',
  '거리의 예술가들',
];

const submissionDescriptions = [
  'AI 기술을 활용하여 서울의 야경을 몽환적으로 재해석한 영상입니다.',
  '일상 속에서 AI가 우리 삶에 어떤 변화를 가져오는지 짧게 담아보았습니다.',
  '1920년대 경성의 사진 자료를 AI 업스케일링과 컬러라이제이션으로 복원하고, 당시 거리의 소리를 AI 음향 합성으로 재현했습니다. 총 6개월간의 작업 과정도 함께 담았습니다.',
  'AI 음악 생성 도구로 만든 배경음악과 함께 제주 바다의 아름다움을 표현한 작품입니다.',
  '버려진 공장 터에서 자라나는 식물들을 통해 자연의 회복력을 보여주는 다큐멘터리 형식의 영상입니다.',
  '전 세계를 돌아다니며 일하는 디지털 노마드의 하루를 AI 편집 도구로 깔끔하게 정리했습니다. 5개국 7개 카페에서 촬영한 영상을 하나의 스토리라인으로 엮었습니다.',
  'AI가 분석한 전통 레시피 데이터를 바탕으로 만든 요리 영상입니다.',
  '2050년 서울의 모습을 AI 이미지 생성과 영상 합성 기술로 구현했습니다. 한강 위를 날아다니는 자율주행 드론, 건물 옥상마다 펼쳐진 도시 농원, 그리고 투명한 태양광 패널로 덮인 스카이라인까지 상상 속 미래 도시를 사실적으로 그려냈습니다.',
  '동네 길고양이들의 하루를 관찰 카메라와 AI 편집으로 귀엽게 담아낸 힐링 영상입니다.',
  '비 오는 날 재즈 카페에서의 한 시간을 그대로 담았습니다.',
  'AI 이미지 생성 모델로 만든 텍스처를 한복에 입혀 전통과 미래를 융합한 패션쇼를 연출했습니다. 전통 자수 패턴을 AI가 학습하여 새로운 디자인으로 변환하는 과정부터 최종 런웨이까지 모든 과정이 담겨 있습니다.',
  '아이의 상상력을 AI 애니메이션으로 시각화한 따뜻한 가족 영상입니다.',
  '봄꽃이 만개한 산책로를 걸으며 촬영한 힐링 영상입니다.',
  '한강의 일몰을 3시간 동안 타임랩스로 촬영하고 AI 보정을 적용한 영상입니다.',
  'Stable Diffusion으로 생성한 제주도 풍경 이미지 300장을 프레임 보간 기술로 이어붙여 4K 해상도의 아트 다큐멘터리로 완성했습니다. AI가 상상한 한라산, 성산일출봉, 우도의 풍경이 수채화와 유화 스타일로 번갈아 펼쳐지는 8분짜리 영상입니다.',
  'AI 비트 생성으로 도시의 소음을 음악으로 변환한 실험적 뮤직비디오입니다.',
  '을지로3가 인쇄 골목부터 세운상가까지, 오래된 골목의 과거 사진과 현재 모습을 AI 모핑 기술로 자연스럽게 연결했습니다. 40년 전 같은 자리에서 찍은 사진과 현재를 교차 편집한 감성적인 영상입니다.',
  'AI 작곡 도구로 만든 오케스트라 음악과 숲속 영상을 결합한 ASMR 콘텐츠입니다.',
  '새벽 4시에 시작되는 배달 라이더의 하루를 밀착 촬영하고 AI로 편집한 다큐멘터리입니다.',
  '전국 단풍 명소를 드론으로 촬영하고 AI 컬러 그레이딩을 적용했습니다.',
  '시골 외할머니가 만드시는 손두부의 전 과정을 AI 슬로모션과 마이크로 촬영으로 기록했습니다. 콩을 불리는 것부터 간수를 넣어 응고시키는 순간까지 3대째 이어져 온 손맛의 비밀을 과학적으로 분석하면서도 따뜻한 시선으로 담아냈습니다. 배경 음악도 AI 작곡입니다.',
  'AI가 예측하는 미래 교육 환경을 시각화한 인포그래픽 영상입니다.',
  '별이 빛나는 밤하늘을 AI가 반 고흐 화풍으로 재해석한 아트 영상입니다.',
  '거리에서 공연하는 버스커들을 AI 멀티캠 편집으로 촬영한 라이브 영상입니다.',
];

// 날짜를 넓게 분포시켜서 과거~현재~미래에 걸치도록 함
// baseDate = 2026-01-01, 현재 약 day 49 (2026-02-19)
// 상태: open(접수중) / judging(심사중) / completed(종료) 3가지만 사용
function computeContestStatus(submissionEndAt: string, judgingEndAt: string, resultAnnouncedAt: string): Contest["status"] {
  const now = new Date();
  const subEnd = new Date(submissionEndAt);
  const judgEnd = new Date(judgingEndAt);

  if (now <= subEnd) return "open";
  if (now <= judgEnd) return "judging";
  return "completed";
}

// 공모전별 수상 티어 프리셋 (주최측이 자유롭게 구성)
const awardTierPresets: AwardTier[][] = [
  // 프리셋 0: 기본 3단계
  [
    { label: '대상', count: 1, prizeAmount: '300만원' },
    { label: '최우수상', count: 2, prizeAmount: '100만원' },
    { label: '우수상', count: 3, prizeAmount: '50만원' },
  ],
  // 프리셋 1: 대규모 공모전
  [
    { label: '대상', count: 1, prizeAmount: '1,000만원' },
    { label: '금상', count: 1, prizeAmount: '500만원' },
    { label: '은상', count: 2, prizeAmount: '200만원' },
    { label: '동상', count: 3, prizeAmount: '100만원' },
    { label: '장려상', count: 5, prizeAmount: '30만원' },
  ],
  // 프리셋 2: 소규모 공모전
  [
    { label: '최우수상', count: 1, prizeAmount: '200만원' },
    { label: '우수상', count: 2, prizeAmount: '50만원' },
  ],
  // 프리셋 3: 4단계 + 특별상
  [
    { label: '대상', count: 1, prizeAmount: '500만원' },
    { label: '최우수상', count: 1, prizeAmount: '200만원' },
    { label: '우수상', count: 3, prizeAmount: '100만원' },
    { label: '특별상', count: 2, prizeAmount: '50만원' },
  ],
  // 프리셋 4: 2단계만
  [
    { label: '대상', count: 1, prizeAmount: '150만원' },
    { label: '입선', count: 5, prizeAmount: '20만원' },
  ],
];

const contestsStore: Contest[] = Array.from({ length: 60 }, (_, index) => {
  // 날짜를 넓게 분포: 과거(-30일) ~ 미래(+120일)
  const offset = -30 + index * 3; // -30, -27, -24, ... +147
  const submissionStartAt = atDay(offset);
  const submissionEndAt = atDay(offset + 30);
  const judgingStartAt = atDay(offset + 31);
  const judgingEndAt = atDay(offset + 45);
  const resultAnnouncedAt = atDay(offset + 50);

  return {
    id: `contest-${index + 1}`,
    title: contestTitles[index % contestTitles.length],
    slug: `ai-video-contest-${index + 1}`,
    hostId: hostUsers[index % hostUsers.length].id,
    description: contestDescriptions[index % contestDescriptions.length],
    region: REGIONS_KR[index % REGIONS_KR.length],
    tags: ["ai", "video", `season-${(index % 4) + 1}`],
    status: computeContestStatus(submissionEndAt, judgingEndAt, resultAnnouncedAt),
    submissionStartAt,
    submissionEndAt,
    judgingStartAt,
    judgingEndAt,
    resultAnnouncedAt,
    judgingType: JUDGING_TYPES[index % JUDGING_TYPES.length].value,
    reviewPolicy: index % 2 === 0 ? "manual" : "auto_then_manual",
    maxSubmissionsPerUser: 3,
    allowedVideoExtensions: VIDEO_EXTENSIONS.map((item) => item.value),
    prizeAmount: ['500만원', '1,000만원', '2,000만원', '300만원', '5,000만원', '800만원', '1,500만원', '200만원', '700만원', '3,000만원', '100만원', '1,200만원'][index % 12],
    awardTiers: awardTierPresets[index % awardTierPresets.length],
    posterUrl: `/images/contest-${(index % 5) + 1}.jpg`,
    promotionVideoUrl: index % 3 === 0 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : undefined,
  };
});


// 1번 공모전을 '꿈꾸는 아리랑' 공모전으로 오버라이드 (프리미엄 랜딩페이지 포함)
Object.assign(contestsStore[0], {
  title: '제1회 꿈꾸는 아리랑 AI 뮤직비디오 공모전',
  slug: 'dreaming-arirang-1st',
  description: '헐버트 박사의 아리랑 채보 130주년을 기념하여, 제1회 \'꿈꾸는 아리랑\' AI 영상 공모전으로 우리 아리랑을 다시 한번 세계로 알립니다.',
  region: '서울',
  tags: ['ai', '아리랑', '헐버트', '뮤직비디오', 'AI공모전'],
  submissionStartAt: '2026-02-25T00:00:00+09:00',
  submissionEndAt: '2026-03-28T23:59:59+09:00',
  judgingStartAt: '2026-03-29T00:00:00+09:00',
  judgingEndAt: '2026-04-10T23:59:59+09:00',
  resultAnnouncedAt: '2026-04-11T00:00:00+09:00',
  status: 'open' as const,
  judgingType: 'both' as const,
  maxSubmissionsPerUser: 1,
  allowedVideoExtensions: ['mp4'],
  prizeAmount: '1,300만원',
  awardTiers: [
    { label: '아리랑상 (대상)', count: 1, prizeAmount: '300만원' },
    { label: '메아리상 (최우수상)', count: 2, prizeAmount: '150만원' },
    { label: '울림상 (우수상)', count: 10, prizeAmount: '40만원' },
    { label: '꿈꿈상 (장려상)', count: 30, prizeAmount: '10만원' },
  ],
  hasLandingPage: true,
  bonusConfigs: [
    { id: 'bonus-poster', label: '공모전 공식포스터 SNS 업로드 후 인증', description: '공모전 공식포스터를 본인 SNS에 업로드하고 필수 해시태그를 포함하세요.', score: 1, requiresUrl: true, requiresImage: true },
    { id: 'bonus-hulbert', label: '헐버트박사 기념사업회 링크 SNS 업로드 후 인증', description: 'hulbert.or.kr 링크를 본인 SNS에 공유하고 캡처본을 업로드하세요.', score: 1, requiresUrl: true, requiresImage: true },
    { id: 'bonus-exhibition', label: '헐버트 아리랑 전시회 참여 인증샷 SNS 업로드 후 인증', description: '전시일정: 3월 12일~24일, 함께봄 본사 (서울 종로구 효자로 7길 10)', score: 1, requiresUrl: true, requiresImage: true },
  ] satisfies BonusConfig[],
  bonusMaxScore: 3,
});

const submissionsStore: Submission[] = Array.from({ length: 600 }, (_, index) => {
  const contest = contestsStore[index % contestsStore.length];
  const creator = participantUsers[index % participantUsers.length];
  const status = REVIEW_TABS[index % REVIEW_TABS.length].value;
  return {
    id: `submission-${index + 1}`,
    contestId: contest.id,
    userId: creator.id,
    title: submissionTitles[index % submissionTitles.length],
    description: submissionDescriptions[index % submissionDescriptions.length],
    videoUrl: `https://cdn.mockup.local/video-${index + 1}.mp4`,
    thumbnailUrl: `https://picsum.photos/seed/submission-${index + 1}/640/360`,
    status,
    submittedAt: atDay(15 + index),
    views: [152, 3840, 510, 98, 12750, 1230, 420, 7620, 2100, 340, 6800, 890, 45, 2950, 11200, 580, 1670, 4300, 760, 9150, 370, 5400, 1890, 210][index % 24],
    likeCount: [12, 287, 43, 5, 1024, 98, 31, 562, 178, 22, 489, 67, 3, 203, 842, 39, 127, 305, 55, 713, 28, 401, 144, 16][index % 24],
    // 영상 길이 60~480초 (1~8분), 평균 시청 시간은 영상 길이의 30~95%
    videoDuration: [180, 240, 360, 120, 300, 420, 90, 480, 210, 150, 270, 60, 330, 390, 450, 135, 195, 285, 105, 375, 165, 315, 255, 75][index % 24],
    avgWatchDuration: [135, 192, 234, 96, 270, 252, 77, 336, 179, 90, 230, 54, 122, 332, 405, 74, 157, 228, 74, 338, 89, 284, 191, 41][index % 24],
    tags: ["ai", "creator", `batch-${(index % 12) + 1}`],
    autoRejectedReason: status === "auto_rejected" ? "형식 검수 실패" : undefined,
    aiTools: ['Sora', 'Runway Gen-3', 'Kling AI', 'Midjourney + Runway', 'Pika Labs', 'Stable Video Diffusion', 'HeyGen', 'Sora + Midjourney'][index % 8],
    productionProcess: [
      'Midjourney로 키 비주얼을 생성한 뒤, Runway Gen-3로 모션을 입히고 DaVinci Resolve에서 컬러 그레이딩 및 최종 편집을 진행했습니다. BGM은 Suno AI로 작곡했습니다.',
      'ChatGPT로 시나리오를 작성하고, Sora로 주요 장면을 생성했습니다. 이후 Premiere Pro에서 장면 전환과 자막을 추가하여 완성했습니다.',
      'Stable Diffusion으로 300장의 이미지를 생성한 뒤, 프레임 보간 기술(FILM)로 부드럽게 연결하고 After Effects에서 카메라 무빙 효과를 적용했습니다.',
      'Kling AI로 초안 영상을 만들고, Topaz Video AI로 4K 업스케일링한 뒤 Final Cut Pro에서 사운드 디자인과 편집을 마무리했습니다.',
      'Pika Labs로 텍스트 기반 영상을 생성하고, ElevenLabs로 나레이션을 만들어 CapCut에서 최종 편집했습니다. 전체 제작 과정은 약 2주 소요되었습니다.',
      'HeyGen으로 AI 아바타 영상을 촬영하고, Runway의 인페인팅 기능으로 배경을 교체한 뒤 Premiere Pro에서 모션 그래픽을 추가했습니다.',
    ][index % 6],
  };
});

let likesStore: Like[] = Array.from({ length: 360 }, (_, index) => ({
  id: `like-${index + 1}`,
  userId: usersStore[index % usersStore.length].id,
  submissionId: submissionsStore[index % submissionsStore.length].id,
  createdAt: atDay(20 + index)
}));

const articleTitles = [
  '꿈플 서비스 오픈',
  '2026년 상반기 AI 영상 공모전 일정 안내 및 참가자 모집 공고',
  'AI 영상 제작, 어디까지 왔나?',
  '제3회 꿈플 우수작품전 개최',
  '크리에이터를 위한 AI 영상 제작 무료 교육 프로그램 참가 신청 안내 — 초급부터 고급 과정까지 단계별로 배워보세요',
  '심사 기준 변경 안내',
  '글로벌 AI 영상 트렌드 리포트: Sora, Runway, Kling 등 주요 도구별 비교 분석과 크리에이터가 알아야 할 핵심 인사이트',
  '서버 정기점검 안내 (2/25)',
  'AI가 바꾸는 영상 제작의 미래',
  '제4회 전국 AI 단편영화 공모전 대상 수상자 인터뷰 — "AI는 도구일 뿐, 결국 이야기가 중요합니다"',
  '신규 기능 업데이트',
  '왜 AI 영상인가? 기존 영상 제작과 AI 영상 제작의 차이점, 그리고 크리에이터에게 열리는 새로운 가능성에 대해',
];

const articleExcerpts = [
  '꿈플이 정식 오픈했습니다.',
  '올해 상반기에 진행되는 AI 영상 공모전 전체 일정을 확인하고, 관심 있는 공모전에 미리 참가 신청하세요. 총 8개 공모전이 예정되어 있습니다.',
  'AI 기반 영상 제작 기술이 빠르게 발전하고 있습니다. 최신 도구들의 현황과 가능성을 살펴봅니다.',
  '우수작품전이 열립니다.',
  '초급, 중급, 고급 3단계로 구성된 AI 영상 제작 교육 프로그램을 무료로 수강할 수 있습니다. Sora, Runway, Kling 등 주요 도구 실습 포함. 수료증 발급 및 우수 수료자 공모전 가산점 혜택까지 제공됩니다.',
  '심사 기준이 일부 변경되었습니다. 자세한 내용을 확인해주세요.',
  'Sora가 등장한 이후 AI 영상 제작 시장은 급격히 변화하고 있습니다. 각 도구별 특성과 장단점, 실제 크리에이터들의 활용 사례를 심층 분석한 리포트입니다.',
  '2월 25일 새벽 2시~6시 서버 점검이 예정되어 있습니다.',
  'AI 영상 제작 기술이 가져올 변화.',
  '"대상 수상은 정말 뜻밖이었어요." 제4회 전국 AI 단편영화 공모전에서 대상을 수상한 김민수 크리에이터와의 인터뷰. AI 도구 활용법부터 스토리텔링 노하우까지 상세히 공유합니다.',
  '갤러리 UI 개선, 실시간 알림 기능이 추가되었습니다.',
  'AI 영상 제작은 기존 영상 제작과 어떻게 다른가요? 촬영 장비 없이도 고품질 영상을 만들 수 있는 AI 시대, 크리에이터에게 어떤 기회가 열리고 있는지 구체적인 사례와 함께 살펴봅니다.',
];

const articlesStore: Article[] = Array.from({ length: 12 }, (_, index) => ({
  id: `article-${index + 1}`,
  type: ARTICLE_TYPES[index % ARTICLE_TYPES.length].value,
  title: articleTitles[index],
  slug: `article-${index + 1}`,
  excerpt: articleExcerpts[index],
  content: `${articleTitles[index]}에 대한 상세 본문 내용입니다.`,
  authorId: usersStore[(index + 2) % usersStore.length].id,
  tags: ["news", "trend", `group-${(index % 3) + 1}`],
  publishedAt: atDay(5 + index),
  isPublished: true,
  thumbnailUrl: `/images/hero-${(index % 6) + 1}.jpg`
}));

const FAQ_ITEMS: Array<{ category: FAQ["category"]; topic: FAQ["topic"]; q: string; a: string }> = [
  /* 일반 (general) */
  { category: "general", topic: "service", q: "꿈플은 어떤 서비스인가요?", a: "꿈플은 AI 영상 공모전 플랫폼으로, 크리에이터와 기업이 함께 성장할 수 있는 공간입니다." },
  { category: "general", topic: "account", q: "회원가입은 어떻게 하나요?", a: "메인 페이지 우측 상단의 '회원가입' 버튼을 통해 개인 또는 기업 계정으로 가입할 수 있습니다." },
  { category: "general", topic: "payment", q: "서비스 이용 요금이 있나요?", a: "기본 서비스는 무료이며, 프리미엄 분석 기능은 유료로 제공됩니다." },
  { category: "general", topic: "technical", q: "지원하는 브라우저는 무엇인가요?", a: "Chrome, Firefox, Safari, Edge 최신 버전을 지원합니다." },
  { category: "general", topic: "account", q: "비밀번호를 잊어버렸어요.", a: "로그인 페이지의 '비밀번호 찾기'를 통해 이메일로 재설정 링크를 받을 수 있습니다." },
  /* 참가자 (participant) */
  { category: "participant", topic: "contest", q: "공모전에 어떻게 참가하나요?", a: "원하는 공모전 상세 페이지에서 '작품 제출하기' 버튼을 클릭하여 작품을 제출할 수 있습니다." },
  { category: "participant", topic: "contest", q: "한 공모전에 여러 작품을 제출할 수 있나요?", a: "공모전별로 최대 제출 작품 수가 다릅니다. 상세 페이지에서 확인해 주세요." },
  { category: "participant", topic: "technical", q: "영상 업로드 시 지원 형식은?", a: "MP4, MOV, WebM, AVI 형식을 지원하며 최대 500MB까지 업로드 가능합니다." },
  { category: "participant", topic: "contest", q: "제출한 작품을 수정할 수 있나요?", a: "마감일 전까지 작품 수정이 가능합니다. 마감 후에는 수정이 불가합니다." },
  { category: "participant", topic: "payment", q: "상금은 어떻게 지급되나요?", a: "결과 발표 후 2주 이내에 등록된 계좌로 지급됩니다. 세금 관련 안내는 별도 공지됩니다." },
  /* 주최자 (host) */
  { category: "host", topic: "contest", q: "공모전을 개설하려면 어떻게 하나요?", a: "주최 관리 대시보드에서 '새 공모전 만들기'를 통해 공모전을 생성할 수 있습니다." },
  { category: "host", topic: "payment", q: "공모전 개설 비용이 있나요?", a: "기본 개설은 무료이며, 홍보 부스트 등 부가 서비스는 별도 비용이 발생합니다." },
  { category: "host", topic: "contest", q: "심사위원을 어떻게 초대하나요?", a: "공모전 관리 페이지에서 이메일로 외부 심사위원을 초대할 수 있습니다." },
  { category: "host", topic: "service", q: "공모전 통계를 볼 수 있나요?", a: "주최 대시보드에서 접수 현황, 참가자 분포, 조회수 등 실시간 통계를 확인할 수 있습니다." },
  /* 심사위원 (judge) */
  { category: "judge", topic: "contest", q: "심사는 어떻게 진행되나요?", a: "심사 대시보드에서 배정된 작품들을 확인하고 심사 기준에 따라 채점합니다." },
  { category: "judge", topic: "contest", q: "심사 기한이 있나요?", a: "공모전별 심사 기간이 정해져 있으며, 심사 대시보드에서 마감일을 확인할 수 있습니다." },
  { category: "judge", topic: "service", q: "심사위원 초대를 수락하지 않으면 어떻게 되나요?", a: "초대 링크는 일정 기간 유효하며, 기한 내 수락하지 않으면 자동 만료됩니다." },
  { category: "judge", topic: "technical", q: "심사 중 영상 재생이 안 됩니다.", a: "브라우저 캐시를 삭제하거나, 다른 브라우저에서 시도해 보세요. 지속 시 1:1 문의를 이용해 주세요." },
];

const faqStore: FAQ[] = FAQ_ITEMS.map((item, index) => ({
  id: `faq-${index + 1}`,
  category: item.category,
  topic: item.topic,
  question: item.q,
  answer: item.a,
  isPinned: index < 4,
  updatedAt: atDay(8 + index),
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

// 결과발표된(completed) 공모전의 awardTiers 기반으로 수상작 생성
const completedContests = contestsStore.filter((c) => c.status === "completed");
const resultsStore: ContestResult[] = completedContests.flatMap((contest, ci) => {
  const contestSubs = submissionsStore.filter((s) => s.contestId === contest.id);
  let subIndex = 0;
  let rankCounter = 1;
  return contest.awardTiers.flatMap((tier) =>
    Array.from({ length: tier.count }, (_, ti) => {
      const result: ContestResult = {
        contestId: contest.id,
        submissionId: contestSubs[subIndex]?.id ?? `submission-placeholder-${ci}-${subIndex}`,
        rank: rankCounter,
        prizeLabel: tier.label,
        awardedAt: atDay(40 + ci * 3 + subIndex),
      };
      subIndex++;
      rankCounter++;
      return result;
    })
  );
});

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
  const completed = contestsStore.filter((c) => c.status === "completed");
  const completedIds = new Set(completed.map((c) => c.id));
  const resultMap = new Map(resultsStore.map((r) => [r.submissionId, r]));

  return asyncReturn(
    submissionsStore
      .filter((s) => completedIds.has(s.contestId))
      .map((s) => {
        const contest = completed.find((c) => c.id === s.contestId);
        const creator = usersStore.find((u) => u.id === s.userId);
        const result = resultMap.get(s.id);
        return {
          ...s,
          contestTitle: contest?.title ?? "",
          creatorName: creator?.nickname ?? creator?.name ?? "익명",
          prizeLabel: result?.prizeLabel,
          rank: result?.rank,
        };
      })
  );
}

/**
 * 수상작 갤러리: 결과발표된 공모전의 수상작만
 */
export async function getAwardedSubmissions(): Promise<GallerySubmission[]> {
  const completed = contestsStore.filter((c) => c.status === "completed");
  const completedIds = new Set(completed.map((c) => c.id));

  return asyncReturn(
    resultsStore
      .filter((r) => completedIds.has(r.contestId))
      .map((r) => {
        const submission = submissionsStore.find((s) => s.id === r.submissionId);
        const contest = completed.find((c) => c.id === r.contestId);
        const creator = submission ? usersStore.find((u) => u.id === submission.userId) : undefined;
        return {
          ...(submission ?? {
            id: r.submissionId, contestId: r.contestId, userId: "", title: "수상작",
            description: "", videoUrl: "", thumbnailUrl: "", status: "judged" as const,
            submittedAt: r.awardedAt, views: 0, likeCount: 0,
            videoDuration: 180, avgWatchDuration: 90, tags: [],
          }),
          contestTitle: contest?.title ?? "",
          creatorName: creator?.nickname ?? creator?.name ?? "익명",
          prizeLabel: r.prizeLabel,
          rank: r.rank,
        };
      })
  );
}

/** 시청 유지율 승수: 0.5 + retentionRate × 0.5 (범위 0.5 ~ 1.0) */
function retentionMultiplier(s: { videoDuration: number; avgWatchDuration: number }): number {
  const rate = s.videoDuration > 0 ? Math.min(s.avgWatchDuration / s.videoDuration, 1) : 0;
  return 0.5 + rate * 0.5;
}

/**
 * 주목할 작품: (조회수 × 0.3 + 좋아요 × 0.7) × 시청유지율 승수
 * — 좋아요 비중 높음: 반응 좋은 양질 컨텐츠 발굴
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
  const submission = submissionsStore.find((s) => s.id === id);
  if (!submission) return asyncReturn(null);
  const contest = contestsStore.find((c) => c.id === submission.contestId);
  const creator = usersStore.find((u) => u.id === submission.userId);
  const result = resultsStore.find((r) => r.submissionId === id);
  return asyncReturn({
    ...submission,
    contestTitle: contest?.title ?? "",
    creatorName: creator?.nickname ?? creator?.name ?? "익명",
    prizeLabel: result?.prizeLabel,
    rank: result?.rank,
  });
}

/**
 * 결과발표 완료된 공모전 목록
 */
export async function getCompletedContests(): Promise<Contest[]> {
  return asyncReturn(contestsStore.filter((c) => c.status === "completed"));
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
