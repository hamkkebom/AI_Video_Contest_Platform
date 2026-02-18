# AI 영상 공모전 플랫폼 (AI Video Contest Platform)

## TL;DR

> **Quick Summary**: AI 영상 공모전 전문 플랫폼 MVP 구축. 공모전 접수 → 심사 → 결과 발표 + 영상 갤러리 + 사용자 테마 선택을 올인원으로 처리하는 웹 서비스. Next.js 15 + Supabase + Mux + next-themes 기반.
> 
 > **Deliverables**:
> - Phase 1a (Week 1-2): 인증 + 공개 페이지 + 3테마 + 영상 업로드(Mux) + 공모전 CRUD + 접수 + 관리자 승인 + 좋아요 + 기기관리
> - Phase 1b (Week 2-3): 심사 + 초대 + 알림 + 결과 + 갤러리 + 검색 + 고객센터 + 소식 + 분석 + 배포
> 
 > **Estimated Effort**: XL (3주 - Phase 1 완성, 48건 변경사항 반영)
> **Total Tasks**: 20개 (기존 13 + 신규 7: 좋아요/검색/고객센터/소식/기기관리/분석과금/지역분석)
> **Parallel Execution**: YES - 6 waves
 > **Critical Path**: Task 1 (DB Schema) → Task 3 (Auth) → Task 4 (Public Pages) → Task 6 (Contest CRUD) → Task 7 (Submission) → Task 9 (Judging) → Task 11 (Results) → Task 12 (Gallery) → Task 13 (Integration)

---

## Context

### Original Request
AI 영상 공모전 사이트 구축. 공모전 접수, 진행, 심사를 올인원으로 처리하는 웹 서비스. 비즈니스 모델: 기업 공모전 대행료 (확정) + 심사 결과 유료 리포트/인증 배지 (클라이언트 제안 사항). 벤치마킹: 비디오콘(기능) + AI카이브(UI/UX) + FilmFreeway(심사시스템) + 레몬사운드(콘테스트 기반 크리에이터 IP 플랫폼 모델).

### Interview Summary
**Key Discussions**:
- MVP 전략: Phase 1 (접수/심사/발표/**갤러리**/**테마선택**) → Phase 2 (리포트/결제) → Phase 3 (배지/프리미엄)
- 기술 스택: Next.js 15 + Supabase + Mux + next-themes + Vercel 확정
- 팀: 바이브코딩 마케터 1명 + 개발자 2명 = 3명
- 일정: 1주 내 접수 서비스 오픈 → 1개월 내 전체 완성
- 디자인: **사용자 선택형 3테마** (라이트/다크/네온사이버펑크 시그니처) — 다크 고정 X
- 테스트: 핵심 기능만 테스트 (심사 점수 계산 등)
- 인증 배지/유료 리포트: 클라이언트 **제안 사항** (확정 아님)
- 영상 갤러리: **Phase 1부터 포함** (공모전 출품작만, 자유 업로드 X)
- 주최자 검증: **관리자 수동 승인** (모든 공모전)
- 벤치마킹 추가: **레몬사운드** (콘테스트 기반 음악 IP 거래 플랫폼 — 구조적 유사성 분석)

**Competitive Positioning (SWOT 기반 5대 확정 차별점)** *(3차 수정 — 레몬사운드 분석 반영)*:
1. **한국형 온라인 심사 OS** — VideoCoN·레몬사운드 약점 공략 (구조적 멀티심사위원 채점 시스템 없음. 레몬사운드는 클라이언트 직접 선택 방식)
2. **신뢰 기반 공모전 거버넌스** — FilmFreeway 약점 공략 (Trustpilot 1.8점). 레몬사운드의 전문 매니저 중개 모델을 거버넌스 시스템으로 체계화
3. **AI 영상 도메인 유일의 구조화된 메타데이터** — 레몬사운드가 음악 도메인에서 AI 분류(Generative AI/AI-Assisted/Complete Original)를 선점했으나, AI 영상 도메인에서는 부재. 영상 특화 메타데이터(AI 도구, AI 기여도 비율, 권리 선언)를 제공
4. **공모전 연동 영상 갤러리 + 발견 루프** — VideoCoN(갤러리X) + AI카이브(공모전X) 결합. 레몬사운드의 Music License(작품 발견) 모델을 영상 도메인으로 적용
5. **크리에이터 중심 개인화 UX (테마 선택)** — VideoCoN 기업형 랜딩 탈피. 레몬사운드의 아티스트 프로필 체계를 참고하되, 테마 선택 등 더 깊은 개인화 제공

> **포지셔닝**: "한국 AI 영상 공모전을 위한 올인원 운영 플랫폼 — 신뢰 가능한 공모 운영, 온라인 심사, 그리고 작품 발견까지 한 곳에서."
> *(레몬사운드가 음악 도메인에서 검증한 "콘테스트 기반 크리에이터 IP 플랫폼" 모델을 AI 영상 도메인에 적용)*

**Research Findings**:
- AI 영상 콘텐츠 시장 급성장 (활용률 20%+)
- AI 영상 공모전 전문 플랫폼 부재 = 블루오션
- Supabase Storage는 영상 저장에 부적합 (용량 한계) → Mux 필수
- 커스텀 심사 양식 = 폼 빌더 구축이므로 MVP에서는 사전 정의 템플릿 사용
- Kakao/Naver OAuth는 사업자 등록 필요 → 초기에는 이메일/Google만
- next-themes로 3개 이상 커스텀 테마 구현 가능 (data-theme 속성 + CSS variables)
- shadcn/ui는 CSS variables(OKLCH) 기반이라 테마 확장이 자연스러움
- **[레몬사운드 분석]** 콘테스트 기반 크리에이터 IP 플랫폼 모델이 음악 도메인에서 이미 검증됨 (76건 콘테스트 운영, 1,294명 아티스트, 닌텐도/넥슨 등 파트너)
- **[레몬사운드 분석]** AI 콘텐츠 분류 체계(Generative AI/AI-Assisted/Complete Original)가 음악 도메인에서 이미 구현됨 → 우리 차별점 #3 "전 경쟁사 약점" 표현 수정 필요
- **[레몬사운드 분석]** Next.js + Supabase 기술 스택 동일 → 우리 기술 선택의 타당성 검증
- **[레몬사운드 분석]** 3중 수익 모델(콘테스트 + 아티스트 매칭 + 라이선싱) 참고 → Phase 2+ 수익 다변화 전략 힌트

### Metis Review
**Identified Gaps** (addressed):
- 1주 타임라인이 전체 Phase 1에 비현실적 → Phase 1a (Week 1 데모) + Phase 1b (Week 2 완성) 분리
- Supabase Storage로 영상 저장 불가 → Mux 전담, Supabase는 메타데이터만
- "커스텀 심사 양식" = 폼 빌더 (2주 프로젝트) → 3~5개 사전 정의 템플릿으로 대체
- "커스텀 접수 양식" = 동일 문제 → 고정 필드 사용
- Kakao/Naver OAuth 사업자 승인 필요 → Phase 1은 이메일+Google만
- 결제(Toss Payments)는 Phase 1에 유료 기능 없으므로 Phase 2로 연기
- Contest 상태 머신 미정의 → `draft → pending_approval → open → closed → judging → results → archived`
- DB 스키마 미정의 → Task 1에서 최우선 설계
- 유저 멀티롤 미정의 → `profiles` 테이블에 roles 배열로 처리
- 점수 계산 방식 미정의 → 단순 평균 + 동점 처리 규칙 정의

### 2차 피드백 반영
- 인증 배지/유료 리포트: 핵심 차별점 → **클라이언트 제안 섹션**으로 이동
- 핵심 차별점: SWOT 기반 5대 확정 차별점으로 재설계 (Oracle 전략 컨설팅)
- 영상 갤러리: Phase 2 → **Phase 1** 포함 (공모전 출품작만)
- 디자인 테마: 다크 고정 → **3테마 프리셋** (라이트/다크/네온사이버펑크)
- 주최자 검증: 관리자 수동 승인 확정

### 3차 피드백 반영 (레몬사운드 벤치마킹 추가)
- 벤치마킹 4번째 업체 추가: **레몬사운드** (lemonsound.co) — 콘테스트 기반 음악 IP 거래 플랫폼
- 차별점 #3 리워딩: "전 경쟁사 약점" → **"AI 영상 도메인 유일"**로 수정 (레몬사운드가 음악 도메인에서 AI 분류 선점)
- 차별점 #1, #4, #5: 레몬사운드 대비 차별화 포인트 보강
- SWOT 위협(T) 추가: 인접 도메인에서 검증된 콘테스트 기반 IP 플랫폼이 영상으로 확장 가능성
- SWOT 약점(W) 보강: 런칭 시 크리에이터 네트워크 제로 (vs 레몬사운드 1,294명, 비디오콘 5만+)
- SWOT 기회(O) 보강: 레몬사운드의 성공이 콘테스트 기반 크리에이터 IP 플랫폼 모델 자체를 시장에서 검증

### 4차 피드백 반영 (사용자 중심 Task 재배치 + 번호 정리)
- **Task 우선순위 재배치**: 사용자(참가자) → 호스트 → 심사위원 → 관리자 순으로 변경
- **공개 페이지(랜딩/공모전 탐색)를 Wave 2로 상향**: 구 Task 11 → 신 Task 4 (UI Foundation 흡수)
- **Contest CRUD를 Wave 3으로 하향**: 구 Task 4 → 신 Task 6
- **번호 불일치 버그 해결**: 구 Wave 구조와 TODO 번호 간 불일치 + Task 12 누락 해소
- **총 Task 수 14개 → 13개**: UI Foundation 별도 Task를 Public Pages에 통합
- **모든 내부 참조 갱신**: Dependency Matrix, Commit Strategy, Evidence 경로, Parallelization 정보

### 5차 피드백 반영 (9대 개발 원칙 + AI 도구 분리)
- **8대 → 9대 개발 원칙으로 확장**: #3 "SEO 친화적 텍스트 기반 설계" 신규 추가, 전체 원칙 원문 상세화
- **원칙 변경 가능**: 프로젝트 진행 중 원칙 추가/삭제/수정 가능 (변경 시 기록)
- **AI 도구 영상/이미지 분리**: `ai_tool TEXT` → `ai_video_tools TEXT[]` + `ai_image_tools TEXT[]`
- **접수 폼 필드 업데이트**: AI 영상 도구 multi-select + AI 이미지 도구 multi-select
- **DB Schema 업데이트**: submissions 테이블의 ai_tool 컬럼을 ai_video_tools, ai_image_tools 배열로 분리

### 6차 피드백 반영 (글로벌 설계 + i18n)
- **글로벌 설계 방침 확정**: DB/구조는 글로벌 대응으로 설계, 번역 인프라(next-intl)로 한국어/영어 전환 실제 동작
- **DB Schema 업데이트**: contests 테이블에 `prize_currency TEXT DEFAULT 'KRW'` 컬럼 추가 (Phase 2+ 글로벌 통화 대응)
- **결제 시스템 Phase 2+ 이연**: 해외 서비스 시 Stripe 등 결제 시스템 추가 (Phase 1에서는 설계만)
- **목업 플랜 동기화**: Task 1 폴더 구조에 `lib/i18n/` 추가, package.json에 `next-intl` 추가, SITE_CONFIG 글로벌 설정값 추가, Task 2 헤더에 언어 전환 버튼 자리 확보

### 7차 피드백 반영 (출품작 주최측 검토 + 더미 데이터 확대 + AI 도구 분리 동기화)
- **출품작 상태 흐름 변경**: `submitted → under_review → scored` → `submitted → pending_review → approved → under_judging → scored` (주최측 콘텐츠 검토 단계 추가)
- **submissions 테이블 업데이트**: `rejection_reason TEXT` 컬럼 추가 (반려 사유)
- **Must Have 추가**: 출품작 주최측 검토 시스템 (유해 콘텐츠 필터링)
- **더미 데이터 대폭 확대**: contests 5~8→20~25, submissions 10~15→80~100, users 5~8→30~40 (UI 레이아웃 실사용 검증)
- **접수 폼 AI 도구 필드**: `AI 도구(select)` → `AI 영상 도구(multi-select)` + `AI 이미지 도구(multi-select)` 동기화

### 8차 피드백 반영 (목업 v2/v2.1/v2.2 변경사항 동기화)

> 인터랙티브 목업 v2 리뷰에서 확인된 변경사항을 풀 개발 플랜에 동기화.
> 목업 v2, v2.1, v2.2 총 3차 리뷰 반영.

**[v2 반영] 역할 체계 + 갤러리 + 데이터**:
- **역할 체계 → 기능 토글 방식**: 기존 roles 배열 기반 → AccountType(individual/business) + FeatureToggles(contestParticipation/contestHosting/judging/commissionRequest) 방식으로 변경
- **갤러리 구조 변경**: 포스터 캐러셀(상단) + 무한스크롤 그리드(하단) 구조. 공모전별 포스터 갤러리 페이지 추가.
- **더미 데이터 상향**: contests 50+, submissions 200+, users 50+ (목업에서 UI 검증 후 풀 개발에도 동일 수량 유지)
- **상금 필터 → 정렬**: 상금 규모 필터 제거, 정렬(높은순/낮은순)으로 변경
- **공모전 결과 점수 비공개**: 일반 사용자에게 점수 비공개, 심사위원/주최자에게만 표시
- **Phase 2/3 placeholder**: 미구현 기능(댓글/좋아요/의뢰CTA/검색자동완성) UI 자리만 잡기
- **통합가입(SSO) 설계 대비**: 함께봄 서비스 생태계 내 통합가입 시스템 (CJ 스타일)

**[v2.1 반영] 알림 + 프리랜서 + UTM 분석**:
- **알림 벨 아이콘**: Header에 알림 드롭다운 추가 (의뢰 요청, 공모전 결과, 심사 초대, 시스템 공지 등)
- **프리랜서 토글 제거**: 공모전 플랫폼에서 프리랜서 등록 토글 삭제 → 대행 사이트 CTA 링크로 대체
- **의뢰 대상 확대**: 기업만 → 개인/기업 모두 의뢰 가능
- **프리랜서 등록 대상**: 개인만 (대행 사이트에서 등록)
- **마이페이지 의뢰 현황**: placeholder 카드 추가 (Phase 2)
- **UTM 전환추적 + 성과 분석**: Phase 1 필수. DB analytics 스키마 5개 테이블 + middleware UTM 캡처 + /api/track 필요
- **아키텍처 메모**: ISR/캐싱/크롤링 SEO 전략

**[v2.2 반영] 결과 페이지 + 캠페인 분석 대폭 확장 + UTM 생성 + 리포트**:
- **공모전 결과 → 수상자만 노출**: 전체 순위 → 수상자(대상/최우수상/우수상/장려상)만 표시. 비수상 참가자 미노출.
- **수상 타이틀 표시**: 각 수상자에 AWARD_TITLES(대상/최우수상/우수상/장려상) 필수 표시
- **참가 인증서**: 비수상 참가자는 결과 페이지 미노출 → 마이페이지에서 "참가 인증서"로만 확인
- **캠페인 성과 분석 대폭 확장**: 기존 유입수+퍼널 → 퍼포먼스 마케팅 지표 전체 (impressions/clicks/CTR/CPC/CVR/CPA/CPM/ROAS + 매체별 집행비/실소진비)
- **전환(CVR) 기준 선택**: 회원가입 + 접수 둘 다 선택 가능한 전환 기준 설정 기능
- **자동 인사이트**: 관리자에게만 표시, 규칙 기반 효율 분석 텍스트
- **리포트 시스템**: 최종 보고서 (공모전 종료 후 기본 제공) + 중간 보고서 (⚠️ 추가 과금 검토 중 — 미확정)
- **UTM 자동 생성**: 관리자만 생성 가능, 공모전별 × 매체별 UTM 링크 자동 조합 + 복사
- **매체 목록 사전 정의**: AD_MEDIA_LIST (Google Ads, Meta, 네이버, 카카오, TikTok, YouTube, X, 이메일, Direct, Organic)
- **마케팅 대행 CTA**: "마케팅 대행 신청" 버튼 (href="#" — 별도 대행 사이트)
- **DB 스키마 영향**: analytics 스키마에 ad_media_performance 테이블 추가, results 테이블에 award_title 필수화, participation_certificates 테이블 추가 검토

