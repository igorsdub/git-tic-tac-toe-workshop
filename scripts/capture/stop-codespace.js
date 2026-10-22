'use strict';
const fs = require('fs');
const path = require('path');
const { launch, createStep, OUT_DIR } = require('./lib');

const SLUG = 'stop-codespace';
const REPO = process.env.CAPTURE_REPO || 'tic-tac-toe-demo';
const SETUP_URL = process.env.SETUP_URL || 'http://127.0.0.1:8765/docs/setup.html#step-stop';

const SELECTORS = {
  // Match the exact demo repository, never similarly named repositories.
  row: (p) => p.locator('li, [role=listitem], div')
    .filter({ has: p.locator(`a[href$="/${REPO}"]`) })
    .filter({ has: p.getByRole('button') })
    .last(),
  moreMenu: (p) => SELECTORS.row(p).getByRole('button').first(),
  stop: (p) => p.getByRole('menuitemradio', { name: 'Stop codespace' }),
  stoppedLabel: (p) => SELECTORS.row(p).getByText(/Last used|Stopped/).first(),
};

const OUT_DIR_FOR_STEP = path.join(OUT_DIR, SLUG);
const STORYBOARD_PATH = path.join(__dirname, 'storyboards', `${SLUG}.json`);

function writeStoryboard(clicks) {
  const byName = new Map(clicks.map((click) => [click.name, click]));
  const link = byName.get('open-codespaces');
  const row = byName.get('target-codespace-row');
  const menu = byName.get('open-more-menu');
  const stop = byName.get('stop-codespace');
  const confirmation = byName.get('stopped-confirmation');
  if (!link || !row || !menu || !stop || !confirmation) throw new Error('Stop recording is missing a navigation, row, menu, Stop action, or stopped confirmation marker.');

  const linkAt = link.t / 1000;
  const rowAt = row.t / 1000;
  const menuAt = menu.t / 1000;
  const stopAt = stop.t / 1000;
  const confirmationAt = confirmation.t / 1000;
  if (confirmationAt < stopAt + 2.5) throw new Error('Stopped confirmation marker precedes the required 2.5 second action hold.');
  // The capture helper records the marker just before releasing the outline
  // and clicking. Sample within that visible outline so Chromium's next frame
  // cannot already show the destination page or changed Codespace state.
  const linkFocusAt = Math.max(0, linkAt - 0.15);
  const rowFocusAt = Math.max(0, rowAt - 0.15);
  const menuFocusAt = Math.max(0, menuAt - 0.15);
  const wide = { scale: 1, focus: { x: 720, y: 450 } };
  // The setup page places this instruction near the lower fold. Bias the
  // camera down so the highlighted URL stays fully inside the zoomed frame.
  const linkFocus = { x: link.x, y: Math.max(link.y, 900) };
  const menuCamera = { scale: 2, focus: { x: menu.x, y: menu.y } };
  const storyboard = {
    version: 1,
    segments: [
      // Keep the full red-outline lead-in before each freeze so the target is
      // visible in context before the camera moves in.
      { kind: 'live', start: 0, end: linkAt, speed: 1, camera: wide },
      {
        kind: 'freeze', at: linkFocusAt, duration: 1.2,
        focus: linkFocus, zoom: { from: 1, to: 2, ease: 1.2 },
      },
      { kind: 'live', start: linkAt, end: rowAt, speed: 1, camera: { scale: 2, focus: linkFocus } },
      {
        kind: 'freeze', at: rowFocusAt, duration: 1.2,
        // Continue from the link's focused camera and zoom back out without
        // jumping the crop to the row before the list has been established.
        focus: linkFocus, zoom: { from: 2, to: 1, ease: 1.2 },
      },
      { kind: 'live', start: rowAt, end: menuAt, speed: 1, camera: wide },
      {
        kind: 'freeze', at: menuFocusAt, duration: 1.2,
        focus: { x: menu.x, y: menu.y }, zoom: { from: 1, to: 2, ease: 1.2 },
      },
      { kind: 'live', start: menuAt, end: confirmationAt, speed: 1, camera: menuCamera },
      {
        kind: 'freeze', at: confirmationAt, duration: 1.2,
        focus: { x: menu.x, y: menu.y }, zoom: { from: 2, to: 1, ease: 1.2 },
      },
      { kind: 'live', start: confirmationAt, end: confirmationAt + 1, speed: 1, camera: wide },
    ],
  };
  fs.writeFileSync(STORYBOARD_PATH, JSON.stringify(storyboard, null, 2));
}

async function run() {
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  const captureStarted = Date.now();

  await page.goto(SETUP_URL);
  await page.locator('#step-stop').waitFor({ state: 'visible' });
  // Keep the published route and let the actual link perform navigation.
  const codespacesLink = page.locator('#step-stop a[href="https://github.com/codespaces"]').first();
  await page.waitForTimeout(3000);
  // The source page sets target=_blank for regular readers; use the same real
  // link in this recording tab so the browser's page recording includes the nav.
  await codespacesLink.evaluate((link) => link.removeAttribute('target'));
  await step.perform(codespacesLink, () => codespacesLink.click(), {
    name: 'open-codespaces', captureScreenshot: false, outlineMs: 500, afterActionMs: 2500,
  });
  await page.waitForLoadState('domcontentloaded');
  await page.locator(`a[href$="/${REPO}"]`).first().waitFor();

  const row = SELECTORS.row(page);
  await row.waitFor({ state: 'visible' });
  await step.perform(row, async () => {}, {
    name: 'target-codespace-row', captureScreenshot: false, outlineMs: 500, afterActionMs: 2500,
  });
  const moreMenu = SELECTORS.moreMenu(page);
  await step.click(moreMenu, 'open-more-menu', {
    captureScreenshot: false, outlineMs: 500, afterClickMs: 2500,
  });
  const stop = SELECTORS.stop(page);
  await stop.waitFor({ state: 'visible' });
  await step.click(stop, 'stop-codespace', { captureScreenshot: false, outlineMs: 500, afterClickMs: 2500 });
  await SELECTORS.stoppedLabel(page).waitFor({ timeout: 60000 });
  const confirmation = await SELECTORS.row(page).innerText();
  if (!/Last used|Stopped/.test(confirmation) || /Shutting down|Active/.test(confirmation)) {
    throw new Error(`Codespace did not reach the stopped confirmation: ${confirmation}`);
  }
  const clicksPath = path.join(OUT_DIR_FOR_STEP, 'clicks.json');
  const clicks = JSON.parse(fs.readFileSync(clicksPath, 'utf8'));
  clicks.push({ t: Date.now() - captureStarted, x: 720, y: 450, name: 'stopped-confirmation' });
  fs.writeFileSync(clicksPath, JSON.stringify(clicks, null, 2));
  await page.waitForTimeout(1000);

  const raw = await step.finish();
  writeStoryboard(clicks);
  return raw;
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS, writeStoryboard };
