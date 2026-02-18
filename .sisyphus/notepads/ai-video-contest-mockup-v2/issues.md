## 2026-02-17

- First `bun install` failed once with `@swc/core-win32-x64-msvc` cache EPERM, then succeeded on retry.

- `apply_patch` with absolute Windows drive path created an unintended root-level file once; switched to workspace-relative paths only.
