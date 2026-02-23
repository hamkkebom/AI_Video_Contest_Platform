# AI Video Contest - Agent Instructions

## Language
- 사용자와의 모든 대화는 반드시 **한국어**로 진행한다.
- 코드 변수명, 함수명은 영어로 유지한다.
- 코드 주석은 **한국어**로 작성한다.
- 커밋 메시지는 영어로 유지한다.

## Project Context
- 프로젝트: AI 영상 공모전 플랫폼 (꿈플) — 실제 운영 서비스
- 프레임워크: Next.js 15 App Router (TypeScript)
- 패키지 매니저: Bun
- 스타일링: Tailwind CSS v4 (CSS-first, `app/globals.css`)
- UI 컴포넌트: shadcn/ui
- 테마: next-themes, `data-theme` 속성 사용 (light/dark/signature)

## Conventions
- 이 프로젝트는 **실제 운영 서비스**이다. 프로덕션 품질 코드를 유지할 것.
- Supabase 기반 백엔드/인증이 연동되어 있다.
- Mock 데이터는 `lib/mock/index.ts`에서 관리 (개발/데모 용도).
- 역할 전환은 Supabase profiles 테이블의 roles 필드 기반.
- `components/ui/` 는 shadcn 프리미티브 — 직접 수정 금지, CLI로만 추가.

## Commands
- Dev server: `bun run dev`
- Build: `bun run build`
- Type check: `npx tsc --noEmit`
