# Components — Agent Instructions

## Overview
61개 파일, 12개 카테고리. shadcn/ui 프리미티브 + 기능별 컴포넌트.

## Structure
```
components/
├── ui/              # shadcn/ui 프리미티브 (16개) — 직접 수정 금지
├── common/          # 공유 유틸리티 (AI 도구 칩, 플로팅 버튼, 좋아요, 페이월)
├── layout/          # 전역 헤더(456줄), 푸터
├── dashboard/       # 역할별 대시보드 (admin, host, judge, participant) — 10개
├── contest/         # 공모전 상세 (카운트다운, 캐러셀, 미디어탭) — 6개
├── contests/        # 특정 공모전 랜딩 (arirang/) — 섹션 기반 + i18n
├── landing/         # 홈페이지 캐러셀 (히어로, 공모전, 작품) — 3개
├── auth/            # 역할 가드, 세션 타임아웃 가드
├── tracking/        # UTM 추적, 활동 추적
├── popup/           # 사이트 팝업 (localStorage 기반 dismiss)
├── profile/         # 프로필 편집 폼 (839줄)
└── submissions/     # 제출 액션 버튼
```

## Where to Look

| 컴포넌트 추가 시 | 위치 | 기준 |
|------------------|------|------|
| 모든 페이지에서 재사용 | `common/` | 2개+ 기능에서 공유 |
| 특정 기능 전용 | `contest/`, `dashboard/` 등 | 단일 도메인 |
| 특정 공모전 랜딩 | `contests/[이름]/` | arirang 패턴 참조 |
| shadcn 컴포넌트 추가 | `ui/` | CLI로만: `npx shadcn@latest add [name]` |
| 라우트 전용 (admin) | `app/(admin)/.../_components/` | Next.js 로컬 컴포넌트 |

## Conventions

### 클라이언트 컴포넌트
- 거의 모든 컴포넌트가 `'use client'` — 상태/훅/이벤트 사용 시 필수
- 서버 컴포넌트는 `app/` 라우트 레벨에서만 (page.tsx, layout.tsx)

### shadcn/ui 규칙
- `components/ui/` 절대 직접 수정 금지
- 추가: `npx shadcn@latest add [component-name]`
- 설정: `components.json` (RSC 지원, Lucide 아이콘, path alias `@/`)
- 현재: button, card, input, label, textarea, avatar, badge, dialog, dropdown-menu, sheet, select, carousel, table, search-input, sort-select, auto-fit-title

### 스타일링
- Tailwind 시맨틱 클래스 우선: `bg-background`, `text-foreground`, `bg-primary`
- `cn()` 유틸로 클래스 병합 (`lib/utils.ts`)
- CVA (Class Variance Authority): button 등 variant 컴포넌트에 사용
- 테마 동적 전환 필요 시만 `useTheme()` 훅 사용

### Arirang 패턴 (contests/arirang/)
- 섹션 기반: `sections/HeroSection.tsx`, `ScheduleSection.tsx` 등
- 다국어: `lang-context.tsx` + `translations.ts` (ko/en)
- 커스텀 CSS: `arirang-landing.css`
- 새 공모전 랜딩 추가 시 이 패턴을 복제

## Anti-Patterns
- `components/ui/` 직접 편집
- 공통 컴포넌트를 기능별 폴더에 생성 (common/ 사용)
- 서버 컴포넌트에서 useState/useEffect 사용 (빌드 실패)
- `useAuth()` 대신 직접 Supabase 클라이언트 생성
