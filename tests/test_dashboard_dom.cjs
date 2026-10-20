const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const chromium = (() => {
  try {
    const candidate = execFileSync('which', ['chromium'], { encoding: 'utf8' }).trim();
    if (candidate && fs.existsSync(candidate) && !candidate.endsWith('/chromium')) return candidate;
  } catch {}
  const chromeApp = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return fs.existsSync(chromeApp) ? chromeApp : null;
})();
const chromiumHeadlessUsable = chromium
  ? spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--dump-dom', 'about:blank'], { encoding: 'utf8', timeout: 5000 }).status === 0
  : false;

test('live refresh and history replay preserve the open panel, selected state, and active slider', { skip: !chromiumHeadlessUsable }, () => {
  const repo = path.resolve(__dirname, '..');
  const htmlPath = path.join(os.tmpdir(), `game-wall-dom-${process.pid}.html`);
  const index = fs.readFileSync(path.join(repo, 'docs/index.html'), 'utf8');
  const fixture = `<script>
    let boardContent = '# Git Tic-Tac-Toe\\nState: Waiting for X\\n\\n [ ] | [ ] | [ ]\\n-----+-----+-----\\n [ ] | [ ] | [ ]\\n-----+-----+-----\\n [ ] | [ ] | [ ]';
    const winningBoard = '# Git Tic-Tac-Toe\\nState: X won\\n\\n [X] | [X] | [X]\\n-----+-----+-----\\n [O] | [O] | [ ]\\n-----+-----+-----\\n [ ] | [ ] | [ ]';
    const historyBoard = '# Git Tic-Tac-Toe\\nState: Waiting for O\\n\\n [X] | [ ] | [ ]\\n-----+-----+-----\\n [ ] | [ ] | [ ]\\n-----+-----+-----\\n [ ] | [ ] | [ ]';
    const catalog = { defaultWorkshopId: 'workshop-a', workshops: [
      { id: 'workshop-a', name: 'Workshop A', status: 'active', registrationUrl: 'https://github.com/example/issues/new?workshop_id=workshop-a' },
      { id: 'workshop-old', name: 'Workshop Old', status: 'archived', registrationUrl: 'https://github.com/example/issues/new?workshop_id=workshop-old' },
    ] };
    let record = { owner: 'pair', repo: 'dom-fixture', repoUrl: 'https://github.com/pair/dom-fixture', workshopId: 'workshop-a', branch: 'match-01', matchKey: 'pair/dom-fixture#match-01', playerX: 'alice', playerO: 'bob', status: 'in_progress', state: 'Ready for X', boardValid: true, board: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']], errors: [] };
    let records = [record];
    let boardFetchFails = false;
    const commit = { sha: 'a'.repeat(40), html_url: 'https://github.com/pair/dom-fixture/commit/a', commit: { message: 'first move', author: { date: '2026-10-20T00:00:00Z' } } };
    window.fetch = async (input) => {
      const url = String(input);
      if (url.includes('workshops.json')) return new Response(JSON.stringify(catalog), { status: 200, headers: { 'Content-Type': 'application/json' } });
      if (url.includes('board.json')) {
        if (boardFetchFails) return new Response('', { status: 503 });
        return new Response(JSON.stringify(records), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/commits?')) return new Response(JSON.stringify([commit]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      if (url.includes('/a'.repeat(4))) return new Response(historyBoard, { status: 200 });
      if (url.includes(commit.sha)) return new Response(historyBoard, { status: 200 });
      return new Response('', { status: 404 });
    };
    window.setInterval = (callback) => { window.__poll = callback; return 1; };
    window.__testRun = async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await wait(100);
      const details = document.querySelector('.history-details');
      details.querySelector('summary').click();
      details.querySelector('[data-history-action="load"]').click();
      await wait(100);
      const slider = details.querySelector('input[type="range"]');
      slider.focus();
      slider.value = '0';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      const stableDuringInput = slider === details.querySelector('input[type="range"]') && document.activeElement === slider;
      record = { ...record, status: 'completed', state: 'X won', outcome: 'X won', board: [['X', 'X', 'X'], ['O', 'O', ' '], [' ', ' ', ' ']] };
      await window.__poll();
      const stableDuringPoll = slider === details.querySelector('input[type="range"]') && document.activeElement === slider;
      slider.blur();
      await wait(100);
      const reopened = document.querySelector('.history-details');
      const preserved = reopened.open && reopened.querySelector('[data-history-panel]').dataset.historyIndex === '0';
      const liveOutcome = document.querySelector('.status-badge').textContent.includes('X won');
      const select = document.getElementById('workshop-select');
      const ordering = Array.from(select.children).map((node) => node.tagName === 'OPTGROUP' ? node.label : node.value);
      select.value = 'workshop-old';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const archivedIsEmpty = document.querySelectorAll('.game-card').length === 0 && document.getElementById('count-all').textContent === '0';
      const stableUrl = new URL(location.href).searchParams.get('workshop') === 'workshop-old';
      const registrationLink = document.getElementById('register-link').href.endsWith('workshop-old');
      select.value = 'workshop-a';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      records = [];
      await window.__poll();
      const removedAfterSuccessfulSnapshot = document.querySelectorAll('.game-card').length === 0;
      records = [record];
      await window.__poll();
      boardFetchFails = true;
      await window.__poll();
      const retainedAfterFailure = document.querySelectorAll('.game-card').length === 1;
      const passed = stableDuringInput && stableDuringPoll && preserved && liveOutcome
        && ordering[0] === 'workshop-a' && ordering[1] === 'Archived workshops'
        && archivedIsEmpty && stableUrl && registrationLink && removedAfterSuccessfulSnapshot && retainedAfterFailure;
      document.body.dataset.fixtureResult = passed ? 'PASS' : 'FAIL';
    };
    setTimeout(() => window.__testRun(), 150);
  </script>`;
  let harness = index.replace('<script src="match-data.js"></script>', `${fixture}<script src="${path.join(repo, 'docs/match-data.js')}"></script>`)
    .replace('src="app.js"', `src="${path.join(repo, 'docs/app.js')}"`)
    .replace(/href="styles\.css"/g, `href="${path.join(repo, 'docs/styles.css')}"`);
  fs.writeFileSync(htmlPath, harness);
  try {
    const result = spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking', '--virtual-time-budget=5000', '--dump-dom', `file://${htmlPath}`], { encoding: 'utf8', timeout: 15000 });
    assert.equal(result.status, 0, `signal=${result.signal} error=${result.error || ''}\n${result.stderr}`);
    assert.match(result.stdout, /data-fixture-result="PASS"/, result.stdout.slice(-3000));
  } finally {
    fs.rmSync(htmlPath, { force: true });
  }
});
