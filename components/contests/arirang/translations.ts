import type { Lang } from './lang-context';

type Translation = {
  ko: string;
  en: string;
};

export function t(dict: Record<string, Translation>, key: string, lang: Lang): string {
  return dict[key]?.[lang] ?? dict[key]?.ko ?? key;
}

export const translations = {
  navbar: {
    brand: { ko: '꿈플', en: '꿈플' },
    navAbout: { ko: '공모전 소개', en: 'About' },
    navOverview: { ko: '공모 개요', en: 'Overview' },
    navSchedule: { ko: '일정', en: 'Schedule' },
    navHowTo: { ko: '참여 방법', en: 'How to Participate' },
    navPrizes: { ko: '시상 내역', en: 'Prizes' },
    navApply: { ko: '접수', en: 'Apply' },
    navNotes: { ko: '유의사항', en: 'Notes' },
    myPage: { ko: '마이페이지', en: 'My Page' },
    signOut: { ko: '로그아웃', en: 'Sign Out' },
    signIn: { ko: '로그인', en: 'Sign In' },
  },
  hero: {
    badge: { ko: '제1회', en: '1st' },
    anniversary: { ko: '헐버트 박사의 아리랑 채보 130주년 기념!', en: "Celebrating 130 years since Dr. Hulbert's Arirang transcription!" },
    title: { ko: '꿈꾸는 아리랑', en: 'Dreaming Arirang' },
    subtitle: { ko: 'AI 영상 공모전', en: 'AI Video Contest' },
    quote: { ko: '아리랑은 한국인의 영원한 노래', en: "Arirang is Korea's eternal song" },
    quoteAuthor: { ko: '호머 헐버트', en: 'Homer Hulbert' },
    quoteAuthorDesc: { ko: '(한국의 외국인 독립운동가)', en: '(A foreign independence activist for Korea)' },
    countdownTitle: { ko: '접수 마감까지', en: 'Time left to apply' },
    countdownDays: { ko: '일', en: 'Days' },
    countdownHours: { ko: '시간', en: 'Hours' },
    countdownMinutes: { ko: '분', en: 'Minutes' },
    countdownSeconds: { ko: '초', en: 'Seconds' },
    cta: { ko: '지금 접수하기', en: 'Apply Now' },
    totalPrize: { ko: '총 상금 1,300만 원', en: 'Total Prize: ₩13,000,000' },
    mountainLabel: { ko: '산 실루엣', en: 'Mountain silhouette' },
    mountainTitle: { ko: '산 실루엣', en: 'Mountain silhouette' },
  },
  about: {
    title: { ko: '공모전 소개', en: 'About the Contest' },
    keywordArirangLabel: { ko: '아리랑', en: 'Arirang' },
    keywordArirangDesc: { ko: '한국인의 영원한 노래', en: "Korea's eternal song" },
    keywordAiLabel: { ko: 'AI 기술', en: 'AI Technology' },
    keywordAiDesc: { ko: '창의적 영상 제작', en: 'Creative video production' },
    keywordDreamLabel: { ko: '꿈', en: 'Dreams' },
    keywordDreamDesc: { ko: '여러분의 이야기', en: 'Your story' },
    paragraph1: {
      ko: '헐버트 박사의 아리랑 채보 130주년을 기념하여, 제1회 ‘꿈꾸는 아리랑’ AI 영상 공모전으로 우리 아리랑을 다시 한번 세계로 알립니다.',
      en: "To commemorate 130 years since Dr. Hulbert's Arirang transcription, the first Dreaming Arirang AI Video Contest shares Arirang with the world once again.",
    },
    paragraph2: {
      ko: '이번 공모전은 한국의 전통 가락인 ‘아리랑’과 현대의 ‘AI 기술’, 그리고 여러분의 ‘꿈’을 하나로 연결하는 창의적인 시도를 목표로 합니다.',
      en: "This contest invites creative work that connects Korea's traditional melody Arirang, modern AI technology, and your personal dreams into one compelling story.",
    },
    paragraph3: {
      ko: '여러분만의 독창적인 시선으로 아리랑의 새로운 꿈을 보여주세요!',
      en: 'Show us a new dream of Arirang through your own original perspective!',
    },
  },
  overview: {
    title: { ko: '공모 개요', en: 'Contest Overview' },
    cardTopicTitle: { ko: '주제', en: 'Theme' },
    cardTopicDesc: { ko: '자신의 꿈을 담은 나만의 아리랑', en: 'Your own Arirang that reflects your dream' },
    cardFormatTitle: { ko: '콘텐츠 형태', en: 'Content Format' },
    cardFormatDesc: { ko: '가로 영상', en: 'Horizontal video' },
    cardLengthTitle: { ko: '분량', en: 'Length' },
    cardLengthDesc: { ko: '30초 ~ 90초 내외', en: 'Around 30 to 90 seconds' },
    cardFileTypeTitle: { ko: '파일 형식', en: 'File Type' },
    cardFileTypeDesc: { ko: 'MP4', en: 'MP4' },
    cardEligibilityTitle: { ko: '참가 대상', en: 'Eligibility' },
    cardEligibilityDesc: { ko: '아리랑과 한국 문화를 사랑하는 전 세계 누구나', en: 'Open to anyone worldwide who loves Arirang and Korean culture' },
    productionMethodTitle: { ko: '제작 방식', en: 'Production Method' },
    productionMethodHeadline: { ko: '100% AI 영상 생성 도구를 활용한 콘텐츠', en: 'Content created using 100% AI video generation tools' },
    methodDetail1: { ko: '단, 참가자의 사진을 활용한 AI 영상은 사용 가능', en: 'AI-generated videos using the participant\'s own photo are allowed' },
    methodDetail2: { ko: '전통 민요 아리랑의 가사를 일부 활용하여 뮤직비디오 형식으로 제작', en: 'Create a music-video-style work that incorporates parts of traditional Arirang lyrics' },
    methodDetail3: { ko: '"아리랑" 단어 필수 사용', en: 'The word "Arirang" must be included' },
    watchSample: { ko: '예시 영상 감상하기', en: 'Watch Sample Video' },
  },
  schedule: {
    title: { ko: '상세 일정', en: 'Detailed Schedule' },
    eventApplyTitle: { ko: '접수 기간', en: 'Application Period' },
    eventApplyDate: { ko: '2026. 2. 25(수) ~ 3. 28(토) 23:59', en: '2026. 2. 25(수) ~ 3. 28(토) 23:59' },
    eventAwardTitle: { ko: '수상작 발표 및 시상식', en: 'Winners Announcement & Award Ceremony' },
    eventAwardDate: { ko: '2026. 4. 11(토)', en: '2026. 4. 11(토)' },
    eventAwardExtra: { ko: '온라인 시상식', en: 'Online ceremony' },
    nowOpen: { ko: 'NOW OPEN', en: 'NOW OPEN' },
  },
  howTo: {
    title: { ko: '참여 방법', en: 'How to Participate' },
    step1Title: { ko: '홈페이지 가입', en: 'Sign Up on the Website' },
    step1Desc: { ko: '공식 홈페이지에 접속하여 회원가입을 완료하세요.', en: 'Visit the official website and complete your registration.' },
    step2Title: { ko: '콘텐츠 업로드', en: 'Upload Your Content' },
    step2Desc: { ko: '공모전 접수 메뉴를 통해 영상 및 신청서를 제출하세요.', en: 'Submit your video and application through the contest submission menu.' },
  },
  prizes: {
    title: { ko: '시상 내역', en: 'Prize Details' },
    totalPrize: { ko: '총 상금 1,300만 원', en: 'Total Prize: ₩13,000,000' },
    arirangAwardName: { ko: '아리랑상', en: 'Arirang Award' },
    arirangAwardRank: { ko: '대상', en: 'Grand Prize' },
    arirangAwardCount: { ko: '1명', en: '1 winner' },
    arirangAwardAmount: { ko: '300만 원', en: '₩3,000,000' },
    echoAwardName: { ko: '메아리상', en: 'Echo Award' },
    echoAwardRank: { ko: '최우수상', en: 'Excellence Prize' },
    echoAwardCount: { ko: '2명', en: '2 winners' },
    echoAwardAmount: { ko: '각 150만 원', en: '₩1,500,000 each' },
    resonanceAwardName: { ko: '울림상', en: 'Resonance Award' },
    resonanceAwardRank: { ko: '우수상', en: 'Merit Prize' },
    resonanceAwardCount: { ko: '10명', en: '10 winners' },
    resonanceAwardAmount: { ko: '각 40만 원', en: '₩400,000 each' },
    dreamAwardName: { ko: '꿈꿈상', en: 'Dream Award' },
    dreamAwardRank: { ko: '장려상', en: 'Encouragement Prize' },
    dreamAwardCount: { ko: '30명', en: '30 winners' },
    dreamAwardAmount: { ko: '각 10만 원', en: '₩100,000 each' },
    benefitsTitle: { ko: '수상자 혜택', en: 'Winner Benefits' },
    benefit1: { ko: '함께봄 전속 프리랜서 계약 가능', en: 'Opportunity for an exclusive freelance contract with Hamkkebom' },
    benefit2: { ko: 'AI 콘텐츠 활용 및 마케팅 관련 창업 네트워크', en: 'Startup network for AI content utilization and marketing' },
    criteriaTitle: { ko: '심사 기준', en: 'Judging Criteria' },
    criteriaJudge: { ko: '심사위원 평가', en: 'Judges\' Evaluation' },
    criteriaVote: { ko: '온라인 투표', en: 'Online Voting' },
    criteriaBonus: { ko: '가산점', en: 'Bonus Points' },
    bonusesTitle: { ko: '가산점 항목', en: 'Bonus Point Items' },
    bonusesNote: { ko: '항목당 1회만 인정 (최대 3점)', en: 'Each item is counted once only (up to 3 points)' },
    bonus1: { ko: '공모전 공식포스터 SNS 업로드 후 인증 (1점)', en: 'Upload the official contest poster on social media and submit proof (1 point)' },
    bonus2: { ko: '헐버트박사 기념사업회 링크 SNS 업로드 후 인증 (1점)', en: 'Share the Hulbert Memorial Society link on social media and submit proof (1 point)' },
    bonus3: { ko: '헐버트 아리랑 전시회 참여 인증샷 SNS 업로드 후 인증 (1점)', en: 'Upload proof of attending the Hulbert Arirang exhibition on social media (1 point)' },
    hulbertToggleLabel: { ko: '헐버트 박사 소개 펼치기', en: 'Expand Dr. Hulbert profile' },
    hulbertAlt: { ko: '호머 헐버트', en: 'Homer Hulbert' },
    hulbertTagline: { ko: '한국을 사랑한 푸른눈의 조선인', en: 'A blue-eyed friend who loved Korea' },
    hulbertName: { ko: '호머 헐버트', en: 'Homer Hulbert' },
    hulbertDesc: {
      ko: '1886년, 23살 미국 청년이 조선을 만났습니다. 최초의 한글 교과서 ‘사민필지’를 저술하고, 고종 황제의 밀사로 헤이그 만국평화회의에 파견되는 등 평생을 한국의 독립과 발전에 헌신했습니다.',
      en: 'In 1886, a 23-year-old American arrived in Joseon. He wrote the first Hangul textbook, Saminpilji, and devoted his life to Korea\'s independence and progress, including serving as Emperor Gojong\'s secret envoy to The Hague Peace Conference.',
    },
    hulbertMore: { ko: '헐버트 박사 더 알아보기', en: 'Learn more about Dr. Hulbert' },
    exhibitionDate: { ko: '전시일정: 3월 12일(목) ~ 3월 24일(화)', en: 'Exhibition dates: 3월 12일(목) ~ 3월 24일(화)' },
    exhibitionPlace: { ko: '전시장소: 함께봄 본사 (서울 종로구 효자로 7길 10, 광화문광장 도보 10분거리)', en: 'Venue: Hamkkebom HQ (10, Hyoja-ro 7-gil, Jongno-gu, Seoul, 10 minutes on foot from Gwanghwamun Square)' },
    hashtagsTitle: { ko: '필수 해시태그', en: 'Required Hashtags' },
    verifyMethod: { ko: '인증방법: 공모전 마이페이지 → 가산점 등록 → SNS 게시글 캡처본 업로드', en: 'Verification: Contest My Page -> Bonus registration -> Upload a screenshot of your social media post' },
    caution: { ko: '본 공모전은 SNS 소통을 기반으로 합니다. 활발한 홍보와 정확한 심사를 위해 발표일까지 게시물을 \'공개\' 상태로 유지해 주세요.', en: 'This contest is based on social media engagement. Please keep your post public until the winners are announced for fair review and active promotion.' },
    hashtagArirang: { ko: '#아리랑', en: '#Arirang' },
    hashtagGwanghwamun: { ko: '#광화문', en: '#Gwanghwamun' },
    hashtagDreamingArirang: { ko: '#꿈꾸는아리랑', en: '#DreamingArirang' },
    hashtagHulbert: { ko: '#헐버트', en: '#Hulbert' },
    hashtagArirangChallenge: { ko: '#아리랑챌린지', en: '#ArirangChallenge' },
    hashtagHamkkebom: { ko: '#함께봄', en: '#Hamkkebom' },
    hashtagAiContest: { ko: '#AI공모전', en: '#AIContest' },
  },
  apply: {
    title: { ko: '공모전 접수', en: 'Contest Application' },
    subtitle: { ko: 'AI 영상으로 아리랑을 재해석해 주세요', en: 'Reimagine Arirang through AI video' },
    guideTitle: { ko: '접수 안내', en: 'Submission Guide' },
    guide1: { ko: 'AI를 활용하여 제작한 영상 (30초~90초, MP4)', en: 'Video created with AI tools (30 to 90 seconds, MP4)' },
    guide2: { ko: '작품 설명 및 제작과정 서술', en: 'Description of your work and production process' },
    guide3: { ko: '썸네일 이미지 (JPG/PNG, 권장 1920×1080)', en: 'Thumbnail image (JPG/PNG, recommended 1920×1080)' },
    guide4: { ko: '가산점 인증 자료 (선택, 추후 등록 가능)', en: 'Bonus-point verification materials (optional, can be submitted later)' },
    deadlinePrefix: { ko: '접수 마감:', en: 'Deadline:' },
    deadlineValue: { ko: '2026년 3월 28일 (토) 23:59', en: '2026년 3월 28일 (토) 23:59' },
    deadlineSuffix: { ko: '· 1인 1작품 제출 가능 · 팀 참여 불가', en: '· One submission per person · Team entries are not allowed' },
    cta: { ko: '작품 접수하기', en: 'Submit Your Work' },
    ctaHint: { ko: '로그인 후 접수 페이지에서 작품을 제출할 수 있습니다', en: 'After signing in, you can submit your work on the submission page.' },
  },
  notes: {
    title: { ko: '유의사항 및 저작권 안내', en: 'Important Notes and Copyright Guide' },

    // 각 섹션 제목
    requirementsTitle: { ko: '출품 요건', en: 'Submission Requirements' },
    copyrightTitle: { ko: '저작권 안내', en: 'Copyright Notice' },
    usageTitle: { ko: '출품작의 게시 및 홍보 활용', en: 'Publication and Promotional Use of Submissions' },
    winnerRightsTitle: { ko: '수상작의 권리 및 상업적 활용', en: 'Rights and Commercial Use of Winning Works' },
    judgingTitle: { ko: '심사 및 대중평가', en: 'Judging and Public Evaluation' },
    aiResponsibilityTitle: { ko: 'AI 제작물 관련 책임', en: 'Responsibility for AI-Generated Content' },
    thirdPartyTitle: { ko: '제3자 권리 침해 금지', en: 'Prohibition of Third-Party Rights Infringement' },
    participationTitle: { ko: '참여 제한', en: 'Participation Restrictions' },
    disqualificationTitle: { ko: '실격 및 수상 취소', en: 'Disqualification and Revocation of Awards' },
    privacyTitle: { ko: '개인정보 수집·이용 안내', en: 'Personal Information Collection and Use' },
    prizeTitle: { ko: '상금 지급 및 세금', en: 'Prize Payment and Taxes' },

    // 1. 출품 요건 bullet
    requirementsBullet1: { ko: '본 공모전의 출품작은 반드시 AI툴을 활용하여 제작된 창작물이어야 합니다.', en: 'All submissions must be original works created using AI tools.' },
    requirementsBullet2: { ko: '사용한 AI툴은 신청서에 반드시 기재해 주세요.', en: 'Please be sure to list the AI tools you used in your application.' },
    requirementsBullet3: { ko: 'AI 활용 사실이 확인되지 않거나 허위로 기재한 경우 심사 제외 또는 실격 처리될 수 있습니다.', en: 'Submissions may be excluded or disqualified if AI usage cannot be verified or is falsely reported.' },
    requirementsBullet4: { ko: '직접 촬영 영상만으로 구성된 콘텐츠는 인정되지 않습니다.', en: 'Content consisting solely of directly filmed footage is not accepted.' },
    requirementsBullet5: { ko: '참가자 본인의 사진을 활용한 AI 생성은 가능합니다.', en: "AI-generated content using the participant's own photos is allowed." },

    // 2. 저작권 안내 bullet
    copyrightBullet1: { ko: '출품작의 저작권은 원칙적으로 출품자에게 귀속됩니다.', en: 'Copyright of submissions belongs to the submitter in principle.' },
    copyrightBullet2: { ko: "단, 아래 '출품작 활용' 및 '수상작 권리' 항목에 명시된 범위에 대해서는 이용권이 부여됩니다.", en: "However, usage rights are granted within the scope specified in the 'Use of Submissions' and 'Winner Rights' sections below." },

    // 3. 출품작의 게시 및 홍보 활용 bullet
    usageBullet1: { ko: '응모자는 공모전 운영, 심사, 홍보, 전시회 개최 및 공익적 행사 진행을 위해 회사가 출품작을 무상으로 활용하는 것에 동의합니다.', en: 'Applicants agree that the company may use submissions free of charge for contest operation, judging, promotion, exhibitions, and public interest events.' },
    usageBullet2: { ko: '활용 범위에는 전시, 상영, 복제, 공중송신, 온라인 게시, 홍보물 제작 등이 포함됩니다.', en: 'The scope of use includes exhibitions, screenings, reproduction, public transmission, online posting, and creation of promotional materials.' },
    usageBullet3: { ko: '제출된 작품은 함께봄 공모전 페이지 및 관련 온라인 채널에 게시될 수 있습니다.', en: 'Submitted works may be posted on the Hamkkebom contest page and related online channels.' },
    usageBullet4: { ko: '수상 발표 이전에도 공모전 기간 중 전시회 및 행사에서 공개 상영 또는 전시될 수 있습니다.', en: 'Works may be publicly screened or exhibited at exhibitions and events during the contest period, even before winners are announced.' },
    usageBullet5: { ko: '전시회는 무료로 운영되며, 출품작 자체를 독립적인 판매 대상으로 활용하지 않습니다.', en: 'Exhibitions are free of charge, and submissions will not be used as independent items for sale.' },
    usageBullet6: { ko: '다만, 전시 공간 내 굿즈 판매 또는 공익적 모금 활동과 병행될 수 있습니다.', en: 'However, merchandise sales or charitable fundraising activities may occur within the exhibition space.' },
    usageBullet7: { ko: '수상 발표 전에는 출품작을 별도의 독립적인 상업 판매 또는 영리사업의 주된 콘텐츠로 활용하지 않습니다.', en: 'Before winners are announced, submissions will not be used as main content for separate commercial sales or profit-making businesses.' },

    // 4. 수상작의 권리 및 상업적 활용 bullet
    winnerRightsBullet1: { ko: '수상자는 상금 수령과 동시에 회사에 해당 수상작에 대한 전 세계적, 독점적, 기간 제한 없는 이용권 및 2차적 저작물 작성권을 부여하는 것에 동의합니다.', en: 'Winners agree to grant the company worldwide, exclusive, perpetual usage rights and derivative work rights upon receiving the prize money.' },
    winnerRightsBullet2: { ko: '회사는 수상작을 수정·편집·재가공하여 광고, 홍보, 상품 제작, 온라인·오프라인 매체 게시 등 상업적 목적으로 활용할 수 있습니다.', en: 'The company may modify, edit, and reprocess winning works for commercial purposes including advertising, promotion, product creation, and publication across online and offline media.' },
    winnerRightsBullet3: { ko: '필요 시 제3자(광고대행사, 제작사, 유통사 등)에게 권리를 재허락할 수 있습니다.', en: 'If necessary, rights may be sublicensed to third parties (advertising agencies, production companies, distributors, etc.).' },
    winnerRightsBullet4: { ko: '상금은 위 이용권 부여에 대한 정당한 대가로 지급됩니다.', en: 'The prize money is paid as fair compensation for granting the above usage rights.' },
    winnerRightsBullet5: { ko: '수상자는 동일 작품을 제3자에게 독점적으로 이용 허락할 수 없습니다.', en: 'Winners may not grant exclusive usage rights of the same work to third parties.' },
    winnerRightsBullet6: { ko: '단, 수상자는 본인의 포트폴리오 및 개인 홍보 목적에 한하여 작품을 사용할 수 있습니다.', en: 'However, winners may use their work for personal portfolio and promotional purposes.' },

    // 5. 심사 및 대중평가 bullet
    judgingBullet1: { ko: "출품작은 공모전 페이지에 게시되며 '좋아요' 수 등 대중 평가 요소가 심사에 일부 반영될 수 있습니다.", en: "Submissions will be posted on the contest page, and public evaluation factors such as 'likes' may be partially reflected in judging." },
    judgingBullet2: { ko: '대중 평가 반영 비율 및 최종 수상작 선정은 회사의 심사 기준에 따릅니다.', en: "The public evaluation ratio and final winner selection follow the company's judging criteria." },
    judgingBullet3: { ko: '비정상적 트래픽, 매크로, 자동화 프로그램, 조직적 투표 등 부정행위가 확인될 경우 해당 점수는 제외되거나 실격 처리될 수 있습니다.', en: 'If fraudulent activities such as abnormal traffic, macros, automated programs, or organized voting are detected, the relevant scores may be excluded or the entry disqualified.' },

    // 6. AI 제작물 관련 책임 bullet
    aiResponsibilityBullet1: { ko: '응모자는 AI툴의 이용약관을 위반하지 않았으며, 상업적 이용에 법적 제한이 없음을 보증합니다.', en: 'Applicants warrant that they have not violated AI tool terms of service and that there are no legal restrictions on commercial use.' },
    aiResponsibilityBullet2: { ko: 'AI 생성물의 저작권, 라이선스, 학습 데이터와 관련된 분쟁 발생 시 모든 책임은 출품자에게 있습니다.', en: 'All responsibility for disputes related to copyright, licensing, and training data of AI-generated content lies with the submitter.' },
    aiResponsibilityBullet3: { ko: '회사는 AI툴 약관 위반으로 인한 분쟁에 대해 책임을 부담하지 않습니다.', en: 'The company is not liable for disputes arising from violations of AI tool terms.' },

    // 7. 제3자 권리 침해 금지 bullet
    thirdPartyBullet1: { ko: '출품작은 제3자의 저작권, 초상권, 상표권, 디자인권, 음원·폰트 라이선스 등을 침해하지 않는 창작물이어야 합니다.', en: 'Submissions must be original works that do not infringe on third-party copyrights, portrait rights, trademarks, design rights, or music/font licenses.' },
    thirdPartyBullet2: { ko: '관련 분쟁 발생 시 모든 민·형사상 책임은 출품자에게 있습니다.', en: 'All civil and criminal liability for related disputes lies with the submitter.' },

    // 8. 참여 제한 bullet
    participationBullet1: { ko: '1인당 1작품만 응모 가능합니다.', en: 'Only one submission per person is allowed.' },
    participationBullet2: { ko: '팀 단위 참여는 불가합니다.', en: 'Team entries are not permitted.' },
    participationBullet3: { ko: '공동 제작 사실이 확인될 경우 수상이 취소될 수 있습니다.', en: 'Awards may be revoked if collaborative production is confirmed.' },

    // 9. 실격 및 수상 취소 bullet
    disqualificationBullet1: { ko: '다음에 해당할 경우 실격 또는 수상 취소 처리됩니다.', en: 'Entries may be disqualified or awards revoked in the following cases:' },
    disqualificationBullet2: { ko: '표절, 도용 등 권리 침해', en: 'Plagiarism, misappropriation, or rights infringement' },
    disqualificationBullet3: { ko: '허위 정보 기재', en: 'False information' },
    disqualificationBullet4: { ko: 'AI툴 라이선스 위반', en: 'Violation of AI tool licenses' },
    disqualificationBullet5: { ko: '사회적 물의를 일으킬 수 있는 내용', en: 'Content that may cause social controversy' },
    disqualificationBullet6: { ko: '법령 위반 또는 공모전 취지에 부합하지 않는 경우', en: 'Violation of laws or failure to align with the contest purpose' },
    disqualificationBullet7: { ko: '중복 또는 팀 참여 사실이 확인된 경우', en: 'Confirmed duplicate or team participation' },
    disqualificationBullet8: { ko: '수상 이후라도 위 사유가 확인될 경우 상금 반환이 요구될 수 있으며, 회사는 필요한 법적 조치를 취할 수 있습니다.', en: 'Even after winning, prize money may be required to be returned if the above reasons are confirmed, and the company may take necessary legal action.' },

    // 10. 개인정보 수집·이용 안내 bullet
    privacyBullet1: { ko: '수집 항목: 이름, 연락처, 이메일, (기업 참가 시) 사업자등록증 사본, (수상 시) 계좌 정보 및 주민등록번호', en: 'Items collected: Name, contact info, email, (for corporate entries) business registration copy, (for winners) bank account info and resident registration number' },
    privacyBullet2: { ko: '이용 목적: 참가자 확인, 심사 진행, 결과 안내, 상금 지급 및 세무 처리', en: 'Purpose: Participant verification, judging, result notification, prize payment and tax processing' },
    privacyBullet3: { ko: '보유 기간: 공모전 종료 후 3년간 보관 후 파기', en: 'Retention period: Stored for 3 years after the contest ends, then destroyed' },
    privacyBullet4: { ko: '수상자의 경우 세무 관련 법령에 따라 보관 기간이 달라질 수 있습니다.', en: 'For winners, the retention period may vary according to tax-related laws.' },
    privacyBullet5: { ko: '개인정보 수집·이용에 동의하지 않을 경우 참여가 제한될 수 있습니다.', en: 'Participation may be restricted if you do not consent to the collection and use of personal information.' },

    // 11. 상금 지급 및 세금 bullet
    prizeBullet1: { ko: '상금은 「소득세법」에 따른 기타소득으로 분류됩니다.', en: 'Prize money is classified as other income under the Income Tax Act.' },
    prizeBullet2: { ko: '관련 세법에 따라 제세공과금(8.8%)이 원천징수된 후 지급됩니다.', en: 'Taxes and fees (8.8%) will be withheld in accordance with relevant tax laws before payment.' },
    prizeBullet3: { ko: '제세공과금은 수상자 본인 부담입니다.', en: "Taxes and fees are the winner's responsibility." },
    prizeBullet4: { ko: '상금 지급을 위해 세무 처리에 필요한 정보 제출이 요구될 수 있으며, 미제출 시 지급이 제한될 수 있습니다.', en: 'Information required for tax processing may be requested for prize payment, and failure to submit may result in payment restrictions.' },
  },
  footer: {
    title: { ko: '꿈꾸는 아리랑', en: 'Dreaming Arirang' },
    hostedBy: { ko: '주최: 함께봄', en: 'Hosted by: Hamkkebom' },
    contactTitle: { ko: '문의', en: 'Contact' },
    copyright: { ko: '2026 함께봄. All rights reserved.', en: '2026 Hamkkebom. All rights reserved.' },
  },
} as const;