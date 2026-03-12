# AI Video Contest — Agent Knowledge Base

**Generated:** 2026-03-12 | **Commit:** 50e1d02 | **Branch:** main

## Overview
AI 영상 공모전 플랫폼 (꿈플/AI꿈) — 실제 운영 서비스. Next.js 15 App Router + Supabase + TypeScript.

## Language
- 사용자와의 모든 대화는 반드시 **한국어**로 진행한다.
- 코드 변수명, 함수명은 영어로 유지한다.
- 코드 주석은 **한국어**로 작성한다.
- 커밋 메시지는 영어로 유지한다 (conventional commits: `feat:`, `fix:`, `chore:` 등).

## Structure
```
.
├── app/                  # Next.js App Router (5개 route group + API)
│   ├── (public)/         #   공개 페이지 (메인, 공모전, 갤러리, 스토리)
│   ├── (auth)/           #   인증 (로그인, 회원가입) + /my 사용자 대시보드
│   ├── (admin)/          #   관리자 대시보드
│   ├── (host)/           #   주최자 대시보드
│   ├── (judge)/          #   심사위원 인터페이스
│   └── api/              #   API 라우트 (29개 엔드포인트)
├── components/           # UI 컴포넌트 (→ components/AGENTS.md)
├── lib/                  # 데이터 레이어, 인증, 타입 (→ lib/AGENTS.md)
├── hooks/                # useCountdown, useSubmissionStatus
├── config/               # constants.ts (상태/역할/AI도구 enum)
├── supabase/             # DB 마이그레이션 (26개), config.toml
├── middleware.ts          # 세션 갱신 + 보호 라우트 가드 + 슬러그 리다이렉트
├── instrumentation.ts     # 서버 시작 시 환경변수 fail-fast 검증
└── scripts/              # 유틸리티 스크립트
```

## Where to Look

| 작업 | 위치 | 비고 |
|------|------|------|
| 새 페이지 추가 | `app/(public)/` | route group 맞춰서 배치 |
| API 엔드포인트 | `app/api/` | 역할별 분리 (admin/, host/, public) |
| 컴포넌트 추가 | `components/` | → `components/AGENTS.md` 참조 |
| DB 쿼리 추가 | `lib/data/index.ts` | unstable_cache + revalidateTag 패턴 |
| 타입 정의 | `lib/types/index.ts` | snake_case(DB) → camelCase(TS) 변환 |
| 인증/세션 | `lib/supabase/` | → `lib/AGENTS.md` 참조 |
| 상수/enum | `config/constants.ts` | 상태 라벨, AI 도구, 지역, 기능 접근 |
| DB 스키마 변경 | `supabase/migrations/` | 순번 파일명, RLS 정책 포함 |
| 테마/색상 | `app/globals.css` | oklch 색상, data-theme 속성 |
| 라우트 보호 | `lib/supabase/middleware.ts` | /my, /admin, /host, /judging 보호 |

## Conventions

### 프로덕션 품질
- **실제 운영 서비스** — 프로덕션 품질 코드 유지 필수
- TypeScript strict mode, path alias `@/*`
- `typedRoutes: true` — Next.js 타입 안전 라우팅 활성화

### 인증 & 세션
- 슬라이딩 만료: 1시간 (SESSION_MAX_AGE = 3600초)
- 미들웨어가 매 요청마다 쿠키 maxAge 재설정
- 보호 경로: `/my/*`, `/admin/*`, `/host/*`, `/judging/*`, `/contests/*/submit`
- 미인증 시 `/login?redirectTo=...` 리다이렉트
- `useAuth()` 훅으로 클라이언트 인증 상태 관리

### 데이터 페칭
- `lib/data/index.ts`의 함수 사용 — 컴포넌트에서 직접 Supabase 쿼리 금지
- 공개 데이터: `unstable_cache()` + `revalidateTag()`
- 인증 데이터: `React.cache()` (getAuthProfile만)
- DB 컬럼 snake_case → TS 필드 camelCase 자동 변환

### 스타일링
- Tailwind CSS v4 (CSS-first, `app/globals.css`)
- shadcn/ui 컴포넌트 (`components/ui/` — 직접 수정 금지, CLI로만 추가)
- `cn()` 유틸로 클래스 병합 (clsx + tailwind-merge)
- 테마: next-themes, `data-theme` 속성 (light/dark/signature)

### API 라우트 패턴
```typescript
// 인증 확인
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

// 데이터 변경 후 캐시 무효화
revalidateTag('contests');
```

### 파일/네이밍
- 파일: kebab-case (`role-guard.tsx`, `contest-form.tsx`)
- 컴포넌트: PascalCase (`RoleGuard`, `ContestForm`)
- 훅: camelCase (`useCountdown.ts`)
- 날짜: KST 고정 — `formatDate()`, `formatDateTime()` 사용 (`lib/utils.ts`)

## Anti-Patterns
- `components/ui/` 직접 수정 — CLI(`npx shadcn@latest add`)로만 추가
- 컴포넌트에서 직접 Supabase 쿼리 — `lib/data/` 함수 사용
- 환경변수 플레이스홀더 커밋
- 캐시 무효화 없이 데이터 변경 — `revalidateTag()` 필수
- `as any`, `@ts-ignore` 사용 금지
- Mock 데이터 소스코드 하드코딩 — `lib/mock/index.ts` 사용
- recharts/lucide-react를 next.config optimizePackageImports에 등록 — HMR chunk 충돌

## Complexity Hotspots
| 파일 | 줄 수 | 설명 |
|------|-------|------|
| `app/(admin)/admin/contests/_components/contest-form.tsx` | 2196 | 공모전 생성/수정 폼 |
| `lib/data/index.ts` | 1900 | Supabase 데이터 레이어 (50+ 함수) |
| `app/(public)/contests/[id]/submit/page.tsx` | 1765 | 출품 제출 페이지 |
| `app/(admin)/admin/submissions/register/page.tsx` | 972 | 관리자 출품 등록 |
| `components/profile/profile-edit-form.tsx` | 839 | 프로필 편집 폼 |

## Environment
```bash
# 필수
NEXT_PUBLIC_SUPABASE_URL=       # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase 익명 키
NEXT_PUBLIC_SITE_URL=           # 사이트 URL

# 선택
CLOUDFLARE_ACCOUNT_ID=          # 영상 업로드 (Cloudflare Stream)
CLOUDFLARE_STREAM_API_TOKEN=
ANTHROPIC_API_KEY=              # Claude API
```

## Commands
```bash
bun run dev          # 개발 서버 (Turbopack)
bun run build        # 프로덕션 빌드
bun run start        # 프로덕션 서버
npx tsc --noEmit     # 타입 체크
```

## Notes
- 배포: Vercel 자동 배포 (git push → 자동 트리거)
- `createPublicClient()`: unstable_cache 내부용 (쿠키 없음, anon RLS만)
- 슬러그 리다이렉트: `/contests/[slug]` → `/contests/[id]` (미들웨어에서 DB 조회)
- 역할: `profiles.roles` 배열 — 복수 역할 지원 (admin은 전체 접근)
- 활동 로그: 인증된 사용자만 `/api/log`로 자동 기록
- UTM 추적: 세션당 1회 `/api/utm`으로 자동 전송
