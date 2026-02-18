# Fix Role-Switch Key Mismatch in Header

## TL;DR

> **Quick Summary**: `header.tsx`의 역할 전환 기능에서 `DEMO_ROLES` 키(`participant`)와 `DemoRoles` 인터페이스 키(`isParticipant`) 간 불일치로 인해 역할 전환이 작동하지 않는 버그를 수정한다.
> 
> **Deliverables**:
> - `components/layout/header.tsx` 수정 (키 매핑 버그 해결)
> - 역할별 GNB 메뉴 전환 정상 작동
> - 역할 드롭다운 활성 표시 정상 작동
> - 역할 트리거 버튼 아이콘 정상 변경
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO — 단일 태스크
> **Critical Path**: Task 1 (fix) → Final Verification

---

## Context

### Original Request
영상공모전 플랫폼에서 역할별로 화면(GNB 메뉴)이 바뀌지 않는 문제 확인 및 수정 요청.

### Interview Summary
**Key Discussions**:
- 원인 분석: `DEMO_ROLES` 키(`participant`, `host`, `judge`, `admin`)와 `DemoRoles` 인터페이스 키(`isParticipant`, `isHost`, `isJudge`, `isAdmin`) 간 불일치
- `as keyof DemoRoles` 타입 캐스팅이 런타임 불일치를 숨기고 있었음
- 단일 파일(`header.tsx`) 수정으로 해결 가능

**Research Findings**:
- `DemoRolePanel` (common/demo-role-panel.tsx)은 `UserRole` 타입을 올바르게 사용하고 있으나, Header에서는 사용되지 않는 별도 드롭다운 구현 존재
- 모든 역할별 페이지가 정상 존재: `(admin)/admin/*`, `(host)/dashboard/*`, `(judge)/judging/*`, `(public)/*`

### Metis Review
**Identified Gaps** (addressed):
- Q: 역할 전환 시 자동 네비게이션(router.push) 필요 여부 → 스코프 밖 (현재는 메뉴 변경만)
- Q: DemoRolePanel import가 dead code → 이번 수정에서 건드리지 않음
- Q: 참가자 메뉴 중복 여부 → 확인 결과 정상
- 수정 방식: Approach B 채택 (직접 비교 — 가장 단순)

---

## Work Objectives

### Core Objective
`header.tsx`의 `handleRoleChange` 함수와 역할 드롭다운에서 키 매핑 불일치를 수정하여, 역할 전환 시 GNB 메뉴가 올바르게 변경되도록 한다.

### Concrete Deliverables
- `components/layout/header.tsx` — 버그 수정 완료

### Definition of Done
- [ ] 4가지 역할 모두 클릭 시 GNB 메뉴가 역할에 맞게 변경됨
- [ ] 역할 드롭다운에서 현재 활성 역할에 `bg-accent` 클래스 적용됨
- [ ] 역할 트리거 버튼 아이콘이 역할에 맞게 변경됨 (🎬/🏢/⚖️/🛡️)
- [ ] `npx tsc --noEmit` 에러 없음
- [ ] 수정된 파일: `header.tsx` 1개만

### Must Have
- `handleRoleChange`가 DEMO_ROLES 키(`participant` 등)를 올바르게 처리
- 역할 드롭다운 활성 표시 정상 동작
- 타입 안전성 유지 (unsafe cast 제거)

### Must NOT Have (Guardrails)
- ❌ `lib/types/index.ts`의 `DemoRoles` 인터페이스 수정 금지
- ❌ `config/constants.ts`의 `DEMO_ROLES` 상수 수정 금지
- ❌ 역할 전환 시 `router.push` 자동 네비게이션 추가 금지
- ❌ 역할 상태를 Context/Provider로 리팩토링 금지
- ❌ `getMenuItems` 함수 수정 금지
- ❌ `DemoRolePanel` import 제거/수정 금지
- ❌ 매핑 유틸리티 함수 추출 금지 (인라인으로 충분)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (테스트 프레임워크 미설치)
- **Automated tests**: None
- **Framework**: none

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

