# Landing UX Fixes v3 — 12 Feedback Items

## TL;DR

> **Quick Summary**: Implement 12 UI/UX feedback items for the 함께봄 AI Video Contest Platform mockup. Covers header symmetry/profile/auth states, dark theme CSS fix, dummy images, carousel improvements, section spacing/colors, footer text changes, and terms/privacy alignment.
> 
> **Deliverables**:
> - Fixed dark theme (Tailwind v4 CSS specificity bug)
> - AI-generated placeholder images in `public/images/`
> - Header: symmetric padding, centered nav, profile avatar+dropdown, guest state
> - Hero carousel: real images, aligned arrows, autoplay timer reset, fullbleed
> - Contest carousel: real images replacing gradient placeholders
> - Landing page: zero contest-gallery gap, warm education section, CTA fixes
> - Footer: updated brand/service text
> - Terms/Privacy: centered headings, repositioned "최종수정일"
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves (3 → 7 → 4 tasks)
> **Critical Path**: Task 1 (dark theme) → Task 4 (header) → Task 11 (final QA)

---

## Context

### Original Request
User reviewed the completed mockup and provided 12 UI/UX feedback items (numbered 1-5, 7-12; no #6). These range from CSS fixes to new component features (profile dropdown, guest state) to content/text changes.

### Interview Summary
**Key Discussions**:
- Image source: User chose **AI-generated local images** over picsum/unsplash
- Dark theme bug: Confirmed root cause — Tailwind v4 `@theme inline` specificity overrides `[data-theme="dark"]` CSS vars
- Profile/auth: Add "비로그인" guest role to demo bar, show login button in guest state
- Education section: Orange text + warm gradient (replacing indigo/purple)
- Footer: Match header brand ("AI 영상 공모전"), remove "대행" terminology

**Research Findings**:
- `globals.css` lines 4-30: `@theme inline` block defines light theme tokens at `:root` level with layer priority
- `globals.css` lines 32-52: `[data-theme="dark"]` is a plain CSS rule outside `@theme`, with lower layer priority
- `header.tsx`: Logo `flex-shrink-0`, nav `flex-1 justify-center`, right actions `flex-shrink-0` — centering is broken by unequal left/right element widths
- `hero-carousel.tsx`: Arrows at `left-4 md:left-8`, autoplay `stopOnInteraction: false`, slides use gradient backgrounds
- `contest-carousel.tsx`: Cards use `cardGradients` array with Film icon placeholder
- `DEMO_ROLES` has 4 roles, no guest concept. `DemoRoles` interface has 4 boolean flags.

### Metis Review
**Identified Gaps** (addressed):
- Dark theme fix approach: Defaulted to `@layer base` with specificity override — safest approach
- Footer brand text ambiguity: Defaulted to matching header brand "AI 영상 공모전"  
- Guest state integration: Defaulted to 5th option in demo role bar
- Image specs: Defaulted to 6 hero (1920×600) + 5 contest (800×320)
- Hero "fullbleed": Defaulted to removing top padding + `object-cover` images
- Terms "center-aligned": Defaulted to centered headings, left-aligned body text

---

## Work Objectives

### Core Objective
Polish the landing page and shared components by implementing all 12 user feedback items, fixing the dark theme bug, and replacing placeholder graphics with actual images.

### Concrete Deliverables
- `app/globals.css` — Fixed dark theme CSS override
- `public/images/hero-{1-6}.jpg` — 6 hero banner images
- `public/images/contest-{1-5}.jpg` — 5 contest card images
- `config/constants.ts` — Guest role added to DEMO_ROLES
- `lib/types/index.ts` — Guest flag added to DemoRoles, UserRole
- `components/ui/avatar.tsx` — Avatar component (shadcn)
- `components/layout/header.tsx` — Symmetric padding, centered nav, profile dropdown, guest state
- `components/landing/hero-carousel.tsx` — Images, arrow alignment, autoplay reset, fullbleed
- `components/landing/contest-carousel.tsx` — Images replacing gradients
- `app/(public)/page.tsx` — Zero gap, warm education section, CTA text/circle fixes
- `components/layout/footer.tsx` — Brand + service text changes
- `app/(public)/terms/page.tsx` — Centered headings, 최종수정일 repositioned
- `app/(public)/privacy/page.tsx` — Same as terms

### Definition of Done
- [ ] `npm run build` exits with code 0
- [ ] All 3 themes (light, dark, signature) render correctly
- [ ] All 5 demo roles (guest, participant, host, judge, admin) switch correctly
- [ ] No gradient placeholder visible anywhere on landing page
- [ ] Playwright screenshots confirm all visual changes

### Must Have
- Dark theme must actually change background/text colors when selected
- Guest state must show "로그인" button instead of profile/dashboard
- Hero images must be fullbleed (no top padding gap below header)
- "대행" word must not appear anywhere in the footer
- "제작 의뢰하기" must replace "대행 의뢰하기" in agency CTA
- Education section "EDUCATION PROGRAM" text must be orange
- Terms/Privacy "최종수정일" must be at bottom-right, not in header

### Must NOT Have (Guardrails)
- MUST NOT create any new pages or routes
- MUST NOT implement real authentication — this is a mockup
- MUST NOT add state management libraries (Redux, Zustand, etc.)
- MUST NOT modify `components/ui/` shadcn primitives (except adding new avatar.tsx via shadcn CLI)
- MUST NOT change `ThemeProvider` attribute from `data-theme` to `class`
- MUST NOT add external image CDN dependencies (picsum, unsplash)
- MUST NOT refactor overall page layout, routing structure, or mock data schema
- MUST NOT add CSS frameworks or preprocessors beyond existing setup
- MUST NOT over-engineer profile dropdown (only 3 items: theme toggle, profile edit link, logout)
- MUST NOT add login modal, registration flow, or OAuth — guest "로그인" just switches to participant role

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (mockup project, no test framework configured)
- **Automated tests**: NONE
- **Framework**: N/A
- **QA Method**: Agent-Executed QA Scenarios via Playwright (visual) + Build verification

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

| Deliverable Type | Verification Tool | Method |
|------------------|-------------------|--------|
| CSS/Theme fixes | Playwright | Toggle themes, screenshot, assert visual changes |
| Component changes | Playwright | Navigate, interact, screenshot, assert DOM elements |
| Text/content changes | Playwright | Navigate, screenshot, assert text presence/absence |
| Image assets | Bash (dir/ls) | Verify file existence and size |
| Build integrity | Bash (npm run build) | Exit code 0, no errors |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation, 3 parallel tasks):
├── Task 1: Fix Dark Theme CSS Override [deep]
├── Task 2: Create AI-Generated Placeholder Images [quick]
└── Task 3: Add Guest Role Type + Install Avatar Component [quick]

Wave 2 (After Wave 1 — core changes, 7 parallel tasks):
├── Task 4: Header: Padding + Nav Centering + Profile/Auth States [visual-engineering]
├── Task 5: Hero Carousel: Images + Arrows + Autoplay + Fullbleed [visual-engineering]
├── Task 6: Contest Carousel: Replace Gradients with Images [quick]
├── Task 7: Landing: Zero Gap + Education Section Colors [visual-engineering]
├── Task 8: Agency CTA: Circles + Text + Centering [quick]
├── Task 9: Footer: Brand + Service Text Changes [quick]
└── Task 10: Terms/Privacy: Alignment + 최종수정일 Reposition [quick]

Wave 3 (After Wave 2 — verification, 4 parallel review tasks):
├── Task F1: Plan Compliance Audit [oracle]
├── Task F2: Code Quality Review [unspecified-high]
├── Task F3: Real Manual QA [unspecified-high]
└── Task F4: Scope Fidelity Check [deep]