### 9차 피드백 반영 (48건 변경사항 — 목업 v3 + 풀 개발 동시 업데이트)

> 세션 1~3에서 확정된 48건 변경사항 전체 반영. DB 스키마 대폭 확장, 7개 신규 Task 추가, 기존 Task 수정, Wave 6단계로 재구조화.

**DB 스키마 변경 — 10개 신규 테이블:**
- `likes` (좋아요 — UNIQUE(user_id, submission_id), 토글식)
- `admin_notes` (관리자 메모)
- `activity_logs` (활동 로그 — 전 이벤트 기록)
- `user_devices` (기기 관리 — 최대 5대, 동시접속 불가)
- `ip_logs` (IP 기록 — 로그인/활동 시 자동)
- `inquiries` (1:1 문의 — general/contest_agency/bug_report)
- `faqs` (FAQ — 역할별 카테고리)
- `articles` (소식/트렌드 — trend_report/announcement/press_release)
- `contest_team_members` (내부 심사위원/주최측 팀)
- `user_account_actions` (계정 조치 이력 — warning/suspension)

**DB 스키마 변경 — 기존 테이블 수정:**
- `profiles`: +nickname(UNIQUE), +account_type, +business_registration_number(기업필수), +is_suspended, +is_flagged
- `contests`: +entry_fee, +allowed_extensions, +max_file_size_mb, +judging_type(3택), +like_criteria_enabled/weight/period, +is_official, +host_as_judge
- `submissions`: +like_count (denormalized counter)
- `judging_templates`: +contest_id, +parent_template_id (커스터마이징)
- `contest_judges`: +judge_type(internal/external), +invite_token, +resent_count
- `contest_reports`: +report_category(operation/marketing) — 2종 분리

**7개 신규 Task:**
| # | Task | Source | Wave |
|---|------|--------|------|
| 14 | Likes System | #10,22,23,24 | 3 |
| 15 | Unified Search | #11,32 | 4 |
| 16 | Customer Service | #39,43 | 4 |
| 17 | News/Trends | #40 | 4 |
| 18 | Device/Session Management | #30,31 | 3 |
| 19 | Analytics Monetization + Pricing | #36,41,42 | 5 |
| 20 | Regional Analytics | #37 | 5 |

**기존 Task 수정:**
- Task 1: +10 테이블, +ALTER TABLE, +RLS 10개, +트리거(like_count, max_devices)
- Task 3: +기업가입(사업자번호필수), +닉네임, +기기등록, +IP기록
- Task 6: +템플릿 커스터마이징(A안), +심사유형3택, +본인심사, +참가비, +영상스펙, +좋아요 설정
- Task 7: +좋아요 수 표시, +확장자/용량 검증
- Task 8: **대폭 확장** (회원관리+활동로그+IP+메모+조치+대행의뢰+공식공모전) → category `quick`→`deep`
- Task 9: +커스텀 템플릿 렌더링, +심사 완료 알림
- Task 10: +내부/외부 구분, +토큰 초대, +재발송
- Task 12: +좋아요 동작, +의뢰 CTA Feature Flag
- Task 4: +GNB에 검색/소식/고객센터 링크

**Must NOT Have 변경:**
- 제거: ~~갤러리 좋아요~~ (Phase 1 승격)
- 추가: 좋아요 자동차단 X, 검색 자동완성 X, IP 대역차단 X, 기기신뢰마크 X, 히트맵/코호트 X, 유료 결제 실제 연동 X, 자동 부정행위 탐지 X, 대량 계정 조치 X

**Wave 재구조화: 5 → 6 Waves, 13 → 20 Tasks**

```
Wave 1: Task 1 (DB+10 tables) + Task 2 (Theme) — 2 parallel
Wave 2: Task 3 (Auth) + Task 4 (Public) + Task 5 (Mux) — 3 parallel
Wave 3: Task 6 (Contest) + Task 7 (Submission) + Task 8 (Admin) + Task 14 (Likes) + Task 18 (Devices) — 5 parallel
Wave 4: Task 9 (Judging) + Task 10 (Invite) + Task 11 (Results) + Task 15 (Search) + Task 16 (Support) + Task 17 (News) — 6 parallel
Wave 5: Task 12 (Gallery) + Task 19 (Analytics+Pricing) + Task 20 (Regional) — 3 parallel
Wave 6: Task 13 (Integration+Deploy) — 1 sequential
```

---

## Work Objectives

### Core Objective
AI 영상 공모전 전문 플랫폼 MVP를 2주 내 구축하여, 공모전 개설 → 영상 접수 → 온라인 심사 → 결과 발표까지의 핵심 플로우를 완성한다.

### Concrete Deliverables
- 다크 테마 기반 반응형 웹 애플리케이션 (Next.js 15 App Router)
- Supabase 기반 인증/DB/RLS (이메일 + Google 로그인)
- Mux 기반 영상 업로드/스트리밍 (signed playback)
- 공모전 개설/관리 호스트 대시보드
- 영상 접수 폼 + 상태 추적
- 심사위원 초대 + 온라인 심사 인터페이스 (영상 재생 + 채점)
- 점수 집계 + 결과 발표 페이지
- 기본 관리자 패널 (공모전 승인)
- Resend 기반 이메일 알림
- **[v2.1/v2.2] UTM 전환추적 + 캠페인 성과 분석 대시보드** (퍼포먼스 마케팅 지표 전체)
- **[v2.2] UTM 자동 생성 도구** (관리자 전용)
- **[v2.2] 리포트 시스템** (최종/중간 보고서)

### Definition of Done
- [ ] 참가자가 회원가입 → 공모전 탐색 → 영상 제출까지 완료 가능
- [ ] 주최자가 공모전 개설 → 심사위원 초대 → 결과 발표까지 완료 가능
- [ ] 심사위원이 초대 수락 → 배정된 영상 시청 → 점수/피드백 입력 가능
- [ ] 관리자가 공모전 승인/반려 가능
- [ ] RLS로 역할 간 데이터 격리 완벽 동작
- [ ] 모든 핵심 API가 올바른 HTTP 상태 코드 반환
- [ ] 다크 테마 UI 전체 적용

### Must Have
- Supabase RLS 기반 역할별 데이터 격리
- Mux signed playback (심사 영상은 권한자만 시청)
- Contest 상태 머신: draft → pending_approval → open → closed → judging → results → archived
- 사전 정의 심사 템플릿 (3~5개)
- 고정 접수 필드 (제목, 설명, 영상, AI 영상 도구, AI 이미지 도구, AI 기여도, 권리 선언, 카테고리)
- 출품작 주최측 검토 시스템: 접수 → 주최측 영상 검토 → 승인/반려(사유 필수) → 심사 풀 진입
- AI 영상 특화 메타데이터 (사용 도구, AI 기여도 비율, 권리 선언 체크) — 레몬사운드의 음악 AI 분류(Generative AI/AI-Assisted/Complete Original)를 영상 도메인으로 확장·심화한 구조
- 이메일 기반 심사위원 초대
- 점수 집계 + 자동 순위 계산
- **3개 테마 시스템**: 라이트 / 다크 / 네온사이버펑크(시그니처) — next-themes + CSS variables
- **영상 갤러리**: 공모전 출품작 기반, 장르/도구/공모전별 필터, 크리에이터 프로필 연결
- **신뢰 거버넌스**: 관리자 수동 승인, 주최자 규정/상금 필수 입력, 타임라인 마일스톤 공개
- **[v2.1/v2.2] UTM 전환추적 + 캠페인 성과 분석**: middleware UTM 캡처, /api/track 이벤트 수집, 관리자 분석 대시보드 (매체별 impressions/clicks/CTR/CPC/CVR/CPA/CPM/ROAS/집행비/실소진비)
- **[v2.2] UTM 자동 생성**: 관리자만, 공모전별 × 매체별 UTM 링크 자동 조합 + 복사
- **[v2.2] 전환 기준 선택**: CVR 전환 기준을 회원가입 또는 접수 중 선택 가능
- **[v2.2] 자동 인사이트**: 관리자에게만 규칙 기반 효율 분석 텍스트 표시
- **[v2.2] 공모전 결과 수상자만 노출**: 비수상 참가자 미노출 + 마이페이지 참가 인증서
- **[v2.2] 리포트 시스템**: 최종 보고서 (공모전 종료 후 기본 제공) + 중간 보고서 (추가 과금 미확정)
- **[v3] 좋아요 시스템**: 토글식 1인1표 + UNIQUE 제약 + like_count denormalized + 심사 반영 옵션
- **[v3] 통합검색**: 공모전/영상/크리에이터/전체 탭 + Supabase text search
- **[v3] 고객센터**: 1:1 문의 + FAQ(역할별) + 대행 의뢰 폼
- **[v3] 소식/트렌드**: AI 도구 트렌드 + 공지 + 보도자료 (회원 전용)
- **[v3] 기기 관리**: 최대 5대 등록, 동시접속 불가, 강제 로그아웃 팝업
- **[v3] 닉네임**: UNIQUE, 선택, 공개 우선 표시
- **[v3] 기업 가입**: Google OAuth + 사업자번호 필수
- **[v3] 심사 템플릿 커스터마이징**: A안 (기본 3종 → 항목/가중치/최대점수 수정)
- **[v3] 내부/외부 심사위원**: 3택 + 토큰 초대 + 재발송
- **[v3] 검수/심사 6탭**: 검수대기/승인/반려/자동반려/심사중/완료
- **[v3] 관리자 회원관리 확장**: 활동로그/IP/메모/조치/의심계정
- **[v3] 관리자 자체 공모전**: 공식 배지 + 우선 노출
- **[v3] 리포트 2종 분리**: 운영 리포트 + 마케팅 리포트
- **[v3] 역할별 분석**: 참가자/주최자/심사위원/관리자 분석 대시보드
- **[v3] 분석 과금 모델**: 무료/유료 경계 (참가자: 작품성과 무료 / 주최자: 기본 무료 / 관리자: 전부 무료)
- **[v3] 플로팅 버튼 2개**: ↑맨위로 + 💬문의하기
- **[v3] 의뢰 CTA Feature Flag**: 관리자 ON/OFF + 자격 조건 (1회 참가+결과발표)
- **[v2.2] 마케팅 대행 CTA**: "마케팅 대행 신청" 버튼 (href="#" — 별도 대행 사이트)

### Must NOT Have (Guardrails)
- ❌ 드래그앤드롭 심사 양식 빌더 (Phase 2+)
- ❌ 커스텀 접수 양식 빌더 (Phase 2+)
- ❌ Toss Payments 결제 통합 (Phase 2 — Phase 1에 유료 기능 없음)
- ❌ 인증 배지 시스템 (클라이언트 제안 → 확정 시 Phase 3)
- ❌ 심사 결과 유료 리포트 (클라이언트 제안 → 확정 시 Phase 2)

- ❌ AI 심사 보조 (Phase 3+)
- ❌ Supabase Storage에 영상 파일 저장 (Mux 전담)
- ❌ Kakao/Naver OAuth (사업자 승인 후 추가)
- ❌ 푸시 알림, SMS, 카카오 알림 (Phase 1은 이메일만)
- ❌ 모바일 최적화 디자인 (데스크톱 우선, 모바일은 "작동" 수준)
- ~~❌ 관리자 분석 대시보드~~ → **[v2.1/v2.2 변경] Phase 1 필수로 승격**: UTM 전환추적 + 캠페인 성과 분석 (매체별 퍼포먼스 지표 전체) + UTM 자동 생성 + 리포트 시스템
- ❌ 갤러리 자유 업로드 (공모전 출품작만 — 자유 업로드는 Phase 2+)
- ~~❌ 갤러리 좋아요~~ → **[v3 변경] Phase 1 승격**: 좋아요 토글 시스템 구현
- ❌ 갤러리 댓글/공유 (Phase 2+)
- ❌ [v3] 좋아요 자동 차단 (의심만 플래그, 관리자 수동 확인)
- ❌ [v3] 검색 자동완성 (Phase 2)
- ❌ [v3] IP 대역 차단 (Phase 2)
- ❌ [v3] 기기 신뢰 마크 / 새 기기 알림 (Phase 2)
- ❌ [v3] 히트맵/코호트/시간대 패턴/IP 클러스터 분석 (Phase 2)
- ❌ [v3] 유료 결제 실제 연동 (placeholder만)
- ❌ [v3] 자동 부정행위 탐지 대시보드 (Phase 2)
- ❌ [v3] 대량 계정 조치 (Phase 2)
- ❌ 불필요한 과도한 에러 핸들링/유효성 검증 (핵심만)
- ❌ 모든 컴포넌트에 JSDoc/주석 (핵심 비즈니스 로직만)

### Client Proposals (미확정 — 기획서에 '제안'으로 포함)
- 💡 **심사 결과 유료 리포트**: 참가자가 상세 심사 피드백을 소액 결제로 열람 (3,000~10,000원)
- 💡 **크리에이터 인증 배지**: 공모전 입상 경력을 인증 배지로 프로필에 표시 (10,000~30,000원)


---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> Every criterion MUST be verifiable by running a command or using a tool.

### Test Decision
- **Infrastructure exists**: NO (신규 프로젝트)
- **Automated tests**: YES (핵심 기능만 - Tests-after)
- **Framework**: bun test (Bun 내장 테스트 러너)

### Test Setup (Task 1에 포함)
- `bun test` 설정 확인
- 핵심 테스트 대상: 점수 계산 로직, RLS 정책, Contest 상태 전이

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Frontend/UI** | Playwright (playwright skill) | Navigate, interact, assert DOM, screenshot |
| **API/Backend** | Bash (curl) | Send requests, parse responses, assert fields |
| **DB/RLS** | Bash (supabase CLI / curl) | Query with different role tokens, verify access |
| **Video Upload** | Bash (curl to Mux API) | Create upload URL, verify asset creation |

---

## Execution Strategy

### Parallel Execution Waves

> **설계 원칙**: 사용자(참가자) → 호스트(주최자) → 심사위원 → 관리자 순으로 구현.
> 일반 사용자가 보는 "앞문"(랜딩, 공모전 탐색)을 먼저 만든 뒤, 백엔드 운영 기능을 쌓는다.

