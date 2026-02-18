## 2026-02-17

- Adopted strict TypeScript baseline and app-router-first folder scaffold for v3 greenfield.
- Centralized v3 constants in `config/constants.ts` and domain contracts in `lib/types/index.ts`.
- Implemented deterministic seeded mock datasets that exceed minimum acceptance quantities.

- Added `components/common/demo-role-panel.tsx` as canonical implementation and re-exported from `components/layout/demo-role-panel.tsx` for compatibility.
- Kept route and settings pages data-driven via `lib/mock` functions even in placeholder scaffold to satisfy no-hardcoded-data rule.
