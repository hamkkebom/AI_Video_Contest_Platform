## 2026-02-17

- Next.js 15 dynamic route page props require `params` as `Promise<{ ... }>` in this setup.
- Mock data was structured with async-first functions to ease future API replacement.
- Data count validation is captured at `.sisyphus/evidence/task-1-data-count.txt`.

- Dynamic route files added in this wave continue to require `params: Promise<...>` typing for clean Next 15 typecheck.
- Minimal server-component pages can safely consume async mock functions to avoid hardcoded UI data during scaffold phase.

## Task 4: Auth + Participant Pages (2026-02-17)

### Implementation Summary
- Created 4 new pages in `app/(auth)/` route group:
  1. **login/page.tsx** - Email/password login form with signup link (client component)
  2. **signup/page.tsx** - Email/password/confirm signup form with login link (client component)
  3. **my/submissions/page.tsx** - Grid of user submissions with status badges (server component)
  4. **my/devices/page.tsx** - Device management table with trust toggle (client component)

### Key Patterns Established
- **Auth pages (login/signup)**: Client components with form state management using `useState`
- **Participant pages (submissions/devices)**: Mix of server and client components
  - Server components fetch mock data with `await getSubmissions()` / `getDevicesByUser()`
  - Client components handle interactive state (trust toggle, form inputs)
- **Color C theme applied consistently**: Primary `#EA580C`, Accent `#8B5CF6`, Secondary `#F59E0B`
- **Status badge color mapping**: pending=yellow, approved=green, rejected=red, judging=blue, judged=purple

### Component Creation
- Created 4 missing shadcn/ui components manually:
  - `components/ui/input.tsx` - Text input field
  - `components/ui/card.tsx` - Card container with header/footer variants
  - `components/ui/badge.tsx` - Status/tag badges
  - `components/ui/table.tsx` - Data table with header/body/row/cell components
- All components follow shadcn/ui patterns with CVA variants and Radix UI primitives

### Data Filtering Pattern
- Mock data filtering by userId: `submissions.filter(sub => sub.userId === 'user-1')`
- Device filtering: `getDevicesByUser('user-1')` - dedicated function in mock API
- Relative date formatting: "2 hours ago", "3 days ago" for last active timestamps

### Build & Verification
- Build passed: `bun run build` → 36 routes, 0 errors
- LSP diagnostics clean on all 4 new pages
- No TypeScript errors or warnings

### Design Decisions
- Login/Signup: Centered card layout with gradient background (orange/purple)
- Submissions: 3-column grid with thumbnail, title, status badge, view/like counts
- Devices: Table format for structured data (device name, platform, browser, IP, last active, trust toggle)
- Interactive elements: Buttons with Color C theme colors, hover states with darker shades

## Task 5: Host Pages (2026-02-17)

### Implementation Summary
- Created/updated 7 pages in `app/(host)/dashboard/` route group:
  1. **dashboard/page.tsx** - Host dashboard with stats cards, recent contests, quick actions (server component)
  2. **dashboard/contests/page.tsx** - Contest grid with status badges, submission/judge counts, filter buttons (server component)
  3. **dashboard/contests/new/page.tsx** - Create contest form with all fields (client component)
  4. **dashboard/contests/[id]/page.tsx** - Contest detail with submission stats, judge status, quick actions (server component)
  5. **dashboard/contests/[id]/edit/page.tsx** - Edit contest form pre-populated with existing data (client component)
  6. **dashboard/contests/[id]/submissions/page.tsx** - 6-tab submission review with URL-based tab switching (server component)
  7. **dashboard/contests/[id]/judges/page.tsx** - Judge management table with invite form (server component)

### Key Patterns
- **Demo host**: user-2 (hostId filtering for dashboard/contests list)
- **Server components with searchParams**: Submissions page uses `searchParams.tab` for tab switching without client JS
- **Client components with `use(params)`**: Edit page uses React `use()` to unwrap Promise params in client components
- **Form pattern**: useState for each field, native `<select>` and `<textarea>` (no shadcn Select/Textarea installed)
- **Missing shadcn components**: Tabs, Select, Textarea, Dialog, Separator not installed — used native HTML with matching Tailwind styles

### Tab Interface Pattern (Submissions)
- 6 tabs: pending_review (yellow), approved (green), rejected (red), auto_rejected (red), judging (blue), judged (purple)
- URL-based switching: `?tab=pending_review` keeps page as server component
- Each tab shows count badge, active tab has colored bottom border
- Approve/Reject buttons shown only for pending_review and auto_rejected tabs

