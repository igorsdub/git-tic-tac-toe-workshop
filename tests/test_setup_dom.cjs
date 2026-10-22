const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const explicitChromium = process.env.CHROMIUM_BIN || process.env.CHROMIUM_PATH;
const chromium = explicitChromium || (() => {
  try {
    const candidate = execFileSync('which', ['chromium'], { encoding: 'utf8' }).trim();
    if (candidate && fs.existsSync(candidate)) return candidate;
  } catch {}
  const chromeApp = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return fs.existsSync(chromeApp) ? chromeApp : null;
})();
const chromiumHeadlessUsable = chromium
  ? spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--dump-dom', 'about:blank'], { encoding: 'utf8', timeout: 5000 }).status === 0
  : false;
if (explicitChromium && !chromiumHeadlessUsable) {
  throw new Error(`CHROMIUM_BIN/CHROMIUM_PATH is not a usable headless browser: ${explicitChromium}`);
}

const repo = path.resolve(__dirname, '..');
const catalog = { defaultWorkshopId: 'ws-code', workshops: [
  { id: 'ws-code', name: 'Code Day', date: '2026-11-06', status: 'active', registrationUrl: 'https://example.test/r', setupTrack: 'codespaces', surveyUrl: 'https://example.test/survey' },
  { id: 'ws-old', name: 'Old Day', date: '2026-10-01', status: 'archived', registrationUrl: 'https://example.test/r', setupTrack: 'codespaces' },
  { id: 'ws-pend-survey', name: 'Pending A', date: '2026-11-10', status: 'active', registrationUrl: 'https://example.test/r', surveyUrl: 'https://example.test/s2' },
  { id: 'ws-pend', name: 'Pending B', date: '2026-11-11', status: 'active', registrationUrl: 'https://example.test/r' },
] };

