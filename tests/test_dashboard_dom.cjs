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

test('live refresh and history replay preserve the open panel, selected state, and active slider', { skip: !chromiumHeadlessUsable }, () => {
  const repo = path.resolve(__dirname, '..');
  const htmlPath = path.join(os.tmpdir(), `game-wall-dom-${process.pid}.html`);
  const index = fs.readFileSync(path.join(repo, 'docs/index.html'), 'utf8');
  const fixture = `<script>
    const historyBoard = '# Git Tic-Tac-Toe\\nState: Waiting for O\\n\\n [X] | [ ] | [ ]\\n-----+-----+-----\\n [ ] | [ ] | [ ]\\n-----+-----+-----\\n [ ] | [ ] | [ ]';
    const catalog = { defaultWorkshopId: 'workshop-a', workshops: [
      { id: 'workshop-a', name: 'Workshop A', date: '2026-10-01', note: 'Test note', status: 'active', registrationUrl: 'https://github.com/example/issues/new?workshop_id=workshop-a' },
      { id: 'workshop-old', name: 'Workshop Old', date: '2026-10-02', status: 'archived', registrationUrl: 'https://github.com/example/issues/new?workshop_id=workshop-old' },
    ] };
    let record = { owner: 'pair', repo: 'dom-fixture', repoUrl: 'https://github.com/pair/dom-fixture', workshopId: 'workshop-a', branch: 'match-01', matchKey: 'pair/dom-fixture#match-01', playerX: 'alice', playerO: 'bob', status: 'in_progress', state: 'Ready for X', boardValid: true, board: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']], errors: [] };
    const oldRecord = { owner: 'pair', repo: 'archived-game', repoUrl: 'https://github.com/pair/archived-game', workshopId: 'workshop-old', branch: 'match-test', matchKey: 'pair/archived-game#match-test', playerX: 'carol', playerO: 'dave', status: 'in_progress', state: 'Ready for X', boardValid: true, board: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']], errors: [] };
    let records = [record, oldRecord];
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
    window.setInterval = (callback) => { window.__poll = () => callback(); return 1; };
    window.__testRun = async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await wait(100);
      const select = document.getElementById('workshop-select');
      const defaultWorkshopSelected = select.value === 'workshop-a' && !new URL(location.href).searchParams.has('workshop');
      const optionLabels = Array.from(select.options, (option) => option.textContent);
      const eventContextRendered = optionLabels[0] === '2026 Oct 1 · WORKSHOP A'
        && optionLabels[1] === '2026 Oct 2 · WORKSHOP OLD'
        && select.closest('header') !== null
        && !document.getElementById('current-workshop-name')
        && !document.getElementById('current-workshop-date')
        && !document.getElementById('current-workshop-note');
      const actionLinksShareRow = document.querySelector('[data-workshop-registration]').parentElement
        === document.querySelector('[data-workshop-dashboard]').parentElement
        && document.querySelector('[data-workshop-dashboard]').textContent.trim() === 'View all games';
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
      records = [record, oldRecord];
      await window.__poll();
      const stableDuringPoll = slider === details.querySelector('input[type="range"]') && document.activeElement === slider;
      slider.blur();
      await wait(100);
      const reopened = document.querySelector('.history-details');
      const preserved = reopened.open && reopened.querySelector('[data-history-panel]').dataset.historyIndex === '0';
      const liveOutcome = document.querySelector('.status-badge').textContent.includes('X won');
      const ordering = Array.from(select.children).map((node) => node.tagName === 'OPTGROUP' ? node.label : node.value);
      const url = new URL(location.href);
      url.searchParams.set('workshop', 'workshop-old');
      history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
      const directQuerySelected = select.value === 'workshop-old';
      const unknownUrl = new URL(location.href);
      unknownUrl.searchParams.set('workshop', 'unknown-workshop');
      history.pushState({}, '', unknownUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
      const unknownQueryFallsBack = select.value === 'workshop-a'
        && new URL(location.href).searchParams.get('workshop') === 'workshop-a';
      const bareUrl = new URL(location.href);
      bareUrl.searchParams.delete('workshop');
      history.pushState({}, '', bareUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
      const bareUrlUsesDefault = select.value === 'workshop-a' && !new URL(location.href).searchParams.has('workshop');
      select.value = 'workshop-old';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const archivedIsIsolated = document.querySelectorAll('.game-card').length === 1
        && document.querySelector('.game-card').textContent.includes('archived-game')
        && !document.querySelector('.game-card').textContent.includes('dom-fixture')
        && document.getElementById('count-all').textContent === '1';
      const archiveNoticeCleared = document.getElementById('notice-banner').classList.contains('hidden');
      const stableUrl = new URL(location.href).searchParams.get('workshop') === 'workshop-old';
      const registrationLink = document.getElementById('register-link').href.endsWith('workshop-old');
      const pageNavigationPreservesWorkshop = document.querySelector('.nav-links a').search.includes('workshop=workshop-old');
      const dashboardLinkPreservesWorkshop = document.querySelector('[data-workshop-dashboard]').search.includes('workshop=workshop-old');
      select.value = 'workshop-a';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      records = [oldRecord];
      await window.__poll();
      const removedAfterSuccessfulSnapshot = document.querySelectorAll('.game-card').length === 0;
      const emptyStateIsHonest = document.getElementById('empty-message').textContent.includes('Registered repositories appear here');
      records = [record];
      await window.__poll();
      boardFetchFails = true;
      await window.__poll();
      const retainedAfterFailure = document.querySelectorAll('.game-card').length === 1;
      boardFetchFails = false;
      const staleActive = { ...record, refreshStatus: 'stale', repositoryRefreshError: 'Branch listing unavailable.' };
      const staleArchived = { ...oldRecord, refreshStatus: 'stale', boardRefreshError: 'BOARD fetch timed out.' };
      records = [staleActive, staleArchived];
      await window.__poll();
      const activeStaleNotice = document.getElementById('notice-message').textContent.includes('1 match is showing the last known board');
      const activeStaleCard = document.querySelector('.card-refresh-status')?.textContent.includes('Branch listing unavailable.')
        && document.querySelector('.card-refresh-status')?.textContent.includes('Showing last known board')
        && document.querySelector('.status-badge')?.textContent.includes('Last known: X won')
        && document.querySelector('[role="grid"]')?.getAttribute('aria-label').includes('Last known board');
      select.value = 'workshop-old';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const archivedStaleNotice = document.getElementById('notice-message').textContent.includes('1 match is showing the last known board');
      const archivedStaleCard = document.querySelector('.card-refresh-status')?.textContent.includes('BOARD fetch timed out.')
        && !document.querySelector('.card-refresh-status')?.textContent.includes('Branch listing unavailable.');
      const freshActive = { ...record, refreshStatus: 'fresh' };
      const freshArchived = { ...oldRecord, refreshStatus: 'fresh' };
      records = [freshActive, freshArchived];
      await window.__poll();
      const freshClearsStaleNotice = document.getElementById('notice-banner').classList.contains('hidden')
        && document.querySelectorAll('.card-refresh-status').length === 0;
      const passed = defaultWorkshopSelected && eventContextRendered && actionLinksShareRow && directQuerySelected && unknownQueryFallsBack && bareUrlUsesDefault
        && stableDuringInput && stableDuringPoll && preserved && liveOutcome
        && ordering[0] === 'workshop-a' && ordering[1] === 'Archived workshops'
        && archivedIsIsolated && archiveNoticeCleared && stableUrl && registrationLink
        && pageNavigationPreservesWorkshop && dashboardLinkPreservesWorkshop
        && removedAfterSuccessfulSnapshot && emptyStateIsHonest && retainedAfterFailure
        && activeStaleNotice && activeStaleCard && archivedStaleNotice && archivedStaleCard && freshClearsStaleNotice;
      document.body.dataset.fixtureResult = passed ? 'PASS' : 'FAIL';
    };
    setTimeout(() => window.__testRun(), 150);
  </script>`;
  let harness = index.replace('<script src="match-data.js"></script>', `${fixture}<script src="${path.join(repo, 'docs/match-data.js')}"></script>`)
    .replace('src="workshop-context.js"', `src="${path.join(repo, 'docs/workshop-context.js')}"`)
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

test('workshop context keeps route, date, registration, and navigation in sync on all pages', { skip: !chromiumHeadlessUsable }, () => {
  const repo = path.resolve(__dirname, '..');
  const htmlPath = path.join(os.tmpdir(), `workshop-context-dom-${process.pid}.html`);
  const pages = ['index.html', 'guide.html', 'setup.html'];
  for (const page of pages) {
    const source = fs.readFileSync(path.join(repo, 'docs', page), 'utf8');
    const pageHtml = source
      .replace(/\s*<script[^>]*><\/script>/g, '')
      .replace(/<script src="[^"]+"><\/script>/g, '')
      .replace(/href="styles\.css"/g, `href="${path.join(repo, 'docs/styles.css')}"`)
      .replace('</body>', `<script>
        window.fetch = async () => new Response(JSON.stringify({ defaultWorkshopId: 'scda', workshops: [
          { id: 'scda', name: 'SCDA Test', date: '2026-10-01', status: 'active', registrationUrl: 'https://example.test/register?workshop_id=scda' },
          { id: 'sokedai', name: 'Sokedai Test', date: '2026-11-06', note: '<strong>Safe note</strong>', status: 'active', registrationUrl: 'https://example.test/register?workshop_id=sokedai' },
          { id: 'riken', name: 'Riken Test', date: '2026-11-10', status: 'active', registrationUrl: 'https://example.test/register?workshop_id=riken' },
        ] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      </script>
      <script src="${path.join(repo, 'docs/workshop-context.js')}"></script>
      <script>
        (async () => {
          await window.WorkshopContext.ready;
          const select = document.getElementById('workshop-select');
          const requested = new URL(location.href).searchParams.get('workshop');
          const initialId = requested || 'scda';
          const expectedInitialLabel = initialId === 'sokedai' ? '2026 Nov 6 · SOKEDAI TEST' : '2026 Oct 1 · SCDA TEST';
          const initial = select.value === initialId
            && select.selectedOptions[0].textContent === expectedInitialLabel
            && select.closest('header') !== null
            && !document.getElementById('current-workshop-name')
            && !document.getElementById('current-workshop-date')
            && !document.getElementById('current-workshop-note');
          const chosenId = initialId === 'sokedai' ? 'riken' : 'sokedai';
          const routeBefore = location.pathname;
          select.value = chosenId;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          const changed = select.value === chosenId
            && location.pathname === routeBefore
            && new URL(location.href).searchParams.get('workshop') === chosenId
            && select.selectedOptions[0].textContent === (chosenId === 'sokedai' ? '2026 Nov 6 · SOKEDAI TEST' : '2026 Nov 10 · RIKEN TEST')
            && document.querySelector('[data-workshop-registration]').href.endsWith('workshop_id=' + chosenId)
            && document.querySelector('[data-workshop-dashboard]').search.includes('workshop=' + chosenId)
            && Array.from(document.querySelectorAll('.nav-links a')).every((link) => link.search.includes('workshop=' + chosenId));
          const detailsRemoved = !document.getElementById('current-workshop-note');
          select.value = 'riken';
          select.dispatchEvent(new Event('change', { bubbles: true }));
          const riken = select.selectedOptions[0].textContent === '2026 Nov 10 · RIKEN TEST'
            && document.querySelector('[data-workshop-registration]').href.endsWith('workshop_id=riken');
          document.body.dataset.fixtureResult = initial && changed && detailsRemoved && riken ? 'PASS' : 'FAIL';
        })();
      </script></body>`);
    for (const query of ['', '?workshop=sokedai']) {
      fs.writeFileSync(htmlPath, pageHtml);
      try {
        const url = `file://${htmlPath}${query}`;
        const result = spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking', '--virtual-time-budget=1500', '--dump-dom', url], { encoding: 'utf8', timeout: 15000 });
        assert.equal(result.status, 0, `${page}${query}: signal=${result.signal} error=${result.error || ''}\n${result.stderr}`);
        assert.match(result.stdout, /data-fixture-result="PASS"/, `${page}${query}: ${result.stdout.slice(-2500)}`);
      } finally {
        fs.rmSync(htmlPath, { force: true });
      }
    }
  }
});

test('in-content route CTA opens the learner guide for the selected workshop', { skip: !chromiumHeadlessUsable }, () => {
  const repo = path.resolve(__dirname, '..');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workshop-route-click-'));
  const contextScript = path.join(repo, 'docs/workshop-context.js');
  for (const page of ['setup.html', 'guide.html']) {
    const source = fs.readFileSync(path.join(repo, 'docs', page), 'utf8');
    const fixture = `<script>
      window.fetch = async () => new Response(JSON.stringify({ defaultWorkshopId: 'scda', workshops: [
        { id: 'scda', name: 'SCDA Test', date: '2026-10-01', status: 'active', registrationUrl: 'https://example.test/register?workshop_id=scda' },
        { id: 'sokedai', name: 'Sokedai Test', date: '2026-11-06', status: 'active', registrationUrl: 'https://example.test/register?workshop_id=sokedai' },
      ] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    </script><script src="${contextScript}"></script><script>
      (async () => {
        await window.WorkshopContext.ready;
        if (location.pathname.endsWith('/setup.html')) {
          const select = document.getElementById('workshop-select');
          select.value = 'sokedai';
          select.dispatchEvent(new Event('change', { bubbles: true }));
          document.querySelector('[data-workshop-route]').click();
          return;
        }
        const selected = document.getElementById('workshop-select').value;
        document.body.dataset.fixtureResult = location.pathname.endsWith('/guide.html')
          && new URL(location.href).searchParams.get('workshop') === 'sokedai'
          && selected === 'sokedai'
          && document.querySelector('[data-workshop-registration]').href.endsWith('workshop_id=sokedai')
          ? 'PASS' : 'FAIL';
      })();
    </script>`;
    const html = source
      .replace(/\s*<script[^>]*><\/script>/g, '')
      .replace(/<script src="[^"]+"><\/script>/g, '')
      .replace(/href="styles\.css"/g, `href="${path.join(repo, 'docs/styles.css')}"`)
      .replace('</body>', `${fixture}</body>`);
    fs.writeFileSync(path.join(tempDir, page), html);
  }
  try {
    const result = spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking', '--virtual-time-budget=3000', '--dump-dom', `file://${path.join(tempDir, 'setup.html')}`], { encoding: 'utf8', timeout: 15000 });
    assert.equal(result.status, 0, `signal=${result.signal} error=${result.error || ''}\n${result.stderr}`);
    assert.match(result.stdout, /data-fixture-result="PASS"/, result.stdout.slice(-3000));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('workshop catalog retries after failure and coalesces overlapping retries', { skip: !chromiumHeadlessUsable }, () => {
  const repo = path.resolve(__dirname, '..');
  const htmlPath = path.join(os.tmpdir(), `workshop-context-retry-${process.pid}.html`);
  const html = `<!doctype html><html><body>
    <label for="workshop-select">Workshop</label><select id="workshop-select"></select>
    <span id="workshop-context-status"></span>
    <script>
      let requests = 0;
      window.fetch = async () => {
        requests += 1;
        if (requests === 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return new Response('', { status: 503 });
        }
        return new Response(JSON.stringify({ defaultWorkshopId: 'scda', workshops: [
          { id: 'scda', name: 'SCDA Test', date: '2026-10-01', status: 'active', registrationUrl: 'https://example.test/register?workshop_id=scda' },
        ] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };
    </script>
    <script src="${path.join(repo, 'docs/workshop-context.js')}"></script>
    <script>
      (async () => {
        const failed = await window.WorkshopContext.ready.then(() => false, () => true);
        const errorShown = document.getElementById('workshop-context-status').textContent.includes('could not be loaded');
        const [first, second] = await Promise.all([window.WorkshopContext.ready, window.WorkshopContext.ready]);
        document.body.dataset.fixtureResult = failed && errorShown && requests === 2
          && first === second && first.workshopId === 'scda'
          && document.getElementById('workshop-select').selectedOptions[0].textContent === '2026 Oct 1 · SCDA TEST'
          ? 'PASS' : 'FAIL';
      })();
    </script>
  </body></html>`;
  fs.writeFileSync(htmlPath, html);
  try {
    const result = spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking', '--virtual-time-budget=1500', '--dump-dom', `file://${htmlPath}`], { encoding: 'utf8', timeout: 15000 });
    assert.equal(result.status, 0, `signal=${result.signal} error=${result.error || ''}\n${result.stderr}`);
    assert.match(result.stdout, /data-fixture-result="PASS"/, result.stdout.slice(-2500));
  } finally {
    fs.rmSync(htmlPath, { force: true });
  }
});
