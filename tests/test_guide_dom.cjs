const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const guide = fs.readFileSync(path.join(repo, 'docs/guide.html'), 'utf8');
const slot2 = fs.readFileSync(path.join(repo, 'docs/play-2.html'), 'utf8');
const setup = fs.readFileSync(path.join(repo, 'docs/setup.html'), 'utf8');
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function section(html, startId, endId) {
  return html.slice(html.indexOf(`id="${startId}"`), endId ? html.indexOf(`id="${endId}"`) : undefined);
}

function linkedImages(html) {
  return [...html.matchAll(/<a class="step-image-link" href="([^"]+)"[^>]*><img src="([^"]+)"[^>]*>/g)]
    .map((match) => ({ href: match[1], src: match[2], tag: match[0] }));
}

const INVITE_SHOTS = [
  '01-settings.png',
  '02-collaborators.png',
  '03-add-people.png',
  '04-username.png',
  '05-result.png',
  '06-add.png',
  '07-pending.png',
  '08-github-search-repo.png',
];
const TURN_SHOTS = ['01-pull.png', '02-edit-cell.png', '03-saved.png', '04-stage.png', '05-commit.png', '06-sync.png'];
const START_SHOTS = ['01-on-main.png', '02-select-match.png', '03-on-match.png'];
const CONFLICT_SHOTS = ['01-merge-changes.png', '02-merge-editor.png', '03-complete-merge.png', '04-commit-sync.png'];
const COPILOT_SHOTS = ['01-ask-mode.png', '02-ask-reply.png', '03-agent-mode.png', '04-agent-diff.png'];

function assertLinkedPng(image) {
  assert.equal(image.href, image.src);
  assert.match(image.tag, /target="_blank"/);
  assert.match(image.tag, /onerror=/);
  const file = path.join(repo, 'docs', image.src);
  assert.equal(fs.existsSync(file), true, image.src);
  assert.deepEqual(fs.readFileSync(file).subarray(0, 8), PNG);
}