// Runs setup.html in headless Chromium; `script` runs after setup.js and must set data-result.
function runSetup(query, script, mp4Status = 404, catalogStatus = 200) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-dom-'));
  const source = fs.readFileSync(path.join(repo, 'docs/setup.html'), 'utf8');
  const html = source
    .replace(/<script src="[^"]+"><\/script>/g, '')
    .replace(/href="styles\.css"/g, `href="${path.join(repo, 'docs/styles.css')}"`)
    .replace(/ loading="lazy"/g, '')
    .replace(/(src|data-light-src|data-dark-src)="images\//g, '$1="file:///nonexistent/images/')
    .replace('</body>', `<script>
      window.fetch = async (url) => String(url).endsWith('.mp4') ? new Response('', { status: ${mp4Status} }) : new Response(JSON.stringify(${JSON.stringify(catalog)}), { status: ${catalogStatus}, headers: { 'Content-Type': 'application/json' } });
    </script>
    <script src="${path.join(repo, 'docs/workshop-context.js')}"></script>
    <script src="${path.join(repo, 'docs/setup.js')}"></script>
    <script>
      (async () => {
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const vis = (id) => !document.getElementById(id).hidden;
        await window.WorkshopContext.ready.catch(() => {});
        await wait(100);
        const choose = async (id) => {
          const select = document.getElementById('workshop-select');
          select.value = id;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          await wait(50);
        };
        try { ${script} } catch (error) { document.body.dataset.error = String(error); document.body.dataset.result = 'FAIL'; }
      })();
    </script></body>`);
  const htmlPath = path.join(tempDir, 'setup.html');
  fs.writeFileSync(htmlPath, html);
  try {
    const result = spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking', '--virtual-time-budget=8000', '--dump-dom', `file://${htmlPath}${query}`], { encoding: 'utf8', timeout: 20000 });
    assert.equal(result.status, 0, `signal=${result.signal} error=${result.error || ''}\n${result.stderr}`);
    assert.match(result.stdout, /data-result="PASS"/, result.stdout.slice(-3000));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

const opts = { skip: !chromiumHeadlessUsable };

test('bare URL picks the catalog default and shows its track', opts, () => {
  runSetup('', `
    const ok = vis('setup-codespaces') && !vis('setup-archived') && !vis('setup-pending')
      && document.getElementById('setup-workshop').textContent === 'Code Day \\u00b7 6 Nov 2026'
      && document.querySelector('[data-survey-link]').getAttribute('href') === 'https://example.test/survey';
    document.body.dataset.result = ok ? 'PASS' : 'FAIL';`);
});

test('archived workshop shows only the finished notice', opts, () => {
  runSetup('?workshop=ws-old', `
    const ok = vis('setup-archived') && !vis('setup-codespaces') && !vis('setup-pending') && !vis('setup-next')
      && document.getElementById('setup-archived').textContent.trim() === 'This workshop has finished.';
    document.body.dataset.result = ok ? 'PASS' : 'FAIL';`);
});

test('workshop without a track shows the pending notice, with a survey link only when configured', opts, () => {
  runSetup('?workshop=ws-pend-survey', `
    const withSurvey = vis('setup-pending') && !vis('setup-codespaces') && vis('setup-pending-survey')
      && document.getElementById('setup-pending').textContent.includes('Setup for this workshop is not published yet')
      && document.querySelector('#setup-pending-survey a').getAttribute('href') === 'https://example.test/s2';
    await choose('ws-pend');
    const without = vis('setup-pending') && !vis('setup-pending-survey');
    document.body.dataset.result = withSurvey && without ? 'PASS' : 'FAIL';`);
});

test('codespaces track renders six steps and checkbox state persists per workshop', opts, () => {
  runSetup('', `
    const boxes = document.querySelectorAll('#setup-codespaces .step-check');
    const six = boxes.length === 6 && document.querySelectorAll('#setup-codespaces .setup-step').length === 6;
    const box = document.getElementById('check-step-repo');
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    const stored = localStorage.getItem('ttt_setup_ws-code_step-repo') === '1';
    await choose('ws-pend');
    await choose('ws-code');
    const survived = document.getElementById('check-step-repo').checked && !document.getElementById('check-step-stop').checked;
    box.checked = false;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    document.body.dataset.result = six && stored && survived && localStorage.getItem('ttt_setup_ws-code_step-repo') === null ? 'PASS' : 'FAIL';`);
});

test('unknown workshop falls back to the default', opts, () => {
  runSetup('?workshop=nope', `
    document.body.dataset.result = vis('setup-codespaces')
      && document.getElementById('setup-workshop').textContent.startsWith('Code Day') ? 'PASS' : 'FAIL';`);
});

test('missing images and videos are hidden, not broken', opts, () => {
  runSetup('', `
    for (let i = 0; i < 40 && document.querySelectorAll('figure.step-shot:not([hidden]), details.step-video-wrap:not([hidden])').length; i += 1) await wait(100);
    const figures = Array.from(document.querySelectorAll('figure.step-shot'));
    const wraps = Array.from(document.querySelectorAll('details.step-video-wrap'));
    const ok = figures.length > 0 && figures.every((f) => f.hidden) && wraps.length === 4 && wraps.every((w) => w.hidden);
    document.body.dataset.result = ok ? 'PASS' : 'FAIL';`);
});

test('a video whose file exists stays visible on a transient error', opts, () => {
  runSetup('', `
    await wait(300);
    const videos = Array.from(document.querySelectorAll('video.step-video'));
    videos.forEach((v) => v.dispatchEvent(new Event('error')));
    await wait(300);
    const wraps = Array.from(document.querySelectorAll('details.step-video-wrap'));
    const ok = wraps.length === 4 && wraps.every((w) => !w.hidden && w.querySelector('.video-reload'));
    document.body.dataset.result = ok ? 'PASS' : 'FAIL';`, 200);
});

test('catalog load failure shows a visible message instead of an empty page', opts, () => {
  runSetup('', `
    const error = document.getElementById('setup-error');
    const ok = vis('setup-error') && error.getAttribute('role') === 'alert'
      && error.textContent.includes('Workshop details could not be loaded')
      && !vis('setup-codespaces') && !vis('setup-pending') && !vis('setup-archived');
    document.body.dataset.result = ok ? 'PASS' : 'FAIL';`, 404, 500);
});