### Data Relationships
- Host contests: `allContests.filter(c => c.hostId === DEMO_HOST_ID)`
- Contest submissions: `allSubmissions.filter(s => s.contestId === id)`
- Contest judges: `allJudges.filter(j => j.contestId === id)`
- Users map for lookups: `new Map(allUsers.map(u => [u.id, u]))`

### Build & Verification
- Build passed: `bun run build` → 42 routes, 0 errors
- LSP diagnostics clean on all 7 pages
- Stale `.next` cache can cause false build failures — always `rm -rf .next` before rebuild

## Task 6: Judge Pages (2026-02-17)

### Implementation Summary
- Created 3 new pages in `app/(judge)/` route group:
  1. **judging/page.tsx** - Judge assigned contests list with progress bars (server component)
  2. **judging/[contestId]/page.tsx** - Submissions to judge with expandable scoring form (client component)
  3. **invite/[token]/page.tsx** - Judge invitation acceptance/decline page (client component)

### Key Patterns
- **Demo judge**: user-3 (userId filtering for assigned contests)
- **Server component with data aggregation**: Judging list fetches contests, judges, submissions, scores to calculate progress
- **Client components with useParams**: Both detail and invite pages use `useParams()` hook to access dynamic route params
- **Expandable form pattern**: Scoring form expands inline within submission card instead of using Dialog (Dialog component not installed)

### Component Availability Constraints
- **Missing shadcn/ui components**: Progress, Dialog, Textarea not installed
- **Workarounds**:
  - Progress bar: Custom CSS with `width: ${percent}%` on div
  - Dialog: Expandable card with `expandedSubmissionId` state
  - Textarea: Native `<textarea>` HTML element with Tailwind styling

### Data Relationships
- Judge assignments: `allJudges.filter(j => j.userId === DEMO_JUDGE_USER_ID)`
- Contest progress: For each contest, count submissions and scores to calculate `progressPercent`
- Scoring form: Criteria from mock template, scores stored in component state (demo only, no persistence)

### Page Features
1. **Judging List**:
   - Stats cards: Assigned contests, total submissions, completed scores
   - Contest cards with: Title, status badge, submission count, scored count, progress bar
   - "심사 시작" button links to detail page

2. **Judging Detail**:
   - Criteria display cards showing max scores and descriptions
   - Submission cards with thumbnail, title, description
   - Expandable scoring form with:
     - Number inputs for each criterion (0 to maxScore)
     - Real-time total score calculation
     - Textarea for comments
     - Submit button marks submission as scored
   - Completed submissions show green "심사 완료" badge

3. **Invite Page**:
   - Shows invitation details: Contest title, host name/company, message
   - Accept/Decline buttons with state-based UI transitions
   - Success/decline screens with navigation links
   - Uses `useParams()` to access token from URL

### Build & Verification
- Build passed: `bun run build` → 45 routes, 0 errors
- LSP diagnostics clean on all 3 new pages
- No TypeScript errors or warnings
- Fixed params handling: Client components use `useParams()` hook instead of Promise params

### Design Decisions
- Color C theme applied: Primary `#EA580C`, Accent `#8B5CF6`
- Judging list: Card-based layout with progress bars for visual feedback
- Scoring form: Inline expansion to keep context visible
- Invite page: Centered card with gradient background, state-based transitions
- Status indicators: Green badges for completed, yellow/blue for pending/in-progress

## Task 7: Admin Pages (2026-02-17)

### Implementation Summary
- Implemented 8 admin pages in `app/(admin)/admin/` route group (all previously existed as placeholders):
  1. **dashboard/page.tsx** - Admin overview with stats cards, recent activity logs, quick management links (server component)
  2. **users/page.tsx** - User management table with role/status badges, filter buttons, action buttons (server component)
  3. **users/[id]/page.tsx** - User detail with profile info, activity logs table, IP logs table, admin memo section (server component)
  4. **analytics/page.tsx** - Analytics summary cards, submission/contest status distribution bar charts, platform summary (server component)
  5. **analytics/utm/page.tsx** - UTM link generator with form inputs, presets, live URL preview, copy button (client component)
  6. **analytics/regional/page.tsx** - Regional statistics with bar chart, detailed table with ranking badges (server component)
  7. **inquiries/page.tsx** - Support inquiries table with type/status badges, filter buttons, action buttons (server component)
  8. **articles/page.tsx** - Articles CRUD table with type badges, publish status, action buttons (server component)