```
Wave 1 (Foundation — 2 parallel):
├── Task 1: Project Setup + DB Schema (확장: +10 tables, +RLS, +triggers)
└── Task 2: Theme System (3-Theme)

Wave 2 (사용자 앞문 + 인증 + 영상 — 3 parallel):
├── Task 3: Auth System (확장: 기업가입, 닉네임, 기기등록)
├── Task 4: Public Pages (확장: GNB에 검색/소식/고객센터)
└── Task 5: Video Upload (Mux)

Wave 3 (호스트 + 접수 + 관리자 + 좋아요 + 기기 — 5 parallel):
├── Task 6: Contest CRUD (확장: 템플릿커스텀, 심사유형, 좋아요설정)
├── Task 7: Submission Flow (확장: 좋아요 수, 파일스펙)
├── Task 8: Admin Panel (대폭 확장: 회원관리, 대행의뢰, 공식공모전)
├── Task 14: Likes System [NEW]
└── Task 18: Device/Session Management [NEW]

Wave 4 (심사 + 결과 + 검색 + 고객센터 + 소식 — 6 parallel):
├── Task 9: Judging Interface (확장: 커스텀 템플릿, 완료알림)
├── Task 10: Judge Invitation (확장: 내부/외부, 토큰, 재발송)
├── Task 11: Score Aggregation + Results
├── Task 15: Unified Search [NEW]
├── Task 16: Customer Service [NEW]
└── Task 17: News/Trends [NEW]

Wave 5 (갤러리 + 분석 + 가격 — 3 parallel):
├── Task 12: Video Gallery (확장: 좋아요, 의뢰CTA)
├── Task 19: Analytics Monetization + Pricing [NEW]
└── Task 20: Regional Analytics [NEW]

Wave 6 (통합 + 배포 — 1 sequential):
└── Task 13: Integration Test + Polish + Deploy

Critical Path: T1 → T3 → T4 → T6 → T7 → T9 → T11 → T12 → T13
Max Concurrent: 6 (Wave 4)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 (Setup+Schema) | None | 3,4,5,6,7,8,14,15,16,17,18,19,20 | 2 |
| 2 (Theme System) | None | 4 | 1 |
| 3 (Auth) | 1 | 4,5,6,7,8,14,16,17,18 | 2 |
| 4 (Public Pages) | 1,2,3 | 6,7,8,9,12,15,16,17 | 5 |
| 5 (Mux Upload) | 1,3 | 7,9 | 4 |
| 6 (Contest CRUD) | 1,3,4 | 7,9,10,11,12 | 7,8,14,18 |
| 7 (Submission) | 5,6 | 9,11,12 | 8,14,18 |
| 8 (Admin) | 1,3,4 | 19,20 | 6,7,14,18 |
| 9 (Judging) | 5,6 | 11 | 10,15,16,17 |
| 10 (Judge Invite) | 3,6 | 11 | 9,15,16,17 |
| 11 (Results) | 7,9,10 | 12,13 | 15,16,17 |
| 12 (Gallery) | 7,11,14 | 13 | 19,20 |
| 13 (Integration) | ALL | None | None (final) |
| **14 (Likes)** | 1,3 | 12,19 | 6,7,8,18 |
| **15 (Search)** | 1,4 | 13 | 9,10,11,16,17 |
| **16 (Support)** | 1,3,4 | 13 | 9,10,11,15,17 |
| **17 (News)** | 1,3,4 | 13 | 9,10,11,15,16 |
| **18 (Devices)** | 1,3 | 20 | 6,7,8,14 |
| **19 (Analytics)** | 8,14 | 13 | 12,20 |
| **20 (Regional)** | 8,18 | 13 | 12,19 |

### Agent Dispatch Summary

| Wave | # Tasks | Dispatch |
|------|---------|---------|
| 1 | 2 | T1→`deep`, T2→`visual-engineering` |
| 2 | 3 | T3→`deep`, T4→`visual-engineering`, T5→`deep` |
| 3 | 5 | T6→`unspecified-high`, T7→`unspecified-high`, T8→`deep`, T14→`unspecified-low`, T18→`deep` |
| 4 | 6 | T9→`visual-engineering`, T10→`unspecified-high`, T11→`deep`, T15→`unspecified-low`, T16→`unspecified-low`, T17→`quick` |
| 5 | 3 | T12→`visual-engineering`, T19→`visual-engineering`, T20→`unspecified-low` |
| 6 | 1 | T13→`deep` |

---

## TODOs

---

- [ ] 1. Project Setup + Database Schema + Supabase Configuration

  **What to do**:
  - Next.js 15 프로젝트 초기화 (`create-next-app@latest` with App Router, TypeScript, Tailwind CSS, ESLint)
  - 필수 패키지 설치:
    - `@supabase/ssr @supabase/supabase-js` (Supabase 클라이언트)
    - `@mux/mux-node @mux/mux-uploader-react @mux/mux-player-react` (Mux 영상)
    - `resend` (이메일)
    - `zod` (유효성 검증)
    - shadcn/ui CLI로 기본 컴포넌트 설치
  - Supabase 프로젝트 연결 (`supabase init`, `supabase link`)
  - 환경변수 설정 (`.env.local`):
    ```
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    SUPABASE_SERVICE_ROLE_KEY=
    MUX_TOKEN_ID=
    MUX_TOKEN_SECRET=
    RESEND_API_KEY=
    ```
  - DB Schema 마이그레이션 파일 생성 (`supabase/migrations/`):

  **[v3] 추가 작업:**
  - **10개 신규 테이블** 추가: `likes`, `admin_notes`, `activity_logs`, `user_devices`, `ip_logs`, `inquiries`, `faqs`, `articles`, `contest_team_members`, `user_account_actions`
  - **기존 테이블 ALTER TABLE**:
    - `profiles`: +`nickname`(UNIQUE), +`account_type`(individual/business), +`business_registration_number`(기업필수), +`is_suspended`, +`is_flagged`
    - `contests`: +`entry_fee`, +`allowed_extensions`, +`max_file_size_mb`, +`judging_type`(score/pass_fail/rank — 3택), +`like_criteria_enabled`/`weight`/`period`, +`is_official`, +`host_as_judge`
    - `submissions`: +`like_count` (denormalized counter)
    - `judging_templates`: +`contest_id`, +`parent_template_id` (커스터마이징 A안)
    - `contest_judges`: +`judge_type`(internal/external), +`invite_token`, +`resent_count`
    - `contest_reports`: +`report_category`(operation/marketing — 2종 분리)
  - **10개 RLS 정책** 추가 (likes, admin_notes, activity_logs, user_devices, ip_logs, inquiries, faqs, articles, contest_team_members, user_account_actions)
  - **트리거 함수** 추가: `update_like_count()` (좋아요 카운터), `check_max_devices()` (최대 5대 제한)

  **Database Tables (Core Schema)**:

  ```sql
  -- 1. profiles (사용자 프로필 + 역할)
  CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    roles TEXT[] DEFAULT ARRAY['participant']::TEXT[],
    -- roles: 'participant', 'host', 'judge', 'admin' (복수 가능)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 2. contests (공모전)
  CREATE TABLE contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    poster_url TEXT,
    prize_amount BIGINT, -- 금액 (currency 단위)
    prize_currency TEXT DEFAULT 'KRW', -- 통화 코드 (Phase 1: KRW 고정, Phase 2+: USD/JPY 등 글로벌 확장)
    category TEXT, -- 'short_film', 'music_video', 'commercial', 'experimental', 'free'
    status TEXT DEFAULT 'draft',
    -- status machine: draft → pending_approval → open → closed → judging → results → archived
    submission_start TIMESTAMPTZ,
    submission_deadline TIMESTAMPTZ,
    judging_deadline TIMESTAMPTZ,
    result_date TIMESTAMPTZ,
    max_duration_seconds INT DEFAULT 600, -- 최대 영상 길이 (초)
    judging_template_id UUID REFERENCES judging_templates(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 3. judging_templates (사전 정의 심사 양식)
  CREATE TABLE judging_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., '기본 점수형', '다기준 평가형', '합격/불합격형'
    description TEXT,
    criteria JSONB NOT NULL,
    -- criteria 예시: [{"name": "창의성", "max_score": 10, "weight": 0.3}, ...]
    is_system BOOLEAN DEFAULT TRUE, -- 시스템 기본 템플릿
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 4. submissions (출품작)
  CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
    participant_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ai_video_tools TEXT[], -- 사용한 AI 영상 도구 (Runway, Sora, Kling 등)
    ai_image_tools TEXT[], -- 사용한 AI 이미지 도구 (Midjourney, DALL-E 등)
    mux_asset_id TEXT, -- Mux 영상 Asset ID
    mux_playback_id TEXT, -- Mux Playback ID (signed)
    thumbnail_url TEXT,
    status TEXT DEFAULT 'submitted',
    -- status: submitted → pending_review → approved → under_judging → scored → winner
    --                                    ↘ rejected (유해/부적절 — 반려 사유 필수)
    rejection_reason TEXT, -- 주최측 반려 사유 (rejected 시 필수)
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contest_id, participant_id) -- 공모전 당 1인 1작품
  );

  -- 5. contest_judges (심사위원 배정 - junction table)
  CREATE TABLE contest_judges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
    judge_id UUID REFERENCES profiles(id),
    invited_email TEXT NOT NULL,
    status TEXT DEFAULT 'invited',
    -- status: invited → accepted → declined
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(contest_id, invited_email)
  );

  -- 6. scores (심사 점수)
  CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
    judge_id UUID REFERENCES profiles(id) NOT NULL,
    criteria_scores JSONB NOT NULL,
    -- 예시: {"창의성": 8, "기술력": 7, "스토리텔링": 9}
    total_score DECIMAL(5,2),
    feedback TEXT,
    scored_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, judge_id) -- 심사위원당 1회 평가
  );

  -- 7. contest_results (공모전 결과)
  CREATE TABLE contest_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
    submission_id UUID REFERENCES submissions(id) NOT NULL,
    rank INT NOT NULL,
    average_score DECIMAL(5,2) NOT NULL,
    award_title TEXT, -- '대상', '최우수상', '우수상' 등
    announced_at TIMESTAMPTZ,
    UNIQUE(contest_id, rank)
  );
  ```

  **RLS Policies (핵심)**:
  ```sql
  -- profiles: 본인만 수정, 모든 사용자 조회 가능
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
  CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

  -- contests: 공개 공모전은 모두 조회, 호스트만 자기 것 수정
  ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "contests_select_public" ON contests FOR SELECT USING (status IN ('open', 'closed', 'judging', 'results', 'archived'));
  CREATE POLICY "contests_select_own" ON contests FOR SELECT USING (host_id = auth.uid());
  CREATE POLICY "contests_insert" ON contests FOR INSERT WITH CHECK (host_id = auth.uid());
  CREATE POLICY "contests_update" ON contests FOR UPDATE USING (host_id = auth.uid());

  -- submissions: 참가자는 자기 것만, 호스트/심사위원은 해당 공모전 것만
  ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "submissions_select_own" ON submissions FOR SELECT USING (participant_id = auth.uid());
  CREATE POLICY "submissions_select_host" ON submissions FOR SELECT USING (
    contest_id IN (SELECT id FROM contests WHERE host_id = auth.uid())
  );
  CREATE POLICY "submissions_select_judge" ON submissions FOR SELECT USING (
    contest_id IN (SELECT contest_id FROM contest_judges WHERE judge_id = auth.uid() AND status = 'accepted')
  );
  CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (participant_id = auth.uid());

  -- scores: 심사위원만 자기 점수 입력/조회
  ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "scores_select_own" ON scores FOR SELECT USING (judge_id = auth.uid());
  CREATE POLICY "scores_select_host" ON scores FOR SELECT USING (
    submission_id IN (SELECT s.id FROM submissions s JOIN contests c ON s.contest_id = c.id WHERE c.host_id = auth.uid())
  );
  CREATE POLICY "scores_insert" ON scores FOR INSERT WITH CHECK (judge_id = auth.uid());
  ```

  **[8차 피드백 — v2.2 반영] 추가 테이블:**

  ```sql
  -- 8. analytics_visits (방문 추적 — UTM 캡처)
  CREATE TABLE analytics_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    contest_id UUID REFERENCES contests(id),
    user_id UUID REFERENCES profiles(id),
    page_path TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 9. analytics_events (전환 이벤트 추적)
  CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES analytics_visits(id),
    event_type TEXT NOT NULL, -- 'signup', 'submission', 'profile_complete', 'contest_view'
    contest_id UUID REFERENCES contests(id),
    user_id UUID REFERENCES profiles(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 10. ad_media_performance (매체별 성과 지표)
  CREATE TABLE ad_media_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
    media_key TEXT NOT NULL, -- AD_MEDIA_LIST의 value (google_ads, meta 등)
    date DATE NOT NULL,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions_signup INT DEFAULT 0,
    conversions_submission INT DEFAULT 0,
    budget DECIMAL(12,2) DEFAULT 0, -- 집행비
    actual_spend DECIMAL(12,2) DEFAULT 0, -- 실 소진비
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contest_id, media_key, date)
  );

  -- 11. utm_generated_links (UTM 자동 생성 링크)
  CREATE TABLE utm_generated_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
    media_key TEXT NOT NULL,
    utm_source TEXT NOT NULL,
    utm_medium TEXT NOT NULL,
    utm_campaign TEXT NOT NULL,
    utm_content TEXT,
    full_url TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id) NOT NULL, -- 관리자만
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contest_id, media_key)
  );

  -- 12. contest_reports (리포트)
  CREATE TABLE contest_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
    report_type TEXT NOT NULL, -- 'final', 'interim'
    data JSONB NOT NULL, -- 보고서 내용 (JSON)
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contest_id, report_type)
  );
  ```

  - Supabase 마이그레이션 실행: `supabase db push`
  - 사전 정의 심사 템플릿 시드 데이터 삽입 (3개):
    1. **기본 점수형**: 창의성(30%) + 기술력(30%) + 스토리텔링(20%) + 완성도(20%)
    2. **단순 합산형**: 항목별 10점 만점 5개 항목
    3. **합격/불합격형**: Pass/Fail + 코멘트

  **Must NOT do**:
  - 영상 파일을 Supabase Storage에 저장하지 않음 (Mux 전담)
  - 커스텀 폼 빌더 스키마 설계하지 않음

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: DB 스키마 설계는 전체 프로젝트의 기반이며, RLS 정책이 복잡하여 심층 이해 필요
  - **Skills**: [`git-master`]
    - `git-master`: 초기 커밋 + 마이그레이션 파일 관리

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 6, 7, 8, 9, 10, 11
  - **Blocked By**: None (can start immediately)

  **References**:

  **External References**:
  - Supabase docs: https://supabase.com/docs/guides/database/overview — DB setup + RLS
  - Supabase Auth: https://supabase.com/docs/guides/auth — Auth.users 테이블 구조
  - Mux docs: https://docs.mux.com/guides/get-started — Asset/Playback ID 구조
  - Next.js 15 App Router: https://nextjs.org/docs/app — 프로젝트 구조 참고
  - shadcn/ui: https://ui.shadcn.com/docs/installation/next — Next.js 설치 가이드

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Next.js 프로젝트 빌드 성공
    Tool: Bash
    Preconditions: 프로젝트 초기화 완료
    Steps:
      1. bun run build
      2. Assert: exit code 0
      3. Assert: .next 디렉토리 생성됨
    Expected Result: 빌드 성공
    Evidence: build output captured

  Scenario: Supabase 마이그레이션 성공
    Tool: Bash
    Preconditions: Supabase 프로젝트 연결됨
    Steps:
      1. supabase db push
      2. Assert: exit code 0
      3. supabase db dump으로 테이블 확인
      4. Assert: profiles, contests, submissions, contest_judges, scores, judging_templates, contest_results 테이블 존재
    Expected Result: 모든 테이블 생성됨
    Evidence: DB dump output

  Scenario: RLS 정책 활성화 확인
    Tool: Bash (curl to Supabase REST API)
    Preconditions: 마이그레이션 완료
    Steps:
      1. Anon key로 contests 테이블 조회 (인증 없음)
      2. Assert: 빈 배열 반환 (RLS 차단)
      3. Service role key로 contests 조회
      4. Assert: 데이터 접근 가능
    Expected Result: RLS가 비인증 접근 차단
    Evidence: Response bodies captured

  Scenario: 심사 템플릿 시드 데이터 확인
    Tool: Bash (curl)
    Preconditions: 시드 데이터 삽입 완료
    Steps:
      1. curl Supabase REST API /judging_templates (service role)
      2. Assert: 3개 템플릿 존재
      3. Assert: 각 템플릿에 criteria JSONB 데이터 존재
    Expected Result: 3개 기본 심사 템플릿 확인
    Evidence: Response body captured
  ```

  **Commit**: YES
  - Message: `feat(db): initialize project with Supabase schema, RLS policies, and seed data`
  - Files: `package.json, supabase/migrations/*.sql, supabase/seed.sql, .env.local.example, next.config.ts, tailwind.config.ts`
  - Pre-commit: `bun run build`

