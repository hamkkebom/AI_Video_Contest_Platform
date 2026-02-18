# Task 1: Fix Role-Switching Key Mismatch in header.tsx

## Summary
Fixed a critical runtime bug in the AI Video Contest platform's header component where role-switching didn't update the GNB menu or highlight the active role.

## Root Cause
Key mismatch between:
- `DEMO_ROLES` keys: `participant`, `host`, `judge`, `admin`
- `DemoRoles` interface keys: `isParticipant`, `isHost`, `isJudge`, `isAdmin`

The code was casting DEMO_ROLES keys as if they were DemoRoles keys, causing all comparisons to fail.

## Changes Made

### File: `ai-video-contest/components/layout/header.tsx`

1. **Fixed `handleRoleChange` function (lines 109-116)**
   - Changed parameter type from `keyof DemoRoles` to `string`
   - Updated comparisons to use DEMO_ROLES keys: `'participant'`, `'host'`, `'judge'`, `'admin'`
   - Removed unsafe type casting

2. **Added `demoRoleKeyMap` mapping (lines 121-126)**
   - Maps DEMO_ROLES keys to DemoRoles keys
   - Enables proper state updates and active highlighting

3. **Fixed dropdown active indicator (line 219)**
   - Removed unsafe `as keyof DemoRoles` cast
   - Uses mapping to determine active state: `demoRoles[demoRoleKeyMap[key]]`

## Verification Results

### ✅ All 6 Scenarios Passed

1. **Admin Role Switch**
   - GNB shows "관리자" link (href="/admin/dashboard")
   - Button icon: 🛡️
   - Active highlight: ✓

2. **Host Role Switch**
   - GNB shows "대시보드" link (href="/dashboard")
   - Button icon: 🏢
   - Active highlight: ✓

3. **Judge Role Switch**
   - GNB shows "심사" link (href="/judging")
   - Button icon: ⚖️
   - Active highlight: ✓

4. **Participant Role Switch**
   - GNB shows "공모전" link (href="/contests")
   - No "관리자" link (menu changed correctly)
   - Button icon: 🎬
   - Active highlight: ✓

5. **Active Highlight Persistence**
   - Only active role has `bg-accent` class
   - Other roles have no `bg-accent` class
   - Verified with admin role: only "🛡️ 관리자" highlighted

6. **TypeScript Build**
   - `npx tsc --noEmit` exit code: 0
   - No type errors

## Evidence Files
- task-1-admin-role-switch.png
- task-1-host-role-switch.png
- task-1-judge-role-switch.png
- task-1-participant-role-switch.png
- task-1-active-highlight.png
- task-1-tsc-check.txt

## Commit
```
fix(header): resolve role-switch key mismatch between DEMO_ROLES and DemoRoles
```

Commit hash: 5964c7b
