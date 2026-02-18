# AI 영상 공모전 플랫폼 — 인터랙티브 목업 (Full Pages)

## TL;DR

> **Quick Summary**: AI 영상 공모전 플랫폼의 전체 페이지 인터랙티브 목업. 백엔드 없이 더미 데이터로 실제처럼 동작하는 프론트엔드 프로토타입. 3테마(라이트/다크/네온) 전환 포함. 사용자 확인 후 풀 개발(13 Task 플랜)로 전환.
> 
> **Deliverables**:
> - 20+ 페이지 인터랙티브 목업 (4역할: 참가자/주최자/심사위원/관리자)
> - 3테마 시스템 실제 동작 (라이트/다크/네온 사이버펑크)
> - 더미 데이터 기반 필터/정렬/폼/네비게이션 인터랙션
> - 목업 → 실제 코드 전환 가능한 구조 (async 데이터 추상화)
> 
> **Estimated Effort**: Medium (3~5일)
> **Total Tasks**: 7개
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (Setup) → Task 2 (Theme+Layout) → Tasks 3~6 (Pages) → Task 7 (Polish)

---

## Context

### Original Request
AI 영상 공모전 플랫폼 풀 개발(13 Task) 전에 인터랙티브 목업(Level B)으로 전체 페이지를 먼저 만들어서 디자인/UX를 확인하고 싶음. 확인 후 백엔드 연결로 전환.

### Interview Summary
**Key Discussions**:
- 목업 레벨: B (인터랙티브 — 필터, 정렬, 폼, Toast 등 더미 데이터로 동작)
- 목업 범위: 전체 페이지 (20+)
- 9대 개발 원칙 확정 (JSDoc 전체, SEO 텍스트 기반, HISTORY.md, config 중앙관리 등)
- Phase 1 추가: 대행 사이트 연결 CTA(`#`), 교육 홍보 배너(`#`)
- Phase 2 이연: 프리랜서 신청 시스템
- Framer Motion: 조건부 사용 (UX 향상 시에만, 억지로 X)
- 스택: Next.js 15 + Tailwind v4 + shadcn/ui + next-themes + next-intl
- **글로벌 설계**: DB/구조는 글로벌 대응으로 설계, 한국어/영어 번역 전환 실제 동작 (next-intl). 결제(Stripe)는 Phase 2+

**Research Findings**:
- 기존 프로젝트에 함께봄 홈페이지 코드 존재 → 정리 후 공모전 프로젝트로 전환 필요
- Tailwind v4 + next-themes의 3번째 커스텀 테마(neon)는 선례가 적음 → 초기에 프로토타입 검증 필수
- 더미 데이터를 async 함수로 감싸야 나중에 Supabase 전환 시 리팩토링 최소화

### Metis Review
**Identified Gaps** (addressed):
- 기존 hamkkebom 코드 정리 필요 → Task 1에 "codebase reset" 단계 포함
- 3테마 neon 구현 위험 → Task 2에서 테마 프로토타입 먼저 검증
- 데이터 함수 sync → async 전환 비용 → 처음부터 async mock 함수 사용

---

## Work Objectives

### Core Objective
풀 개발 전에 전체 UI/UX를 시각적으로 확인할 수 있는 인터랙티브 목업을 제작한다. 목업 코드는 버리지 않고 풀 개발 시 그대로 전환한다.

### Concrete Deliverables
- 20+ 페이지 (4역할 × 각 페이지)
- 3테마 실시간 전환
- 더미 데이터 기반 인터랙션 (필터, 정렬, 폼 제출, Toast)
- 폴더 구조 + package.json + config/constants.ts + HISTORY.md

### Definition of Done
- [ ] 모든 페이지 네비게이션 정상 동작
- [ ] 3테마 전환 시 깨지는 UI 없음
- [ ] 한국어/영어 언어 전환 정상 동작
- [ ] 더미 데이터로 필터/정렬 동작
- [ ] 폼 제출 시 Validation + Toast 피드백
- [ ] 주최측 출품작 검토(승인/반려) 플로우 동작
- [ ] Skeleton/Spinner 로딩 UI 존재
- [ ] bun run build → 에러 0

### Must Have
- 9대 개발 원칙 전체 준수
- 3테마 시스템 (라이트/다크/네온 사이버펑크) — 기본값: neon
- 모든 외부 링크를 `config/constants.ts`에서 관리
- HISTORY.md 실시간 기록
- JSDoc 모든 함수/컴포넌트에 적용
- 모든 비동기 로직에 try-catch + Error Boundary
- 더미 데이터 함수를 `async`로 작성 (나중에 Supabase 전환 대비)
- 대행 사이트 CTA 버튼 (href="#" — config에서 관리)
- 교육 홍보 배너 (href="#" — config에서 관리)
- i18n 번역 (next-intl + messages/ko.json + en.json) — 한국어/영어 전환 실제 동작