---

- [ ] 2. Theme System (3-Theme: Light / Dark / Neon Cyberpunk Signature)

  **What to do**:
  - next-themes 설치 및 3테마 설정:
    - `bun add next-themes`
    - ThemeProvider 설정: `themes={['light', 'dark', 'neon']}`, `attribute="data-theme"`, `defaultTheme="neon"`
    - 쿠키 기반 저장 (SSR 깜빡임 방지): `storageKey="theme"` + 쿠키 미들웨어
  - shadcn/ui 설치 및 CSS variables 정의 (OKLCH 기반):
    - `npx shadcn@latest init`
    - `app/globals.css`에 3개 테마별 CSS variables 정의:

    **Theme 1 — Light (깨끗한 라이트)**:
    ```css
    :root, [data-theme='light'] {
      --background: oklch(0.99 0 0);
      --foreground: oklch(0.15 0.02 260);
      --primary: oklch(0.55 0.25 270);      /* 인디고 퍼플 */
      --card: oklch(1 0 0);
      /* ... shadcn 전체 변수 */
    }
    ```

    **Theme 2 — Dark (AI카이브 스타일 다크)**:
    ```css
    [data-theme='dark'] {
      --background: oklch(0.13 0.02 260);
      --foreground: oklch(0.98 0 0);
      --primary: oklch(0.65 0.2 270);       /* 밝은 인디고 */
      --card: oklch(0.18 0.02 260);
      /* ... */
    }
    ```

    **Theme 3 — Neon Cyberpunk (시그니처 — 핵심 차별점!)**:
    ```css
    [data-theme='neon'] {
      --background: oklch(0.10 0.04 290);   /* 딥 퍼플 블랙 */
      --foreground: oklch(0.95 0.03 200);   /* 시안 화이트 */
      --primary: oklch(0.75 0.3 320);       /* 핫 핑크 네온 */
      --secondary: oklch(0.7 0.25 200);     /* 시안 네온 */
      --accent: oklch(0.8 0.28 290);        /* 바이올렛 네온 */
      --card: oklch(0.14 0.05 290);         /* 글래스모피즘 느낌 퍼플 */
      --border: oklch(0.4 0.15 320 / 30%);  /* 네온 핑크 반투명 보더 */
      /* 네온 글로우 효과를 위한 커스텀 변수 */
      --neon-glow: 0 0 10px oklch(0.75 0.3 320 / 50%);
      --neon-glow-cyan: 0 0 10px oklch(0.7 0.25 200 / 50%);
      /* ... */
    }
    ```
  - 테마 전환 UI 컴포넌트:
    - `components/ui/theme-switcher.tsx`: 3개 테마 선택 드롭다운/토글
    - 헤더에 배치 (아이콘: 태양/달/번개)
    - 선택 시 즉시 전환 (no flash)
  - 네온 테마 전용 글로우 유틸리티 클래스:
    - `.neon-glow`: box-shadow로 네온 효과
    - `.neon-text`: text-shadow로 네온 텍스트
    - `.neon-border`: 반투명 네온 보더
    - 이 클래스들은 `[data-theme='neon']` 하위에서만 활성화

  **Must NOT do**:
  - 4개 이상 테마 (3개만 — light, dark, neon)
  - 사용자 커스텀 색상 피커 (프리셋만)
  - 테마별 다른 레이아웃 (색상만 변경, 구조는 동일)
  - 과도한 네온 애니메이션 (정적 글로우만, 깜빡임 X)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS variables + 테마 디자인이 핵심. 네온 사이버펑크의 시각적 완성도가 중요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 3개 테마의 색상 조화와 UI 일관성 보장

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 4 (UI Foundation이 테마 위에 올라감)
  - **Blocked By**: None

  **References**:

  **External References**:
  - next-themes: https://github.com/pacocoursey/next-themes — 멀티 테마 설정 (themes prop으로 커스텀 테마)
  - shadcn/ui 테마: https://ui.shadcn.com/docs/theming — CSS variables (OKLCH) 정의 방법
  - AI카이브 다크 참고: https://aikive.com/ — 다크 테마 레퍼런스
  - 네온 사이버펑크 참고: Tron Legacy, Blade Runner 2049 색상 팔레트

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 라이트 테마 렌더링
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to: http://localhost:3000
      2. Execute JS: localStorage.setItem('theme', 'light')
      3. Reload page
      4. Assert: document.documentElement has data-theme="light"
      5. Assert: body background-color is light (near white)
      6. Screenshot: .sisyphus/evidence/task-2-theme-light.png
    Expected Result: 라이트 테마 정상 적용
    Evidence: .sisyphus/evidence/task-2-theme-light.png

  Scenario: 네온 사이버펑크 테마 렌더링
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Execute JS: localStorage.setItem('theme', 'neon')
      3. Reload page
      4. Assert: document.documentElement has data-theme="neon"
      5. Assert: body background-color is deep purple-black
      6. Assert: primary 색상이 핑크 계열
      7. Screenshot: .sisyphus/evidence/task-2-theme-neon.png
    Expected Result: 네온 테마 정상 적용 (사이버펑크 분위기)
    Evidence: .sisyphus/evidence/task-2-theme-neon.png

  Scenario: 테마 전환 UI 동작
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Click: theme switcher button in header
      3. Assert: 3개 옵션 표시 (라이트/다크/네온)
      4. Click: "네온" 옵션
      5. Assert: 페이지 즉시 테마 전환 (깜빡임 없음)
      6. Reload page
      7. Assert: 테마 유지됨 (localStorage 저장 확인)
      8. Screenshot: .sisyphus/evidence/task-2-theme-switch.png
    Expected Result: 테마 전환 + 저장 정상 동작
    Evidence: .sisyphus/evidence/task-2-theme-switch.png
  ```

  **Commit**: YES
  - Message: `feat(theme): add 3-theme system (light/dark/neon cyberpunk) with next-themes`
  - Files: `app/globals.css, app/layout.tsx, components/ui/theme-switcher.tsx, lib/theme.ts`
  - Pre-commit: `bun run build`

---

- [ ] 3. Authentication System (Signup/Login/Roles)

  **What to do**:
  - Supabase Auth 설정:
    - 이메일/비밀번호 회원가입 + Google OAuth
    - Auth callback route: `app/auth/callback/route.ts`
    - Supabase middleware: `middleware.ts` (세션 갱신 + 역할 기반 라우트 가드)
  - 회원가입 시 `profiles` 테이블에 자동 생성 (Supabase trigger 또는 Auth Hook):
    ```sql
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO profiles (id, email, name, roles)
      VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''), ARRAY['participant']);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    ```
  - Supabase Client 유틸리티:
    - `lib/supabase/client.ts` (브라우저 클라이언트)
    - `lib/supabase/server.ts` (서버 컴포넌트/액션용)
    - `lib/supabase/middleware.ts` (미들웨어용)
  - 페이지 구현:
    - `app/(auth)/login/page.tsx`: 로그인 (이메일 + Google)
    - `app/(auth)/signup/page.tsx`: 회원가입 (역할 선택: 참가자/주최자)
    - `app/(auth)/auth/callback/route.ts`: OAuth 콜백
  - 역할 기반 미들웨어:
    - `/dashboard/*` → host/admin만 접근
    - `/judging/*` → judge만 접근
    - `/admin/*` → admin만 접근
  - 역할 전환 기능: 참가자가 주최자 역할 추가 요청 (profiles.roles 배열에 추가)

  **[v3] 추가 작업:**
  - **기업 가입 플로우**: Google OAuth + 사업자등록번호 필수 입력 (`account_type='business'` → `business_registration_number` NOT NULL 검증)
  - **닉네임 설정**: 회원가입 시 닉네임(선택, UNIQUE) 입력 → 설정 시 공개 표시명 우선
  - **기기 등록**: 회원가입/로그인 시 `user_devices` 테이블에 기기 자동 등록 (User-Agent 파싱, 최대 5대)
  - **IP 기록**: 로그인/주요 활동 시 `ip_logs` 테이블에 자동 기록
  - `handle_new_user()` 트리거에 `nickname`, `account_type` 초기화 추가

  **Must NOT do**:
  - Kakao/Naver OAuth (사업자 등록 후 Phase 2에 추가)
  - 복잡한 역할/권한 관리 UI (기본 역할 선택만)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Supabase Auth + RLS + Middleware 통합이 복잡, 보안이 중요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 로그인/회원가입 UI

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 1 이후)
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 4, 5, 6, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:

  **External References**:
  - Supabase Auth with Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs — SSR 인증 패턴
  - Supabase Middleware: https://supabase.com/docs/guides/auth/server-side/creating-a-client — 미들웨어 클라이언트
  - Next.js 15 Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware — 라우트 가드

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 이메일 회원가입 성공
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to: http://localhost:3000/signup
      2. Wait for: input[name="email"] visible (timeout: 5s)
      3. Fill: input[name="email"] → "testuser@example.com"
      4. Fill: input[name="password"] → "TestPass123!"
      5. Fill: input[name="name"] → "테스트유저"
      6. Select role: "participant"
      7. Click: button[type="submit"]
      8. Wait for: navigation or success message (timeout: 10s)
      9. Screenshot: .sisyphus/evidence/task-3-signup-success.png
    Expected Result: 회원가입 완료, 확인 메시지 또는 대시보드 이동
    Evidence: .sisyphus/evidence/task-3-signup-success.png

  Scenario: 로그인 후 역할 기반 라우팅
    Tool: Playwright (playwright skill)
    Preconditions: testuser@example.com 계정 존재 (participant 역할)
    Steps:
      1. Navigate to: http://localhost:3000/login
      2. Fill: email → "testuser@example.com", password → "TestPass123!"
      3. Click: submit
      4. Wait for: navigation (timeout: 10s)
      5. Navigate to: /admin
      6. Assert: 403 또는 redirect to /login (participant는 admin 접근 불가)
      7. Screenshot: .sisyphus/evidence/task-3-role-guard.png
    Expected Result: participant가 admin 라우트 접근 시 차단됨
    Evidence: .sisyphus/evidence/task-3-role-guard.png

  Scenario: RLS 데이터 격리 확인
    Tool: Bash (curl)
    Preconditions: 2명의 사용자 존재 (user_a, user_b)
    Steps:
      1. user_a의 JWT로 profiles 조회 → 본인 데이터 조회 가능
      2. user_a의 JWT로 submissions 조회 → 본인 출품작만 반환
      3. Assert: user_b의 submission은 user_a에게 보이지 않음
    Expected Result: RLS가 사용자 간 데이터 격리
    Evidence: Response bodies captured
  ```

  **Commit**: YES
  - Message: `feat(auth): add Supabase auth with email/Google login and role-based middleware`
  - Files: `app/(auth)/*, lib/supabase/*, middleware.ts, supabase/migrations/*`
  - Pre-commit: `bun run build`

---

- [ ] 4. UI Foundation + Public Pages (랜딩, 공모전 탐색, SEO)

  **What to do**:
  - 공통 레이아웃 + 네비게이션:
    - `app/layout.tsx`: 루트 레이아웃 (ThemeProvider, 폰트, 메타데이터)
    - `components/layout/header.tsx`: 글로벌 헤더 (로고, 네비게이션, 테마 전환, 로그인/프로필)
    - `components/layout/footer.tsx`: 글로벌 푸터
    - `components/layout/sidebar.tsx`: 대시보드용 사이드바 (Wave 3에서 사용)
    - 반응형 네비게이션 (데스크톱: 수평 메뉴, 모바일: 햄버거)
  - 공통 UI 컴포넌트 (shadcn/ui 기반):
    - Button, Card, Badge, Input, Textarea, Select, Dialog, Toast, Skeleton, Avatar
    - `npx shadcn@latest add` 로 설치
  - 랜딩 페이지:
    - `app/page.tsx`: 메인 홈
    - 히어로 섹션 (슬로건 + CTA)
    - 진행 중인 공모전 하이라이트 (시드 데이터 기반)
    - 최근 수상작 (초기에는 빈 상태 또는 "Coming Soon")
    - 플랫폼 소개 + 비즈니스 모델 설명
  - 공모전 목록 페이지 (Public):
    - `app/contests/page.tsx`: 공모전 탐색
    - 필터: 상태(접수중/심사중/완료), 카테고리, 상금 규모
    - 정렬: 최신순, 마감임박순, 상금순
    - AI카이브 스타일 카드형 그리드 레이아웃
    - 서버 사이드 페이지네이션
  - 공모전 상세 페이지 (Public):
    - `app/contests/[id]/page.tsx`: 공모전 상세 정보
    - 포스터, 제목, 설명, 상금, 일정, 카테고리
    - "접수하기" CTA 버튼 (로그인 필요)
    - 접수 현황 (접수 수)
  - SEO:
    - `app/layout.tsx`: metadata (title, description, og:image)
    - 공모전 상세 페이지: dynamic metadata

  **[v3] 추가 작업:**
  - **GNB 링크 추가**: 글로벌 헤더 네비게이션에 검색(`/search`), 소식(`/news`), 고객센터(`/support`) 링크 추가
  - **플로팅 버튼 2개**: ↑맨위로(scroll-to-top) + 💬문의하기(`/support/inquiry`) — 전역 컴포넌트

  **Must NOT do**:
  - 커뮤니티/소셜 기능
  - 검색 자동완성
  - 모바일 최적화 (데스크톱 우선, 모바일은 "작동" 수준)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 플랫폼의 "첫인상" — 랜딩 페이지와 공모전 탐색 UI가 핵심. AI카이브 스타일 참고 필요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 랜딩 페이지, 카드 그리드, 공모전 상세, 레이아웃 UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Tasks 6, 7, 8, 9, 12
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **External References**:
  - AI카이브: https://aikive.com/ — 카드형 그리드, 다크 테마, 메뉴 구조 참고
  - Next.js Metadata: https://nextjs.org/docs/app/building-your-application/optimizing/metadata — SEO
  - shadcn/ui components: https://ui.shadcn.com/docs/components — 공통 컴포넌트

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 랜딩 페이지 렌더링
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to: http://localhost:3000
      2. Assert: 히어로 섹션 visible
      3. Assert: 진행 중인 공모전 섹션 visible
      4. Assert: CTA 버튼 존재
      5. Assert: 글로벌 헤더 + 네비게이션 렌더링
      6. Assert: 글로벌 푸터 렌더링
      7. Screenshot: .sisyphus/evidence/task-4-landing.png
    Expected Result: 랜딩 페이지 정상 렌더링
    Evidence: .sisyphus/evidence/task-4-landing.png

  Scenario: 공모전 목록 페이지
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, 3개+ 공모전 시드 데이터 존재
    Steps:
      1. Navigate to: http://localhost:3000/contests
      2. Wait for: contest cards visible (timeout: 5s)
      3. Assert: 카드형 그리드 레이아웃 (grid 또는 flex)
      4. Assert: 각 카드에 제목, 상금, 마감일 표시
      5. Click: 필터 "접수중"
      6. Assert: open 상태 공모전만 표시
      7. Screenshot: .sisyphus/evidence/task-4-contest-list.png
    Expected Result: 공모전 목록 정상 표시 + 필터 동작
    Evidence: .sisyphus/evidence/task-4-contest-list.png

  Scenario: SEO 메타데이터
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s http://localhost:3000 | grep "<title>"
      2. Assert: title 태그에 적절한 제목 포함
      3. curl -s http://localhost:3000 | grep "og:title"
      4. Assert: og:title 메타 태그 존재
    Expected Result: SEO 메타데이터 정상 설정
    Evidence: HTML output captured

  Scenario: 테마 전환 시 공개 페이지 정상 렌더링
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/contests
      2. Click: theme switcher → "네온"
      3. Assert: 카드 그리드가 네온 테마 색상으로 렌더링
      4. Screenshot: .sisyphus/evidence/task-4-contests-neon.png
    Expected Result: 네온 테마에서도 공모전 목록 정상 표시
    Evidence: .sisyphus/evidence/task-4-contests-neon.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add layout, navigation, landing page, contest listing, and public pages with SEO`
  - Files: `app/page.tsx, app/contests/page.tsx, app/contests/[id]/page.tsx, components/layout/*`
  - Pre-commit: `bun run build`

---

- [ ] 5. Video Upload (Mux Integration)

  **What to do**:
  - Mux Direct Upload 구현:
    - API Route: `app/api/mux/upload/route.ts` — 업로드 URL 생성
    - Mux 설정: `signed` playback policy (심사 영상은 권한자만)
    - 업로드 완료 시 asset_id, playback_id를 submissions 테이블에 저장
  - Mux Webhook 처리:
    - API Route: `app/api/mux/webhook/route.ts`
    - 이벤트: `video.asset.ready` → submission 상태 업데이트
    - Webhook 시그니처 검증
  - Mux Player 컴포넌트:
    - `components/video/mux-uploader.tsx`: `@mux/mux-uploader-react` 래퍼
    - `components/video/mux-player.tsx`: `@mux/mux-player-react` 래퍼 (signed playback)
    - 업로드 진행률 표시
    - 최대 영상 길이 제한 (contest.max_duration_seconds)
  - Signed Playback Token 생성:
    - API Route: `app/api/mux/token/route.ts`
    - 요청자의 역할 확인 (심사위원/호스트만 토큰 발급)
    - JWT 기반 Mux Signing Key 사용

  **Must NOT do**:
  - Supabase Storage에 영상 저장
  - 영상 편집/트리밍 기능
  - 영상 썸네일 커스텀 생성 (Mux 자동 생성 활용)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Mux API 통합, Webhook, Signed Playback 등 외부 서비스 연동 복잡
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 업로드 UI/UX (진행률, 에러 처리)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Tasks 1, 3

  **References**:

  **External References**:
  - Mux Direct Uploads: https://docs.mux.com/guides/direct-upload — 브라우저에서 직접 업로드
  - Mux Webhooks: https://docs.mux.com/guides/listen-for-webhooks — Webhook 설정
  - Mux Signed Playback: https://docs.mux.com/guides/secure-video-playback — 서명된 재생
  - @mux/mux-uploader-react: https://docs.mux.com/guides/mux-uploader — React 업로더 컴포넌트
  - @mux/mux-player-react: https://docs.mux.com/guides/mux-player-react — React 플레이어 컴포넌트

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Mux 업로드 URL 생성 API
    Tool: Bash (curl)
    Preconditions: Server running, MUX_TOKEN_ID/SECRET 설정됨
    Steps:
      1. POST /api/mux/upload with authenticated user's token
      2. Assert: HTTP 200
      3. Assert: response contains "upload_url" field
      4. Assert: response contains "asset_id" field
    Expected Result: Mux 업로드 URL 생성됨
    Evidence: Response body captured

  Scenario: 비인증 사용자 영상 재생 차단
    Tool: Bash (curl)
    Preconditions: Mux asset 존재 (signed policy)
    Steps:
      1. GET /api/mux/token/{playback_id} without auth token
      2. Assert: HTTP 401
      3. GET /api/mux/token/{playback_id} with participant token (not assigned judge)
      4. Assert: HTTP 403
    Expected Result: 권한 없는 사용자는 토큰 발급 거부
    Evidence: Response bodies captured

  Scenario: Mux 업로더 UI 렌더링
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, 인증된 사용자
    Steps:
      1. Navigate to submission page with Mux uploader
      2. Assert: mux-uploader element visible
      3. Assert: 파일 드래그&드롭 영역 표시
      4. Screenshot: .sisyphus/evidence/task-5-uploader.png
    Expected Result: Mux 업로더 정상 렌더링
    Evidence: .sisyphus/evidence/task-5-uploader.png
  ```

  **Commit**: YES
  - Message: `feat(video): integrate Mux for video upload, streaming, and signed playback`
  - Files: `app/api/mux/*, components/video/*, lib/mux.ts`
  - Pre-commit: `bun run build`

---

- [ ] 6. Contest CRUD + Host Dashboard

  **What to do**:
  - 공모전 생성/수정/삭제 API (Server Actions):
    - `app/dashboard/contests/new/page.tsx`: 공모전 생성 폼
    - 필드: 제목, 설명, 카테고리, 상금, 접수 기간, 심사 기간, 결과 발표일, 최대 영상 길이, 포스터 이미지, 심사 템플릿 선택
  - Contest 상태 머신 구현:
    ```
    draft → pending_approval → open → closed → judging → results → archived
    ```
    - 상태 전이 규칙:
      - `draft → pending_approval`: 주최자가 "승인 요청" 버튼 클릭
      - `pending_approval → open`: 관리자 승인
      - `open → closed`: 접수 마감일 도래 또는 수동 마감
      - `closed → judging`: 주최자가 "심사 시작" 버튼
      - `judging → results`: 주최자가 "결과 발표" 버튼
      - `results → archived`: 일정 기간 후 자동 또는 수동
  - Host Dashboard 페이지:
    - `app/dashboard/page.tsx`: 대시보드 메인 (내 공모전 목록, 통계 요약)
    - `app/dashboard/contests/page.tsx`: 내 공모전 리스트 (상태별 필터)
    - `app/dashboard/contests/[id]/page.tsx`: 공모전 상세 (접수 현황, 심사 진행률)
    - `app/dashboard/contests/[id]/edit/page.tsx`: 공모전 수정
  - Task 4에서 만든 레이아웃/네비게이션 재사용 + 사이드바 레이아웃 적용
  - 포스터 이미지 업로드: Supabase Storage (이미지만, 영상 아님)

  **[v3] 추가 작업:**
  - **심사 템플릿 커스터마이징 (A안)**: 기본 3종 시스템 템플릿을 복제(clone) → 항목명/가중치/최대점수 수정 가능. `judging_templates`에 `parent_template_id` FK + `contest_id` FK 사용
  - **심사 유형 3택**: `judging_type` 필드 — `score`(점수형) / `pass_fail`(합격불합격) / `rank`(순위형) 중 선택
  - **본인 심사**: `host_as_judge` 체크박스 — 주최자 본인도 심사위원에 자동 포함
  - **참가비**: `entry_fee` 필드 — 0이면 무료, 금액 입력 시 유료 (Phase 1에서는 표시만, 실결제 X)
  - **영상 스펙**: `allowed_extensions`(TEXT[]) + `max_file_size_mb`(INT) 필드 — 공모전별 허용 확장자/용량 설정
  - **좋아요 설정**: `like_criteria_enabled`(BOOLEAN) + `like_criteria_weight`(DECIMAL) + `like_criteria_period`(start/end TIMESTAMPTZ) — 심사 반영 여부/비중/집계기간

  **Must NOT do**:
  - 커스텀 접수 양식 빌더
  - 공모전 대행 서비스 신청 기능 (Phase 2)
  - 결과 보고서 PDF 생성 (Phase 2)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CRUD + 상태 머신 + 대시보드 UI가 복합적 작업
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 대시보드 UI 구현

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Tasks 7, 9, 10, 11, 12
  - **Blocked By**: Tasks 1, 3, 4

  **References**:

  **External References**:
  - FilmFreeway 대시보드: https://filmfreeway.com/ — 주최자 대시보드 레이아웃 참고
  - shadcn/ui data-table: https://ui.shadcn.com/docs/components/data-table — 리스트/테이블 뷰
  - Supabase Storage (이미지): https://supabase.com/docs/guides/storage — 포스터 이미지 업로드
  - Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 공모전 생성 성공
    Tool: Playwright (playwright skill)
    Preconditions: Host 역할 사용자 로그인 상태, Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/dashboard/contests/new
      2. Fill: input[name="title"] → "AI 영상 공모전 2026"
      3. Fill: textarea[name="description"] → "AI로 제작된 영상 공모전입니다"
      4. Select: category → "short_film"
      5. Fill: input[name="prize_amount"] → "1000000"
      6. Fill: 접수 기간, 심사 기간, 결과 발표일
      7. Select: judging_template → "기본 점수형"
      8. Click: submit button
      9. Wait for: success toast or redirect (timeout: 10s)
      10. Assert: 공모전 목록에 새 공모전 표시
      11. Screenshot: .sisyphus/evidence/task-6-contest-created.png
    Expected Result: 공모전 생성 후 대시보드에 표시
    Evidence: .sisyphus/evidence/task-6-contest-created.png

  Scenario: 공모전 상태 전이 (draft → pending_approval)
    Tool: Playwright (playwright skill)
    Preconditions: Draft 상태 공모전 존재
    Steps:
      1. Navigate to: 공모전 상세 페이지
      2. Assert: status badge shows "임시저장"
      3. Click: "승인 요청" 버튼
      4. Wait for: status change (timeout: 5s)
      5. Assert: status badge shows "승인 대기"
      6. Screenshot: .sisyphus/evidence/task-6-status-transition.png
    Expected Result: 상태가 정상 전이됨
    Evidence: .sisyphus/evidence/task-6-status-transition.png

  Scenario: 다른 호스트의 공모전 수정 불가
    Tool: Bash (curl)
    Preconditions: host_a의 공모전, host_b의 JWT
    Steps:
      1. PATCH /api/contests/{host_a_contest_id} with host_b's token
      2. Assert: HTTP 403 or empty result (RLS 차단)
    Expected Result: RLS가 다른 호스트의 공모전 수정 차단
    Evidence: Response body captured
  ```

  **Commit**: YES
  - Message: `feat(contest): add contest CRUD, state machine, and host dashboard`
  - Files: `app/dashboard/*, lib/actions/contest.ts, components/contest/*`
  - Pre-commit: `bun run build`

---

- [ ] 7. Submission Flow (접수)

  **What to do**:
  - 공모전 접수 페이지:
    - `app/contests/[id]/submit/page.tsx`: 출품 폼
    - 고정 필드: 제목, 설명, AI 영상 도구 (multi-select: Runway, Sora, Kling, Pika, Hailuo, Vidu, Luma, Synthesia, HeyGen, Invideo, 기타), AI 이미지 도구 (multi-select: Midjourney, DALL-E, Stable Diffusion, Firefly, Leonardo AI, Flux, Ideogram, Playground, 기타), AI 기여도 (슬라이더: 0~100%), 권리 선언 체크박스 ("본인 제작 AI 영상이며, 타인의 저작권을 침해하지 않았음을 확인합니다"), 갤러리 공개 동의 체크박스, 영상 업로드 (Mux)
    - Zod 유효성 검증
    - 접수 마감일 확인 (마감 시 제출 불가)
    - 공모전당 1인 1작품 제한 (DB unique constraint)
  - 내 출품작 관리:
    - `app/my/submissions/page.tsx`: 내 출품작 목록 (상태별)
    - `app/my/submissions/[id]/page.tsx`: 출품작 상세 (영상 재생, 상태, 점수)
  - 접수 상태 추적:
    - 상태: `submitted → pending_review → approved → under_judging → scored → winner / rejected`
    - `pending_review`: 접수 완료 후 주최측 콘텐츠 검토 대기
    - `approved`: 주최측 승인 (유해 콘텐츠 아님 확인 — 심사 풀 진입)
    - `rejected`: 주최측 반려 (사유 필수 — rejection_reason 컬럼)
    - `under_judging`: 심사위원 심사 진행 중
    - `scored`: 심사 완료
    - `winner`: 수상작 선정
    - 실시간 상태 표시 (Supabase Realtime은 Phase 2, 현재는 새로고침)
  - 주최측 출품작 검토 UI (호스트 대시보드):
    - 검토대기 출품작 영상 확인 + 메타데이터 검토
    - 승인/반려 버튼 (반려 시 사유 필수 입력)
    - 검토대기 건수 알림 뱃지
  - 호스트 대시보드에 접수 현황 표시:
    - 총 접수 수, 최근 접수작, 접수 기간 카운트다운

  **[v3] 추가 작업:**
  - **좋아요 수 표시**: 출품작 카드/상세에 `like_count` 표시 (submissions.like_count denormalized 값)
  - **확장자/용량 검증**: 접수 시 해당 공모전의 `allowed_extensions`/`max_file_size_mb` 설정과 대조하여 Zod + 클라이언트 검증 (서버 측에서도 재검증)

  **Must NOT do**:
  - 커스텀 접수 양식 (고정 필드만)
  - 다중 영상 업로드 (1작품 = 1영상)
  - 접수 수정/재제출 (Phase 2)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 폼 + API + 상태 관리 + 대시보드 연동 복합 작업
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 접수 폼 UI, 상태 표시 컴포넌트

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8)
  - **Blocks**: Tasks 9, 11, 12
  - **Blocked By**: Tasks 5, 6

  **References**:

  **External References**:
  - Zod validation: https://zod.dev/ — 폼 유효성 검증 스키마
  - react-hook-form + Zod: https://react-hook-form.com/get-started#SchemaValidation

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 공모전 접수 성공
    Tool: Playwright (playwright skill)
    Preconditions: Open 상태 공모전 존재, participant 로그인
    Steps:
      1. Navigate to: http://localhost:3000/contests/{id}/submit
      2. Fill: input[name="title"] → "나의 AI 단편영화"
      3. Fill: textarea[name="description"] → "Runway Gen-3로 제작한 단편"
      4. Select: ai_tool → "Runway"
      5. Upload: 영상 파일 (Mux uploader)
      6. Wait for: upload complete indicator (timeout: 60s)
      7. Click: submit button
      8. Wait for: success message (timeout: 10s)
      9. Assert: redirected to /my/submissions
      10. Assert: 새 출품작이 "접수완료" 상태로 표시
      11. Screenshot: .sisyphus/evidence/task-7-submission-success.png
    Expected Result: 출품 접수 완료
    Evidence: .sisyphus/evidence/task-7-submission-success.png

  Scenario: 마감된 공모전 접수 차단
    Tool: Playwright (playwright skill)
    Preconditions: Closed 상태 공모전
    Steps:
      1. Navigate to: /contests/{closed_id}/submit
      2. Assert: 제출 폼 비활성화 또는 "접수 마감" 메시지 표시
      3. Screenshot: .sisyphus/evidence/task-7-deadline-passed.png
    Expected Result: 마감된 공모전 접수 불가
    Evidence: .sisyphus/evidence/task-7-deadline-passed.png

  Scenario: 중복 접수 방지
    Tool: Bash (curl)
    Preconditions: 이미 접수한 공모전
    Steps:
      1. POST /api/contests/{id}/submissions with same participant token
      2. Assert: HTTP 409 or error message "이미 접수한 공모전입니다"
    Expected Result: 중복 접수 차단
    Evidence: Response body captured
  ```

  **Commit**: YES
  - Message: `feat(submission): add submission form with AI metadata, status tracking, and my submissions`
  - Files: `app/contests/[id]/submit/*, app/my/submissions/*, lib/actions/submission.ts`
  - Pre-commit: `bun run build`

---

- [ ] 8. Admin Panel (관리자)

  **What to do**:
  - 관리자 패널 페이지:
    - `app/admin/page.tsx`: 관리자 대시보드 (기본 통계)
    - `app/admin/contests/page.tsx`: 공모전 승인/관리 목록
    - `app/admin/contests/[id]/page.tsx`: 공모전 상세 (승인/반려 버튼)
    - `app/admin/users/page.tsx`: 회원 목록 (기본)
  - 공모전 승인 워크플로:
    - `pending_approval` 상태 공모전 목록 표시
    - 승인 → `open` 상태로 전환
    - 반려 → `draft` 상태로 되돌림 + 사유 입력
  - 기본 통계:
    - 전체 회원 수, 공모전 수, 출품작 수
    - 승인 대기 공모전 수
  - 관리자 역할 보호:
    - middleware에서 admin 역할 확인
    - RLS에서 admin 역할 추가 정책

  **[v3] 대폭 확장:**
  - **회원관리 확장**:
    - `app/admin/users/[id]/page.tsx`: 회원 상세 (활동로그/IP/메모/조치 탭)
    - 활동 로그 탭: `activity_logs` 테이블에서 해당 회원의 전 이벤트 히스토리 (최신순, 페이지네이션)
    - IP 기록 탭: `ip_logs` 테이블에서 로그인/활동 IP 히스토리 + 위치 표시(GeoIP)
    - 관리자 메모 탭: `admin_notes` CRUD — 관리자끼리 공유하는 내부 메모
    - 계정 조치: `user_account_actions` 테이블 사용 — 경고/정지/해제 + 사유 필수
    - 의심 계정 목록: `is_flagged=true` 필터 (좋아요 조작 등 — Task 14에서 플래그)
  - **대행 의뢰 관리**: `app/admin/inquiries/page.tsx` — `inquiries` 테이블의 `type='contest_agency'` 필터, 의뢰 목록 열람/상태 변경
  - **공식 공모전 관리**: 관리자가 개설한 공모전에 `is_official=true` 배지 + 목록 우선 노출(정렬 가중치)

  **Must NOT do**:
  - 결제/정산 관리 (Phase 2)
  - 신고/분쟁 처리 (Phase 2)
  - 사이트 콘텐츠 관리 (Phase 2)
  - 대량 계정 조치 (Phase 2 — 개별 조치만)
  - 자동 부정행위 탐지 대시보드 (Phase 2)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: [v3] 회원관리 확장(활동로그/IP/메모/조치) + 대행의뢰 + 공식공모전으로 대폭 복잡화
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 관리자 테이블/리스트 UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: None directly
  - **Blocked By**: Tasks 1, 3, 4

  **References**:

  **External References**:
  - shadcn/ui data-table: https://ui.shadcn.com/docs/components/data-table — 테이블 컴포넌트

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 공모전 승인
    Tool: Playwright (playwright skill)
    Preconditions: Admin 로그인, pending_approval 공모전 존재
    Steps:
      1. Navigate to: http://localhost:3000/admin/contests
      2. Assert: 승인 대기 공모전 목록 표시
      3. Click: 공모전 상세 링크
      4. Click: "승인" 버튼
      5. Wait for: status change (timeout: 5s)
      6. Assert: 공모전 상태 "open"으로 변경
      7. Screenshot: .sisyphus/evidence/task-8-admin-approve.png
    Expected Result: 관리자 승인 후 공모전 공개
    Evidence: .sisyphus/evidence/task-8-admin-approve.png

  Scenario: 비관리자 접근 차단
    Tool: Playwright (playwright skill)
    Preconditions: Participant 역할 사용자 로그인
    Steps:
      1. Navigate to: http://localhost:3000/admin
      2. Assert: redirect to / 또는 403 페이지
      3. Screenshot: .sisyphus/evidence/task-8-admin-guard.png
    Expected Result: 비관리자 접근 차단
    Evidence: .sisyphus/evidence/task-8-admin-guard.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add admin panel with contest approval workflow`
  - Files: `app/admin/*, lib/actions/admin.ts`
  - Pre-commit: `bun run build`

---

- [ ] 9. Judging Interface (심사)

  **What to do**:
  - 심사 인터페이스 페이지:
    - `app/judging/page.tsx`: 배정된 공모전 목록
    - `app/judging/[contestId]/page.tsx`: 심사 대상 출품작 목록 (심사 완료/미완료 표시)
    - `app/judging/[contestId]/[submissionId]/page.tsx`: 심사 화면
  - 심사 화면 레이아웃:
    - 좌측: Mux 비디오 플레이어 (signed playback)
    - 우측: 심사 양식 (선택된 템플릿 기반)
    - 심사 기준별 점수 입력 (슬라이더 또는 숫자 입력)
    - 텍스트 피드백 입력란
    - 저장 버튼 + 자동 저장 (draft)
  - 심사 양식 렌더링:
    - `judging_templates.criteria` JSONB를 기반으로 동적 폼 생성
    - 기준별 최대 점수, 가중치 표시
    - 총점 실시간 계산 (가중 평균)
  - 심사 진행률:
    - 전체 출품작 수 vs 심사 완료 수
    - 프로그레스 바 표시

  **[v3] 추가 작업:**
  - **커스텀 템플릿 렌더링**: `judging_templates`에 `parent_template_id`가 있는 경우 커스터마이징된 기준으로 심사 폼 동적 생성 (기본 템플릿 vs 커스텀 분기 처리)
  - **심사 완료 알림**: 심사위원이 모든 출품작 채점 완료 시 호스트에게 Resend 이메일 알림 (`lib/email/judging-complete.tsx`)
  - **검수/심사 6탭 UI**: 호스트 대시보드 출품작 관리에 6개 탭 — 검수대기 / 승인 / 반려 / 자동반려 / 심사중 / 완료 (submission status별 필터)

  **Must NOT do**:
  - 영상 다운로드 기능 (보안)
  - 심사위원 간 점수 비교 기능 (Phase 2)
  - 심사 코멘트 편집/수정 (1회 제출만)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 영상 플레이어 + 심사 폼의 복잡한 레이아웃, UX가 핵심
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 심사 화면 레이아웃 (영상+폼 split view)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 11)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 5, 6

  **References**:

  **External References**:
  - FilmFreeway 심사 인터페이스 참고 — 영상 + 채점 폼 병렬 레이아웃
  - Mux Player React: https://docs.mux.com/guides/mux-player-react — 플레이어 커스터마이징

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 심사 화면 렌더링 + 점수 입력
    Tool: Playwright (playwright skill)
    Preconditions: Judge 로그인, 배정된 출품작 존재
    Steps:
      1. Navigate to: http://localhost:3000/judging/{contestId}/{submissionId}
      2. Wait for: mux-player element visible (timeout: 10s)
      3. Assert: 비디오 플레이어 렌더링 (mux-player 또는 video element)
      4. Assert: 심사 폼 렌더링 (criteria fields visible)
      5. Fill: 각 기준별 점수 입력 (e.g., 창의성: 8, 기술력: 7, 스토리텔링: 9, 완성도: 8)
      6. Assert: 총점 자동 계산되어 표시 (가중 평균)
      7. Fill: textarea[name="feedback"] → "전체적으로 완성도 높은 작품입니다"
      8. Click: submit score button
      9. Wait for: success message (timeout: 5s)
      10. Assert: 출품작 목록에서 "심사 완료" 표시
      11. Screenshot: .sisyphus/evidence/task-9-judging-complete.png
    Expected Result: 점수 입력 및 제출 성공
    Evidence: .sisyphus/evidence/task-9-judging-complete.png

  Scenario: 비배정 출품작 접근 차단
    Tool: Bash (curl)
    Preconditions: Judge_A는 Contest_X에만 배정, Contest_Y에는 미배정
    Steps:
      1. GET /judging/contest_y/submissions with Judge_A's token
      2. Assert: HTTP 403 또는 빈 목록
    Expected Result: 비배정 공모전 심사 불가
    Evidence: Response body captured

  Scenario: 심사 진행률 표시
    Tool: Playwright (playwright skill)
    Preconditions: 5개 출품작 중 2개 심사 완료
    Steps:
      1. Navigate to: /judging/{contestId}
      2. Assert: 진행률 "2/5 완료" 또는 프로그레스 바 40% 표시
      3. Screenshot: .sisyphus/evidence/task-9-progress.png
    Expected Result: 심사 진행률 정확히 표시
    Evidence: .sisyphus/evidence/task-9-progress.png
  ```

  **Commit**: YES
  - Message: `feat(judging): add judging interface with video player, scoring form, and progress tracking`
  - Files: `app/judging/*, components/judging/*, lib/actions/score.ts`
  - Pre-commit: `bun run build`

---

- [ ] 10. Judge Invitation + Email Notifications (Resend)

  **What to do**:
  - 심사위원 초대 시스템:
    - 호스트가 이메일로 심사위원 초대 (contest_judges 테이블에 레코드 생성)
    - 초대 이메일 발송 (Resend)
    - 초대 링크 클릭 → 회원가입(미가입 시) 또는 로그인 → judge 역할 자동 추가 → contest_judges.status = 'accepted'
    - `app/invite/[token]/page.tsx`: 초대 수락 페이지
  - Resend 이메일 템플릿:
    - 심사위원 초대 이메일 (공모전명, 주최자, 수락 링크)
    - 접수 확인 이메일 (참가자에게)
    - 결과 발표 이메일 (참가자에게)
  - 호스트 대시보드에 심사위원 관리:
    - 초대한 심사위원 목록 (상태: 초대됨/수락/거절)
    - 추가 초대 버튼

  **[v3] 추가 작업:**
  - **내부/외부 심사위원 구분**: `judge_type` 필드 — `internal`(주최측 팀원, `contest_team_members` 테이블 연동) / `external`(외부 초대)
  - **심사위원 유형 3택 UI**: 공모전 설정에서 심사위원 유형 선택 — 내부만 / 외부만 / 혼합
  - **토큰 기반 초대**: `invite_token`(UUID) 생성 → 이메일 링크에 토큰 포함 → 토큰으로 수락 처리
  - **초대 재발송**: `resent_count` 카운터 + "재발송" 버튼 (동일 이메일에 새 토큰 발급)

  **Must NOT do**:
  - 푸시 알림, SMS, 카카오 알림
  - 이메일 템플릿 에디터 (하드코딩된 템플릿)
  - 심사위원 프로필 공개 (Phase 2)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 초대 플로우 (이메일 → 토큰 → 수락 → 역할 전환)가 여러 시스템 연동
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 초대 수락 페이지 UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 9, 11)
  - **Blocks**: Task 11 (심사위원 배정 완료해야 결과 산출)
  - **Blocked By**: Tasks 3, 6

  **References**:

  **External References**:
  - Resend docs: https://resend.com/docs/introduction — 이메일 전송 API
  - Resend + Next.js: https://resend.com/docs/send-with-nextjs — Next.js 통합
  - react-email: https://react.email/ — 이메일 템플릿 (선택사항)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 심사위원 초대 이메일 발송
    Tool: Bash (curl)
    Preconditions: Host 로그인, 공모전 존재, Resend API key 설정
    Steps:
      1. POST /api/contests/{id}/judges/invite
         -d '{"email": "judge@example.com"}'
         -H "Authorization: Bearer $HOST_TOKEN"
      2. Assert: HTTP 200
      3. Assert: contest_judges 테이블에 status='invited' 레코드 생성
      4. Assert: Resend API 호출됨 (로그 확인)
    Expected Result: 초대 레코드 생성 + 이메일 발송
    Evidence: Response body + server logs

  Scenario: 초대 링크 수락 플로우
    Tool: Playwright (playwright skill)
    Preconditions: 초대 이메일의 토큰 존재
    Steps:
      1. Navigate to: /invite/{token}
      2. Assert: 공모전명, 주최자 정보 표시
      3. Click: "심사위원 수락" 버튼
      4. Wait for: redirect to /judging (timeout: 10s)
      5. Assert: 배정된 공모전 목록에 해당 공모전 표시
      6. Screenshot: .sisyphus/evidence/task-10-invite-accept.png
    Expected Result: 초대 수락 후 심사 페이지로 이동
    Evidence: .sisyphus/evidence/task-10-invite-accept.png
  ```

  **Commit**: YES
  - Message: `feat(invite): add judge invitation system with email notifications via Resend`
  - Files: `app/invite/*, app/api/contests/[id]/judges/*, lib/email/*, lib/actions/invite.ts`
  - Pre-commit: `bun run build`

---

- [ ] 11. Score Aggregation + Result Announcement

  **What to do**:
  - 점수 집계 로직:
    - `lib/scoring.ts`: 순수 함수로 점수 계산 로직 분리
    - 계산 방식: 각 심사위원의 가중 평균 → 전체 심사위원 단순 평균 = 최종 점수
    - 동점 처리: 동점 시 제출 순서 (먼저 제출한 작품 우선)
    - Edge cases: 심사위원 1명만 평가한 경우, 모든 심사위원 미완료 시
  - 결과 발표 기능:
    - 호스트가 "결과 발표" 버튼 클릭 → 자동 순위 계산 → contest_results 테이블 저장
    - 수상 타이틀 지정 (대상, 최우수상, 우수상 등)
    - 결과 발표 시 참가자에게 이메일 발송 (Resend)
  - 결과 페이지:
    - `app/contests/[id]/results/page.tsx`: 공모전 결과 (공개)
    - **[v2.2] 수상자만 표시**: 결과 페이지에는 수상자(대상/최우수상/우수상/장려상)만 노출. 비수상 참가자 미노출.
    - **[v2.2] 수상 타이틀 필수 표시**: 각 수상자에 award_title 표시 (예: 🏆 대상, 🥇 최우수상, 🥈 우수상, 🎖 장려상)
    - **일반 사용자**: 수상자 목록 (순위, 작품명, 작가, **수상 타이틀**) — 점수 비공개
    - **심사위원/주최자**: 위 + 평균 점수 + 상세 점수 표시
    - 수상작 영상 재생 (public으로 전환 가능)
  - 참가자 측 결과 확인:
    - **[v2.2] 비수상 참가자**: 결과 페이지에 미노출 → **마이페이지에서 "참가 인증서"로만 확인**
    - **[v2.2] 수상자**: 마이페이지에서 수상 타이틀 + 점수 확인 가능
    - (Phase 2: 상세 리포트 유료 구매)

  **Must NOT do**:
  - 유료 심사 결과 리포트 (Phase 2)
  - 다단계 심사 (예선/본선) — 단일 라운드만
  - 점수 이의 신청 기능

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 점수 계산 로직의 정확성이 중요, edge case 처리 필요, 테스트 필수
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 결과 페이지 UI

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 4 — 심사+초대 완료 후)
  - **Parallel Group**: Wave 4 (with Tasks 9, 10 — but depends on their output)
  - **Blocks**: Tasks 12, 13
  - **Blocked By**: Tasks 7, 9, 10

  **References**:

  **Acceptance Criteria**:

  **Tests (핵심 기능 — 반드시 작성):**
  ```
  - [ ] Test: lib/scoring.test.ts
  - [ ] 3명 심사위원의 가중 평균 정확히 계산되는지
  - [ ] 동점 시 제출 순서로 순위 결정
  - [ ] 심사위원 1명만 평가한 경우 정상 동작
  - [ ] 모든 심사위원 미완료 시 결과 발표 불가
  - [ ] bun test lib/scoring.test.ts → PASS
  ```

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 결과 발표 전체 플로우
    Tool: Playwright (playwright skill)
    Preconditions: 모든 심사위원 점수 입력 완료, Host 로그인
    Steps:
      1. Navigate to: /dashboard/contests/{id}
      2. Assert: "결과 발표" 버튼 활성화
      3. Click: "결과 발표" 버튼
      4. Wait for: confirm dialog
      5. Click: confirm
      6. Wait for: success message (timeout: 10s)
      7. Assert: contest status → "results"
      8. Navigate to: /contests/{id}/results
      9. Assert: 수상작 목록 순위별 표시
      10. Assert: 1위 점수 > 2위 점수 (정상 순위)
      11. Screenshot: .sisyphus/evidence/task-11-results.png
    Expected Result: 결과 정상 발표 + 순위 정확
    Evidence: .sisyphus/evidence/task-11-results.png

  Scenario: 점수 계산 정확성 (API)
    Tool: Bash (curl)
    Preconditions: Contest with 3 judges who scored submission_x
    Steps:
      1. GET /api/contests/{id}/results with host token
      2. Assert: submission_x의 average_score가 3명 점수의 정확한 가중 평균
      3. Assert: 순위가 점수 내림차순
    Expected Result: 점수 계산 정확
    Evidence: Response body captured
  ```

  **Commit**: YES
  - Message: `feat(results): add score aggregation, ranking, and result announcement`
  - Files: `lib/scoring.ts, lib/scoring.test.ts, app/contests/[id]/results/*, lib/actions/result.ts`
  - Pre-commit: `bun test && bun run build`

---

---

- [ ] 12. Video Gallery (공모전 연동 영상 갤러리)

  **What to do**:
  - 갤러리 DB 확장:
    - submissions 테이블에 `gallery_visible BOOLEAN DEFAULT FALSE` 컬럼 추가
    - 참가자가 접수 시 "갤러리 공개 동의" 체크 → `gallery_visible = true`
    - 수상작은 자동으로 `gallery_visible = true` (결과 발표 시)
  - 갤러리 페이지:
    - `app/gallery/page.tsx`: AI 영상 갤러리 메인
    - AI카이브 스타일 카드형 그리드 (영상 썸네일 + 제목 + 크리에이터 + AI도구 + 공모전명)
    - 필터: 공모전별, AI 도구별, 카테고리별, 수상작만
    - 정렬: 최신순, 인기순 (조회수 기반 — 간단한 카운터)
    - 서버 사이드 페이지네이션 (무한 스크롤 또는 페이지)
  - 갤러리 상세 페이지:
    - `app/gallery/[id]/page.tsx`: 영상 재생 (Mux Player — public playback)
    - 작품 정보: 제목, 설명, AI 도구, AI 기여도, 크리에이터 프로필 링크
    - 공모전 정보: 어떤 공모전 출품작인지, 수상 여부
    - 조회수 카운터 (Supabase RPC increment)
  - 갤러리 공개 정책:
    - 접수 시 참가자 동의 필수 (체크박스)
    - 수상작: 결과 발표 시 자동 공개
    - 비수상작: 참가자 동의 시에만 공개
    - 공모전 진행 중에는 비공개 (심사 완료 후 공개)
  - 크리에이터 프로필 연결:
    - `app/creators/[id]/page.tsx`: 크리에이터 프로필 (기본)
    - 갤러리에 공개된 본인 작품 목록
    - 참가/수상 이력

  **[v3] 추가 작업:**
  - **좋아요 동작**: 갤러리 카드/상세에 좋아요 토글 버튼 (하트 아이콘) + `like_count` 실시간 표시. Task 14(Likes System) API 연동
  - **의뢰 CTA Feature Flag**: `app/admin/settings` (또는 env 기반) — 관리자 ON/OFF. ON일 때 갤러리/공모전 상세에 "공모전 대행 의뢰" CTA 표시. 자격 조건: 1회 이상 참가 + 결과발표 완료된 공모전 있는 사용자만

  **Must NOT do**:
  - 자유 업로드 (공모전 출품작만)
  - ~~댓글/좋아요/공유 기능 (Phase 2)~~ → [v3] 좋아요는 Phase 1 승격, 댓글/공유는 Phase 2
  - 플레이리스트/컬렉션 (Phase 2)
  - 영상 다운로드

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 갤러리 UI가 플랫폼의 "발견" 경험 핵심. AI카이브 수준의 비주얼 필요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 카드형 그리드, 영상 썸네일, 필터 UI

  **Parallelization**:
  - **Can Run In Parallel**: NO (결과 발표 이후 갤러리 공개 로직 의존)
  - **Parallel Group**: Wave 5 (with Task 13)
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 7 (Submission), 11 (Results)

  **References**:

  **External References**:
  - AI카이브 갤러리: https://aikive.com/ — AI Videos 섹션 카드형 그리드 참고
  - Mux Player (public playback): https://docs.mux.com/guides/mux-player-react — 공개 재생

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 갤러리 메인 페이지 렌더링
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, 갤러리 공개 출품작 3개+ 존재
    Steps:
      1. Navigate to: http://localhost:3000/gallery
      2. Wait for: gallery grid visible (timeout: 5s)
      3. Assert: 카드형 그리드 레이아웃
      4. Assert: 각 카드에 썸네일, 제목, 크리에이터명, AI도구 배지 표시
      5. Click: 필터 "Runway"
      6. Assert: Runway로 제작된 영상만 표시
      7. Screenshot: .sisyphus/evidence/task-12-gallery-main.png
    Expected Result: 갤러리 정상 렌더링 + 필터 동작
    Evidence: .sisyphus/evidence/task-12-gallery-main.png

  Scenario: 갤러리 상세 페이지 + 영상 재생
    Tool: Playwright (playwright skill)
    Preconditions: 갤러리 공개 출품작 존재
    Steps:
      1. Navigate to: /gallery/{id}
      2. Assert: Mux Player 렌더링 (public playback)
      3. Assert: 작품 정보 (제목, 설명, AI 도구, AI 기여도) 표시
      4. Assert: 공모전 정보 + 수상 여부 표시
      5. Assert: 크리에이터 프로필 링크 존재
      6. Screenshot: .sisyphus/evidence/task-12-gallery-detail.png
    Expected Result: 갤러리 상세 + 영상 재생 정상
    Evidence: .sisyphus/evidence/task-12-gallery-detail.png

  Scenario: 비동의 출품작 갤러리 비공개
    Tool: Bash (curl)
    Preconditions: gallery_visible=false 출품작 존재
    Steps:
      1. GET /api/gallery (public)
      2. Assert: gallery_visible=false인 출품작은 목록에 미포함
      3. GET /gallery/{hidden_id} (direct URL)
      4. Assert: 404 또는 "비공개 작품" 메시지
    Expected Result: 비동의 작품은 갤러리에서 완전 비공개
    Evidence: Response body captured

  Scenario: 수상작 자동 갤러리 공개
    Tool: Bash (curl)
    Preconditions: 결과 발표 완료된 공모전 존재
    Steps:
      1. 결과 발표 전: GET /api/gallery → 수상작 미포함
      2. 결과 발표 실행 (host가 결과 발표)
      3. 결과 발표 후: GET /api/gallery → 수상작 자동 포함
    Expected Result: 결과 발표 시 수상작 자동 갤러리 공개
    Evidence: Response body captured
  ```

  **Commit**: YES
  - Message: `feat(gallery): add contest-linked video gallery with filters and creator profiles`
  - Files: `app/gallery/*, app/creators/*, lib/actions/gallery.ts, supabase/migrations/*`
  - Pre-commit: `bun run build`

---

- [ ] 13. Integration Test + Polish + Deploy

  **What to do**:
  - E2E 통합 테스트 (Playwright):
    - 전체 플로우: 회원가입 → 공모전 탐색 → 접수 → 심사 → 결과 확인
    - 역할 전환: 호스트 공모전 생성 → 심사위원 초대 → 심사 → 결과 발표
    - RLS 보안: 교차 역할 데이터 접근 차단 확인
  - 전체 빌드 + 린트:
    - `bun run build` → 에러 0
    - `bun run lint` → 에러 0
    - `bun test` → 모든 테스트 통과
  - 배포:
    - Vercel 프로젝트 연결
    - 환경변수 설정 (Vercel Dashboard)
    - Production 빌드 배포
    - 배포 후 smoke test
  - 최종 폴리시:
    - 로딩 상태 (Skeleton) 확인
    - 에러 페이지 (404, 500) 커스텀
    - Toast 알림 일관성
    - 접근 불가 페이지 → 적절한 리다이렉트

  **Must NOT do**:
  - CI/CD 파이프라인 구축 (Vercel 자동 배포 활용)
  - 성능 최적화 (Phase 2)
  - 로드 테스트

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 전체 시스템 통합 검증 + 배포로 심층적 확인 필요
  - **Skills**: [`playwright`, `frontend-ui-ux`]
    - `playwright`: E2E 통합 테스트 실행
    - `frontend-ui-ux`: UI 폴리시

  **Parallelization**:
  - **Can Run In Parallel**: NO (모든 Task 완료 후)
  - **Parallel Group**: Wave 5 (Sequential — final, after Task 12)
  - **Blocks**: None (final task)
  - **Blocked By**: All previous tasks (1-12)

  **References**:

  **External References**:
  - Vercel Deployment: https://vercel.com/docs/deployments/overview
  - Next.js Deployment: https://nextjs.org/docs/app/building-your-application/deploying
  - Playwright Testing: https://playwright.dev/docs/intro

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: E2E 전체 플로우 (참가자 관점)
    Tool: Playwright (playwright skill)
    Preconditions: 배포된 환경 또는 로컬 dev server
    Steps:
      1. Navigate to: / (랜딩 페이지)
      2. Click: "회원가입" → 참가자로 가입
      3. Navigate to: /contests → 공모전 목록 확인
      4. Click: 공모전 카드 → 상세 페이지
      5. Click: "접수하기" → 출품 폼
      6. Fill: 제목, 설명, AI 도구 선택
      7. Upload: 테스트 영상 (Mux)
      8. Submit → 접수 확인
      9. Navigate to: /my/submissions → 출품작 상태 확인
      10. Screenshot: .sisyphus/evidence/task-13-e2e-participant.png
    Expected Result: 참가자 전체 플로우 성공
    Evidence: .sisyphus/evidence/task-13-e2e-participant.png

  Scenario: E2E 전체 플로우 (주최자+심사위원 관점)
    Tool: Playwright (playwright skill)
    Preconditions: 참가자 접수 완료 상태
    Steps:
      1. Login as Host
      2. Navigate to: /dashboard → 공모전 관리
      3. Click: 공모전 상세 → 접수 현황 확인
      4. Invite judge via email
      5. Login as Admin → 공모전 승인
      6. Login as Judge (초대 수락)
      7. Navigate to: /judging → 배정된 출품작
      8. 영상 시청 + 점수 입력 + 제출
      9. Login as Host → "결과 발표" 클릭
      10. Navigate to: /contests/{id}/results → 수상작 확인
      11. Screenshot: .sisyphus/evidence/task-13-e2e-host-judge.png
    Expected Result: 주최자→심사위원→결과 발표 플로우 성공
    Evidence: .sisyphus/evidence/task-13-e2e-host-judge.png

  Scenario: Production 빌드 성공
    Tool: Bash
    Steps:
      1. bun run build
      2. Assert: exit code 0, no errors
      3. bun run lint
      4. Assert: exit code 0, no errors
      5. bun test
      6. Assert: all tests pass
    Expected Result: 빌드, 린트, 테스트 모두 성공
    Evidence: Build + test output

  Scenario: Vercel 배포 확인
    Tool: Playwright (playwright skill)
    Preconditions: Vercel 배포 완료
    Steps:
      1. Navigate to: https://{deployed-url}
      2. Assert: 랜딩 페이지 로드 (200 OK)
      3. Navigate to: /contests
      4. Assert: 공모전 목록 로드
      5. Screenshot: .sisyphus/evidence/task-13-production.png
    Expected Result: Production 배포 정상 동작
    Evidence: .sisyphus/evidence/task-13-production.png
  ```

  **Commit**: YES
  - Message: `chore(deploy): add E2E tests, polish UI, and deploy to Vercel`
  - Files: `tests/e2e/*, app/not-found.tsx, app/error.tsx, vercel.json`
  - Pre-commit: `bun test && bun run build`

---

## [v3] 신규 Tasks (14~20)

> 48건 변경사항에서 발생한 7개 신규 Task. Metis 2차 분석 기반.

---

- [ ] 14. Likes System (좋아요)

  **What to do**:
  - DB: `likes` 테이블 (Task 1에서 생성). `submissions.like_count` denormalized counter + Postgres trigger `AFTER INSERT/DELETE ON likes`
  - API: `app/api/submissions/[id]/like/route.ts` — POST 토글 (INSERT or DELETE)
  - Components: `components/ui/like-button.tsx` — 하트 아이콘 토글 + 숫자
  - Logic:
    - 1인1표 (UNIQUE constraint: user_id + submission_id)
    - 세션 기반 중복 제거: 같은 사용자 3초 내 재클릭 무시 (클라이언트 debounce)
    - Rate limiting: 1분에 최대 30회 좋아요 (서버 사이드)
  - 심사 반영 (선택):
    - Contest에 `like_criteria_enabled`, `like_criteria_weight`, `like_criteria_period_start/end` 설정
    - 점수 집계 시 like_count를 정규화하여 가중치 적용 (Task 11 수정 필요)
  - Admin: 의심 플래그 뷰 — 같은 IP에서 다수 계정이 같은 작품에 좋아요 → 플래그 (자동차단 X, 수동 확인만)
  - RLS: 인증 사용자만 생성/삭제, 모두 조회

  **Must NOT do**: 좋아요 자동 차단, IP 분석 자동화, 좋아요 알림

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 3 (with 6,7,8,18), Blocks 12,19

  **Acceptance Criteria**:
  - POST /api/submissions/[id]/like → 토글 동작 (INSERT/DELETE)
  - UNIQUE 제약: 동일 사용자 2회 POST → 1회 INSERT + 1회 DELETE
  - like_count trigger: INSERT 후 +1, DELETE 후 -1
  - Rate limit: 31번째 요청 → 429
  - RLS: 비인증 → 403

  **QA Scenarios**:
  ```
  Scenario: 좋아요 토글
    Tool: Bash (curl)
    Steps:
      1. POST /api/submissions/{id}/like (auth token) → 201
      2. GET /api/submissions/{id} → like_count = 1
      3. POST /api/submissions/{id}/like (same user) → 200 (삭제)
      4. GET /api/submissions/{id} → like_count = 0
    Expected: 토글 동작, count 정확
    Evidence: .sisyphus/evidence/task-14-like-toggle.txt
  ```

  **Commit**: YES
  - Message: `feat(likes): add toggle like system with rate limiting and abuse flags`

---

- [ ] 15. Unified Search (통합검색)

  **What to do**:
  - Pages: `app/search/page.tsx` — 4개 탭 (전체/공모전/영상/크리에이터)
  - API: `app/api/search/route.ts` — Supabase text search (pg_trgm or to_tsvector)
  - 전체 탭: 각 카테고리 섹션별 3개 미리보기 + "더보기" 링크
  - 검색 대상: contest.title/description, submission.title, profiles.nickname/name
  - 서버 사이드 검색 (쿼리 파라미터 ?q=&tab=)
  - GNB에 검색 아이콘/바 추가 (Task 4에서 자리 확보)

  **Must NOT do**: 검색 자동완성, 풀텍스트 인덱스 최적화, 검색 분석

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 4 (with 9,10,11,16,17), Blocks 13

  **Acceptance Criteria**:
  - GET /api/search?q=AI&tab=all → 섹션별 결과
  - GET /api/search?q=AI&tab=contests → 공모전만
  - 빈 결과 → "검색 결과가 없습니다" UI

  **QA Scenarios**:
  ```
  Scenario: 통합검색 4탭
    Tool: Playwright
    Steps:
      1. /search?q=AI → 전체 탭 → 3개 섹션 미리보기
      2. "공모전" 탭 클릭 → 공모전만 표시
      3. 빈 검색어 → 안내 메시지
    Expected: 탭별 필터링 정상
    Evidence: .sisyphus/evidence/task-15-search.png
  ```

  **Commit**: YES
  - Message: `feat(search): add unified search with tabs for contests, videos, and creators`

---

- [ ] 16. Customer Service (고객센터)

  **What to do**:
  - DB: `inquiries`, `faqs` 테이블 (Task 1에서 생성)
  - Pages:
    - `app/support/page.tsx`: FAQ (역할별 카테고리 아코디언)
    - `app/support/inquiry/page.tsx`: 1:1 문의 폼 (제목/내용/타입)
    - `app/support/agency/page.tsx`: 대행 의뢰 전용 폼
  - Admin:
    - `app/admin/inquiries/page.tsx`: 문의 목록 + 답변
    - `app/admin/agency-requests/page.tsx`: 대행 의뢰 목록 (수락/거절)
  - API:
    - POST /api/support/inquiry → INSERT inquiries
    - PATCH /api/admin/inquiries/[id] → 답변 + 상태 변경
  - 플로팅 버튼 💬문의하기 → /support/inquiry 이동 (Task 4 layout에서 구현)
  - RLS: 본인 문의만 조회, 관리자 전체

  **Must NOT do**: 실시간 채팅, 자동 답변, 이메일 알림 (문의 관련)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 4 (with 9,10,11,15,17), Blocks 13

  **Acceptance Criteria**:
  - FAQ: 4카테고리 아코디언 동작
  - 문의 제출: POST → 201 + 목록에 반영
  - 관리자 답변: PATCH → 상태 변경
  - RLS: 타인 문의 조회 → 빈 결과

  **QA Scenarios**:
  ```
  Scenario: 문의 제출 + 관리자 답변
    Tool: Bash (curl)
    Steps:
      1. POST /api/support/inquiry (참가자 token) → 201
      2. GET /api/admin/inquiries (admin token) → 문의 포함
      3. PATCH /api/admin/inquiries/{id} (admin) → reply + status=resolved
      4. GET /api/support/inquiry (참가자) → 답변 확인
    Expected: 문의→답변 플로우 완성
    Evidence: .sisyphus/evidence/task-16-inquiry.txt
  ```

  **Commit**: YES
  - Message: `feat(support): add customer service with FAQ, inquiries, and agency requests`

---

- [ ] 17. News/Trends Content System (소식/트렌드)

  **What to do**:
  - DB: `articles` 테이블 (Task 1에서 생성)
  - Pages:
    - `app/news/page.tsx`: 목록 (타입별 필터 + 최신순)
    - `app/news/[slug]/page.tsx`: 상세 (마크다운 렌더링)
  - Admin: `app/admin/articles/page.tsx`: CRUD (생성/수정/삭제/공개 전환)
  - Access Control: **회원만 상세 열람** (비회원: 목록만, 클릭 시 로그인 유도)
  - RLS: published + auth.uid() IS NOT NULL → SELECT. 관리자만 CRUD.
  - GNB에 "소식/트렌드" 메뉴 (Task 4에서 자리 확보)
  - Content types: AI 도구 트렌드 리포트, 공지사항, 보도자료

  **Must NOT do**: 에디터 (관리자가 마크다운으로 작성), 댓글, 공유

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 4 (with 9,10,11,15,16), Blocks 13

  **Acceptance Criteria**:
  - 관리자 CRUD: 아티클 생성 → 목록 반영
  - 회원 전용: 비인증 → 상세 403
  - 타입 필터: trend_report/announcement/press_release

  **QA Scenarios**:
  ```
  Scenario: 회원 전용 아티클
    Tool: Bash (curl)
    Steps:
      1. GET /api/articles (no auth) → 목록만 (200)
      2. GET /api/articles/{slug} (no auth) → 403
      3. GET /api/articles/{slug} (auth) → 200 + 컨텐츠
    Expected: 회원 전용 접근 제한
    Evidence: .sisyphus/evidence/task-17-articles.txt
  ```

  **Commit**: YES
  - Message: `feat(news): add news/trends content system with member-only access`

---

- [ ] 18. Device/Session Management + IP Logging (기기관리)

  **What to do**:
  - DB: `user_devices`, `ip_logs` 테이블 (Task 1에서 생성)
  - Middleware: 로그인 시 기기 등록 (device fingerprint via fingerprintjs)
  - 동시접속 제한:
    - 로그인 시 현재 활성 기기 확인
    - 다른 기기 활성 중 → **팝업**: "다른 기기에서 로그인 중입니다. 강제 로그아웃하시겠습니까?"
    - 확인 → 기존 기기 세션 무효화 (Supabase Realtime으로 force-logout 신호)
  - 최대 5대 등록: 6번째 기기 → "기기 등록 한도 초과" 에러 + 기존 기기 삭제 안내
  - Pages: `app/my/devices/page.tsx` — 내 기기 목록 + "이 기기 삭제" + 마지막 접속 시간
  - API:
    - GET /api/auth/devices → 내 기기 목록
    - DELETE /api/auth/devices/[id] → 기기 삭제
    - POST /api/auth/force-logout → 다른 기기 강제 로그아웃
  - IP Logging: 로그인/좋아요/접수 시 자동 IP 기록 (서버 사이드)
  - Admin: 회원 상세에서 IP 기록 테이블 + 동일 IP 다수 계정 하이라이트
  - RLS: 본인 기기만 조회/삭제, IP 로그는 관리자만

  **Must NOT do**: 기기 신뢰 마크, 새 기기 알림, IP 차단, device fingerprinting 고급 (기본 브라우저 정보만)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**: Wave 3 (with 6,7,8,14), Blocks 20

  **Acceptance Criteria**:
  - 로그인 시 기기 자동 등록
  - 2번째 기기 로그인 → 강제 로그아웃 팝업
  - 6번째 기기 → 등록 거부
  - IP 기록: 로그인 후 ip_logs에 행 추가
  - 관리자: 동일 IP 다수 계정 하이라이트

  **QA Scenarios**:
  ```
  Scenario: 기기 등록 + 동시접속 제한
    Tool: Bash (curl)
    Steps:
      1. Login (device A) → 200 + 기기 등록
      2. GET /api/auth/devices → 1개
      3. Login (device B, same user) → 팝업 신호 (force_logout_required=true)
      4. POST /api/auth/force-logout → device A 세션 무효화
      5. GET /api/auth/devices → 2개
    Expected: 동시접속 제한, 강제 로그아웃
    Evidence: .sisyphus/evidence/task-18-devices.txt
  ```

  **Commit**: YES
  - Message: `feat(devices): add device management with session control and IP logging`

---

- [ ] 19. Analytics Monetization + Pricing Page (분석 과금)

  **What to do**:
  - Pages: `app/pricing/page.tsx` — 요금제 비교 테이블 + 기능 설명 + "결제" 비활성 버튼
  - Components: `components/ui/paywall-overlay.tsx` — 🔒 잠금 + "출시 시 알림 받기"
  - 역할별 분석 뷰:
    - **참가자**: 작품 성과 (조회수/좋아요 — 무료) + 카테고리 경쟁률 (유료 🔒)
    - **주최자**: 접수 현황/기본 통계 (무료) + 상세 분석/리포트 (유료 🔒)
    - **심사위원**: 진행률 (무료) + 채점 분포 (TBD 🔒)
    - **관리자**: 전부 무료
  - 각 유료 영역에 PaywallOverlay 적용
  - "출시 시 알림 받기" 클릭 → 이메일 수집 (간단한 API + DB 또는 placeholder)
  - 가격표 페이지: 3단 비교 (무료/프로/프리미엄) — 가격은 placeholder

  **Must NOT do**: 실제 결제 연동, Stripe/Toss, 과금 로직

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 5 (with 12,20), Blocks 13

  **Acceptance Criteria**:
  - 참가자: 작품 성과 무료 표시, 경쟁률 🔒
  - 관리자: 전체 분석 잠금 없음
  - /pricing: 3단 비교 테이블 렌더링
  - PaywallOverlay: 🔒 아이콘 + 버튼 표시

  **QA Scenarios**:
  ```
  Scenario: 역할별 분석 과금 경계
    Tool: Playwright
    Steps:
      1. 참가자 로그인 → 분석 → 작품성과(무료) + 경쟁률(🔒)
      2. 관리자 로그인 → 분석 → 전체 무료 (잠금 없음)
      3. /pricing → 3단 비교 + 비활성 결제 버튼
    Expected: 무료/유료 경계 정확
    Evidence: .sisyphus/evidence/task-19-paywall.png
  ```

  **Commit**: YES
  - Message: `feat(analytics): add role-based analytics with paywall overlay and pricing page`

---

- [ ] 20. Regional Analytics (지역별 분석)

  **What to do**:
  - Admin 대시보드 위젯: 지역별 접속/참가자/주최자 분포
  - GeoIP lookup: `ip_logs` 테이블의 IP → 지역 매핑 (MaxMind GeoLite2 또는 IP-API)
  - Visualization: Bar chart 또는 한국 지도 시각화 (recharts)
  - 17개 시도별 데이터
  - API: `app/api/admin/analytics/regional/route.ts` — 지역별 집계

  **Must NOT do**: 실시간 지도, 도시 단위 분석, GeoIP 정확도 최적화

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []

  **Parallelization**: Wave 5 (with 12,19), Blocks 13

  **Acceptance Criteria**:
  - GET /api/admin/analytics/regional → 17개 시도별 데이터
  - Admin 대시보드: 지역 차트 렌더링
  - 비관리자 → 403

  **QA Scenarios**:
  ```
  Scenario: 지역별 분석
    Tool: Bash (curl)
    Steps:
      1. GET /api/admin/analytics/regional (admin) → 200 + 17개 시도
      2. GET /api/admin/analytics/regional (non-admin) → 403
    Expected: 관리자만 접근, 17개 시도 데이터
    Evidence: .sisyphus/evidence/task-20-regional.txt
  ```

  **Commit**: YES
  - Message: `feat(analytics): add regional analytics with geo-IP distribution`

---

## Commit Strategy

| After Task | Message | Key Files | Verification |
|------------|---------|-----------|--------------|
| 1 | `feat(db): initialize project with Supabase schema, RLS, and seed data` | migrations, package.json | `bun run build` |
| 2 | `feat(theme): add 3-theme system (light/dark/neon cyberpunk)` | globals.css, theme-switcher | `bun run build` |
| 3 | `feat(auth): add Supabase auth with email/Google login and role-based middleware` | auth, middleware | `bun run build` |
| 4 | `feat(ui): add layout, navigation, landing page, contest listing, and public pages with SEO` | layout, pages, components | `bun run build` |
| 5 | `feat(video): integrate Mux for video upload, streaming, and signed playback` | api/mux, video components | `bun run build` |
| 6 | `feat(contest): add contest CRUD, state machine, and host dashboard` | dashboard, actions | `bun run build` |
| 7 | `feat(submission): add submission form with AI metadata, status tracking, and my submissions` | submit, my/submissions | `bun run build` |
| 8 | `feat(admin): add admin panel with trust governance and contest approval` | admin | `bun run build` |
| 9 | `feat(judging): add judging interface with video player, scoring form, and progress` | judging | `bun run build` |
| 10 | `feat(invite): add judge invitation system with email notifications via Resend` | invite, email | `bun run build` |
| 11 | `feat(results): add score aggregation, ranking, and result announcement` | scoring, results | `bun test && bun run build` |
| 12 | `feat(gallery): add contest-linked video gallery with filters and creator profiles` | gallery, creators | `bun run build` |
| 13 | `chore(deploy): add E2E tests, polish UI, and deploy to Vercel` | tests, deploy | `bun test && bun run build` |
| 14 | `feat(likes): add toggle like system with rate limiting and denormalized counter` | likes API, components | `bun run build` |
| 15 | `feat(search): add unified search with 4-tab results (contests/videos/creators/all)` | search page, API | `bun run build` |
| 16 | `feat(support): add customer service center with FAQ, inquiry, and agency request` | support pages, inquiries | `bun run build` |
| 17 | `feat(news): add news/trends content system with admin CRUD` | news pages, articles | `bun run build` |
| 18 | `feat(devices): add device/session management with max 5 devices and IP logging` | devices, ip_logs | `bun run build` |
| 19 | `feat(analytics): add role-based analytics dashboards and pricing page` | analytics, pricing | `bun run build` |
| 20 | `feat(regional): add regional analytics with GeoIP and 17 sido aggregation` | regional analytics | `bun run build` |

---

## Success Criteria

### Verification Commands
```bash
bun run build          # Expected: exit 0, no errors
bun run lint           # Expected: exit 0, no warnings
bun test               # Expected: all tests pass (scoring logic, RLS)
```

### Final Checklist

**Core Flow:**
- [ ] 참가자: 회원가입 → 공모전 탐색 → 영상 접수(AI 메타데이터 포함) → 상태 추적 → 결과 확인 가능
- [ ] 주최자: 공모전 생성 → 승인 대기 → 접수 관리 → 심사위원 초대 → 심사 관리 → 결과 발표 가능
- [ ] 심사위원: 초대 수락 → 영상 시청 → 점수+피드백 입력 → 진행률 확인 가능
- [ ] 관리자: 공모전 승인/반려 (신뢰 거버넌스) → 회원 관리 → 대행 의뢰 확인 가능
- [ ] RLS: 역할 간 데이터 완벽 격리 (참가자는 타인 출품작 미조회)
- [ ] Mux: 영상 업로드/스트리밍 정상 (signed playback for 심사, public for 갤러리)

**Theme & UI:**
- [ ] **3테마 시스템**: 라이트/다크/네온 사이버펑크 전환 정상 + 저장 유지
- [ ] **GNB**: 검색/소식/고객센터 링크 포함
- [ ] **플로팅 버튼**: ↑맨위로 + 💬문의하기 전역 표시

**v3 Feature Set:**
- [ ] **[v3] 좋아요**: 토글 1인1표, UNIQUE 제약, like_count 카운터 동기화, 심사 반영 옵션
- [ ] **[v3] 통합검색**: 4탭(공모전/영상/크리에이터/전체) Supabase text search
- [ ] **[v3] 고객센터**: FAQ(역할별) + 1:1 문의 + 대행 의뢰 폼
- [ ] **[v3] 소식/트렌드**: 회원 전용 콘텐츠 + 관리자 CRUD
- [ ] **[v3] 기기관리**: 최대 5대, 동시접속 불가, 강제 로그아웃
- [ ] **[v3] 닉네임**: UNIQUE, 선택, 공개 우선 표시
- [ ] **[v3] 기업 가입**: Google OAuth + 사업자번호 필수
- [ ] **[v3] 심사 템플릿 커스터마이징**: 기본 3종 clone → 수정 가능
- [ ] **[v3] 내부/외부 심사위원**: 3택 + 토큰 초대 + 재발송
- [ ] **[v3] 검수/심사 6탭**: 검수대기/승인/반려/자동반려/심사중/완료
- [ ] **[v3] 관리자 회원관리 확장**: 활동로그/IP/메모/조치/의심계정
- [ ] **[v3] 공식 공모전**: 관리자 개설 → is_official 배지 + 우선 노출
- [ ] **[v3] 리포트 2종**: 운영 리포트 + 마케팅 리포트 분리
- [ ] **[v3] 역할별 분석**: 참가자/주최자/심사위원/관리자 대시보드
- [ ] **[v3] 분석 과금 모델**: 무료/유료 경계 (placeholder)
- [ ] **[v3] 의뢰 CTA Feature Flag**: 관리자 ON/OFF + 자격 조건

**기존 검증:**
- [ ] **영상 갤러리**: 공모전 연동 갤러리, 필터(도구/장르/공모전), 수상작 하이라이트, 좋아요 동작
- [ ] **AI 메타데이터**: 접수 시 AI 도구, 기여도, 권리 선언 입력 + 심사/갤러리에서 표시
- [ ] **신뢰 거버넌스**: 관리자 수동 승인, 주최자 규정/상금 필수 입력
- [ ] 이메일: 심사위원 초대, 접수 확인, 결과 발표, 심사완료 알림 이메일 발송
- [ ] 테스트: 점수 계산 로직 테스트 통과
- [ ] 배포: Vercel production 정상 동작
- [ ] All "Must NOT Have" absent — 폼 빌더 없음, 실결제 없음, 배지 없음, 자유 업로드 없음, 자동차단 없음, 검색자동완성 없음