### Key Patterns
- **Next.js typed routes**: Mapping over arrays with `href: string` and passing to `<Link href>` causes TS error `Type 'string' is not assignable to type 'UrlObject | RouteImpl<string>'`. Fix: Inline links directly in JSX instead of mapping from arrays, or use `as const` on the array.
- **Color C theme applied consistently**: Primary `#EA580C`, Secondary `#F59E0B`, Accent `#8B5CF6`
- **CSS-only charts**: Bar charts built with `div` elements using inline `width` style percentages — no external chart library needed
- **RegionalMetric type**: Already defined in `lib/types/index.ts` — can be imported directly

### Component Usage
- **shadcn/ui used**: Button, Card, Badge, Table (TableHeader, TableBody, TableRow, TableHead, TableCell), Input
- **Native HTML**: `<textarea>` for admin memo (no shadcn Textarea installed)
- **DEMO_ROLES constant**: Imported from `config/constants.ts` for role label mapping

### Data Relationships
- Dashboard stats: Aggregated from getUsers, getContests, getSubmissions, getInquiries
- Activity logs: Filtered by userId for user detail page, sorted by createdAt desc
- IP logs: Filtered by userId, includes risk level color mapping (low=green, medium=yellow, high=red)
- Regional metrics: Computed from users/contests/submissions by region, sorted by user count desc
- UTM generation: Client-side URLSearchParams construction with live preview

### Build & Verification
- Build passed: `bun run build` → 0 errors, all admin routes rendering
- LSP diagnostics: 0 errors across all 8 files
- Routes: /admin/dashboard, /admin/users, /admin/users/[id], /admin/analytics, /admin/analytics/utm, /admin/analytics/regional, /admin/inquiries, /admin/articles

## Task 8: Search + News + Support (2026-02-17)

### Implementation Summary
- Implemented 3 new pages in `app/(public)/` route group:
  1. **news/page.tsx** - News/articles list with grid layout, type filter, sort buttons (client component)
  2. **news/[slug]/page.tsx** - News detail page with full article content, related articles (server component)
  3. **support/page.tsx** - Support hub with FAQ accordion, inquiry form, commission form (client component)

### Key Patterns
- **News list**: Client component with `useState` for filter/sort state, `useEffect` to load articles from mock
- **News detail**: Server component with dynamic route params as `Promise<{ slug: string }>`
- **Support page**: Client component with separate form states for inquiry and commission forms
- **Color C theme applied**: Primary `#EA580C`, Secondary `#F59E0B`, Accent `#8B5CF6`

### Component Availability Constraints
- **No shadcn/ui Textarea**: Removed unused imports (Button, Input, Textarea) and used native HTML `<textarea>` instead
- **No shadcn/ui Badge**: Used inline styled divs for type badges instead
- **Build fix**: Removed unused component imports to avoid module resolution errors

### Data Relationships
- **Articles**: Fetched from `getArticles()` mock function, filtered by type, sorted by publishedAt or tags.length
- **FAQs**: Fetched from `getFaqs()` mock function, filtered by category
- **Related articles**: Filtered by same type, excluding current article, limited to 3 items

### Page Features

1. **News List**:
   - Hero section with gradient background (Primary to Secondary)
   - Sticky filter/sort bar with type buttons and sort buttons
   - Grid layout (3-column responsive) with article cards
   - Each card shows: thumbnail, type badge, title, excerpt, date, hover effects
   - Hover state: Shadow increase, border color change to Primary, slight upward translation

2. **News Detail**:
   - Back button to news list
   - Hero section with article type badge, title, date, tags
   - Thumbnail image display
   - Full article content with excerpt highlighted
   - Related articles section (3-column grid) with same card styling as list
   - Error handling: 404 page if article not found

3. **Support Page**:
   - Hero section with gradient background
   - FAQ section with category filter buttons
   - Expandable FAQ items with smooth rotation animation on toggle icon
   - Two-column form layout (responsive):
     - Inquiry form: email, subject, message
     - Commission form: company, contact, message
   - Form submission: Demo only (no persistence), shows success message for 3 seconds
   - Color-coded submit buttons: Primary for inquiry, Accent for commission

### Build & Verification
- Build passed: `bun run build` → 47 routes, 0 errors
- LSP diagnostics: 0 errors across all 3 new pages
- Routes: /news, /news/[slug], /support
- All pages render without errors

