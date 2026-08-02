import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 설정
 *
 * 대상은 기본적으로 로컬 dev 서버다. 운영을 검사하려면 아래처럼 지정한다.
 *   E2E_BASE_URL=https://www.aikkumhub.com bun run test:e2e
 *
 * dev 서버를 직접 띄우므로 프로덕션 빌드(.next)와 충돌하지 않게
 * 테스트 실행 중에는 `bun run build` 를 돌리지 않는다.
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const isExternal = !baseURL.includes('localhost');

export default defineConfig({
  testDir: './e2e',
  /* 운영 DB 를 함께 보므로 상태를 바꾸는 테스트는 두지 않는다 — 병렬 실행이 안전하다 */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL,
    trace: 'on-first-retry',
    /* 첫 로딩이 느린 페이지(갤러리 462건)가 있어 넉넉히 잡는다 */
    navigationTimeout: 60_000,
  },

  /* 모바일도 Chromium 기반(Pixel 5)을 쓴다 — iPhone 프로필은 WebKit 을 따로 받아야 하고,
     국내 모바일 트래픽 대부분이 Chromium 계열이라 실익이 크지 않다.
     WebKit 을 검사하려면 `install webkit` 후 프로젝트를 추가할 것. */
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],

  /* 외부 URL 을 검사할 때는 서버를 띄우지 않는다 */
  webServer: isExternal
    ? undefined
    : {
        command: 'bun run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
