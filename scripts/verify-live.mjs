import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
await mkdir('evidence', { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const safe = text => text.replace(/access_token=[^&\s"']+/g, 'access_token=[redacted]').replace(/pk\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[public map credential]');
try {
  for (const width of [1366, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    const failedAssets = [];
    let mapStyleLoaded = false;
    page.on('pageerror', error => errors.push(safe(error.message)));
    page.on('response', response => {
      const url = new URL(response.url());
      if (url.hostname === 'api.mapbox.com' && url.pathname.includes('/styles/v1/') && response.ok()) mapStyleLoaded = true;
      if (response.status() >= 400 && ['script', 'stylesheet', 'font', 'image', 'fetch', 'xhr'].includes(response.request().resourceType())) {
        failedAssets.push(response.status() + ' ' + url.origin + url.pathname);
      }
    });
    const response = await page.goto('https://2026.santacruzreunion.com/', { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => typeof mapInstance !== 'undefined' && mapInstance && mapInstance.loaded(), { timeout: 60000 });
    assert(mapStyleLoaded, 'Map style must load with the existing credential on the new domain');
    assert.equal(await page.locator('.lodging-card').count(), 16);
    assert.equal(await page.locator('a[href*="netlify.app"],script[src*="netlify.app"],img[src*="netlify.app"]').count(), 0);
    const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute('href')).filter(href => href.length > 1 && !document.getElementById(href.slice(1))));
    assert.deepEqual(brokenAnchors, []);
    await page.screenshot({ path: 'evidence/guest-' + width + '.png', fullPage: true });
    await page.getByRole('button', { name: 'Explore the Guide' }).click();
    await page.locator('#map').scrollIntoViewIfNeeded();
    assert(await page.locator('.map-marker').count() > 20);
    await page.getByRole('button', { name: 'Lodging', exact: true }).click();
    assert.equal(await page.locator('.map-marker').evaluateAll(markers => markers.filter(m => getComputedStyle(m).pointerEvents !== 'none').length), 6);
    await page.screenshot({ path: 'evidence/map-' + width + '.png' });
    await page.getByRole('button', { name: 'All', exact: true }).click();
    for (const id of ['schedule-section', 'lodging-section', 'field-guide-section']) {
      await page.goto('https://2026.santacruzreunion.com/#' + id);
      await page.locator('#' + id).scrollIntoViewIfNeeded();
      assert(await page.locator('#' + id).isVisible(), id);
    }
    assert.deepEqual(errors, [], 'No page JavaScript errors');
    assert.deepEqual(failedAssets, [], 'All required assets load');
    console.log(JSON.stringify({ width, https: 200, mapLoaded: true, mapStyleAuthorized: true, lodgingSuggestions: 16, lodgingMapPins: 6, brokenAnchors, errors, failedAssets }));
    await context.close();
  }
} finally {
  await browser.close();
}