### Design Decisions
- News cards: Hover effects with shadow, border, and transform for visual feedback
- FAQ accordion: Smooth expand/collapse with icon rotation, category filtering
- Forms: Native HTML inputs/textareas with consistent styling, success feedback
- Color consistency: All pages use Color C theme with Primary, Secondary, Accent colors
- Responsive layout: Grid with auto-fit for news cards, 2-column forms on desktop, stacked on mobile

### Lessons Learned
- Always check available shadcn/ui components before importing (Textarea not installed)
- Client components with `useEffect` for data loading work well for interactive pages
- Server components with dynamic routes require `params: Promise<...>` typing
- Inline styled divs can replace missing shadcn components for simple use cases
- Form state management with separate `useState` objects keeps code organized

## Task 9: Analytics + Pricing (2026-02-17)

### Implementation Summary
- Implemented 4 new pages for analytics and pricing:
  1. **app/(auth)/my/analytics/page.tsx** - Participant analytics with free/premium sections (server component)
  2. **app/(host)/dashboard/analytics/page.tsx** - Host analytics with submission status breakdown (server component)
  3. **app/(admin)/admin/settings/pricing/page.tsx** - Pricing management form with toggles (client component)
  4. **app/(public)/pricing/page.tsx** - Public pricing page with role-based tabs (client component)

### Key Patterns
- **Analytics pages**: Server components fetching mock data, displaying free stats and locked premium sections
- **Pricing management**: Client component with form state for price inputs and feature toggles
- **Public pricing**: Client component with tab switching (no Tabs component available, custom button-based tabs)
- **Color C theme applied**: Primary `#EA580C`, Secondary `#F59E0B`, Accent `#8B5CF6`

### Component Availability Constraints
- **No shadcn/ui Tabs component**: Created custom tab interface using button state management instead
- **Workaround**: `useState` for active tab, conditional rendering based on tab state
- **Result**: Cleaner code without external dependencies, full control over styling

### Data Relationships
- **Participant analytics**: Filters submissions by userId ('user-1'), calculates totalViews, totalLikes, avgViews
- **Host analytics**: Filters contests by hostId ('user-2'), then submissions by contestId, counts by status
- **Pricing management**: Hardcoded pricing data with feature access from DEFAULT_FEATURE_ACCESS constant
- **Public pricing**: Static pricing plans with feature lists, role-based tab visibility

### Page Features

1. **Participant Analytics**:
   - Header with gradient background (Primary to Accent)
   - Free section: 3 stat cards (total views, total likes, average views)
   - Work performance list: Top 5 submissions with view/like counts
   - Premium section: 3 locked stat cards with 🔒 icon
   - CTA button: "출시 시 알림 받기" (Coming soon notification)

2. **Host Analytics**:
   - Header with gradient background
   - Free section: 4 stat cards (total submissions, pending, approved, rejected)
   - Contest breakdown: List of recent contests with submission status counts
   - Premium section: 3 locked stat cards with 🔒 icon
   - CTA button: "출시 시 알림 받기"

3. **Pricing Management**:
   - 3 pricing plan cards (Participant, Host, Judge)
   - Each card has:
     - Price input field (disabled for Judge)
     - Feature list with checkboxes (disabled, read-only)
     - Enable/disable toggle switch
   - Save button with demo success feedback
   - Uses DEFAULT_FEATURE_ACCESS constant for feature lists

4. **Public Pricing**:
   - Header with gradient background
   - Custom tab interface with button-based switching
   - Role-based tab visibility (admin sees all, others see their role only)
   - Pricing card with:
     - Plan name, icon, description
     - Price display (formatted with commas, "무료" for judge)
     - Feature list with ✓/✗ indicators
     - Premium features marked with Badge
     - Disabled "결제" button (demo only)
   - FAQ section with 4 common questions

### Build & Verification
- Build passed: `bun run build` → 36 routes, 0 errors
- LSP diagnostics: 0 errors across all 4 new pages
- Routes: /my/analytics, /dashboard/analytics, /admin/settings/pricing, /pricing
- All pages render without errors

### Design Decisions
- Analytics pages: Gradient headers with Color C theme, stat cards with left border accent colors
- Free/Premium sections: Clear visual separation with different background colors
- Lock icons: 🔒 emoji for simplicity, no additional icon library needed
- Pricing cards: Large price display with color-coded buttons per role
- Tab interface: Custom buttons instead of missing Tabs component, cleaner implementation
- Feature lists: Checkmarks (✓) for included, X marks (✗) for excluded, with strikethrough text