Critical Path: Task 1 → Task 4 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|------------|--------|------|
| 1. Dark Theme Fix | — | 4, 5, 6, 7, 8, 9, 10 | 1 |
| 2. Create Images | — | 5, 6 | 1 |
| 3. Guest Role + Avatar | — | 4 | 1 |
| 4. Header/Profile | 1, 3 | F1-F4 | 2 |
| 5. Hero Carousel | 1, 2 | F1-F4 | 2 |
| 6. Contest Carousel | 1, 2 | F1-F4 | 2 |
| 7. Spacing + Education | 1 | F1-F4 | 2 |
| 8. Agency CTA | 1 | F1-F4 | 2 |
| 9. Footer | 1 | F1-F4 | 2 |
| 10. Terms/Privacy | 1 | F1-F4 | 2 |
| F1. Plan Compliance | 4-10 | — | 3 |
| F2. Code Quality | 4-10 | — | 3 |
| F3. Real Manual QA | 4-10 | — | 3 |
| F4. Scope Fidelity | 4-10 | — | 3 |

### Agent Dispatch Summary

| Wave | # Parallel | Tasks → Agent Category |
|------|------------|----------------------|
| 1 | **3** | T1 → `deep`, T2 → `quick`, T3 → `quick` |
| 2 | **7** | T4 → `visual-engineering`, T5 → `visual-engineering`, T6 → `quick`, T7 → `visual-engineering`, T8 → `quick`, T9 → `quick`, T10 → `quick` |
| 3 | **4** | F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep` |

---

## TODOs

- [ ] 1. Fix Dark Theme CSS Override (Tailwind v4 Specificity Bug)

  **What to do**:
  - In `app/globals.css`, the `[data-theme="dark"]` block (lines 32-52) is a plain CSS rule outside `@theme inline`, which means Tailwind v4's generated `:root` properties from `@theme inline` take precedence. The dark theme variables never actually override.
  - **Fix approach**: Restructure `globals.css` so that `@theme inline` only contains CSS variable references (not hardcoded values), and all theme values (light/dark/signature) are defined as plain CSS custom properties at `:root` and `[data-theme="..."]` selectors inside `@layer base`. This ensures Tailwind resolves the tokens while the actual values come from the CSS cascade where `[data-theme]` properly overrides.
  - Alternative simpler approach: Keep `@theme inline` as-is but wrap dark/signature overrides in a specificity-boosted selector or add `!important` to the overrides inside `@layer base { [data-theme="dark"] { ... } }`.
  - **Whichever approach you choose**: Verify all 3 themes work (light, dark, signature). The key test is: when `data-theme="dark"` is set on `<html>`, `--color-background` must resolve to `oklch(0.145 0.024 266)`, NOT `oklch(0.985 0.002 247)`.
  - Also fix `body { color-scheme: light; }` to be dynamic: `[data-theme="dark"] body { color-scheme: dark; }` (this already exists at line 87-89 but verify it works with the fix).

  **Must NOT do**:
  - MUST NOT change `ThemeProvider` attribute from `data-theme` to `class`
  - MUST NOT modify any `components/ui/*.tsx` shadcn primitives
  - MUST NOT remove the `signature` theme
  - MUST NOT change the oklch color values themselves — only fix the cascade/specificity

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: CSS specificity in Tailwind v4 `@theme inline` is a nuanced problem requiring careful investigation and testing of multiple approaches
  - **Skills**: [`playwright`]
    - `playwright`: Need to visually verify all 3 themes toggle correctly in browser
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed — this is a CSS architecture fix, not a visual design task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5, 6, 7, 8, 9, 10 (all Wave 2 tasks depend on themes working for QA)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `app/globals.css:4-30` — Current `@theme inline` block defining light theme tokens. This is what generates `:root` CSS properties with layer priority.
  - `app/globals.css:32-52` — Current `[data-theme="dark"]` block that FAILS to override. These are the dark theme values.
  - `app/globals.css:54-74` — `[data-theme="signature"]` block (also potentially affected by same specificity issue, though signature matches light values currently).
  - `app/globals.css:76-95` — `@layer base` block with `body` styles and `color-scheme` rule.

  **API/Type References**:
  - `app/layout.tsx:25` — `<ThemeProvider attribute="data-theme" defaultTheme="signature" enableSystem>` — this is how next-themes applies the theme attribute to `<html>`.

  **External References**:
  - Tailwind CSS v4 `@theme` documentation: https://tailwindcss.com/docs/theme — explains how `@theme inline` generates CSS custom properties
  - next-themes: uses `data-theme` attribute on `<html>` element to switch themes

  **WHY Each Reference Matters**:
  - `globals.css:4-30`: This is the ROOT CAUSE — `@theme inline` puts properties in a CSS layer that takes precedence
  - `globals.css:32-52`: These are the values that should apply but don't — your fix must make these override
  - `layout.tsx:25`: Confirms the theme attribute mechanism — don't change this, work within it

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Dark theme applies correctly
    Tool: Playwright
    Preconditions: Dev server running at http://localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Execute JS: document.documentElement.setAttribute('data-theme', 'dark')
      3. Wait 500ms for CSS to apply
      4. Get computed style of document.body for background-color
      5. Screenshot full page
    Expected Result: Background color is dark (oklch ~0.145), text is light. No white/light background visible.
    Failure Indicators: Background remains white/light, text remains dark
    Evidence: .sisyphus/evidence/task-1-dark-theme.png

  Scenario: Light theme still works after fix
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Execute JS: document.documentElement.setAttribute('data-theme', 'light')
      3. Wait 500ms
      4. Get computed style of body for background-color
      5. Screenshot full page
    Expected Result: Background is light (oklch ~0.985), text is dark
    Failure Indicators: Background is dark or colors are wrong
    Evidence: .sisyphus/evidence/task-1-light-theme.png

  Scenario: Signature theme still works after fix
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Execute JS: document.documentElement.setAttribute('data-theme', 'signature')
      3. Wait 500ms
      4. Screenshot full page
    Expected Result: Matches original signature theme appearance
    Evidence: .sisyphus/evidence/task-1-signature-theme.png

  Scenario: Theme toggle in header works
    Tool: Playwright
    Preconditions: Dev server running, page loaded
    Steps:
      1. Navigate to http://localhost:3000
      2. Click theme dropdown button (the Sun/Moon/Sparkles icon button in header right actions)
      3. Click "Dark" menu item
      4. Wait 1s for theme transition
      5. Screenshot full page
      6. Verify html element has data-theme="dark"
    Expected Result: Page switches to dark theme, background is dark
    Failure Indicators: No visual change, data-theme attribute not set
    Evidence: .sisyphus/evidence/task-1-theme-toggle.png
  ```

  **Evidence to Capture:**
  - [ ] task-1-dark-theme.png — Full page in dark theme
  - [ ] task-1-light-theme.png — Full page in light theme
  - [ ] task-1-signature-theme.png — Full page in signature theme
  - [ ] task-1-theme-toggle.png — After clicking dark in dropdown

  **Commit**: YES
  - Message: `fix(theme): resolve dark theme CSS override for Tailwind v4`
  - Files: `app/globals.css`
  - Pre-commit: `npm run build`

- [ ] 2. Create AI-Generated Placeholder Images

  **What to do**:
  - Create directory `public/images/` if it doesn't exist
  - Generate or create 11 placeholder images for the platform:
    - **6 hero banners** (`hero-1.jpg` through `hero-6.jpg`): 1920×600px, AI video contest themed (e.g., video production scenes, AI creativity, awards ceremonies, digital art). These will be used as full-width carousel slide backgrounds.
    - **5 contest cards** (`contest-1.jpg` through `contest-5.jpg`): 800×320px, individual contest themed (e.g., film production, creative tech, digital media). These will be used as contest card thumbnails.
  - **Image generation approach**: Use any available method to create visually appropriate images. Options:
    1. Use `canvas` API via Node.js script to generate gradient + text overlay images (fastest, guaranteed to work)
    2. Use placeholder image services to download and save locally
    3. Create simple but visually appealing colored backgrounds with SVG overlays
  - The images should look professional and appropriate for an AI video contest platform — NOT generic colored rectangles. At minimum, use interesting gradients with overlaid graphics/text.
  - All images must be saved in `public/images/` directory as `.jpg` files.

  **Must NOT do**:
  - MUST NOT use external CDN URLs — images must be local files
  - MUST NOT exceed 500KB per image (keep them web-optimized)
  - MUST NOT create more than exactly 11 images (6 hero + 5 contest)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Asset creation task — well-defined output, no complex logic
  - **Skills**: []
    - No special skills needed — file creation via bash/node
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for file creation
    - `frontend-ui-ux`: Not a design task, just asset generation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 5, 6 (hero and contest carousels need images)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `components/landing/hero-carousel.tsx:25-33` — `slideGradients` array shows 6 gradient entries — this is why we need exactly 6 hero images
  - `components/landing/contest-carousel.tsx:14-20` — `cardGradients` array shows 5 gradient entries — this is why we need exactly 5 contest card images
  - `components/landing/hero-carousel.tsx:126-132` — Current slide rendering with gradient div — shows the dimensions the hero images need to fill
  - `components/landing/contest-carousel.tsx:94-98` — Current card rendering with `h-40` gradient div — shows the card image height

  **WHY Each Reference Matters**:
  - `hero-carousel.tsx:25-33`: Tells you exactly how many hero images are needed (6) and the gradient styles they replace
  - `contest-carousel.tsx:14-20`: Tells you exactly how many contest images are needed (5)
  - The `h-40` class on contest cards means the image display area is 160px tall

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All hero images exist and are valid
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: ls -la public/images/hero-*.jpg
      2. Count files
      3. Check each file is > 10KB
    Expected Result: 6 files (hero-1.jpg through hero-6.jpg), each > 10KB
    Failure Indicators: Missing files, 0-byte files, wrong count
    Evidence: .sisyphus/evidence/task-2-hero-images-ls.txt

  Scenario: All contest images exist and are valid
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: ls -la public/images/contest-*.jpg
      2. Count files
      3. Check each file is > 10KB
    Expected Result: 5 files (contest-1.jpg through contest-5.jpg), each > 10KB
    Failure Indicators: Missing files, 0-byte files, wrong count
    Evidence: .sisyphus/evidence/task-2-contest-images-ls.txt

  Scenario: No extra images in directory
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: ls public/images/ | wc -l
    Expected Result: Exactly 11 files
    Failure Indicators: More or fewer than 11
    Evidence: .sisyphus/evidence/task-2-image-count.txt
  ```

  **Evidence to Capture:**
  - [ ] task-2-hero-images-ls.txt — ls output showing 6 hero images
  - [ ] task-2-contest-images-ls.txt — ls output showing 5 contest images
  - [ ] task-2-image-count.txt — Total image count = 11

  **Commit**: YES
  - Message: `feat(assets): add AI-generated placeholder images for hero and contest cards`
  - Files: `public/images/hero-{1-6}.jpg`, `public/images/contest-{1-5}.jpg`
  - Pre-commit: file count check

- [ ] 3. Add Guest Role Type + Install Avatar Component

  **What to do**:
  - **Step 1**: In `config/constants.ts`, add `guest` entry to `DEMO_ROLES`:
    ```typescript
    guest: {
      label: "비로그인",
      icon: "👤",
      description: "로그인하지 않은 게스트 상태"
    }
    ```
    Add it as the FIRST entry (before `participant`) so it appears first in the demo role bar.
  - **Step 2**: In `lib/types/index.ts`:
    - Add `"guest"` to `UserRole` type: `export type UserRole = "guest" | "participant" | "host" | "judge" | "admin";`
    - Add `isGuest: boolean` to `DemoRoles` interface
  - **Step 3**: Install shadcn avatar component: `npx shadcn@latest add avatar` (this will create `components/ui/avatar.tsx` and install `@radix-ui/react-avatar`). If the CLI prompts for options, use defaults.
  - **Step 4**: Verify `npm run build` passes after changes.

  **Must NOT do**:
  - MUST NOT modify any existing entries in `DEMO_ROLES`
  - MUST NOT change any component files — only types and constants
  - MUST NOT install packages beyond what shadcn avatar requires

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple type/constant additions + CLI command — well-defined, minimal files
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not a visual task
    - `playwright`: No visual verification needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 4 (header needs guest role type + avatar component)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `config/constants.ts:1-22` — Current `DEMO_ROLES` object with 4 roles. Add `guest` as a new entry following the same `{ label, icon, description }` pattern.
  - `lib/types/index.ts:1` — Current `UserRole` type union. Add `"guest"` to it.
  - `lib/types/index.ts:9-14` — Current `DemoRoles` interface with 4 boolean flags. Add `isGuest: boolean`.

  **API/Type References**:
  - `components/layout/header.tsx:11-12` — Imports `DEMO_ROLES` and `DemoRoles` — these are the consumers of the types you're modifying

  **WHY Each Reference Matters**:
  - `constants.ts:1-22`: You're adding a new entry here — follow the exact same structure
  - `types/index.ts:1`: The `UserRole` type must include `"guest"` for type safety
  - `types/index.ts:9-14`: The `DemoRoles` interface must include `isGuest` for the header component to use

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Guest role exists in constants
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: grep -n "guest" config/constants.ts
    Expected Result: "guest" key found in DEMO_ROLES with label "비로그인"
    Failure Indicators: No match found
    Evidence: .sisyphus/evidence/task-3-guest-constant.txt

  Scenario: DemoRoles type includes isGuest
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: grep -n "isGuest" lib/types/index.ts
    Expected Result: "isGuest: boolean" found in DemoRoles interface
    Failure Indicators: No match
    Evidence: .sisyphus/evidence/task-3-demo-roles-type.txt

  Scenario: Avatar component exists
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: ls components/ui/avatar.tsx
    Expected Result: File exists
    Failure Indicators: File not found
    Evidence: .sisyphus/evidence/task-3-avatar-exists.txt

  Scenario: Build passes
    Tool: Bash
    Preconditions: All changes applied
    Steps:
      1. Run: npm run build
    Expected Result: Exit code 0, no type errors
    Failure Indicators: Type errors mentioning DemoRoles, UserRole, or avatar
    Evidence: .sisyphus/evidence/task-3-build.txt
  ```

  **Evidence to Capture:**
  - [ ] task-3-guest-constant.txt
  - [ ] task-3-demo-roles-type.txt
  - [ ] task-3-avatar-exists.txt
  - [ ] task-3-build.txt

  **Commit**: YES
  - Message: `feat(auth): add guest role type and avatar component`
  - Files: `config/constants.ts`, `lib/types/index.ts`, `components/ui/avatar.tsx`, `package.json`
  - Pre-commit: `npm run build`

- [ ] 4. Header: Symmetric Padding + Nav Centering + Profile Dropdown + Guest Auth State

  **What to do**:
  This is the most complex task — it addresses feedback items #1, #2, and #5.

  **4a. Symmetric padding (Feedback #1)**:
  - The logo (left) and right actions area have different widths, causing the nav to not be truly centered.
  - Solution: Give both the logo container and the right actions container the same fixed `min-w` value. Measure the right actions area width (search + bell + theme + dashboard ≈ 280-320px on desktop) and apply `min-w-[300px]` (or similar) to BOTH left and right containers. This ensures `flex-1 justify-center` on the nav actually centers it.
  - The left container should left-align its content, and the right container should right-align (`ml-auto` or `justify-end`).

  **4b. Nav centering + font size (Feedback #2)**:
  - Change nav link text from `text-sm` to `text-base` (line 162 of header.tsx)
  - With the symmetric min-width containers from 4a, the nav should be truly centered.

  **4c. Dashboard button uniform width (Feedback #5a)**:
  - The dashboard button label varies by role: "관리자" (3 chars), "대시보드" (4 chars), "심사" (2 chars), "내 공모전" (4 chars)
  - Add a fixed `min-w-[6rem]` (or similar) and `justify-center` to the dashboard Button to ensure all labels have uniform button width.

  **4d. Profile avatar (Feedback #5b)**:
  - For logged-in roles (participant, host, judge, admin), add a circular Avatar component showing a mock profile image. Use a placeholder avatar image or initials.
  - Position: Between the theme toggle and the dashboard button (or wrap avatar + dashboard into a group).
  - Use the shadcn `Avatar`, `AvatarImage`, `AvatarFallback` components from `components/ui/avatar.tsx` (installed in Task 3).
  - Avatar size: `h-8 w-8` (matching the icon button size).

  **4e. Profile dropdown (Feedback #5c)**:
  - Wrap the Avatar in a `DropdownMenu` trigger.
  - Dropdown items:
    1. **Theme toggle**: Show Sun icon + "라이트" / Moon icon + "다크" / Sparkles icon + "시그니처" — three items that call `setTheme('light'|'dark'|'signature')`
    2. **Separator**
    3. **프로필 편집**: Link to `#` (no-op in mockup)
    4. **로그아웃**: Calls `handleRoleChange('guest')` to switch to guest state
  - **Remove the existing standalone theme dropdown** (lines 211-242 of current header.tsx) since theme selection is now inside the profile dropdown.

  **4f. Guest state (Feedback #5d + #5e)**:
  - Add `guest` to the demo role bar (it's now in `DEMO_ROLES` from Task 3).
  - When role is `guest`:
    - HIDE: profile avatar, profile dropdown, dashboard button
    - SHOW: a "로그인" Button that, when clicked, calls `handleRoleChange('participant')` (simulates logging in)
    - The "로그인" button should be `variant="default"` (filled), approximately the width of avatar + dashboard button combined.
  - Update `handleRoleChange` to handle `'guest'` key.
  - Update `demoRoleKeyMap` to include `guest: 'isGuest'`.
  - Update `roleIconMap` to include `guest` (use `User` icon from lucide-react or similar).
  - Update initial `demoRoles` state to include `isGuest: false`.
  - Update `getActiveRoleKey` and `getRoleDashboardLink` to handle guest.

  **Must NOT do**:
  - MUST NOT implement real auth or add auth libraries
  - MUST NOT create a login modal or registration page
  - MUST NOT add more than 3 items to profile dropdown (theme toggle group, profile edit, logout)
  - MUST NOT change the mobile Sheet menu structure fundamentally

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI component work with layout, dropdowns, conditional rendering, and responsive design
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Header layout, avatar integration, dropdown design
    - `playwright`: Visual verification of centering, responsive, dropdown behavior
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations in this task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 8, 9, 10)
  - **Blocks**: F1-F4 (final verification)
  - **Blocked By**: Task 1 (dark theme), Task 3 (guest role type + avatar)

  **References**:

  **Pattern References**:
  - `components/layout/header.tsx:146-154` — Current header container + logo layout. You'll modify the logo container to add `min-w-[...]`.
  - `components/layout/header.tsx:156-167` — Current nav section with `flex-1 justify-center` and `text-sm`. Change font to `text-base`.
  - `components/layout/header.tsx:169-250` — Current right actions area. You'll add profile avatar/dropdown here, remove standalone theme dropdown, add guest login button.
  - `components/layout/header.tsx:211-242` — Existing theme dropdown to be REMOVED (moved into profile dropdown).
  - `components/layout/header.tsx:244-250` — Dashboard button. Add `min-w` + `justify-center`.
  - `components/layout/header.tsx:74-109` — Component state + role handling. Add `isGuest` to state, update handlers.
  - `components/layout/header.tsx:32-37` — `getRoleDashboardLink` function. Add guest case.
  - `components/layout/header.tsx:42-47` — `getActiveRoleKey` function. Add guest case.
  - `components/layout/header.tsx:52-57` — `roleIconMap`. Add guest entry.
  - `components/layout/header.tsx:114-119` — `demoRoleKeyMap`. Add guest entry.

  **API/Type References**:
  - `lib/types/index.ts:9-14` — Updated `DemoRoles` interface (from Task 3) with `isGuest: boolean`
  - `config/constants.ts:1-22` — Updated `DEMO_ROLES` (from Task 3) with `guest` entry
  - `components/ui/avatar.tsx` — Avatar, AvatarImage, AvatarFallback (installed in Task 3)
  - `components/ui/dropdown-menu.tsx` — DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator (already imported)

  **WHY Each Reference Matters**:
  - `header.tsx:146-154`: This is where you add `min-w` to the logo container for symmetric centering
  - `header.tsx:211-242`: This entire theme dropdown gets DELETED — its functionality moves into the profile dropdown
  - `header.tsx:74-109`: All state management changes happen here — add `isGuest`, update handlers
  - Avatar component: Used for the profile circle image

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Nav is visually centered on desktop
    Tool: Playwright
    Preconditions: Dev server running, participant role active
    Steps:
      1. Navigate to http://localhost:3000
      2. Set viewport to 1440×900
      3. Screenshot the header area
      4. Measure: distance from left viewport edge to first nav item vs distance from last nav item to right viewport edge
    Expected Result: Left and right distances are approximately equal (within 20px)
    Failure Indicators: Nav visibly off-center
    Evidence: .sisyphus/evidence/task-4-nav-centered.png

  Scenario: Guest state shows login button
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Click "비로그인" button in the demo role bar
      3. Wait 500ms
      4. Screenshot header
      5. Assert: "로그인" button is visible in the header right area
      6. Assert: No avatar/profile image is visible
      7. Assert: No dashboard button is visible
    Expected Result: Only "로그인" button shows in right actions area
    Failure Indicators: Avatar visible, dashboard button visible, no login button
    Evidence: .sisyphus/evidence/task-4-guest-state.png

  Scenario: Profile dropdown has correct items
    Tool: Playwright
    Preconditions: Dev server running, participant role active
    Steps:
      1. Navigate to http://localhost:3000
      2. Click the profile avatar circle in the header
      3. Wait for dropdown to appear
      4. Screenshot the dropdown
      5. Assert: dropdown contains theme options (라이트/다크/시그니처)
      6. Assert: dropdown contains "프로필 편집"
      7. Assert: dropdown contains "로그아웃"
    Expected Result: Dropdown shows with 3 theme options + separator + profile edit + logout
    Failure Indicators: Dropdown doesn't open, missing items, wrong items
    Evidence: .sisyphus/evidence/task-4-profile-dropdown.png

  Scenario: Logout switches to guest state
    Tool: Playwright
    Preconditions: Dev server running, participant role active, profile dropdown open
    Steps:
      1. Navigate to http://localhost:3000
      2. Click avatar → click "로그아웃"
      3. Wait 500ms
      4. Assert: "비로그인" is now the active role in demo bar
      5. Assert: "로그인" button visible, avatar hidden
    Expected Result: Role switches to guest, login button appears
    Failure Indicators: Role doesn't change, avatar still visible
    Evidence: .sisyphus/evidence/task-4-logout-to-guest.png

  Scenario: Login button switches to participant
    Tool: Playwright
    Preconditions: Dev server running, guest role active
    Steps:
      1. Click "비로그인" in demo bar (if not already)
      2. Click "로그인" button
      3. Wait 500ms
      4. Assert: "참가자" is now the active role
      5. Assert: Avatar visible, dashboard button visible
    Expected Result: Role switches to participant, avatar + dashboard appear
    Evidence: .sisyphus/evidence/task-4-login-to-participant.png

  Scenario: Mobile header works correctly
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport to 375×812
      2. Navigate to http://localhost:3000
      3. Screenshot header
      4. Verify mobile menu hamburger is visible
      5. Click hamburger → verify menu opens
    Expected Result: Mobile layout intact, no overflow, menu works
    Failure Indicators: Layout broken, elements overflow, menu doesn't open
    Evidence: .sisyphus/evidence/task-4-mobile-header.png

  Scenario: Dashboard buttons have uniform width across roles
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport to 1440×900
      2. For each role (participant, host, judge, admin): click role in demo bar, screenshot header
      3. Measure dashboard button width in each screenshot
    Expected Result: All dashboard buttons have the same width (within 2px)
    Failure Indicators: Buttons have different widths per role
    Evidence: .sisyphus/evidence/task-4-uniform-buttons.png
  ```

  **Evidence to Capture:**
  - [ ] task-4-nav-centered.png
  - [ ] task-4-guest-state.png
  - [ ] task-4-profile-dropdown.png
  - [ ] task-4-logout-to-guest.png
  - [ ] task-4-login-to-participant.png
  - [ ] task-4-mobile-header.png
  - [ ] task-4-uniform-buttons.png

  **Commit**: YES
  - Message: `feat(header): symmetric padding, centered nav, profile dropdown, guest auth state`
  - Files: `components/layout/header.tsx`
  - Pre-commit: `npm run build`

- [ ] 5. Hero Carousel: Real Images + Arrow Alignment + Autoplay Timer Reset + Fullbleed

  **What to do**:
  This addresses feedback item #7 (3 sub-items) plus feedback item #3 (images) for the hero.

  **5a. Replace gradients with real images (Feedback #3)**:
  - Replace the gradient background divs in each slide with actual images from `public/images/hero-{1-6}.jpg`.
  - Use Next.js `<Image>` component (from `next/image`) with `fill`, `className="object-cover"`, `priority` for first slide.
  - Add a dark overlay (e.g., `bg-black/40` or gradient overlay) on top of the image so the white text remains readable.
  - Remove the `slideGradients` array since it's no longer needed.
  - Each slide's image should be `hero-{(index % 6) + 1}.jpg` (cycling through the 6 images).

  **5b. Arrow alignment to contest section edges (Feedback #7a)**:
  - Currently arrows are at `left-4 md:left-8` / `right-4 md:right-8` (relative to the full-width section).
  - They should align with the `max-w-6xl` container edges that the "진행 중인 공모전" section uses.
  - Solution: Wrap the arrows in a `div` with `container mx-auto max-w-6xl relative` positioned absolutely within the hero, then position arrows at `left-0` / `right-0` of that container (or `-left-4` / `-right-4` for slight outset). Or use CSS calc: `left-[max(1rem,calc((100%-72rem)/2))]`.

  **5c. Autoplay timer reset on manual navigation (Feedback #7b)**:
  - Currently: `stopOnInteraction: false` — autoplay continues regardless of manual clicks.
  - Change to: `stopOnInteraction: true` — autoplay stops on manual interaction.
  - In the arrow click handlers (`scrollPrev`/`scrollNext`) and dot click handlers (`scrollTo`), after the scroll action, call `autoplayRef.current?.reset()` to restart the autoplay timer from 0.
  - Store the autoplay plugin instance in a ref so you can call `.reset()` on it.

  **5d. Fullbleed image to top (Feedback #7c)**:
  - Remove top padding from the hero section. Currently it likely has `py-24 md:py-32` or similar padding on the content overlay.
  - The slide background image should extend from the very top of the section (right below the header) to the bottom.
  - The text content can remain vertically centered within the slide using flexbox.
  - Ensure the hero section has a fixed height (e.g., `h-[500px] md:h-[600px]`) so the images fill properly.

  **Must NOT do**:
  - MUST NOT modify `components/ui/carousel.tsx` shadcn primitive
  - MUST NOT add external image CDN dependencies
  - MUST NOT remove the dot navigation indicators
  - MUST NOT change the slide content (title, description, CTA button)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex visual component work — images, positioning, animations
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Image integration, arrow positioning, visual polish
    - `playwright`: Visual verification of image display, arrow positions
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7, 8, 9, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (dark theme), Task 2 (images)

  **References**:

  **Pattern References**:
  - `components/landing/hero-carousel.tsx:25-33` — `slideGradients` array to be REMOVED and replaced with image paths
  - `components/landing/hero-carousel.tsx:113-121` — Autoplay plugin configuration. Change `stopOnInteraction` and add reset logic.
  - `components/landing/hero-carousel.tsx:124-150` — Slide rendering with gradient background. Replace with `<Image>` component + dark overlay.
  - `components/landing/hero-carousel.tsx:152-172` — Arrow buttons. Reposition to align with `max-w-6xl` container.
  - `components/landing/hero-carousel.tsx:174-193` — Dot navigation. Keep as-is but ensure dots work with autoplay reset.

  **API/Type References**:
  - `embla-carousel-autoplay` — The autoplay plugin. Its instance has a `.reset()` method to restart the timer.
  - `next/image` — Next.js Image component for optimized image loading.

  **External References**:
  - embla-carousel-autoplay API: The plugin instance returned by `Autoplay()` has methods: `play()`, `stop()`, `reset()`.

  **WHY Each Reference Matters**:
  - `hero-carousel.tsx:25-33`: These gradients are replaced by images — know which lines to remove
  - `hero-carousel.tsx:113-121`: Autoplay config is THE critical section for timer reset behavior
  - `hero-carousel.tsx:124-150`: This is where gradient divs become `<Image>` components
  - `hero-carousel.tsx:152-172`: Arrow positioning is the primary layout change

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Hero shows real images instead of gradients
    Tool: Playwright
    Preconditions: Dev server running, images in public/images/
    Steps:
      1. Navigate to http://localhost:3000
      2. Screenshot the hero section
      3. Assert: no solid gradient background visible — actual image content shown
      4. Assert: text overlay is readable (dark overlay present)
    Expected Result: Real image visible as slide background with text overlay
    Failure Indicators: Gradient still showing, image missing, text unreadable
    Evidence: .sisyphus/evidence/task-5-hero-images.png

  Scenario: Hero section is fullbleed (no top gap)
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Get bounding rect of header bottom edge and hero section top edge
      3. Calculate gap between them
    Expected Result: Gap is 0px — hero starts immediately after header
    Failure Indicators: Visible gap/padding between header and hero
    Evidence: .sisyphus/evidence/task-5-hero-fullbleed.png

  Scenario: Arrows align with contest section container
    Tool: Playwright
    Preconditions: Dev server running, viewport 1440×900
    Steps:
      1. Navigate to http://localhost:3000
      2. Get hero left arrow's left position
      3. Get contest section container's left edge position
      4. Compare positions
    Expected Result: Arrow left position ≈ contest container left edge (within 20px)
    Failure Indicators: Arrows far from container edges
    Evidence: .sisyphus/evidence/task-5-arrow-alignment.png

  Scenario: Manual navigation resets autoplay timer
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait 4 seconds (almost at autoplay threshold of 5s)
      3. Click right arrow to advance manually
      4. Record current slide
      5. Wait 3 seconds
      6. Check if slide has auto-advanced (it shouldn't — timer reset to 5s)
    Expected Result: Slide does NOT auto-advance within 3s of manual click (timer was reset)
    Failure Indicators: Slide auto-advances within 3s of manual click
    Evidence: .sisyphus/evidence/task-5-autoplay-reset.txt
  ```

  **Evidence to Capture:**
  - [ ] task-5-hero-images.png
  - [ ] task-5-hero-fullbleed.png
  - [ ] task-5-arrow-alignment.png
  - [ ] task-5-autoplay-reset.txt

  **Commit**: YES
  - Message: `feat(hero): fullbleed images, aligned arrows, autoplay timer reset`
  - Files: `components/landing/hero-carousel.tsx`
  - Pre-commit: `npm run build`

- [ ] 6. Contest Carousel: Replace Gradient Placeholders with Real Images

  **What to do**:
  - In `components/landing/contest-carousel.tsx`, replace the gradient `div` + Film icon (lines 94-98) with an actual image.
  - Use `<img>` tag (or Next.js `<Image>`) with `src={`/images/contest-${(index % 5) + 1}.jpg`}`.
  - Keep the card structure: `h-40 rounded-t-xl overflow-hidden` on the image container.
  - Image should use `object-cover w-full h-full` to properly fill the card thumbnail area.
  - Remove or keep the `cardGradients` array — it's no longer needed for card backgrounds, but removing it is cleaner.
  - Add `alt` text using the contest title.

  **Must NOT do**:
  - MUST NOT change the card layout, spacing, or typography below the image
  - MUST NOT modify `components/ui/carousel.tsx`
  - MUST NOT add lazy loading configuration (default browser behavior is fine)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple image replacement in one component — well-defined change
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Ensure image fits properly in card layout
  - **Skills Evaluated but Omitted**:
    - `playwright`: Simple enough to verify with build only

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7, 8, 9, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (dark theme), Task 2 (images)

  **References**:

  **Pattern References**:
  - `components/landing/contest-carousel.tsx:14-20` — `cardGradients` array to be removed
  - `components/landing/contest-carousel.tsx:93-98` — Current gradient div rendering: `<div className={`h-40 bg-gradient-to-br ${cardGradients[...]} flex items-center justify-center`}><Film ... /></div>` — replace this entire div with an image
  - `components/landing/contest-carousel.tsx:87-118` — Full card structure context — understand what wraps the image area

  **WHY Each Reference Matters**:
  - `contest-carousel.tsx:14-20`: These gradients are replaced — can be deleted
  - `contest-carousel.tsx:93-98`: This is THE specific div to replace with `<img>`
  - `contest-carousel.tsx:87-118`: Full card context ensures you don't break the card layout

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Contest cards show real images
    Tool: Playwright
    Preconditions: Dev server running, images in public/images/
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to "진행 중인 공모전" section
      3. Screenshot the contest cards area
      4. Assert: img elements exist within contest cards
      5. Assert: no Film icon SVG visible in card thumbnails
    Expected Result: Each contest card shows a real image thumbnail
    Failure Indicators: Gradients still showing, Film icons visible, broken images
    Evidence: .sisyphus/evidence/task-6-contest-images.png

  Scenario: Card images are properly sized
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Get bounding rect of first contest card image
      3. Check image fills the h-40 (160px) container width
    Expected Result: Image fills container without distortion (object-cover)
    Failure Indicators: Image stretched, cropped incorrectly, or has empty space
    Evidence: .sisyphus/evidence/task-6-image-sizing.png
  ```

  **Evidence to Capture:**
  - [ ] task-6-contest-images.png
  - [ ] task-6-image-sizing.png

  **Commit**: YES
  - Message: `feat(contest): replace gradient placeholders with real images`
  - Files: `components/landing/contest-carousel.tsx`
  - Pre-commit: `npm run build`

- [ ] 7. Landing Page: Zero Gap Between Contest & Gallery + Education Section Warm Colors

  **What to do**:
  This addresses feedback items #8 (spacing) and #9 (education colors).

  **7a. Zero gap between contest carousel and gallery banner (Feedback #8)**:
  - Current spacing: contest section has `pt-20 pb-8` (in `contest-carousel.tsx` line 65), gallery banner has `py-8` (in `page.tsx` line 48).
  - Total gap = `pb-8` (32px) + top of `py-8` (32px) = 64px.
  - Fix: Change contest section padding to `pt-20 pb-0` in `contest-carousel.tsx` line 65.
  - Fix: Change gallery banner padding to `pt-0 pb-8` (or `py-0 pb-8`) in `page.tsx` line 48. Or keep `py-8` and only remove contest `pb-8`.
  - **Better approach**: Set contest to `pt-20 pb-0` and gallery to `pt-0 pb-8 px-4` — this creates zero gap between the two sections while preserving internal padding in gallery.

  **7b. Education section warm colors (Feedback #9)**:
  - In `page.tsx`, education section (lines 73-132):
    - Change "EDUCATION PROGRAM" text color from `text-indigo-300` to `text-[#EA580C]` (orange) — line 76
    - Change background gradient from `from-indigo-950 via-purple-900 to-violet-950` to warm tones: `from-amber-950 via-orange-900/80 to-rose-950` (or similar warm gradient mixing warm + mid-tones)
    - Update card hover/background colors from `bg-white/10` → keep as-is (works with any background)
    - Change icon container color from `bg-indigo-400/20` + `text-indigo-300` to `bg-orange-400/20` + `text-orange-300`
    - Change description text from `text-indigo-200/70` to `text-orange-200/70` (or `text-amber-200/70`)
    - Change sub-header text from `text-indigo-200/80` to `text-orange-200/80`
    - Update CTA button colors from `bg-white text-indigo-950` to `bg-white text-amber-950` (or keep white since it's neutral)

  **Must NOT do**:
  - MUST NOT change the education section content (feature cards, text, structure)
  - MUST NOT add new sections or reorder sections
  - MUST NOT change the gallery banner content — only its top padding

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Color design work requiring aesthetic judgment for warm gradient
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Color palette selection for warm tones
    - `playwright`: Visual verification of spacing and colors
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 8, 9, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (dark theme for visual QA)

  **References**:

  **Pattern References**:
  - `components/landing/contest-carousel.tsx:65` — `<section className="pt-20 pb-8 px-4">` — change `pb-8` to `pb-0`
  - `app/(public)/page.tsx:48` — `<section className="py-8 px-4 bg-muted/30">` — change `py-8` to `pt-0 pb-8` or just remove top padding
  - `app/(public)/page.tsx:73` — Education section opening tag with `from-indigo-950 via-purple-900 to-violet-950` gradient
  - `app/(public)/page.tsx:76` — "Education Program" text with `text-indigo-300`
  - `app/(public)/page.tsx:80` — Sub-description with `text-indigo-200/80`
  - `app/(public)/page.tsx:112` — Feature card icon with `bg-indigo-400/20` + `text-indigo-300`
  - `app/(public)/page.tsx:116` — Feature card description with `text-indigo-200/70`

  **WHY Each Reference Matters**:
  - `contest-carousel.tsx:65`: This is the bottom padding creating the gap — set to `pb-0`
  - `page.tsx:48`: This is the top padding of gallery creating the gap — remove it
  - `page.tsx:73-116`: All the indigo/purple color references that need to change to warm tones

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Zero gap between contest and gallery sections
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to contest carousel section
      3. Get bottom edge of contest section and top edge of gallery banner
      4. Calculate gap
      5. Screenshot the boundary area
    Expected Result: Gap is 0px — sections are directly adjacent
    Failure Indicators: Visible gap/whitespace between sections
    Evidence: .sisyphus/evidence/task-7-zero-gap.png

  Scenario: Education section has warm colors
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to education section
      3. Screenshot the section
      4. Assert: "EDUCATION PROGRAM" text color is orange (not indigo/blue)
      5. Assert: Background is warm-toned (amber/orange/rose, not indigo/purple)
    Expected Result: Education section uses warm color palette
    Failure Indicators: Indigo/purple colors still visible
    Evidence: .sisyphus/evidence/task-7-education-warm.png

  Scenario: Education section readable on all themes
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000, scroll to education
      2. Set data-theme="dark", screenshot
      3. Set data-theme="light", screenshot
    Expected Result: Text readable on both dark and light themes
    Evidence: .sisyphus/evidence/task-7-education-themes.png
  ```

  **Evidence to Capture:**
  - [ ] task-7-zero-gap.png
  - [ ] task-7-education-warm.png
  - [ ] task-7-education-themes.png

  **Commit**: YES
  - Message: `style(landing): zero contest-gallery gap, warm education section colors`
  - Files: `app/(public)/page.tsx`, `components/landing/contest-carousel.tsx`
  - Pre-commit: `npm run build`

- [ ] 8. Agency CTA: Darker Decorative Circles + Text Change + Button Centering

  **What to do**:
  This addresses feedback item #10.

  **8a. Darker decorative circles**:
  - In `page.tsx`, agency CTA section (lines 134-173):
    - Line 138: Change `bg-[#EA580C]/10` to `bg-[#EA580C]/30` (or `/40` for even darker)
    - Line 139: Change `bg-primary/10` to `bg-primary/30` (or `/40`)
  
  **8b. Button text change**:
  - Line 164: Change "대행 의뢰하기" to "제작 의뢰하기"
  - Line 152: Change "AI 영상 제작 대행 서비스" to "AI 영상 제작 의뢰 서비스" (keeping consistent with button text)
  - Line 155: Update description text to remove "대행" if present — change to "전문 크리에이터에게 맡겨보세요"

  **8c. Button vertical centering**:
  - Line 141: The flex container already has `items-center` which should center vertically.
  - Verify it works. If the button appears misaligned, it may be due to the `shrink-0` wrapper div. Add `flex items-center` to the button wrapper div (line 159) if needed.

  **Must NOT do**:
  - MUST NOT change the section layout structure (card, gradient, positioning)
  - MUST NOT change the CTA button color scheme (#EA580C orange)
  - MUST NOT add new content to this section

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple text and CSS value changes — 3-4 line edits
  - **Skills**: []
    - No special skills needed for simple edits
  - **Skills Evaluated but Omitted**:
    - `playwright`: Overkill for simple text changes; build verification sufficient
    - `frontend-ui-ux`: No design decisions needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 7, 9, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (dark theme)

  **References**:

  **Pattern References**:
  - `app/(public)/page.tsx:134-173` — Full agency CTA section
  - `app/(public)/page.tsx:138` — Top-right decorative circle: `bg-[#EA580C]/10`
  - `app/(public)/page.tsx:139` — Bottom-left decorative circle: `bg-primary/10`
  - `app/(public)/page.tsx:152` — Section title: "AI 영상 제작 대행 서비스"
  - `app/(public)/page.tsx:155-156` — Description text
  - `app/(public)/page.tsx:164` — Button text: "대행 의뢰하기"
  - `app/(public)/page.tsx:141` — Flex container with `items-center`
  - `app/(public)/page.tsx:159` — Button wrapper `<div className="shrink-0">`

  **WHY Each Reference Matters**:
  - Lines 138-139: Opacity values to increase for darker circles
  - Lines 152, 164: Text to change from "대행" to "제작"
  - Lines 141, 159: Centering verification points

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Button text changed to 제작 의뢰하기
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to agency CTA section (bottom of page, before footer)
      3. Screenshot the section
      4. Assert: button text contains "제작 의뢰하기"
      5. Assert: button text does NOT contain "대행"
    Expected Result: Button says "제작 의뢰하기"
    Failure Indicators: "대행 의뢰하기" still showing
    Evidence: .sisyphus/evidence/task-8-cta-text.png

  Scenario: Section title updated
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Scroll to agency CTA section
      2. Assert: heading does NOT contain the word "대행"
    Expected Result: Section title uses "의뢰" not "대행"
    Failure Indicators: "대행" still in heading
    Evidence: .sisyphus/evidence/task-8-cta-title.png

  Scenario: Decorative circles are darker
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to agency CTA section
      2. Get computed opacity/background of decorative circle elements
    Expected Result: Circle opacity is ≥ 0.3 (was 0.1)
    Evidence: .sisyphus/evidence/task-8-circles.png
  ```

  **Evidence to Capture:**
  - [ ] task-8-cta-text.png
  - [ ] task-8-cta-title.png
  - [ ] task-8-circles.png

  **Commit**: YES
  - Message: `style(cta): darker circles, rename to 제작 의뢰하기`
  - Files: `app/(public)/page.tsx`
  - Pre-commit: `npm run build`

- [ ] 9. Footer: Brand Text + Remove "대행" + Education Link Text

  **What to do**:
  This addresses feedback item #11.

  **9a. Brand/logo text**:
  - In `footer.tsx` line 31: Change "함께봄" to "AI 영상 공모전" (matching the header brand text from `header.tsx` line 152: `<span>AI 영상 공모전</span>`).
  - Keep the Film icon next to the brand text.

  **9b. Remove "대행" from service links**:
  - In `footer.tsx`, `extraServiceLinks` array (lines 11-15):
    - "영상 제작 대행" → "영상 제작" (remove "대행")
    - "마케팅 대행" → "마케팅" (remove "대행")

  **9c. Education link text**:
  - In `footer.tsx`, `extraServiceLinks` array:
    - "교육 프로그램" → "AI 영상제작 교육"

  **Must NOT do**:
  - MUST NOT change the footer layout or grid structure
  - MUST NOT add new links or sections
  - MUST NOT change the legal links (이용약관, 개인정보처리방침)
  - MUST NOT change the copyright line at the bottom

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple text string replacements — 4 line edits
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: Overkill for text changes; build verification sufficient

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 7, 8, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (dark theme)

  **References**:

  **Pattern References**:
  - `components/layout/footer.tsx:11-15` — `extraServiceLinks` array: `["교육 프로그램", "영상 제작 대행", "마케팅 대행"]` — change all 3 labels
  - `components/layout/footer.tsx:29-32` — Brand area: Film icon + "함께봄" text — change text
  - `components/layout/header.tsx:150-153` — Header brand for reference: "AI 영상 공모전" — footer should match

  **WHY Each Reference Matters**:
  - `footer.tsx:11-15`: The exact strings to change
  - `footer.tsx:29-32`: The brand text to change
  - `header.tsx:150-153`: Reference for what the footer brand should match

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Footer brand matches header brand
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to footer
      3. Screenshot footer
      4. Assert: footer brand text is "AI 영상 공모전"
      5. Assert: footer does NOT contain "함께봄" in the brand area
    Expected Result: Footer brand says "AI 영상 공모전"
    Failure Indicators: "함께봄" still showing as brand
    Evidence: .sisyphus/evidence/task-9-footer-brand.png

  Scenario: No "대행" in footer
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to footer
      3. Get all text content from footer element
      4. Assert: text does NOT contain "대행"
    Expected Result: The word "대행" does not appear anywhere in the footer
    Failure Indicators: "대행" found in any footer link or text
    Evidence: .sisyphus/evidence/task-9-no-daehang.txt

  Scenario: Education link shows correct text
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to footer
      3. Assert: footer contains "AI 영상제작 교육" link text
    Expected Result: "AI 영상제작 교육" visible in footer services
    Failure Indicators: "교육 프로그램" still showing
    Evidence: .sisyphus/evidence/task-9-education-link.png
  ```

  **Evidence to Capture:**
  - [ ] task-9-footer-brand.png
  - [ ] task-9-no-daehang.txt
  - [ ] task-9-education-link.png

  **Commit**: YES
  - Message: `style(footer): update brand and service link text`
  - Files: `components/layout/footer.tsx`
  - Pre-commit: `npm run build`

- [ ] 10. Terms & Privacy Pages: Center-Aligned Headings + 최종수정일 Repositioning

  **What to do**:
  This addresses feedback item #12. Apply identical changes to BOTH `terms/page.tsx` and `privacy/page.tsx`.

  **10a. Center-aligned content**:
  - The page header section (title + description) should be center-aligned.
  - In both files, the header section (e.g., terms line 4-9): Add `text-center` to the container div.
  - The body content (articles, sections) should keep left-alignment for readability — center-aligning body text would make long paragraphs hard to read. Only center the page title.

  **10b. 최종수정일 repositioning**:
  - Currently in terms/page.tsx line 7: `<p className="text-muted-foreground mt-2">최종 수정일: 2025년 1월 1일</p>` — this is in the header section at the top.
  - Remove this line from the header section.
  - Add it at the very bottom of the page content, right-aligned and small:
    ```tsx
    <div className="text-right mt-8">
      <p className="text-xs text-muted-foreground">최종 수정일: 2025년 1월 1일</p>
    </div>
    ```
  - Place this after the last content section, before the closing `</div>` of the main content container.
  - Apply the same change to `privacy/page.tsx`.

  **Must NOT do**:
  - MUST NOT change the actual legal content text
  - MUST NOT change the page route or layout
  - MUST NOT center-align body paragraph text (only headings)
  - MUST NOT change the border-t divider styling at the bottom

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple layout changes — text alignment and element repositioning in 2 files
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: Overkill for alignment changes; build verification sufficient

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 7, 8, 9)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (dark theme)

  **References**:

  **Pattern References**:
  - `app/(public)/terms/page.tsx:4-9` — Header section with title and 최종수정일. Add `text-center`, remove 최종수정일 from here.
  - `app/(public)/terms/page.tsx:76-80` — Bottom border-t section with "본 약관은 2025년 1월 1일부터 시행됩니다." — add 최종수정일 AFTER this section.
  - `app/(public)/privacy/page.tsx:4-9` — Same header pattern as terms. Apply identical changes.
  - `app/(public)/privacy/page.tsx:92-96` — Same bottom section as terms. Add 최종수정일 here.

  **WHY Each Reference Matters**:
  - `terms/page.tsx:4-9`: This is where 최종수정일 currently lives — remove it from here, add `text-center`
  - `terms/page.tsx:76-80`: This is where 최종수정일 should be added — right-aligned at the very bottom
  - Both privacy references: Identical changes needed

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Terms page title is centered
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/terms
      2. Screenshot the page header area
      3. Assert: "이용약관" title is center-aligned
    Expected Result: Title text is horizontally centered
    Failure Indicators: Title left-aligned
    Evidence: .sisyphus/evidence/task-10-terms-centered.png

  Scenario: Terms 최종수정일 at bottom-right
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/terms
      2. Scroll to very bottom of content
      3. Find "최종 수정일" text element
      4. Assert: it is right-aligned (text-align: right or text-right class)
      5. Assert: it uses small font (text-xs)
      6. Assert: it is NOT in the header section
      7. Screenshot bottom of page
    Expected Result: "최종 수정일: 2025년 1월 1일" in small text at bottom-right of content
    Failure Indicators: 최종수정일 in header, left-aligned, normal font size
    Evidence: .sisyphus/evidence/task-10-terms-date-bottom.png

  Scenario: Privacy page has same changes
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/privacy
      2. Assert: title "개인정보처리방침" is center-aligned
      3. Assert: "최종 수정일" is at bottom-right, small text
      4. Assert: "최종 수정일" is NOT in header
      5. Screenshot
    Expected Result: Same layout as terms page
    Failure Indicators: Different layout from terms
    Evidence: .sisyphus/evidence/task-10-privacy-layout.png

  Scenario: Body content remains left-aligned
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/terms
      2. Check text-align of article body paragraphs
    Expected Result: Body paragraphs are left-aligned (not centered)
    Failure Indicators: Body text is centered, making it hard to read
    Evidence: .sisyphus/evidence/task-10-body-alignment.png
  ```

  **Evidence to Capture:**
  - [ ] task-10-terms-centered.png
  - [ ] task-10-terms-date-bottom.png
  - [ ] task-10-privacy-layout.png
  - [ ] task-10-body-alignment.png

  **Commit**: YES
  - Message: `style(legal): center headings, reposition 최종수정일 to bottom-right`
  - Files: `app/(public)/terms/page.tsx`, `app/(public)/privacy/page.tsx`
  - Pre-commit: `npm run build`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build`. Review all changed files for: `as any` (tolerate existing ones, flag new), empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Verify TypeScript compiles cleanly.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (theme switch + profile + carousel all working together). Test edge cases: rapid theme switching, mobile viewport, all 5 demo roles. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual code changes. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After Task(s) | Message | Key Files | Verification |
|---------------|---------|-----------|--------------|
| 1 | `fix(theme): resolve dark theme CSS override for Tailwind v4` | `globals.css` | `npm run build` |
| 2 | `feat(assets): add AI-generated placeholder images` | `public/images/*` | file count check |
| 3 | `feat(auth): add guest role type and avatar component` | `constants.ts`, `types/index.ts`, `avatar.tsx` | `npm run build` |
| 4 | `feat(header): symmetric padding, profile dropdown, guest auth state` | `header.tsx` | `npm run build` |
| 5 | `feat(hero): fullbleed images, aligned arrows, autoplay timer reset` | `hero-carousel.tsx` | `npm run build` |
| 6 | `feat(contest): replace gradient placeholders with images` | `contest-carousel.tsx` | `npm run build` |
| 7 | `style(landing): zero contest-gallery gap, warm education section` | `page.tsx`, `contest-carousel.tsx` | `npm run build` |
| 8 | `style(cta): darker circles, rename to 제작 의뢰하기` | `page.tsx` | `npm run build` |
| 9 | `style(footer): update brand and service link text` | `footer.tsx` | `npm run build` |
| 10 | `style(legal): center headings, reposition 최종수정일` | `terms/page.tsx`, `privacy/page.tsx` | `npm run build` |
| F1-F4 | No commit — verification only | — | — |

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: exit code 0, no errors
dir public\images\hero-*.jpg  # Expected: 6 files
dir public\images\contest-*.jpg  # Expected: 5 files
```

### Final Checklist
- [ ] All "Must Have" present (7 items)
- [ ] All "Must NOT Have" absent (10 guardrails)
- [ ] Build passes with 0 errors
- [ ] All 3 themes render correctly (light, dark, signature)
- [ ] All 5 demo roles switch correctly (guest, participant, host, judge, admin)
- [ ] No gradient placeholder visible on landing page
- [ ] Playwright evidence screenshots exist for each task
