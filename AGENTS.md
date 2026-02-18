# AI Video Contest - Agent Instructions

## Language
- 사용자와의 모든 대화는 반드시 **한국어**로 진행한다.
- 코드 변수명, 함수명은 영어로 유지한다.
- 코드 주석은 **한국어**로 작성한다.
- 커밋 메시지는 영어로 유지한다.

## Project Context
- 프로젝트: AI 영상 공모전 플랫폼 (함께봄) 목업
- 프레임워크: Next.js 15 App Router (TypeScript)
- 패키지 매니저: Bun
- 스타일링: Tailwind CSS v4 (CSS-first, `app/globals.css`)
- UI 컴포넌트: shadcn/ui
- 테마: next-themes, `data-theme` 속성 사용 (light/dark/signature)

## Conventions
- 이 프로젝트는 목업(mockup)이다. 실제 백엔드/인증 구현 금지.
- Mock 데이터는 `lib/mock/index.ts`에서 관리.
- 역할 전환은 `DEMO_ROLES` (config/constants.ts) 기반 클라이언트 상태.
- `components/ui/` 는 shadcn 프리미티브 — 직접 수정 금지, CLI로만 추가.

## Commands
- Dev server: `bun run dev`
- Build: `bun run build`
- Type check: `npx tsc --noEmit`