test('slot 1 screenshots are on match', () => {
  const turn = section(guide, 'turn', 'copilot');
  const start = section(guide, 'open-codespaces', 'turn');
  assert.deepEqual(
    linkedImages(turn).filter((image) => image.src.startsWith('images/guide/turn/')).map((image) => image.src),
    TURN_SHOTS.map((name) => `images/guide/turn/${name}`),
  );
  assert.deepEqual(
    linkedImages(start).map((image) => image.src),
    START_SHOTS.map((name) => `images/guide/start-together/${name}`),
  );
  for (const image of [...linkedImages(turn), ...linkedImages(start)]) assertLinkedPng(image);
  assert.match(start, /The branch picker shows <code>origin\/match<\/code>/);
  assert.match(start, /The status bar shows <code>match<\/code>/);
  assert.match(turn, /The graph is on <code>match<\/code>/);
  assert.doesNotMatch(guide, /match-01/);
  assert.doesNotMatch(guide, /images\/guide\/rematch\//);
  assert.doesNotMatch(guide, /images\/guide\/copilot\/05-plan-mode\.png/);
  assert.doesNotMatch(guide, /<h3>Plan mode<\/h3>/);
  assert.doesNotMatch(setup, /images\/guide\//);
  assert.match(guide, /Main branch is sacred: don't modify it/);
  assert.doesNotMatch(guide, /main is sacred\. Don't touch it\./);
  assert.match(guide, /creates branch <code>match<\/code> on github\.com/);
});

function pngSize(file) {
  const buf = fs.readFileSync(file);
  assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file);
  assert.equal(buf.subarray(12, 16).toString(), 'IHDR', file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test('Codespace guide and time-machine shots keep the full 1920x1200 frame', () => {
  const dirs = [
    'docs/images/guide/turn',
    'docs/images/guide/start-together',
    'docs/images/guide/rematch',
    'docs/images/guide/conflict',
    'docs/images/guide/copilot',
    'docs/images/time-machine',
  ];
  for (const dir of dirs) {
    const files = fs.readdirSync(path.join(repo, dir)).filter((name) => name.endsWith('.png')).sort();
    assert.ok(files.length > 0, dir);
    for (const name of files) {
      const size = pngSize(path.join(repo, dir, name));
      assert.deepEqual(size, { width: 1920, height: 1200 }, `${dir}/${name}`);
    }
  }
  const styles = fs.readFileSync(path.join(repo, 'docs/styles.css'), 'utf8');
  const rule = styles.slice(styles.indexOf('.step-shot img'), styles.indexOf('}', styles.indexOf('.step-shot img')));
  assert.match(rule, /max-width:\s*100%/);
  assert.match(rule, /height:\s*auto/);
  assert.match(rule, /max-height:\s*none/);
  assert.match(rule, /object-fit:\s*contain/);
  assert.doesNotMatch(rule, /object-fit:\s*cover|height:\s*\d|max-height:\s*\d/);
});

test('invite figures show the owner collaborator flow and the partner accept paths', () => {
  const invite = section(guide, 'invite', 'create-match');
  const images = linkedImages(invite);
  assert.deepEqual(images.map((image) => image.src), INVITE_SHOTS.map((name) => `images/guide/invite/${name}`));
  for (const image of images) assertLinkedPng(image);
  const figures = [...invite.matchAll(/<figure class="step-shot">([\s\S]*?)<\/figure>/g)].map((match) => match[1]);
  assert.equal(figures.length, 8);
  for (const figure of figures) assert.ok(figure.indexOf('shot-instruction') < figure.indexOf('<img'));
  assert.match(figures[2], /Scroll down until <strong>Add people<\/strong> is fully visible/);
  assert.match(invite, /you have not invited any collaborators/);
  assert.match(invite, /Add &lt;username&gt;/);
  assert.match(invite, /Add viyuetuki/);
  const partner = invite.slice(invite.indexOf('O (partner)'));
  assert.deepEqual(linkedImages(partner).map((image) => image.src), ['images/guide/invite/08-github-search-repo.png']);
  assert.match(partner, /Accept invitation/);
  assert.match(partner, /github\.com\/&lt;owner&gt;\/&lt;repo&gt;/);
  assert.match(partner, /owner\/repo/);
  assert.match(partner, /igorsdub\/git-tic-tac-toe/);
  assert.match(partner, /same signed-in device/);
  assert.match(partner, /top search bar/);
  assert.doesNotMatch(guide, /figure-slot/);
  const branch = section(guide, 'create-match', 'open-codespaces');
  assert.deepEqual(linkedImages(branch).map((image) => image.src), ['images/guide/create-match/01-github-create-match-branch.png']);
  assert.match(branch, /Create branch match from main/);
  assert.doesNotMatch(branch, /match-01/);
  for (const image of linkedImages(branch)) assertLinkedPng(image);
});

test('conflict and copilot figures follow the shot pattern without Plan mode', () => {
  const turn = section(guide, 'turn', 'copilot');
  const copilot = section(guide, 'copilot', 'register');
  assert.deepEqual(
    linkedImages(turn).filter((image) => image.src.includes('/conflict/')).map((image) => image.src),
    CONFLICT_SHOTS.map((name) => `images/guide/conflict/${name}`),
  );
  assert.deepEqual(linkedImages(copilot).map((image) => image.src), COPILOT_SHOTS.map((name) => `images/guide/copilot/${name}`));
  for (const image of linkedImages(copilot)) assertLinkedPng(image);
  assert.ok(turn.indexOf('</details>') > turn.indexOf('images/guide/conflict/01-merge-changes.png'));
  assert.match(copilot, /id="stop-the-prompts"/);
  assert.match(copilot, /Turn on Copilot auto-approve\./);
  assert.match(copilot, /don't ask again/);
  assert.equal(guide.match(/id="stop-the-prompts"/g).length, 1);
  assert.doesNotMatch(slot2, /stop-the-prompts|Plan mode/);
});

test('agentic coding discusses the board before any check', () => {
  const discussion = section(slot2, 'what-can-go-wrong', 'grilling');
  assert.doesNotMatch(discussion, /test/i);
  assert.match(discussion, /at least two cases/i);
  assert.match(discussion, /X−O is 0 or 1/);
  assert.match(discussion, /Lowercase/);
  assert.match(discussion, /this actually happened before/);
  assert.match(discussion, /<details class="hint-box" id="board-hint">/);
  assert.ok(slot2.indexOf('id="board-hint"') < slot2.indexOf('id="checks"'));
  assert.ok(slot2.indexOf('id="reproducibility"') < slot2.indexOf('id="checks"'));
  assert.match(slot2, /https:\/\/ai\.engineer\/talks\/v4F1gFy-hqg-software-fundamentals-for-ai-coding/);
  assert.doesNotMatch(slot2, /talksintel\.ai/);
  assert.match(slot2, /Interview me relentlessly about every aspect of this plan/);
  assert.match(slot2, /You and Copilot agreed the rules for a valid board/);
  assert.match(slot2, /id="copy-planner"/);
  assert.match(slot2, /id="copy-reviewer"/);
  assert.match(slot2, /id="copy-docs"/);
  assert.match(slot2, /Write pytest tests for these rules and a pyproject.toml so `uv run pytest` works\./);
  assert.match(slot2, /feature\/testing/);
  assert.doesNotMatch(slot2, /rematch/i);
  assert.match(slot2, /uv run pytest/);
  assert.match(slot2, /GitHub Actions can run the same tests on every push\./);
  assert.ok(slot2.indexOf('id="reference"') > slot2.indexOf('id="reproducibility"'));
  assert.equal(linkedImages(slot2).length, 0);
  assert.doesNotMatch(slot2, /figure-slot/);
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

const browser = findBrowser();

test('guide figures stay linked inside their sections', { skip: !browser }, () => {
  const result = spawnSync(browser, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--virtual-time-budget=8000', '--dump-dom',
    `file://${path.join(repo, 'docs/guide.html')}`,
  ], { encoding: 'utf8', timeout: 20000 });
  assert.equal(result.status, 0, result.stderr);
  const renderedTurn = section(result.stdout, 'turn', 'copilot');
  const renderedStart = section(result.stdout, 'open-codespaces', 'turn');
  for (const name of TURN_SHOTS) {
    const src = `images/guide/turn/${name}`;
    assert.ok(renderedTurn.includes(`href="${src}"`), src);
    assert.ok(renderedTurn.includes(`src="${src}"`), src);
  }
  for (const name of START_SHOTS) assert.ok(renderedStart.includes(`src="images/guide/start-together/${name}"`));
  for (const name of INVITE_SHOTS) assert.ok(section(result.stdout, 'invite', 'create-match').includes(`src="images/guide/invite/${name}"`));
  for (const name of CONFLICT_SHOTS) assert.ok(renderedTurn.includes(`src="images/guide/conflict/${name}"`));
  for (const name of COPILOT_SHOTS) assert.ok(section(result.stdout, 'copilot', 'register').includes(`src="images/guide/copilot/${name}"`));
  assert.ok(!result.stdout.includes('images/guide/copilot/05-plan-mode.png'));
  assert.doesNotMatch(result.stdout, /match-01/);
});