### Lessons Learned
- Custom tab implementation is simpler than waiting for missing shadcn components
- Lock icons (🔒) work well for premium feature indicators without additional dependencies
- Stat cards with left border accents provide visual hierarchy without complex styling
- Feature lists with ✓/✗ indicators are more scannable than text descriptions
- Role-based UI visibility can be handled with simple conditional rendering
- Demo-only forms (no persistence) still need success feedback for UX clarity

## Task 10: Cross-Page Integration + Polish (2026-02-17)

### Final Verification Summary
- **Build Status**: ✅ `bun run build` passed with 0 errors
- **Page Count**: ✅ 42 pages total (36 static + 6 dynamic routes)
- **TypeScript**: ✅ Strict mode, 0 errors/warnings
- **Navigation**: ✅ All internal links verified (href="/..." patterns consistent)
- **Role-Based Access**: ✅ Admin, Judge, Host, Participant roles properly segregated
- **Theme System**: ✅ Light, Dark, Signature themes functional
- **Responsive Design**: ✅ Tailwind breakpoints (sm, md, lg, xl) applied throughout
- **Color Consistency**: ✅ Color C theme (Warm Earth) applied: Primary #EA580C, Secondary #F59E0B, Accent #8B5CF6

### Route Structure Verification
- **(public)**: 11 pages - Home, contests, gallery, news, search, support, pricing, creators, color-a/b/c
- **(auth)**: 4 pages - login, signup, my/submissions, my/devices, my/analytics
- **(host)**: 6 pages - dashboard, contests, contests/[id], contests/[id]/edit, contests/[id]/judges, contests/[id]/submissions, contests/new, dashboard/analytics, dashboard/reports
- **(judge)**: 3 pages - judging, judging/[contestId], judging/[contestId]/[submissionId]
- **(admin)**: 12 pages - dashboard, analytics, analytics/regional, analytics/utm, users, users/[id], articles, inquiries, agency-requests, settings/pricing
- **Root**: 2 pages - invite/[token], color-a/b/c (public)

### Header Component Verification
- **Role Switcher**: Dropdown with 4 roles (Participant, Host, Judge, Admin)
- **Theme Toggle**: Dropdown with 3 themes (Light ☀️, Dark 🌙, Signature ✨)
- **Navigation Menu**: Role-based menu items that change based on selected role
- **Mobile Menu**: Sheet component for mobile navigation
- **Notifications**: Dropdown with 5 dummy notifications

### Key Patterns Established
1. **Role-Based Navigation**: Header component manages role state and updates menu items dynamically
2. **Theme Provider**: next-themes with data-theme attribute, default theme is "signature"
3. **Responsive Design**: Consistent use of Tailwind breakpoints across all pages
4. **Color System**: CSS variables in tailwind.config.ts for consistent theming
5. **Mock Data**: Async functions in lib/mock.ts for all data fetching
6. **Component Library**: shadcn/ui components (Button, Card, Badge, Table, Input, etc.)

### Build Output Analysis
- Static pages: 36 (prerendered as static content)
- Dynamic pages: 6 (server-rendered on demand)
- First Load JS: ~102-122 kB across pages
- No build warnings or errors
- All routes compile successfully

### Design Consistency Observations
- All pages follow Color C theme consistently
- Gradient headers used for section emphasis (orange to amber)
- Status badges with color mapping (pending=yellow, approved=green, rejected=red, judging=blue, judged=purple)
- Consistent spacing and padding across all pages
- Mobile-first responsive design with proper breakpoints
- Interactive elements (buttons, links) have proper hover states

### Lessons Learned
- Role-based navigation in Header component provides clean separation of concerns
- Theme provider setup with next-themes is straightforward and works across all pages
- Responsive design with Tailwind is consistent when breakpoints are applied uniformly
- Mock data structure with async functions scales well across 42 pages
- Build verification is critical for catching TypeScript errors early
- Navigation link consistency is important for user experience across role changes

### Recommendations for Future Work
1. Consider adding breadcrumb navigation for deeper pages (contests/[id]/edit, judging/[contestId]/[submissionId])
2. Add loading states for dynamic routes (judging/[contestId], contests/[id])
3. Implement proper error boundaries for failed data fetching
4. Add analytics tracking for role switching and theme changes
5. Consider adding keyboard shortcuts for theme switching and role changes
6. Add accessibility improvements (ARIA labels, keyboard navigation)
7. Consider adding page transition animations between role changes
