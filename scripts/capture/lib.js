'use strict';
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const AUTH_FILE = path.join(REPO_ROOT, '.playwright-auth.json');
const OUT_DIR = path.join(__dirname, 'out');
const VIEWPORT = { width: 1440, height: 900 };

function loadManifest() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'captures.json'), 'utf8'));
}

function stepEntry(slug) {
  const entry = loadManifest().steps.find((s) => s.slug === slug);
  if (!entry) throw new Error(`Unknown step slug: ${slug}`);
  return entry;
}

async function launch({ headless = true, recordVideo = false, slug } = {}) {
  const { chromium } = require('playwright');
  if (process.env.HEADLESS === '0') headless = false;
  if (!fs.existsSync(AUTH_FILE)) throw new Error('Run npm run capture:login first');
  const opts = { storageState: AUTH_FILE, viewport: VIEWPORT };
  if (recordVideo) {
    if (!slug) throw new Error('launch: slug is required with recordVideo');
    opts.recordVideo = { dir: path.join(OUT_DIR, slug), size: VIEWPORT };
  }
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext(opts);
  // Closing the context also closes the browser, so step scripts need no changes.
  const closeContext = context.close.bind(context);
  context.close = async (...args) => {
    await closeContext(...args);
    await browser.close();
  };
  return context;
}

function createStep(page, slug) {
  const entry = stepEntry(slug);
  const imgDir = path.join(REPO_ROOT, 'docs', 'images', 'setup', slug);
  const outDir = path.join(OUT_DIR, slug);
  fs.mkdirSync(imgDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });
  const start = Date.now();
  const clicks = [];

  function checkName(name) {
    if (!entry.screenshots.includes(name)) {
      throw new Error(`Screenshot "${name}" is not listed for "${slug}" in captures.json`);
    }
  }

  const masks = () => [
    page.locator('header [data-testid="user-menu-button"]'),
    page.locator('header img.avatar'),
  ];

  async function shot(locator, name) {
    checkName(name);
    if (locator) await locator.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(imgDir, name), mask: masks(), maskColor: '#222222' });
  }

  async function click(locator, name) {
    checkName(name);
    await locator.scrollIntoViewIfNeeded();
    await locator.evaluate((el) => {
      el.dataset.captureOutline = el.style.outline;
      el.dataset.captureOffset = el.style.outlineOffset;
      el.style.outline = '3px solid #e5484d';
      el.style.outlineOffset = '3px';
    });
    await page.waitForTimeout(400);
    const box = await locator.boundingBox();
    await page.screenshot({ path: path.join(imgDir, name), mask: masks(), maskColor: '#222222' });
    if (box) {
      clicks.push({
        t: Date.now() - start,
        x: Math.round(box.x + box.width / 2),
        y: Math.round(box.y + box.height / 2),
        name,
      });
    }
    await locator.evaluate((el) => {
      el.style.outline = el.dataset.captureOutline || '';
      el.style.outlineOffset = el.dataset.captureOffset || '';
    }).catch(() => {});
    await locator.click();
  }

  async function finish() {
    fs.writeFileSync(path.join(outDir, 'clicks.json'), JSON.stringify(clicks, null, 2));
    const video = page.video();
    await page.context().close();
    if (!video) return null;
    const raw = path.join(outDir, 'raw.webm');
    fs.copyFileSync(await video.path(), raw);
    return raw;
  }

  return { shot, click, finish };
}

module.exports = { AUTH_FILE, OUT_DIR, REPO_ROOT, VIEWPORT, launch, createStep, loadManifest };
