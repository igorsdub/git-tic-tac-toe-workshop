'use strict';
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PROFILE_DIR = path.join(REPO_ROOT, '.playwright-profile');
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
  const opts = { headless, viewport: VIEWPORT };
  if (recordVideo) {
    if (!slug) throw new Error('launch: slug is required with recordVideo');
    opts.recordVideo = { dir: path.join(OUT_DIR, slug), size: VIEWPORT };
  }
  return chromium.launchPersistentContext(PROFILE_DIR, opts);
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

  async function shot(locator, name) {
    checkName(name);
    if (locator) await locator.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(imgDir, name) });
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
    await page.screenshot({ path: path.join(imgDir, name) });
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

module.exports = { PROFILE_DIR, OUT_DIR, REPO_ROOT, VIEWPORT, launch, createStep, loadManifest };
