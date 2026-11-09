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
      && !document.querySelector('[data-survey-link]')
      && !document.getElementById('step-survey')
      && !document.getElementById('guide-cleanup');
    document.body.dataset.result = ok ? 'PASS' : 'FAIL';`);
});

test('archived workshop shows only the finished notice', opts, () => {
  runSetup('?workshop=ws-old', `
    const ok = vis('setup-archived') && !vis('setup-codespaces') && !vis('setup-pending') && !vis('setup-next')
      && document.getElementById('setup-archived').textContent.trim() === 'This workshop has finished.';
    document.body.dataset.result = ok ? 'PASS' : 'FAIL';`);
});

test('workshop without a track shows the pending notice and no survey', opts, () => {
  runSetup('?workshop=ws-pend-survey', `
    const pending = vis('setup-pending') && !vis('setup-codespaces')
      && document.getElementById('setup-pending').textContent.includes('Setup for this workshop is not published yet')
      && !document.querySelector('[data-survey-link]');
    await choose('ws-pend');
    const stillPending = vis('setup-pending') && !vis('setup-codespaces');
    document.body.dataset.result = pending && stillPending ? 'PASS' : 'FAIL';`);
});

test('codespaces track renders four steps and checkbox state persists per workshop', opts, () => {
  runSetup('', `
    const boxes = document.querySelectorAll('#setup-codespaces .step-check');
    const four = boxes.length === 4 && document.querySelectorAll('#setup-codespaces .setup-step').length === 4;
    const box = document.getElementById('check-step-repo');
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    const stored = localStorage.getItem('ttt_setup_ws-code_step-repo') === '1';
    await choose('ws-pend');
    await choose('ws-code');
    const survived = document.getElementById('check-step-repo').checked && !document.getElementById('check-step-look-around').checked;
    box.checked = false;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    document.body.dataset.result = four && stored && survived && localStorage.getItem('ttt_setup_ws-code_step-repo') === null ? 'PASS' : 'FAIL';`);
});

test('screenshots are visible without video', opts, () => {
  runSetup('', `const pictures = [...document.querySelectorAll('.step-pictures')]; document.body.dataset.result = pictures.length === 3 && pictures.every(p => p.querySelector('figure img') && !p.closest('details')) && !document.querySelector('video') && !document.getElementById('guide-cleanup') ? 'PASS' : 'FAIL';`);
});

test('setup page opens each section with its goal and keeps the template and codespace pictures', () => {
  const html = fs.readFileSync(path.join(repo, 'docs/setup.html'), 'utf8');
  const account = html.match(/<section class="setup-guide-section" id="step-account">([\s\S]*?)<\/section>/)?.[1];
  const template = html.match(/<section class="setup-guide-section" id="guide-template">([\s\S]*?)<\/section>/)?.[1];
  const images = [...html.matchAll(/<a class="step-image-link" href="([^"]+)"[^>]*><img src="([^"]+)"/g)];
  assert.match(html, /Copilot answers "what does this repository do\?"/);
  assert.match(html, /You can sign in to GitHub\./);
  assert.match(html, /<span class="step-num">1<\/span> Create a GitHub account/);
  assert.ok(account, 'account section exists');
  assert.match(account, /<aside class="student-pack-callout"[\s\S]*?<h3 id="student-pack-heading">Recommended: GitHub Student Developer Pack<\/h3>/);
  assert.match(account.trimEnd(), /<\/aside>\s*<\/article>$/);
  assert.match(template || '', /<span class="step-num">2<\/span> Create a repository from the template/);
  assert.match(template || '', /The template now has only <code>main<\/code>, so the copy is just <code>main<\/code>/);
  assert.match(template || '', /class="template-repository-link"[\s\S]*?href="https:\/\/github\.com\/igorsdub\/git-tic-tac-toe-template"/);
  assert.doesNotMatch(template || '', /match-01/);
  assert.match(html, /<span class="step-num">3<\/span> Check Codespaces and GitHub Copilot/);
  assert.match(html, /what does this repository do\?/);
  assert.doesNotMatch(html, /Fill in the survey|Clean up|step-delete|03-cleaning-up/);
  assert.equal(images.length, 21);
  assert.ok(images.every(([, href, src]) => href === src), 'manual image links and sources match');
});

test('setup page renders the new section and completion structure', opts, () => {
  runSetup('', `
    const account = document.querySelector('#step-account');
    const survey = document.querySelector('#step-survey');
    const template = document.querySelector('#guide-template');
    const cleanup = document.querySelector('#guide-cleanup');
    const text = document.querySelector('#setup-codespaces').textContent;
    const heading = selector => document.querySelector(selector).textContent.replace(/\\s+/g, ' ').trim();
    const images = [...document.querySelectorAll('#setup-codespaces .step-pictures img')];
    const checks = {
      opening: document.querySelector('#step-account .section-goal').textContent === 'You can sign in to GitHub.',
      noSurvey: !survey && !document.querySelector('[data-survey-link]'),
      accountHeading: heading('#step-account .setup-section-heading') === '1 Create a GitHub account',
      accountCopy: account.textContent.includes('GitHub stores the project and the history of its changes.'),
      studentPackLast: account.querySelector('.setup-step').lastElementChild.classList.contains('student-pack-callout'),
      studentPackHeading: account.querySelector('.student-pack-callout h3').textContent === 'Recommended: GitHub Student Developer Pack',
      templateHeading: heading('#guide-template .setup-section-heading') === '2 Create a repository from the template',
      templateCopy: template.textContent.includes('The template now has only main, so the copy is just main.'),
      templateLink: template.querySelector('.template-repository-link a')?.href === 'https://github.com/igorsdub/git-tic-tac-toe-template',
      noMatchReference: !template.textContent.includes('match-01'),
      codespacesGoal: document.querySelector('#guide-codespaces .section-goal').textContent === 'Copilot answers "what does this repository do?"',
      codespacesHeading: heading('#guide-codespaces .setup-section-heading') === '3 Check Codespaces and GitHub Copilot',
      noCleanup: !cleanup && !text.includes('Delete the Codespace'),
      images: images.length === 21 && images.every(image => image.closest('a.step-image-link')?.getAttribute('href')),
      onwardHidden: getComputedStyle(document.getElementById('setup-next')).display === 'none'
    };
    const failed = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
    if (failed.length) {
      const details = document.createElement('pre');
      details.id = 'setup-render-failures';
      details.textContent = failed.join(', ');
      document.body.append(details);
    }
    document.body.dataset.result = failed.length ? 'FAIL' : 'PASS';`);
});

test('unknown workshop falls back to the default', opts, () => {
  runSetup('?workshop=nope', `
    document.body.dataset.result = vis('setup-codespaces')
      && document.getElementById('setup-workshop').textContent.startsWith('Code Day') ? 'PASS' : 'FAIL';`);
});

test('catalog load failure shows a visible message instead of an empty page', opts, () => {
  runSetup('', `
    const error = document.getElementById('setup-error');
    const ok = vis('setup-error') && error.getAttribute('role') === 'alert'
      && error.textContent.includes('Workshop details could not be loaded')
      && !vis('setup-codespaces') && !vis('setup-pending') && !vis('setup-archived');
    document.body.dataset.result = ok ? 'PASS' : 'FAIL';`, 404, 500);
});
