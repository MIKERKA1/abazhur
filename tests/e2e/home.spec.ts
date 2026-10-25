import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Collects console errors (CSP violations show up there) for the whole test. */
function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

/** yyyy-mm-dd of the next Saturday within the 14-day booking window: evening rates all day. */
function nextSaturday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

test('home loads with SEO basics and a clean console', async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Абажур/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /компьютерный клуб/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Своя лампа над каждым местом');
  await expect(page.locator('.hero').getByRole('link', { name: 'Выбрать место' })).toBeVisible();
  await expect(page.locator('.hero')).toContainText('190 ₽ в час');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test('no horizontal scroll from 320 to 1920 px', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, `width ${width}`).toBeLessThanOrEqual(0);
  }
});

test('no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);
  await page.evaluate(() => scrollTo(0, 0));
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
});

test('every in-page link points at an existing section', async ({ page }) => {
  await page.goto('/');
  const hashes = await page.$$eval('a[href*="#"]', (as) => [...new Set(as.map((a) => new URL((a as HTMLAnchorElement).href).hash))]);
  for (const h of hashes.filter(Boolean)) await expect(page.locator(h), h).toHaveCount(1);
});

test('zone tabs switch with mouse and arrow keys, and the zone link points the plan at it', async ({ page }) => {
  await page.goto('/#zony');
  const camp = page.getByRole('tab', { name: 'Буткемп' });
  await camp.click();
  await expect(page.locator('#zone-camp')).toBeVisible();
  await expect(page.locator('#zone-hall')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Комнаты с PS5' })).toBeFocused();
  await expect(page.locator('#zone-room')).toBeVisible();
  await page.getByRole('tab', { name: 'Буткемп' }).click();
  await page.locator('#zone-camp').getByRole('link', { name: 'Выбрать места в буткемпе' }).click();
  await expect(page).toHaveURL(/#bron$/);
  await expect(page.locator('[data-notice]')).toContainText('Буткемп');
});

test('booking: errors, seats on the plan, live price with a package, honest demo confirmation', async ({ page }) => {
  await page.goto('/#bron');
  await page.getByRole('button', { name: 'Забронировать', exact: true }).click();
  const errors = page.locator('[data-errors]');
  await expect(errors).toBeVisible();
  await expect(errors).toBeFocused();
  await expect(errors.locator('li')).toHaveCount(4);

  await page.locator('#b-date').fill(nextSaturday());
  await page.locator('label.chip', { hasText: '3 часа' }).click();
  // Occupancy is an example that changes by the hour, so pick an evening hour with a free PS5 room.
  const freeRoom = page.locator('#bron input[name="seat"][data-zone="room"]:not([disabled])');
  for (const h of ['18', '19', '20', '21', '17', '16', '15', '14']) {
    await page.locator('#b-hour').selectOption(h);
    if (await freeRoom.count()) break;
  }
  const free = page.locator('#bron input[name="seat"][data-zone="hall"]:not([disabled])');
  await free.nth(0).check();
  await expect(page.locator('[data-s-total]')).toHaveText(/650\s₽/);
  await expect(page.locator('[data-s-deal]')).toContainText('пакет «3 часа»');
  await free.nth(1).check();
  await expect(page.locator('[data-s-total]')).toHaveText(/1\s300\s₽/);
  await expect(page.locator('[data-s-what]')).toContainText('Зал, места');

  // A PS5 room replaces the hall seats and cannot take the night package.
  await freeRoom.first().check();
  await expect(page.locator('#bron input[name="seat"][data-zone="hall"]:checked')).toHaveCount(0);
  await expect(page.locator('input[name="duration"][value="night"]')).toBeDisabled();
  await expect(page.locator('[data-notice]')).toContainText('одной зоны');

  await page.locator('#b-name').fill('Аня');
  await page.locator('#b-phone').fill('89123456789');
  await page.locator('#b-phone').blur();
  await expect(page.locator('#b-phone')).toHaveValue('+7 (912) 345-67-89');
  await page.locator('#b-consent').check();
  await page.getByRole('button', { name: 'Забронировать', exact: true }).click();

  const done = page.locator('[data-done]');
  await expect(done).toBeVisible();
  await expect(done).toContainText('никуда не отправлена');
  await expect(done).toContainText('+7 (912) ***-**-89');
  await expect(done).toContainText('Комната с PS5');
  await done.getByRole('button', { name: 'Начать заново' }).click();
  await expect(page.locator('#b-name')).toHaveValue('');
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length)).toBe(0);
});

test('mobile menu opens, closes with Escape and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const open = page.getByRole('button', { name: 'Меню' });
  await open.click();
  const menu = page.locator('[data-menu]');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(open).toBeFocused();
  await open.click();
  await menu.getByRole('link', { name: 'Цены' }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator('#ceny-title')).toBeFocused();
});

test('reduced motion shows the hero at once and settles the lamps', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.hero .w').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.hero__actions')).toHaveCSS('opacity', '1');
  const lit = await page.locator('[data-stage] .seat[data-on]').count();
  expect(lit).toBeGreaterThan(0);
  expect(lit).toBeLessThan(27);
  await ctx.close();
});

test('privacy, 404, robots and sitemap', async ({ page, request }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveText('Политика конфиденциальности');
  const missing = await page.goto('/net-takoy-stranicy/');
  expect(missing?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Такой страницы нет');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
  expect((await request.get('/sitemap-index.xml')).ok()).toBe(true);
});

test('all requests stay on the same origin', async ({ page, baseURL }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (!['data:', 'blob:'].includes(u.protocol) && u.origin !== new URL(baseURL!).origin) foreign.push(r.url());
  });
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  expect(foreign).toEqual([]);
});
