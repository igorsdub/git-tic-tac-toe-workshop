'use strict';
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const AUTH_FILE = path.join(REPO_ROOT, '.playwright-auth.json');
const OUT_DIR = path.join(__dirname, 'out');
const VIEWPORT = { width: 1440, height: 900 };
const DEFAULT_OUTLINE_COLOR = '#e5484d';

function loadManifest() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'captures.json'), 'utf8'));
}

function outlineStyle(color = DEFAULT_OUTLINE_COLOR) {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new Error(`Unsupported outline colour: ${color}`);
  return `3px solid ${color}`;
}

function storyboardEntry(slug) {
  const entry = (loadManifest().storyboards || []).find((item) => item.slug === slug);
  if (!entry) throw new Error(`Unknown storyboard: ${slug}`);
  return entry;
}

function writeCaptureCompleteMarker(outDir, rawPath, answerText) {
  if (!rawPath || !fs.existsSync(rawPath)) throw new Error('Cannot mark capture complete before its recording is finalized.');
  if (typeof answerText !== 'string' || !answerText.trim()) throw new Error('Cannot mark capture complete without visible answer text.');
  fs.writeFileSync(path.join(outDir, 'capture-complete.json'), JSON.stringify({ status: 'complete', mode: 'Ask', answerVisible: true }, null, 2));
}

function stepEntry(slug) {
  const entry = loadManifest().steps.find((s) => s.slug === slug);
  if (!entry) throw new Error(`Unknown step slug: ${slug}`);
  return entry;
}

async function launch({ headless = true, recordVideo = false, slug, viewport = VIEWPORT, deviceScaleFactor } = {}) {
  const { chromium } = require('playwright');
  if (process.env.HEADLESS === '0') headless = false;
  if (!fs.existsSync(AUTH_FILE)) throw new Error('Run npm run capture:login first');
  const opts = { storageState: AUTH_FILE, viewport };
  if (deviceScaleFactor) opts.deviceScaleFactor = deviceScaleFactor;
  if (recordVideo) {
    if (!slug) throw new Error('launch: slug is required with recordVideo');
    opts.recordVideo = { dir: path.join(OUT_DIR, slug), size: viewport };
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

function createStep(page, slug, { imageDir, screenshots } = {}) {
  const allowed = screenshots || stepEntry(slug).screenshots;
  const imgDir = imageDir || path.join(REPO_ROOT, 'docs', 'images', 'setup', slug);
  const outDir = path.join(OUT_DIR, slug);
  fs.mkdirSync(imgDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });
  const start = Date.now();
  const clicks = [];
  const waits = [];
  const completionFile = path.join(outDir, 'capture-complete.json');
  if (slug === 'look-around') fs.rmSync(completionFile, { force: true });

  function fileFor(name) {
    const file = path.join(imgDir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return file;
  }

  function checkName(name) {
    if (!allowed.includes(name)) {
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
    if (process.env.CAPTURE_VIDEO_ONLY === '1') return;
    await page.screenshot({ path: fileFor(name), mask: masks(), maskColor: '#222222' });
  }

  async function perform(locator, action, { name, captureScreenshot = true, outlineMs = 400, afterActionMs = 0, outlineColor = DEFAULT_OUTLINE_COLOR } = {}) {
    if (name && captureScreenshot) checkName(name);
    const outline = outlineStyle(outlineColor);
    await locator.scrollIntoViewIfNeeded();
    await locator.evaluate((el, style) => {
      el.dataset.captureOutline = el.style.outline;
      el.dataset.captureOffset = el.style.outlineOffset;
      el.style.outline = style;
      el.style.outlineOffset = '3px';
    }, outline);
    await page.waitForTimeout(outlineMs);
    const box = await locator.boundingBox();
    if (name && captureScreenshot && process.env.CAPTURE_VIDEO_ONLY !== '1') {
      await page.screenshot({ path: fileFor(name), mask: masks(), maskColor: '#222222' });
    }
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
    await action();
    if (afterActionMs) await page.waitForTimeout(afterActionMs);
  }

  async function click(locator, name, { outlineMs = 400, afterClickMs = 0, captureScreenshot = true, outlineColor } = {}) {
    return perform(locator, () => locator.click(), { name, outlineMs, afterActionMs: afterClickMs, captureScreenshot, outlineColor });
  }

  // Browser page zoom, as in Chrome's zoom control. 2 is 200%.
  async function applyPageZoom(zoom) {
    const factor = Number(zoom);
    if (!Number.isFinite(factor) || factor <= 0) throw new Error(`Invalid page zoom: ${zoom}`);
    await page.evaluate((value) => {
      document.documentElement.style.zoom = String(value);
    }, factor);
  }

  async function finish() {
    fs.writeFileSync(path.join(outDir, 'clicks.json'), JSON.stringify(clicks, null, 2));
    fs.writeFileSync(path.join(outDir, 'waits.json'), JSON.stringify(waits, null, 2));
    const video = page.video();
    await page.context().close();
    if (!video) return null;
    const raw = path.join(outDir, 'raw.webm');
    fs.copyFileSync(await video.path(), raw);
    return raw;
  }

  function markComplete(rawPath, answerText) {
    writeCaptureCompleteMarker(outDir, rawPath, answerText);
  }

  function recordWait(startMs, endMs) {
    if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
      waits.push({ start: startMs - start, end: endMs - start, speed: 4 });
    }
  }

  return { shot, click, perform, applyPageZoom, recordWait, markComplete, finish };
}

module.exports = {
  AUTH_FILE, OUT_DIR, REPO_ROOT, VIEWPORT, DEFAULT_OUTLINE_COLOR,
  launch, createStep, loadManifest, storyboardEntry, outlineStyle, writeCaptureCompleteMarker,
};