### Must NOT Have (Guardrails)
- ❌ Supabase 연결 (DB, Auth, Storage 전부 없음)
- ❌ Mux 연결 (영상 업로드/스트리밍 없음 — 플레이스홀더 UI만)
- ❌ Resend 연결 (이메일 발송 없음)
- ❌ 실제 인증/로그인 (역할 전환은 UI 토글로 시뮬레이션)
- ❌ 프리랜서 신청 시스템 (Phase 2)
- ❌ 결제 시스템
- ❌ API Routes (Server Actions 없음 — 모든 데이터는 로컬 mock)
- ❌ 실제 영상 파일 재생 (썸네일 + 플레이스홀더)
- ❌ 고급 SEO 최적화 (sitemap, robots.txt, structured data 등은 풀 개발에서 — 단, 9대 원칙 #3에 따라 **의미론적 HTML 태그 구조는 목업부터 적용**)
- ❌ 배포 (로컬 개발 서버에서 확인)
- ❌ Framer Motion 강제 사용 (UX 향상에 도움될 때만 선택적 사용)

---

## 9대 개발 원칙 (전체 Task에 적용)

> 모든 Task는 아래 9대 원칙을 **엄격히** 준수해야 한다.
> *(원칙은 프로젝트 진행 중 추가/삭제/수정 가능 — 변경 시 이 섹션과 HISTORY.md에 기록)*

| # | 원칙 | 상세 적용 방법 |
|---|------|----------------|
| 1 | **컴포넌트 기반 아키텍처** | 각 기능(네비게이션, 푸터, 공모전 리스트 등)을 재사용 가능한 컴포넌트로 분리. 먼저 전체 폴더 구조를 사용자에게 보여주고 **승인받은 뒤** 파일 생성 시작. |
| 2 | **기능 명세 & 예외 처리** | 각 컴포넌트가 담당할 구체적 기능을 나열하고 충실히 수행. 외부 사용자가 쓸 서비스이므로 **입력값 유효성 검사(Zod Validation)** + 로딩 중/에러 시 **UI 피드백(Skeleton, Spinner, Toast)** 반드시 포함. |
| 3 | **SEO 친화적 텍스트 기반 설계** | 핵심 내용은 반드시 실제 텍스트(HTML 태그)로 작성. 이미지는 시각적 요소(배경, 아이콘)로만 제한. 정보 전달은 텍스트 중심 + 의미론적 태그 구조(h1, p, section 등) 활용. |
| 4 | **에러 핸들링** | 모든 비동기 로직(API 호출, DB 연동 등)에 try-catch 필수. 예외 상황에 사용자 인지 가능한 안내 문구 포함. 시스템 에러 시 서비스가 멈추지 않도록 Error Boundary 안전장치 설계. |
| 5 | **클린 코드 & JSDoc** | **모든** 함수/컴포넌트 상단에 JSDoc 스타일 주석. 변수명은 의미 명확한 영문. 유지보수 용이하도록 Clean Code 원칙 철저 준수. |
| 6 | **상태 관리 & 데이터 흐름** | 데이터가 컴포넌트 사이에서 어떻게 전달/관리되는지 정의. React Server Components 우선 + 필요 시 Context. **Props drilling 방지** 등 데이터 흐름 최적화. |
| 7 | **안정적 종속성** | 필요한 라이브러리를 미리 선정하고 **안정적인 LTS 버전 기반** package.json 작성. 실험적(beta/alpha) 버전 금지. Framer Motion은 UX 향상 시에만 선택적 사용. 예외 시 반드시 사용자에게 먼저 확인. |
| 8 | **HISTORY.md 작업 로그** | 프로젝트 루트에 `HISTORY.md` 생성. **[작업 지시 기록]**: 요청한 지시 내용 + 수정/생성 파일 리스트. **[에러 및 해결 기록]**: 에러 로그, 원인 분석, 해결 과정 상세 기록. 실시간 업데이트. |
| 9 | **설정값 및 링크 중앙 관리** | 서비스 전체 공통 URL, 외부 API 주소, 고정 텍스트를 **절대 하드코딩 금지**. `lib/config/constants.ts` 또는 `.env`에서 한곳 관리. 링크 하나 바꾸면 전체 반영되도록 환경변수와 상수 적극 활용. |

### 원칙 변경 이력
| 날짜 | 변경 내용 |
|------|-----------|
| 2026-02-12 | 8대 원칙 초안 확정 |
| 2026-02-13 | 9대 원칙으로 확장: #3 SEO 친화적 설계 신규 추가, 기존 #8 설정값 관리를 #9로 이동 및 상세화, 전체 원문 반영 |

---

## 목업 데이터 전략 (Metis 권고 반영)

### 더미 데이터 구조

기존 풀 플랜의 DB 스키마(7 테이블)를 TypeScript 타입으로 변환:

```typescript
// lib/types/index.ts — 풀 개발에서도 그대로 사용
export interface Contest { id: string; title: string; status: ContestStatus; ... }
export interface Submission { id: string; contestId: string; title: string; ... }
export interface Score { id: string; submissionId: string; judgeId: string; ... }
// ... 7개 테이블 전부
```

### 데이터 함수 — async로 작성 (핵심!)

```typescript
// lib/data/contests.ts — 목업에서는 더미, 풀 개발에서 Supabase로 교체
export async function getContests(filters?: ContestFilters): Promise<Contest[]> {
  // 목업: 로컬 JSON에서 필터링
  return MOCK_CONTESTS.filter(c => matchesFilters(c, filters));
  // 풀 개발 시: return supabase.from('contests').select('*').match(filters)
}
```

> **왜 async?** 지금은 더미 데이터라 sync로 해도 되지만, 나중에 Supabase로 바꿀 때 모든 호출부를 수정해야 함. 처음부터 async면 데이터 함수 내부만 교체하면 끝.

### 더미 데이터 파일

> **데이터 수량 원칙**: 실제 서비스처럼 보여야 한다. 적은 데이터로는 그리드 레이아웃,
> 페이지네이션, 필터 결과, 빈 상태 등을 제대로 검증할 수 없음.

```
lib/data/
├── mock/                     # 더미 데이터
│   ├── contests.ts           # 공모전 20~25개 (상태별 분포: open 5, closed 4, judging 3, results 5, draft 3, archived 3, pending 2)
│   ├── submissions.ts        # 출품작 80~100개 (공모전당 4~8개, 다양한 AI 도구 조합)
│   ├── users.ts              # 사용자 30~40명 (참가자 20+, 주최자 5, 심사위원 5, 관리자 2, 복수 역할 포함)
│   ├── scores.ts             # 심사 점수 50~60개 (심사 완료된 공모전 기준)
│   ├── results.ts            # 결과 데이터 15~20개 (결과 발표된 5개 공모전 × 3~4순위)
│   └── templates.ts          # 심사 템플릿 3개
├── contests.ts               # getContests(), getContestById() 등
├── submissions.ts            # getSubmissions(), createSubmission() 등
├── users.ts                  # getCurrentUser(), getUserById() 등
├── scores.ts                 # getScores(), submitScore() 등
└── index.ts                  # barrel export
```

**데이터 수량 기준 & 검증 목적**:

| 데이터 | 수량 | 검증 포인트 |
|--------|------|------------|
| 공모전 | 20~25개 | 카드 그리드 3줄+, 페이지네이션, 상태별 필터 결과가 각각 여러 개 |
| 출품작 | 80~100개 | 공모전당 목록 스크롤, 호스트 접수현황 테이블, 갤러리 그리드 채움. **상태 분포**: pending_review 10+, approved 40+, rejected 5+, under_judging 15+, scored 10+, winner 5+ |
| 사용자 | 30~40명 | 관리자 회원목록 페이지네이션, 크리에이터 프로필 다양성 |
| 점수 | 50~60개 | 심사 진행률 바 다양한 상태 (0%, 50%, 100%), 결과 순위 계산 |
| 결과 | 15~20개 | 결과 페이지 수상작 목록, 갤러리 수상 뱃지 |
| 갤러리 공개 | 40~50개 | 갤러리 메인 그리드 3줄+, AI 도구별 필터 결과 충분 |

**Edge Case 데이터도 포함**:
- 출품작 0개인 공모전 1개 (빈 상태 UI 검증)
- 설명 텍스트가 매우 긴 공모전 1개 (텍스트 오버플로우 검증)
- AI 도구를 5개 이상 사용한 출품작 2개 (뱃지 줄바꿈 검증)
- 상금이 0원인 공모전 1개 (상금 없음 표시 검증)
- 한글 이름 + 영문 이름 혼재 사용자 (레이아웃 검증)

### 역할 시뮬레이션 (인증 없이)

```typescript
// lib/config/constants.ts
export const MOCK_CURRENT_USER_ID = 'user-participant-1'; // 이것만 바꾸면 역할 전환

// 또는 UI에 역할 전환 토글 (개발자/시연용)
// Header에 [참가자 | 주최자 | 심사위원 | 관리자] 탭 → 클릭 시 역할 전환
```

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Automated tests**: NO (목업 단계 — Agent QA로 대체)
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

| Type | Tool | How |
|------|------|-----|
| **모든 페이지 렌더링** | Playwright | Navigate + screenshot + DOM assert |
| **테마 전환** | Playwright | 3테마 순회, 깨짐 확인 |
| **인터랙션** | Playwright | 필터 클릭, 폼 입력, Toast 확인 |
| **빌드** | Bash | `bun run build` → exit 0 |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 순차):
└── Task 1: Project Setup + Folder Structure + Config + HISTORY.md
    └── Task 2: Theme System + Common Layout (Header/Footer/Sidebar)