| Deliverable Type | Verification Tool | Method |
|------------------|-------------------|--------|
| Frontend/UI | Playwright (playwright skill) | Navigate, interact, assert DOM, screenshot |
| TypeScript Build | Bash | `npx tsc --noEmit` |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — single task):
└── Task 1: Fix role-switching key mismatch in header.tsx [quick]

Wave FINAL (After Task 1 — verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
└── Task F3: Real manual QA via Playwright (unspecified-high)

Critical Path: Task 1 → F1-F3
Parallel Speedup: F1, F2, F3 run in parallel
Max Concurrent: 3 (Final wave)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|------------|--------|------|
| 1 | — | F1, F2, F3 | 1 |
| F1 | 1 | — | FINAL |
| F2 | 1 | — | FINAL |
| F3 | 1 | — | FINAL |

### Agent Dispatch Summary

| Wave | # Parallel | Tasks -> Agent Category |
|------|------------|----------------------|
| 1 | **1** | T1 -> `quick` |
| FINAL | **3** | F1 -> `oracle`, F2 -> `unspecified-high`, F3 -> `unspecified-high` |

---

## TODOs

- [ ] 1. Fix role-switching key mismatch in header.tsx

  **What to do**:
  1. **`handleRoleChange` 함수 수정** (line 108-115):
     - 파라미터 타입을 `keyof DemoRoles` 에서 `string` (혹은 `UserRole` 임포트하여 사용)으로 변경
     - 비교 대상을 `'isParticipant'` → `'participant'`로 변경 (host, judge, admin 동일)
     - 수정 전: `isParticipant: role === 'isParticipant'`
     - 수정 후: `isParticipant: role === 'participant'`
  2. **역할 드롭다운 active indicator 수정** (line 208):
     - `demoRoles[key as keyof DemoRoles]` → 올바른 키 매핑 적용
     - 인라인 매핑 객체 사용: `const demoRoleKeyMap: Record<string, keyof DemoRoles> = { participant: 'isParticipant', host: 'isHost', judge: 'isJudge', admin: 'isAdmin' };`
     - `demoRoles[demoRoleKeyMap[key]]`로 활성 상태 확인
  3. **unsafe `as keyof DemoRoles` 캐스트 제거** (line 207, 208):
     - line 207: `handleRoleChange(key as keyof DemoRoles)` → `handleRoleChange(key)`
     - line 208: `demoRoles[key as keyof DemoRoles]` → `demoRoles[demoRoleKeyMap[key]]`
  4. **TypeScript 빌드 검증**: `npx tsc --noEmit`

  **Must NOT do**:
  - `DemoRoles` 인터페이스 수정 금지
  - `DEMO_ROLES` 상수 수정 금지
  - `getMenuItems` 함수 수정 금지
  - `router.push` 자동 네비게이션 추가 금지
  - import 추가/제거 금지 (기존 import 유지)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 파일, 10줄 미만 변경, 명확한 수정 방향
  - **Skills**: [`playwright`]
    - `playwright`: UI 기반 역할 전환 동작 검증 필요
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: UI 디자인 변경 없음, 로직 수정만 필요
    - `git-master`: 단일 커밋, 기본 git 사용이면 충분

  **Parallelization**:
  - **Can Run In Parallel**: NO (단일 태스크)
  - **Parallel Group**: Wave 1 (단독)
  - **Blocks**: F1, F2, F3 (Final verification wave)
  - **Blocked By**: None (즉시 시작 가능)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `components/common/demo-role-panel.tsx:13-17` — `UserRole` 타입으로 DEMO_ROLES 키를 올바르게 사용하는 패턴. 이 파일의 `roleKeys = Object.keys(DEMO_ROLES) as UserRole[]` 패턴 참고
  - `components/layout/header.tsx:22-67` — `getMenuItems(roles: DemoRoles)` 함수가 `roles.isAdmin`, `roles.isJudge` 등 DemoRoles 인터페이스 키를 올바르게 사용하는 패턴

  **API/Type References** (contracts to implement against):
  - `lib/types/index.ts:1` — `UserRole = "participant" | "host" | "judge" | "admin"` — DEMO_ROLES 키와 동일한 타입
  - `lib/types/index.ts:9-14` — `DemoRoles` 인터페이스 정의 — `isParticipant`, `isHost`, `isJudge`, `isAdmin` 불리언 키
  - `config/constants.ts:1-22` — `DEMO_ROLES` 상수 — `participant`, `host`, `judge`, `admin` 키

  **Buggy Code References** (what to fix):
  - `components/layout/header.tsx:108-115` — **`handleRoleChange` 함수**: 파라미터 타입 `keyof DemoRoles`가 잘못됨, 비교 대상이 `'isParticipant'` 등인데 실제 입력은 `'participant'` 등
  - `components/layout/header.tsx:207` — **드롭다운 onClick**: `handleRoleChange(key as keyof DemoRoles)` — unsafe cast가 런타임 불일치 은폐
  - `components/layout/header.tsx:208` — **활성 표시**: `demoRoles[key as keyof DemoRoles]` — 키 불일치로 항상 undefined

  **WHY Each Reference Matters**:
  - `demo-role-panel.tsx` — 올바른 키 사용 패턴의 정답지. 이 컴포넌트는 `UserRole` 타입으로 DEMO_ROLES를 순회하며 정상 동작함
  - `lib/types/index.ts` — 두 가지 타입 체계(`UserRole` vs `DemoRoles`)의 관계를 이해해야 올바른 매핑 가능
  - `header.tsx:108-115` — 실제 수정 대상 코드. 비교 문자열만 변경하면 됨

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  - [ ] `npx tsc --noEmit` → 에러 0건
  - [ ] 변경된 파일이 `components/layout/header.tsx` 1개뿐

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 관리자 역할 전환 (Happy path)
    Tool: Playwright (playwright skill)
    Preconditions: dev server 실행 중 (http://localhost:3000)
    Steps:
      1. http://localhost:3000 접속
      2. 헤더 우측 "🎬 역할" 버튼 클릭 (selector: button:has-text("역할"))
      3. 드롭다운에서 "🛡️ 관리자" 클릭
      4. GNB 네비게이션에 "관리자" 텍스트가 포함된 링크(href="/admin/dashboard") 존재 확인
      5. "🎬 역할" 버튼 대신 "🛡️ 역할" 버튼으로 아이콘 변경 확인
      6. 스크린샷 캡처
    Expected Result: GNB에 "관리자" 메뉴 노출, 트리거 버튼 아이콘 🛡️
    Failure Indicators: GNB에 "관리자" 링크 없음, 아이콘이 여전히 🎬
    Evidence: .sisyphus/evidence/task-1-admin-role-switch.png

  Scenario: 주최자 역할 전환 (Happy path)
    Tool: Playwright (playwright skill)
    Preconditions: dev server 실행 중
    Steps:
      1. 헤더 우측 역할 버튼 클릭
      2. 드롭다운에서 "🏢 주최자" 클릭
      3. GNB에 "대시보드" 텍스트가 포함된 링크(href="/dashboard") 존재 확인
      4. 트리거 버튼 아이콘이 🏢로 변경 확인
      5. 스크린샷 캡처
    Expected Result: GNB에 "대시보드" 메뉴 노출, 트리거 버튼 아이콘 🏢
    Failure Indicators: GNB에 "대시보드" 링크 없음
    Evidence: .sisyphus/evidence/task-1-host-role-switch.png

  Scenario: 심사위원 역할 전환 (Happy path)
    Tool: Playwright (playwright skill)
    Preconditions: dev server 실행 중
    Steps:
      1. 헤더 우측 역할 버튼 클릭
      2. 드롭다운에서 "⚖️ 심사위원" 클릭
      3. GNB에 "심사" 텍스트가 포함된 링크(href="/judging") 존재 확인
      4. 트리거 버튼 아이콘이 ⚖️로 변경 확인
      5. 스크린샷 캡처
    Expected Result: GNB에 "심사" 메뉴 노출, 트리거 버튼 아이콘 ⚖️
    Failure Indicators: GNB에 "심사" 링크 없음
    Evidence: .sisyphus/evidence/task-1-judge-role-switch.png

  Scenario: 참가자 역할로 복귀 (Happy path)
    Tool: Playwright (playwright skill)
    Preconditions: 현재 관리자 역할 상태
    Steps:
      1. 헤더 우측 역할 버튼 클릭
      2. 드롭다운에서 "🎬 참가자" 클릭
      3. GNB에 "공모전" 텍스트가 포함된 링크(href="/contests") 존재 확인
      4. GNB에 "관리자" 링크가 없음 확인
      5. 트리거 버튼 아이콘이 🎬로 변경 확인
      6. 스크린샷 캡처
    Expected Result: GNB에 "공모전" 메뉴 노출, "관리자" 메뉴 사라짐, 아이콘 🎬
    Failure Indicators: "관리자" 메뉴 여전히 노출
    Evidence: .sisyphus/evidence/task-1-participant-role-switch.png

  Scenario: 활성 역할 하이라이트 (Happy path)
    Tool: Playwright (playwright skill)
    Preconditions: dev server 실행 중
    Steps:
      1. 역할 버튼 클릭하여 드롭다운 열기
      2. "🛡️ 관리자" 클릭
      3. 다시 역할 버튼 클릭하여 드롭다운 열기
      4. "관리자" 항목에 bg-accent 클래스 존재 확인
      5. 다른 3개 항목에는 bg-accent 클래스 없음 확인
      6. 스크린샷 캡처
    Expected Result: 현재 선택된 "관리자"만 bg-accent 하이라이트
    Failure Indicators: 모든 항목에 하이라이트 없음 또는 잘못된 항목 하이라이트
    Evidence: .sisyphus/evidence/task-1-active-highlight.png

  Scenario: TypeScript 빌드 검증 (Verification)
    Tool: Bash
    Preconditions: 프로젝트 루트
    Steps:
      1. npx tsc --noEmit 실행
      2. 종료 코드 0 확인
    Expected Result: exit code 0, 에러 메시지 없음
    Failure Indicators: 타입 에러 출력
    Evidence: .sisyphus/evidence/task-1-tsc-check.txt
  ```

  **Evidence to Capture:**
  - [ ] task-1-admin-role-switch.png
  - [ ] task-1-host-role-switch.png
  - [ ] task-1-judge-role-switch.png
  - [ ] task-1-participant-role-switch.png
  - [ ] task-1-active-highlight.png
  - [ ] task-1-tsc-check.txt

  **Commit**: YES
  - Message: `fix(header): resolve role-switch key mismatch between DEMO_ROLES and DemoRoles`
  - Files: `components/layout/header.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 3 review agents run in PARALLEL. ALL must APPROVE. Rejection -> fix -> re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify: (1) "Must Have" — `handleRoleChange`가 4가지 역할 모두 올바르게 처리하는지 코드 확인, (2) "Must NOT Have" — `lib/types/index.ts`, `config/constants.ts`, `getMenuItems` 함수가 변경되지 않았는지 확인, (3) Evidence 파일 6개 존재 여부.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit`. Review `header.tsx` 변경 내용: `as any`/`@ts-ignore` 없는지, unsafe cast(`as keyof DemoRoles`) 제거 확인, 불필요한 코드 추가 없는지. `git diff --name-only`로 header.tsx만 변경되었는지 확인.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from Task 1 — 4가지 역할 전환 + 활성 하이라이트 + TypeScript 빌드. 모바일 메뉴(Sheet)에서도 메뉴 항목이 역할에 따라 변경되는지 추가 확인. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(header): resolve role-switch key mismatch between DEMO_ROLES and DemoRoles` | components/layout/header.tsx | `npx tsc --noEmit` |

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit  # Expected: exit 0, no errors
```

### Final Checklist
- [ ] 4가지 역할 전환 모두 GNB 메뉴 정상 변경
- [ ] 역할 드롭다운 활성 하이라이트 정상 표시
- [ ] 트리거 버튼 아이콘 역할별 정상 변경
- [ ] TypeScript 빌드 에러 없음
- [ ] `header.tsx` 외 파일 변경 없음
- [ ] unsafe `as keyof DemoRoles` 캐스트 제거됨
