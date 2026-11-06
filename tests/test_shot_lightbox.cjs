const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { shouldExpandClick } = require('../docs/shot-lightbox.js');

const repo = path.resolve(__dirname, '..');

test('plain clicks enlarge and modified clicks keep the new-tab fallback', () => {
  assert.equal(shouldExpandClick({ button: 0 }), true);
  assert.equal(shouldExpandClick({}), true);
  for (const event of [
    null,
    { button: 0, defaultPrevented: true },
    { button: 1 },
    { button: 0, metaKey: true },
    { button: 0, ctrlKey: true },
    { button: 0, shiftKey: true },
    { button: 0, altKey: true },
  ]) {
    assert.equal(shouldExpandClick(event), false);
  }
});

test('guide and time machine share the lightbox and keep the no-JS image links', () => {
  const css = fs.readFileSync(path.join(repo, 'docs/styles.css'), 'utf8');
  const rule = css.slice(css.indexOf('.shot-lightbox-image'), css.indexOf('}', css.indexOf('.shot-lightbox-image')));
  assert.match(rule, /object-fit:\s*contain/);
  assert.match(rule, /max-width:\s*100%/);
  assert.match(rule, /max-height:\s*100%/);
  assert.doesNotMatch(rule, /object-fit:\s*cover/);
  assert.match(css, /html\.shot-lightbox-open/);
  assert.doesNotMatch(css, /shot-lightbox-close|shot-lightbox-original|shot-lightbox-title|Open original size/);
  for (const page of ['guide.html', 'time-machine.html']) {
    const html = fs.readFileSync(path.join(repo, 'docs', page), 'utf8');
    assert.match(html, /src="shot-lightbox\.js"/);
    assert.match(html, /<a class="step-image-link" href="[^"]+" target="_blank"/);
  }
  assert.doesNotMatch(fs.readFileSync(path.join(repo, 'docs/setup.html'), 'utf8'), /shot-lightbox\.js/);
});

function findBrowser() {
  const explicit = process.env.CHROMIUM_BIN || process.env.CHROMIUM_PATH;
  const candidates = explicit ? [explicit] : [];
  for (const name of ['chromium', 'google-chrome', 'google-chrome-stable']) {
    try {
      const found = execFileSync('which', [name], { encoding: 'utf8' }).trim();
      if (found) candidates.push(found);
    } catch { /* try the next name */ }
  }
  return candidates.find((candidate) => fs.existsSync(candidate) && spawnSync(candidate, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--dump-dom', 'about:blank',
  ], { encoding: 'utf8', timeout: 15000 }).status === 0) || null;
}

function runPage(browser, windowSize, script) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shot-lightbox-'));
  const image = path.join(repo, 'docs/images/guide/start-together/01-on-main.png');
  const htmlPath = path.join(dir, 'page.html');
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<link rel="stylesheet" href="${path.join(repo, 'docs/styles.css')}">
</head>
<body style="margin:0">
<main>
<div style="height:1100px"></div>
<a id="shot" class="step-image-link" href="${image}" target="_blank" rel="noopener noreferrer" aria-label="Open full-size image: main outlined">
<img src="${image}" alt="Status bar with main outlined, empty BOARD.txt, and a clean Source Control view">
</a>
<div style="height:1100px"></div>
</main>
<script src="${path.join(repo, 'docs/shot-lightbox.js')}"></script>
<script>${script}</script>
</body></html>`;
  fs.writeFileSync(htmlPath, html);
  const result = spawnSync(browser, [
    '--headless=new', '--no-sandbox', '--disable-gpu', `--window-size=${windowSize}`,
    '--virtual-time-budget=8000', '--dump-dom', `file://${htmlPath}`,
  ], { encoding: 'utf8', timeout: 20000 });
  fs.rmSync(dir, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr);
  const match = result.stdout.match(/data-lightbox-result="([^"]*)"/);
  const detail = result.stdout.match(/data-lightbox-detail="([^"]*)"/);
  assert.ok(match, result.stdout.slice(-1500));
  return { result: match[1], detail: detail ? detail[1].replaceAll('&quot;', '"') : '' };
}

const browser = findBrowser();

test('enlarged screenshot keeps its frame, alt, focus, and scroll position', { skip: !browser }, () => {
  const script = `
    window.addEventListener('load', () => {
      const link = document.getElementById('shot');
      link.scrollIntoView({ block: 'center' });
      const before = window.scrollY;
      link.focus();
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
      const stayed = document.querySelector('.shot-lightbox').hidden === true;
      link.click();
      const dialog = document.querySelector('.shot-lightbox');
      const image = dialog.querySelector('.shot-lightbox-image');
      const finish = () => {
        const box = image.getBoundingClientRect();
        const style = getComputedStyle(image);
        const ratio = box.width / box.height;
        const labelled = dialog.querySelector('[role="dialog"]');
        const openOk = dialog.hidden === false
          && labelled.getAttribute('aria-modal') === 'true'
          && labelled.getAttribute('aria-label').includes('main outlined')
          && !dialog.querySelector('button, a, .shot-lightbox-close, .shot-lightbox-original, .shot-lightbox-title')
          && image.alt.includes('main outlined')
          && image.getAttribute('src').endsWith('01-on-main.png')
          && document.activeElement === labelled
          && style.objectFit === 'contain'
          && box.width > 40 && box.height > 40
          && box.top >= -1 && box.left >= -1
          && box.bottom <= window.innerHeight + 1
          && box.right <= window.innerWidth + 1
          && ratio > 1.55 && ratio < 1.65
          && image.naturalWidth === 1920 && image.naturalHeight === 1200;
        image.click();
        const closed = dialog.hidden === true
          && document.activeElement === link
          && Math.abs(window.scrollY - before) < 3
          && link.getAttribute('aria-expanded') === 'false';
        link.click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        const escaped = dialog.hidden === true && document.activeElement === link && Math.abs(window.scrollY - before) < 3;
        link.click();
        document.querySelector('.shot-lightbox').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const outside = document.querySelector('.shot-lightbox').hidden === true;
        const pass = stayed && openOk && closed && escaped && outside;
        document.body.dataset.lightboxResult = pass ? 'PASS' : 'FAIL';
        document.body.dataset.lightboxDetail = JSON.stringify({
          stayed, openOk, closed, outside, before, after: window.scrollY,
          box: [Math.round(box.width), Math.round(box.height)], viewport: [window.innerWidth, window.innerHeight],
        });
      };
      if (image.complete && image.naturalWidth) finish();
      else image.addEventListener('load', finish, { once: true });
    });
  `;
  const desktop = runPage(browser, '1280,900', script);
  assert.equal(desktop.result, 'PASS', desktop.detail);
  const mobile = runPage(browser, '390,700', script);
  assert.equal(mobile.result, 'PASS', mobile.detail);
});