Wave 2 (Pages — 병렬):
├── Task 3: Public Pages (랜딩, 공모전 목록/상세, 갤러리, 크리에이터)
├── Task 4: Auth + Participant Pages (로그인, 회원가입, 접수, 내 출품작)
├── Task 5: Host Pages (대시보드, 공모전 CRUD, 접수현황)
├── Task 6: Judge + Admin Pages (심사화면, 초대수락, 관리자패널)

Wave 3 (Polish — 순차):
└── Task 7: Cross-Page Integration + Polish + Build Verification
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 (Setup) | None | All | None |
| 2 (Theme+Layout) | 1 | 3, 4, 5, 6 | None |
| 3 (Public) | 2 | 7 | 4, 5, 6 |
| 4 (Auth+Participant) | 2 | 7 | 3, 5, 6 |
| 5 (Host) | 2 | 7 | 3, 4, 6 |
| 6 (Judge+Admin) | 2 | 7 | 3, 4, 5 |
| 7 (Polish) | 3, 4, 5, 6 | None | None (final) |

---

## TODOs

---

- [ ] 1. Project Setup + Folder Structure + Config + Mock Data

  **What to do**:

  **⚠️ 사용자 승인 필수 단계 (8대 원칙 #1)**:
  > 아래 4개를 순서대로 제안하고 사용자 승인을 받은 뒤 파일 생성을 시작할 것.
  > 1. 폴더 구조 (Folder Structure)
  > 2. package.json (종속성 목록)
  > 3. 설정값 관리 방식 (config/constants.ts + .env)
  > 4. HISTORY.md 초안

  **Step 1 — 기존 코드 정리 (Codebase Reset)**:
  - 현재 프로젝트의 함께봄 홈페이지 코드 제거
    - `app/page.tsx` → 기본 빈 페이지로 교체
    - `components/` → 함께봄 전용 컴포넌트 제거
    - `app/globals.css` → 함께봄 색상 토큰 제거 (Tailwind v4 기본만 유지)
  - Git commit: `chore: reset codebase for AI video contest platform`

  **Step 2 — 폴더 구조 제안 → 사용자 승인 대기**:
  ```
  app/
  ├── (auth)/
  │   ├── login/page.tsx
  │   └── signup/page.tsx
  ├── (public)/
  │   ├── page.tsx                    # 랜딩
  │   ├── contests/
  │   │   ├── page.tsx                # 공모전 목록
  │   │   └── [id]/
  │   │       ├── page.tsx            # 공모전 상세
  │   │       ├── submit/page.tsx     # 접수 폼
  │   │       └── results/page.tsx    # 결과
  │   ├── gallery/
  │   │   ├── page.tsx                # 갤러리 메인
  │   │   └── [id]/page.tsx           # 갤러리 상세
  │   └── creators/
  │       └── [id]/page.tsx           # 크리에이터 프로필
  ├── dashboard/
  │   ├── page.tsx                    # 호스트 대시보드 메인
  │   └── contests/
  │       ├── page.tsx                # 내 공모전 리스트
  │       ├── new/page.tsx            # 공모전 생성
  │       └── [id]/
  │           ├── page.tsx            # 공모전 상세 (접수현황)
  │           └── edit/page.tsx       # 공모전 수정
  ├── judging/
  │   ├── page.tsx                    # 배정된 공모전 목록
  │   └── [contestId]/
  │       ├── page.tsx                # 출품작 목록
  │       └── [submissionId]/page.tsx # 심사 화면
  ├── admin/
  │   ├── page.tsx                    # 관리자 대시보드
  │   ├── contests/
  │   │   ├── page.tsx                # 공모전 승인 목록
  │   │   └── [id]/page.tsx           # 공모전 상세
  │   └── users/page.tsx              # 회원 목록
  ├── invite/
  │   └── [token]/page.tsx            # 심사위원 초대 수락
  ├── my/
  │   └── submissions/
  │       ├── page.tsx                # 내 출품작 목록
  │       └── [id]/page.tsx           # 출품작 상세
  ├── layout.tsx                      # 루트 레이아웃 (ThemeProvider)
  ├── globals.css                     # 3테마 CSS variables
  ├── not-found.tsx                   # 404 페이지
  └── error.tsx                       # Error Boundary

  components/
  ├── layout/
  │   ├── header.tsx                  # 글로벌 헤더 + 네비게이션 + 테마 전환 + 역할 전환 토글
  │   ├── footer.tsx                  # 글로벌 푸터
  │   ├── sidebar.tsx                 # 대시보드 사이드바
  │   └── role-switcher.tsx           # 목업용 역할 전환 UI
  ├── ui/                             # shadcn/ui 컴포넌트
  ├── contest/
  │   ├── contest-card.tsx            # 공모전 카드
  │   ├── contest-filters.tsx         # 필터 UI
  │   ├── contest-form.tsx            # 생성/수정 폼
  │   └── status-badge.tsx            # 상태 뱃지
  ├── submission/
  │   ├── submission-card.tsx
  │   ├── submission-form.tsx         # 접수 폼 (AI 메타데이터 포함)
  │   └── video-placeholder.tsx       # 영상 플레이스홀더 (Mux 대체)
  ├── judging/
  │   ├── scoring-form.tsx            # 채점 폼 (템플릿 기반)
  │   ├── judge-video-player.tsx      # 심사 영상 플레이스홀더
  │   └── progress-bar.tsx            # 심사 진행률
  ├── gallery/
  │   ├── gallery-card.tsx            # 갤러리 카드
  │   ├── gallery-filters.tsx         # 갤러리 필터
  │   └── gallery-player.tsx          # 갤러리 영상 플레이스홀더
  ├── common/
  │   ├── education-banner.tsx        # 교육 홍보 배너 (CTA → #)
  │   ├── agency-cta.tsx              # 대행 사이트 연결 CTA (→ #)
  │   ├── loading-skeleton.tsx        # 로딩 스켈레톤
  │   └── empty-state.tsx             # 빈 상태 UI
  └── theme/
      └── theme-switcher.tsx          # 3테마 전환 UI

  lib/
  ├── config/
  │   ├── constants.ts                # 외부 URL, 고정 텍스트, 설정값 중앙 관리
  │   ├── navigation.ts               # 네비게이션 메뉴 구조
  │   └── site.ts                     # 사이트 메타데이터
  ├── i18n/
  │   ├── config.ts                   # next-intl 설정 (지원 로케일, 기본 로케일)
  │   ├── request.ts                  # 서버 컴포넌트용 getRequestConfig
  │   └── messages/
  │       ├── ko.json                 # 한국어 메시지
  │       └── en.json                 # 영어 메시지
  ├── data/
  │   ├── mock/                       # 더미 데이터
  │   │   ├── contests.ts
  │   │   ├── submissions.ts
  │   │   ├── users.ts
  │   │   ├── scores.ts
  │   │   ├── results.ts
  │   │   └── templates.ts
  │   ├── contests.ts                 # async 데이터 함수
  │   ├── submissions.ts
  │   ├── users.ts
  │   ├── scores.ts
  │   └── index.ts
  ├── types/
  │   ├── contest.ts                  # Contest, ContestStatus 등
  │   ├── submission.ts               # Submission, SubmissionStatus 등
  │   ├── user.ts                     # User, UserRole 등
  │   ├── score.ts                    # Score, JudgingTemplate 등
  │   └── index.ts
  ├── utils/
  │   ├── cn.ts                       # tailwind-merge + clsx
  │   ├── format.ts                   # 날짜, 금액 포맷
  │   └── scoring.ts                  # 점수 계산 유틸
  └── hooks/
      ├── use-role.ts                 # 역할 전환 훅
      └── use-filters.ts             # 필터 상태 관리 훅

  HISTORY.md                          # 작업 로그
  ```

  **Step 3 — package.json 제안 → 사용자 승인 대기**:
  ```json
  {
    "dependencies": {
      "next": "15.x (현재 설치됨)",
      "react": "19.x (현재 설치됨)",
      "react-dom": "19.x (현재 설치됨)",
      "next-themes": "latest stable — 3테마 전환",
      "next-intl": "latest stable — i18n 국제화 (Phase 1은 한국어만, 글로벌 확장 대비)",
      "zod": "latest stable — 폼 유효성 검증",
      "clsx": "latest stable — 조건부 클래스",
      "tailwind-merge": "latest stable — Tailwind 클래스 병합"
    },
    "devDependencies": {
      "typescript": "현재 설치됨",
      "tailwindcss": "v4 (현재 설치됨)",
      "@types/react": "현재 설치됨",
      "@types/node": "현재 설치됨"
    },
    "note": "Framer Motion은 필수 아님. 구현 중 UX 향상에 필요하다고 판단될 때만 추가 (사전 기록)"
  }
  ```
  - shadcn/ui 컴포넌트: Button, Card, Badge, Input, Textarea, Select, Dialog, Toast, Skeleton, Avatar, Tabs, DropdownMenu, Sheet, Separator, Tooltip

  **Step 4 — config/constants.ts 제안 → 사용자 승인 대기**:
  ```typescript
  // lib/config/constants.ts
  export const EXTERNAL_LINKS = {
    AGENCY_SITE: '#',          // TODO: 대행 사이트 URL 확정 시 교체
    EDUCATION_PAGE: '#',       // TODO: 교육 페이지 URL 확정 시 교체
    HAMKKEBOM_HOME: '#',       // TODO: 함께봄 홈페이지 오픈 시 교체
  } as const;

  /** 사이트 설정 — UI 텍스트는 i18n(messages/ko.json)으로 관리, 여기는 설정값만 */
  export const SITE_CONFIG = {
    name: 'AI Video Contest Platform',    // 내부 식별용 (영문 고정)
    defaultLocale: 'ko' as const,
    supportedLocales: ['ko', 'en'] as const,  // 한국어 + 영어 번역 지원
    defaultTheme: 'neon' as const,
    themes: ['light', 'dark', 'neon'] as const,
    defaultCurrency: 'KRW' as const,      // Phase 1: 원화, Phase 2+: 통화 선택
  } as const;

  export const CONTEST_CATEGORIES = [
    { value: 'short_film', label: '단편 영화' },
    { value: 'music_video', label: '뮤직비디오' },
    { value: 'commercial', label: '광고/CF' },
    { value: 'experimental', label: '실험 영상' },
    { value: 'free', label: '자유 주제' },
  ] as const;

  /** AI 영상 제작 도구 */
  export const AI_VIDEO_TOOLS = [
    'Runway', 'Sora', 'Kling', 'Pika', 'Hailuo', 'Vidu', 'Luma',
    'Synthesia', 'HeyGen', 'Invideo', '기타',
  ] as const;

  /** AI 이미지 생성 도구 */
  export const AI_IMAGE_TOOLS = [
    'Midjourney', 'DALL-E', 'Stable Diffusion', 'Firefly', 'Leonardo AI',
    'Flux', 'Ideogram', 'Playground', '기타',
  ] as const;

  /** 통합 AI 도구 (접수 폼에서 영상/이미지 각각 선택 가능) */
  export const AI_TOOLS = {
    video: AI_VIDEO_TOOLS,
    image: AI_IMAGE_TOOLS,
  } as const;
  ```

  **Step 5 — HISTORY.md 초안 생성**

  **Step 6 — 승인 후 실제 파일 생성**:
  - 프로젝트 초기화 (패키지 설치, shadcn/ui 컴포넌트 추가)
  - TypeScript 타입 정의 (7 테이블 기반)
  - 더미 데이터 생성 (contests 20~25개, submissions 80~100개, users 30~40명, scores 50~60개, results 15~20개 — 상세 기준은 "목업 데이터 전략" 섹션 참고)
  - async 데이터 함수 작성
  - config/constants.ts 생성

  **Must NOT do**:
  - 사용자 승인 없이 파일 생성 시작하지 않을 것
  - Supabase, Mux, Resend 패키지 설치하지 않을 것
  - beta/alpha 패키지 설치하지 않을 것

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 프로젝트 전체 구조 설계 + 타입 시스템 + 데이터 추상화 레이어 — 풀 개발 전환의 기반이므로 심층적 접근 필요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 폴더 구조 설계, 컴포넌트 분리 전략

  **Parallelization**:
  - **Can Run In Parallel**: NO (첫 번째, 사용자 승인 필요)
  - **Parallel Group**: Wave 1
  - **Blocks**: All
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `.sisyphus/plans/ai-video-contest-platform.md` — 풀 플랜의 DB 스키마(7 테이블)를 TypeScript 타입으로 변환
  - `.sisyphus/plans/ai-video-contest-platform.md:277-381` — SQL 스키마 정의 (contests, submissions, scores, profiles 등)
  - `.sisyphus/plans/ai-video-contest-platform.md:506-551` — 3테마 CSS variables 정의 (OKLCH)

  **External References**:
  - shadcn/ui 설치: https://ui.shadcn.com/docs/installation/next
  - next-themes: https://github.com/pacocoursey/next-themes

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 사용자 승인 프로세스 완료
    Tool: N/A (대화형)
    Steps:
      1. 폴더 구조 제안 → 사용자 "승인" 응답 확인
      2. package.json 제안 → 사용자 "승인" 응답 확인
      3. config 구조 제안 → 사용자 "승인" 응답 확인
      4. HISTORY.md 초안 제안 → 사용자 "승인" 응답 확인
    Expected Result: 4개 항목 모두 사용자 승인 완료

  Scenario: 프로젝트 빌드 성공
    Tool: Bash
    Steps:
      1. bun run build
      2. Assert: exit code 0
    Expected Result: 빌드 성공
    Evidence: Build output

  Scenario: TypeScript 타입 검증
    Tool: Bash
    Steps:
      1. bunx tsc --noEmit
      2. Assert: 타입 에러 0개
    Expected Result: 타입 에러 없음

  Scenario: 더미 데이터 함수 async 확인
    Tool: Bash (grep)
    Steps:
      1. lib/data/*.ts 파일에서 export function 검색
      2. Assert: 모든 데이터 함수가 async 키워드 포함
    Expected Result: sync 데이터 함수 0개
  ```

  **Commit**: YES
  - Message: `chore: setup project structure, types, mock data, and config for interactive mockup`
  - Pre-commit: `bun run build`

---

- [ ] 2. Theme System (3-Theme) + Common Layout (Header/Footer/Sidebar)

  **What to do**:

  **⚠️ 테마 프로토타입 검증 (Metis 권고)**:
  > Tailwind v4 + next-themes의 3번째 커스텀 테마(neon)는 선례가 적으므로,
  > 먼저 3개 테마가 정상 전환되는 최소 프로토타입을 만들고 검증한 뒤 레이아웃으로 진행.

  **Part A — 3테마 시스템**:
  - next-themes 설치 및 설정:
    - `themes={['light', 'dark', 'neon']}`, `attribute="data-theme"`, `defaultTheme="neon"`
  - `app/globals.css`에 3개 테마별 CSS variables 정의 (OKLCH):
    - Light: 깨끗한 비즈니스 라이트
    - Dark: AI카이브 스타일 시네마틱
    - Neon Cyberpunk: 딥퍼플 배경 + 핫핑크/시안/바이올렛 네온 글로우 (시그니처)
  - 네온 전용 유틸리티: `.neon-glow`, `.neon-text`, `.neon-border`
  - 테마 전환 UI: `components/theme/theme-switcher.tsx` (아이콘: 태양/달/번개)

  **Part B — 공통 레이아웃**:
  - `components/layout/header.tsx`: 글로벌 헤더
    - 로고 (텍스트 플레이스홀더)
    - 네비게이션 메뉴 (역할별 다른 메뉴 — `lib/config/navigation.ts`에서 관리)
    - 테마 전환 버튼
    - 🌐 언어 전환 버튼 (한국어/English 전환 — next-intl로 UI 텍스트 번역 실제 동작)
    - 역할 전환 토글 (목업 전용 — 참가자/주최자/심사위원/관리자)
    - 로그인/프로필 영역 (더미)
    - 반응형: 데스크톱 수평 / 모바일 햄버거
  - `components/layout/footer.tsx`: 글로벌 푸터
    - 대행 사이트 CTA (`EXTERNAL_LINKS.AGENCY_SITE`)
    - 교육 홍보 링크 (`EXTERNAL_LINKS.EDUCATION_PAGE`)
    - 플랫폼 정보
  - `components/layout/sidebar.tsx`: 대시보드 사이드바 (호스트/심사위원/관리자용)
  - `components/layout/role-switcher.tsx`: 역할 전환 드롭다운
    - 선택하면 `useRole()` 훅으로 현재 역할 변경
    - 역할에 따라 네비게이션 메뉴 + 접근 가능 페이지 변경
  - `app/layout.tsx`: ThemeProvider + 폰트 + Header + Footer 적용
  - Error Boundary: `app/error.tsx`, `app/not-found.tsx`

  **Must NOT do**:
  - 4개 이상 테마
  - 테마별 다른 레이아웃 (색상만 변경)
  - 과도한 네온 애니메이션 (정적 글로우만)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 3테마의 시각적 완성도가 프로젝트 인상을 결정. 네온 사이버펑크는 디자인 감각 필요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 테마 색상 조화, 레이아웃 UI, 반응형 네비게이션

  **Parallelization**:
  - **Can Run In Parallel**: NO (Task 1 이후)
  - **Parallel Group**: Wave 1 (Sequential — after Task 1)
  - **Blocks**: Tasks 3, 4, 5, 6
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `.sisyphus/plans/ai-video-contest-platform.md:506-560` — 3테마 CSS variables 정의 (OKLCH 값, 네온 글로우 변수)

  **External References**:
  - next-themes: https://github.com/pacocoursey/next-themes — 3테마 설정 (themes prop)
  - shadcn/ui 테마: https://ui.shadcn.com/docs/theming — CSS variables (OKLCH)
  - AI카이브 다크 참고: https://aikive.com/
  - Tailwind v4 custom variants: https://tailwindcss.com/docs/adding-custom-styles

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 3테마 전환 정상 동작
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to: http://localhost:3000
      2. Assert: data-theme="neon" (기본값)
      3. Click: theme switcher → "라이트"
      4. Assert: data-theme="light", 배경색 밝음
      5. Screenshot: .sisyphus/evidence/task-2-theme-light.png
      6. Click: theme switcher → "다크"
      7. Assert: data-theme="dark"
      8. Screenshot: .sisyphus/evidence/task-2-theme-dark.png
      9. Click: theme switcher → "네온"
      10. Assert: data-theme="neon", 네온 글로우 효과 visible
      11. Screenshot: .sisyphus/evidence/task-2-theme-neon.png
      12. Reload page → Assert: 테마 유지됨
    Expected Result: 3테마 전환 + 저장 + 시각 차이 확인
    Evidence: .sisyphus/evidence/task-2-theme-*.png

  Scenario: 역할 전환 토글 동작
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Click: role-switcher → "주최자"
      3. Assert: 네비게이션에 "대시보드" 메뉴 표시
      4. Click: role-switcher → "심사위원"
      5. Assert: 네비게이션에 "심사" 메뉴 표시
      6. Click: role-switcher → "관리자"
      7. Assert: 네비게이션에 "관리" 메뉴 표시
    Expected Result: 역할별 네비게이션 정상 전환

  Scenario: 언어 전환 (한국어 ↔ English)
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Assert: 기본 언어 한국어 (UI 텍스트 한글)
      3. Click: 언어 전환 버튼 → "English"
      4. Assert: UI 텍스트가 영어로 전환됨 (예: 네비게이션, 버튼, 푸터)
      5. Screenshot: .sisyphus/evidence/task-2-lang-en.png
      6. Reload page → Assert: 영어 유지
      7. Click: 언어 전환 → "한국어"
      8. Assert: UI 텍스트 한국어로 복귀
      9. Screenshot: .sisyphus/evidence/task-2-lang-ko.png
    Expected Result: 언어 전환 + 저장 정상 동작
    Evidence: .sisyphus/evidence/task-2-lang-*.png

  Scenario: 반응형 헤더
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Set viewport: 1280x720 (desktop)
      3. Assert: 수평 네비게이션 메뉴 visible
      4. Set viewport: 375x812 (mobile)
      5. Assert: 햄버거 메뉴 버튼 visible
      6. Click: 햄버거 → Assert: 모바일 메뉴 열림
      7. Screenshot: .sisyphus/evidence/task-2-responsive.png
    Expected Result: 반응형 정상 동작
    Evidence: .sisyphus/evidence/task-2-responsive.png
  ```

  **Commit**: YES
  - Message: `feat(theme): add 3-theme system and common layout with role switcher`
  - Pre-commit: `bun run build`

---

- [ ] 3. Public Pages (랜딩, 공모전 목록/상세, 갤러리, 크리에이터)

  **What to do**:

  **3-1. 랜딩 페이지** (`app/(public)/page.tsx`):
  - 히어로 섹션: 슬로건 + "공모전 탐색하기" CTA
  - 진행 중인 공모전 하이라이트 (더미 데이터 3개)
  - 최근 수상작 갤러리 프리뷰 (더미 데이터)
  - 플랫폼 소개 + 차별점 섹션
  - 교육 홍보 배너 (`EXTERNAL_LINKS.EDUCATION_PAGE`)
  - 대행 사이트 CTA ("AI 영상 제작이 필요하신가요?" → `EXTERNAL_LINKS.AGENCY_SITE`)
  - Framer Motion: 히어로 애니메이션에 효과적이면 사용 가능

  **3-2. 공모전 목록** (`app/(public)/contests/page.tsx`):
  - AI카이브 스타일 카드형 그리드
  - 필터: 상태(접수중/심사중/완료), 카테고리, 상금 규모
  - 정렬: 최신순, 마감임박순, 상금순
  - 더미 데이터 기반 필터/정렬 실제 동작
  - 페이지네이션 (더미)
  - Skeleton 로딩 UI

  **3-3. 공모전 상세** (`app/(public)/contests/[id]/page.tsx`):
  - 포스터 이미지 (플레이스홀더), 제목, 설명, 상금, 일정, 카테고리
  - "접수하기" CTA 버튼
  - 접수 현황 (접수 수 — 더미)
  - 대행 연결 CTA ("이런 영상을 제작하고 싶으신가요?")
  - 상태별 다른 UI (접수중/마감/심사중/결과발표)

  **3-4. 공모전 결과** (`app/(public)/contests/[id]/results/page.tsx`):
  - 수상작 목록 (순위, 작품명, 작가, 점수)
  - 수상작 영상 플레이스홀더

  **3-5. 갤러리 메인** (`app/(public)/gallery/page.tsx`):
  - 카드형 그리드 (영상 썸네일 + 제목 + 크리에이터 + AI도구 뱃지)
  - 필터: 공모전별, AI 도구별, 카테고리별, 수상작만
  - 정렬: 최신순

  **3-6. 갤러리 상세** (`app/(public)/gallery/[id]/page.tsx`):
  - 영상 플레이스홀더 (16:9 비율)
  - 작품 정보, AI 메타데이터, 크리에이터 링크, 공모전 링크, 수상 여부
  - 대행 CTA ("이 크리에이터에게 의뢰하고 싶으신가요?")

  **3-7. 크리에이터 프로필** (`app/(public)/creators/[id]/page.tsx`):
  - 프로필 정보 (아바타, 이름, 소개)
  - 갤러리 작품 목록
  - 참가/수상 이력

  **Must NOT do**:
  - 실제 영상 재생 (플레이스홀더만)
  - 검색 자동완성
  - 댓글/좋아요

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 랜딩 + 갤러리가 플랫폼의 "첫인상". 네온 테마에서 시각적 임팩트 필요
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Task 2

  **References**:
  - `.sisyphus/plans/ai-video-contest-platform.md:755-871` — 공개 페이지 상세 스펙
  - `.sisyphus/plans/ai-video-contest-platform.md:1506-1616` — 갤러리 상세 스펙
  - AI카이브: https://aikive.com/ — 카드형 그리드, 갤러리 레이아웃 참고

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 랜딩 페이지 렌더링 + CTA
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: http://localhost:3000
      2. Assert: 히어로 섹션 visible
      3. Assert: 공모전 하이라이트 카드 3개 표시
      4. Assert: 교육 홍보 배너 visible
      5. Assert: 대행 CTA 버튼 visible (href="#")
      6. Screenshot (3테마 각각): .sisyphus/evidence/task-3-landing-*.png
    Expected Result: 랜딩 페이지 + CTA 정상

  Scenario: 공모전 목록 필터/정렬
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: /contests
      2. Assert: 카드형 그리드 렌더링
      3. Click: 필터 "접수중"
      4. Assert: open 상태 공모전만 표시
      5. Click: 정렬 "상금순"
      6. Assert: 상금 내림차순 정렬
      7. Screenshot: .sisyphus/evidence/task-3-contests-filter.png
    Expected Result: 필터/정렬 동작

  Scenario: 갤러리 필터 + 상세
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: /gallery
      2. Click: 필터 "Runway"
      3. Assert: Runway 작품만 표시
      4. Click: 카드 → /gallery/[id]
      5. Assert: 영상 플레이스홀더 + AI 메타데이터 표시
    Expected Result: 갤러리 필터 + 상세 정상
  ```

  **Commit**: YES
  - Message: `feat(public): add landing, contest listing/detail, gallery, and creator pages with dummy data`
  - Pre-commit: `bun run build`

---

- [ ] 4. Auth + Participant Pages (로그인, 회원가입, 접수, 내 출품작)

  **What to do**:

  **4-1. 로그인** (`app/(auth)/login/page.tsx`):
  - 이메일 + 비밀번호 폼 (Zod validation)
  - Google 로그인 버튼 (비활성 — 목업)
  - "회원가입" 링크
  - Toast: "로그인 성공" (더미 — 실제 인증 없음, 역할 전환으로 시뮬레이션)

  **4-2. 회원가입** (`app/(auth)/signup/page.tsx`):
  - 이름, 이메일, 비밀번호 + 역할 선택 (참가자/주최자)
  - Zod validation (이메일 형식, 비밀번호 강도)
  - Toast: "회원가입 성공"

  **4-3. 접수 폼** (`app/(public)/contests/[id]/submit/page.tsx`):
  - 제목, 설명
  - AI 영상 도구 (multi-select: Runway, Sora, Kling, Pika 등 — `AI_VIDEO_TOOLS`에서)
  - AI 이미지 도구 (multi-select: Midjourney, DALL-E, Stable Diffusion 등 — `AI_IMAGE_TOOLS`에서)
  - AI 기여도 (슬라이더 0~100%)
  - 권리 선언 체크박스
  - 갤러리 공개 동의 체크박스
  - 영상 업로드 플레이스홀더 (Mux 대체 — 파일 선택 UI만)
  - Zod validation 전체 적용
  - 제출 시 Toast: "접수 완료 — 주최측 검토 후 승인됩니다"

  **4-4. 내 출품작 목록** (`app/my/submissions/page.tsx`):
  - 출품작 카드 리스트 (상태 뱃지: 검토대기/승인/심사중/수상/반려 등)
  - 필터: 상태별
  - 반려된 출품작은 반려 사유 표시

  **4-5. 출품작 상세** (`app/my/submissions/[id]/page.tsx`):
  - 영상 플레이스홀더, 출품 정보, 상태, 점수(공개 시)
  - 상태별 안내 메시지:
    - `pending_review`: "주최측에서 검토 중입니다"
    - `approved`: "승인 완료 — 심사 대기 중"
    - `rejected`: "반려됨 — 사유: {reason}"

  > **출품작 상태 흐름 (주최측 검토 포함)**:
  > ```
  > submitted → pending_review → approved → under_judging → scored → winner
  >                            ↘ rejected (유해/부적절 콘텐츠)
  > ```
  > - `submitted`: 참가자 접수 완료
  > - `pending_review`: 주최측 콘텐츠 검토 대기
  > - `approved`: 주최측 승인 (심사 풀 진입)
  > - `rejected`: 주최측 반려 (사유 필수 입력)
  > - `under_judging`: 심사위원 심사 중
  > - `scored`: 심사 완료
  > - `winner`: 수상작 선정

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 폼 UI + Validation + Toast 피드백 복합 작업
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Task 2

  **References**:
  - `.sisyphus/plans/ai-video-contest-platform.md:643-751` — Auth 스펙
  - `.sisyphus/plans/ai-video-contest-platform.md:1071-1158` — Submission 스펙

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 접수 폼 Validation + Toast
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: /contests/{id}/submit
      2. Click: submit (빈 폼)
      3. Assert: validation 에러 메시지 표시
      4. Fill: 모든 필드 정상 입력
      5. Click: submit
      6. Assert: Toast "접수 완료" 표시
    Expected Result: Validation + 성공 피드백

  Scenario: 회원가입 폼 Validation
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: /signup
      2. Fill: email → "invalid-email"
      3. Assert: 이메일 형식 에러 표시
      4. Fill: email → "test@example.com", 나머지 정상
      5. Click: submit
      6. Assert: Toast "회원가입 성공"
    Expected Result: Validation 정상 동작
  ```

  **Commit**: YES
  - Message: `feat(participant): add auth pages, submission form with validation, and my submissions`
  - Pre-commit: `bun run build`

---

- [ ] 5. Host Pages (대시보드, 공모전 CRUD, 접수현황)

  **What to do**:

  **5-1. 대시보드 메인** (`app/dashboard/page.tsx`):
  - 내 공모전 요약 카드 (총 N개, 접수중 N개, 심사중 N개)
  - 최근 공모전 리스트
  - 사이드바 레이아웃 적용

  **5-2. 공모전 생성** (`app/dashboard/contests/new/page.tsx`):
  - 생성 폼: 제목, 설명, 카테고리, 상금, 접수 기간, 심사 기간, 결과 발표일, 최대 영상 길이, 포스터(플레이스홀더), 심사 템플릿 선택
  - Zod validation
  - Toast: "공모전 생성 완료"

  **5-3. 공모전 리스트** (`app/dashboard/contests/page.tsx`):
  - 상태별 필터/탭
  - 공모전 카드 리스트

  **5-4. 공모전 상세 — 접수현황** (`app/dashboard/contests/[id]/page.tsx`):
  - 접수 통계 (총 접수, 검토대기, 승인, 반려)
  - 출품작 리스트 (테이블 뷰 — 상태 뱃지 포함)
  - **출품작 검토 기능 (핵심!)**:
    - 검토대기(`pending_review`) 출품작 영상 플레이스홀더 + 메타데이터 확인
    - "승인" 버튼 → 상태 `approved`로 전환 + Toast "승인 완료"
    - "반려" 버튼 → 반려 사유 입력 모달 → 상태 `rejected` + Toast "반려 완료"
    - 검토대기 건수 뱃지 표시 (예: "검토대기 3건")
  - 공모전 상태 전이 버튼 ("승인 요청", "심사 시작", "결과 발표")
  - 심사위원 관리 (초대한 심사위원 목록 — 더미)
  - ⚠️ "심사 시작" 버튼은 `approved` 상태 출품작이 1개 이상일 때만 활성화

  **5-5. 공모전 수정** (`app/dashboard/contests/[id]/edit/page.tsx`):
  - 생성 폼과 동일 + 기존 데이터 프리필

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Task 2

  **References**:
  - `.sisyphus/plans/ai-video-contest-platform.md:968-1067` — Contest CRUD 스펙

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 공모전 생성 폼
    Tool: Playwright (playwright skill)
    Steps:
      1. Role: 주최자로 전환
      2. Navigate to: /dashboard/contests/new
      3. Fill: 모든 필드
      4. Click: submit
      5. Assert: Toast "생성 완료"
      6. Navigate to: /dashboard/contests
      7. Assert: 새 공모전 목록에 표시

  Scenario: 출품작 검토 — 승인
    Tool: Playwright (playwright skill)
    Steps:
      1. Role: 주최자로 전환
      2. Navigate to: /dashboard/contests/{id}
      3. Assert: "검토대기 N건" 뱃지 표시
      4. Assert: 출품작 테이블에 pending_review 상태 출품작 존재
      5. Click: 출품작 행의 "승인" 버튼
      6. Assert: Toast "승인 완료"
      7. Assert: 해당 출품작 상태 뱃지 → "승인"으로 변경
      8. Assert: 검토대기 건수 1 감소
      9. Screenshot: .sisyphus/evidence/task-5-review-approve.png

  Scenario: 출품작 검토 — 반려 (사유 입력)
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: /dashboard/contests/{id}
      2. Click: 출품작 행의 "반려" 버튼
      3. Assert: 반려 사유 입력 모달 표시
      4. Fill: 사유 → "저작권 침해 의심 콘텐츠"
      5. Click: "반려 확인"
      6. Assert: Toast "반려 완료"
      7. Assert: 해당 출품작 상태 뱃지 → "반려"
      8. Screenshot: .sisyphus/evidence/task-5-review-reject.png

  Scenario: 심사 시작 조건 검증
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: /dashboard/contests/{id} (approved 출품작 0개)
      2. Assert: "심사 시작" 버튼 비활성(disabled)
      3. 출품작 1개 승인 처리
      4. Assert: "심사 시작" 버튼 활성화

  Scenario: 공모전 상태 전이
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to: /dashboard/contests/{id}
      2. Assert: 현재 상태 뱃지 표시
      3. Click: "승인 요청" 버튼
      4. Assert: 상태 변경 Toast
  ```

  **Commit**: YES
  - Message: `feat(host): add host dashboard, contest CRUD, and submission management`
  - Pre-commit: `bun run build`

---

- [ ] 6. Judge + Admin Pages (심사화면, 초대수락, 관리자패널)

  **What to do**:

  **6-1. 심사 대상 목록** (`app/judging/page.tsx`):
  - 배정된 공모전 목록 (더미)

  **6-2. 출품작 목록** (`app/judging/[contestId]/page.tsx`):
  - 심사 대상 출품작 — **`approved` 상태만 표시** (주최측 검토 통과분만 심사 가능)
  - 심사 완료/미완료 표시
  - 심사 진행률 프로그레스 바

  **6-3. 심사 화면** (`app/judging/[contestId]/[submissionId]/page.tsx`):
  - 좌측: 영상 플레이스홀더 (16:9)
  - 우측: 심사 양식 (템플릿 기반 동적 폼)
    - 기준별 점수 입력 (슬라이더/숫자)
    - 총점 실시간 계산 (가중 평균)
    - 텍스트 피드백
  - 제출 시 Toast: "심사 완료"

  **6-4. 초대 수락** (`app/invite/[token]/page.tsx`):
  - 공모전명, 주최자 정보 표시
  - "수락" / "거절" 버튼

  **6-5. 관리자 대시보드** (`app/admin/page.tsx`):
  - 기본 통계 (회원 수, 공모전 수, 출품작 수)
  - 승인 대기 공모전 수

  **6-6. 공모전 승인 목록** (`app/admin/contests/page.tsx`):
  - 승인 대기 공모전 리스트
  - 승인/반려 버튼

  **6-7. 회원 목록** (`app/admin/users/page.tsx`):
  - 회원 테이블 (이름, 이메일, 역할, 가입일)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 심사 화면의 영상+채점 분할 레이아웃이 UX 핵심
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5)
  - **Blocks**: Task 7
  - **Blocked By**: Task 2

  **References**:
  - `.sisyphus/plans/ai-video-contest-platform.md:1241-1331` — Judging 스펙
  - `.sisyphus/plans/ai-video-contest-platform.md:1162-1237` — Admin 스펙

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 심사 화면 점수 입력
    Tool: Playwright (playwright skill)
    Steps:
      1. Role: 심사위원으로 전환
      2. Navigate to: /judging/{contestId}/{submissionId}
      3. Assert: 영상 플레이스홀더 + 심사 폼 표시
      4. Fill: 각 기준 점수 입력
      5. Assert: 총점 실시간 계산됨
      6. Fill: 피드백 텍스트
      7. Click: submit
      8. Assert: Toast "심사 완료"
      9. Screenshot: .sisyphus/evidence/task-6-judging.png

  Scenario: 관리자 공모전 승인
    Tool: Playwright (playwright skill)
    Steps:
      1. Role: 관리자로 전환
      2. Navigate to: /admin/contests
      3. Assert: 승인 대기 목록 표시
      4. Click: "승인" 버튼
      5. Assert: Toast + 상태 변경
  ```

  **Commit**: YES
  - Message: `feat(judge-admin): add judging interface, invitation page, and admin panel`
  - Pre-commit: `bun run build`

---

- [ ] 7. Cross-Page Integration + Polish + Build Verification

  **What to do**:
  - 전체 페이지 간 네비게이션 통합 테스트
  - 3테마에서 모든 페이지 깨짐 확인 + 수정
  - 한국어/영어 전환 시 모든 페이지 텍스트 번역 확인 (미번역 하드코딩 텍스트 없는지)
  - HISTORY.md 최종 업데이트
  - Skeleton/Spinner 로딩 UI 일관성 확인
  - Toast 메시지 일관성 확인
  - 주최측 검토 플로우 전체 동작 확인 (접수 → 검토대기 → 승인/반려 → 심사)
  - 404, Error 페이지 동작 확인
  - 빌드 성공 확인: `bun run build` → exit 0
  - 전체 페이지 3테마 스크린샷 촬영 (증거)

  **Must NOT do**:
  - 배포 (로컬에서만 확인)
  - 성능 최적화
  - 접근성 최적화 (Phase 2)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 전체 UI 통합 검증 + 테마별 시각 품질 확인
  - **Skills**: [`playwright`, `frontend-ui-ux`]
    - `playwright`: 전체 페이지 자동 스크린샷 + 인터랙션 검증
    - `frontend-ui-ux`: UI 폴리시

  **Parallelization**:
  - **Can Run In Parallel**: NO (final)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4, 5, 6

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 전체 페이지 네비게이션 (참가자 플로우)
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate: / → /contests → /contests/{id} → /contests/{id}/submit → /my/submissions
      2. Navigate: / → /gallery → /gallery/{id} → /creators/{id}
      3. Assert: 모든 전환 정상, 404 없음
      4. Screenshot 각 페이지: .sisyphus/evidence/task-7-flow-participant-*.png

  Scenario: 전체 페이지 3테마 검증
    Tool: Playwright (playwright skill)
    Steps:
      1. 주요 페이지 5개 (랜딩, 공모전 목록, 심사, 갤러리, 대시보드)
      2. 각 페이지에서 3테마 전환
      3. Assert: 깨지는 UI 없음 (텍스트 가독성, 카드 보더, 버튼 색상)
      4. Screenshot: .sisyphus/evidence/task-7-theme-{page}-{theme}.png (15장)
    Expected Result: 모든 페이지 3테마 정상

  Scenario: 빌드 성공
    Tool: Bash
    Steps:
      1. bun run build
      2. Assert: exit code 0, no errors
      3. bun run lint
      4. Assert: exit code 0
    Expected Result: 빌드 + 린트 성공
  ```

  **Commit**: YES
  - Message: `chore(polish): integrate all pages, fix theme issues, verify build`
  - Pre-commit: `bun run build`

---

## Commit Strategy

| After Task | Message | Verification |
|------------|---------|--------------|
| 1 | `chore: setup project structure, types, mock data, and config` | `bun run build` |
| 2 | `feat(theme): add 3-theme system and common layout with role switcher` | `bun run build` |
| 3 | `feat(public): add landing, contests, gallery, creator pages` | `bun run build` |
| 4 | `feat(participant): add auth, submission form, my submissions` | `bun run build` |
| 5 | `feat(host): add dashboard, contest CRUD, submission management` | `bun run build` |
| 6 | `feat(judge-admin): add judging interface, invitation, admin panel` | `bun run build` |
| 7 | `chore(polish): integrate all pages, fix theme issues, verify build` | `bun run build` |

---

## Success Criteria

### Verification Commands
```bash
bun run build          # Expected: exit 0, no errors
bun run lint           # Expected: exit 0
```

### Final Checklist
- [ ] 20+ 페이지 모두 렌더링 정상
- [ ] 3테마 전환 시 모든 페이지에서 깨지는 UI 없음
- [ ] 한국어/영어 언어 전환 모든 페이지에서 정상 동작
- [ ] 역할 전환 토글로 4역할 시뮬레이션 가능
- [ ] 필터/정렬 더미 데이터 기반 동작
- [ ] 모든 폼에 Zod Validation + Toast 피드백
- [ ] 주최측 출품작 검토 플로우 동작 (승인/반려 + 사유)
- [ ] 심사 대상이 approved 상태 출품작만인지 확인
- [ ] Skeleton/Spinner 로딩 UI 존재
- [ ] 모든 외부 링크가 config/constants.ts에서 관리됨
- [ ] HISTORY.md에 작업 기록 존재
- [ ] 모든 함수/컴포넌트에 JSDoc 주석
- [ ] 더미 데이터 함수 전부 async
- [ ] 대행 사이트 CTA + 교육 홍보 배너 배치됨 (href="#")
- [ ] bun run build → 에러 0

### 목업 → 풀 개발 전환 가이드
목업 완료 후 풀 개발(13 Task 플랜) 진입 시:
1. `lib/data/` 내부의 mock import를 Supabase 호출로 교체
2. 인증: 역할 전환 토글 → Supabase Auth + middleware로 교체
3. 영상: 플레이스홀더 → Mux Player/Uploader로 교체
4. 이메일: Toast → Resend 실제 발송으로 교체
5. 타입, 컴포넌트, 레이아웃, config는 **그대로 유지**
