import { test, expect } from '@playwright/test';

/**
 * 2026-08-01~02 에 실제로 터졌던 것들을 잡는 회귀 테스트.
 *
 * 여기 있는 항목은 전부 "한 번은 운영에서 깨졌던" 것이다. 추측으로 쓴 테스트가 아니라
 * 사고 목록이며, 각 테스트에 어떤 사고였는지 남긴다.
 *
 * 상태를 바꾸는 동작(제출·승인·삭제)은 넣지 않는다 — 운영 DB 를 함께 보기 때문이다.
 * 로그인이 필요한 흐름은 e2e/README.md 참조.
 */

/** 작품 상세 링크만 — 목록(/gallery/all)과 수상작(/gallery/awards)은 제외 */
const WORK_LINK = 'a[href^="/gallery/"]:not([href*="/all"]):not([href*="/awards"])';

test.describe('공개 페이지가 살아 있다', () => {
  for (const path of [
    '/',
    '/contests',
    '/gallery/all',
    '/gallery/awards',
    '/creators',
    '/story',
    '/search',
    '/support/faq',
  ]) {
    test(`${path} 는 200 을 반환한다`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} 응답 코드`).toBe(200);
    });
  }
});

test.describe('없는 리소스는 404 로 답한다', () => {
  /* 사고: (public)/loading.tsx 가 스트리밍을 먼저 시작해 notFound() 가 상태코드를
     못 바꿨다. 세 페이지는 아예 notFound() 를 호출하지 않고 커스텀 UI 를 200 으로 렌더했다. */
  for (const path of ['/contests/99999999', '/gallery/99999999', '/story/no-such-slug', '/hosts/99999999']) {
    test(`${path} 는 404 를 반환한다`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} 응답 코드`).toBe(404);
    });
  }
});

test.describe('갤러리는 비로그인으로 감상할 수 있다', () => {
  /* 사고: 미들웨어가 /gallery/[id] 를 보호 라우트로 잡아, 462편을 보여주고는
     클릭하면 로그인 벽이 나왔다 (D-013 에서 공개 전환). */
  test('작품 상세가 로그인 없이 열린다', async ({ page }) => {
    await page.goto('/gallery/all');
    /* 작품 상세만 고른다 — /gallery/all(헤더 링크)과 /gallery/awards 를 배제하지 않으면
       모바일에서 접힌 헤더 링크가 먼저 잡혀 보이지 않는다 */
    const firstWork = page.locator(WORK_LINK).first();
    await expect(firstWork).toBeVisible({ timeout: 30_000 });

    const href = await firstWork.getAttribute('href');
    const res = await page.goto(href!);
    expect(res?.status()).toBe(200);
    expect(page.url()).not.toContain('/login');
  });
});

test.describe('콘텐츠가 실제로 렌더된다', () => {
  /* 사고: articles 에 is_admin() 정책이 붙어 익명 조회가 통째로 깨졌는데,
     데이터 함수가 실패를 빈 배열로 삼켜 "아티클이 없습니다"로 위장됐다.
     빈 목록과 장애를 구분하지 못한 게 핵심이라, 목록 페이지는 개수를 확인한다. */
  test('갤러리에 작품이 있다', async ({ page }) => {
    await page.goto('/gallery/all');
    const cards = page.locator(`${WORK_LINK} img`);
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('공모전 목록이 비어 있지 않다', async ({ page }) => {
    await page.goto('/contests');
    await expect(page.getByRole('heading', { name: 'Contests' })).toBeVisible();
    /* 스마트 기본 탭이 콘텐츠 있는 탭을 고르므로 빈 화면이 나오면 안 된다 */
    await expect(page.locator('a[href^="/contests/"]').first()).toBeVisible({ timeout: 30_000 });
  });

  test('홈 히어로가 실제 숫자를 보여준다', async ({ page }) => {
    /* 사고: 히어로가 형용사만 있는 어두운 상자였다. 지표는 DB 에서 온다 —
       0 이 찍히면 데이터 경로가 끊긴 것이다. */
    await page.goto('/');
    const works = page.locator('dl dd').first();
    await expect(works).toBeVisible();
    const value = Number((await works.textContent())?.replace(/[^0-9]/g, ''));
    expect(value, '히어로 출품작 수').toBeGreaterThan(0);
  });
});

test.describe('보호 라우트와 관리자 API', () => {
  /* 사고: /api/admin/* 은 /admin 으로 시작하지 않아 미들웨어가 보호하지 않는다.
     companies 상세 API 가 인증 없이 사업자등록번호를 반환하고 있었다. */
  for (const path of ['/my/submissions', '/admin/dashboard', '/host/dashboard', '/hosts/apply']) {
    test(`${path} 는 로그인을 요구한다`, async ({ page }) => {
      await page.goto(path);
      expect(page.url(), `${path} 리다이렉트`).toContain('/login');
    });
  }

  for (const endpoint of [
    '/api/admin/articles/1',
    '/api/admin/users/00000000-0000-0000-0000-000000000000',
    '/api/admin/inquiries/1',
    '/api/admin/agency-requests/1',
    '/api/admin/companies/1',
  ]) {
    test(`${endpoint} 는 비인증 쓰기를 거부한다`, async ({ request }) => {
      const res = await request.patch(endpoint, { data: { status: 'active', isPublished: true } });
      expect([401, 403], `${endpoint} 응답 코드`).toContain(res.status());
    });
  }

  test('호스트 공개 페이지는 대시보드 경로와 섞이지 않는다', async ({ page }) => {
    /* 사고: startsWith('/host') 가 /hosts/[id] 까지 삼켜 공개 주최자 페이지가
       비로그인 방문자를 로그인으로 보냈다. */
    const res = await page.goto('/hosts/99999999');
    expect(res?.status()).toBe(404);
    expect(page.url()).not.toContain('/login');
  });
});

test.describe('SEO 계약', () => {
  test('landing 은 상세를 canonical 로 가리킨다', async ({ page }) => {
    /* 사고: 상세와 landing 이 각자 자기 URL 을 canonical 로 주장해 중복 색인됐다. */
    await page.goto('/contests');
    const first = await page.locator('a[href^="/contests/"]').first().getAttribute('href');
    const id = first?.split('/').pop();
    test.skip(!id, '공모전이 없어 건너뜀');

    await page.goto(`/contests/${id}/landing`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain(`/contests/${id}`);
    expect(canonical).not.toContain('/landing');
  });

  test('sitemap 에 landing 과 pricing 이 없다', async ({ request }) => {
    /* 사고: landing 이 sitemap 에 함께 실려 중복을 키웠고, 동결된 pricing 이
       내비에서만 빠지고 sitemap 에는 남아 있었다. */
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).not.toContain('/landing');
    expect(xml).not.toContain('/pricing');
  });
});
