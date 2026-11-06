const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const guide = fs.readFileSync(path.join(repo, 'docs/guide.html'), 'utf8');
const setup = fs.readFileSync(path.join(repo, 'docs/setup.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(repo, 'scripts/capture/captures.json'), 'utf8'));
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function section(html, startId, endId) {
  return html.slice(html.indexOf(`id="${startId}"`), html.indexOf(`id="${endId}"`));
}

function linkedImages(html) {
  return [...html.matchAll(/<a class="step-image-link" href="([^"]+)"[^>]*><img src="([^"]+)"[^>]*>/g)]
    .map((match) => ({ href: match[1], src: match[2], tag: match[0] }));
}

const board = manifest.storyboards.find((item) => item.slug === 'how-to-play');
const turn = section(guide, 'turn', 'rematch');
const rematch = section(guide, 'rematch', 'conflict');
const INVITE_SHOTS = [
  '01-settings.png',
  '02-collaborators.png',
  '03-add-people.png',
  '04-username.png',
  '05-result.png',
  '06-add.png',
  '07-pending.png',
];

function expectedSources(group) {
  return group.screenshots.map((name) => `images/guide/${group.id}/${name}`);
}

function ownerInvite(html) {
  const start = html.indexOf('id="invite"');
  const end = html.indexOf('O (partner)');
  assert.ok(start >= 0 && end > start);
  return html.slice(start, end);
}

function assertLinkedPng(image) {
  assert.equal(image.href, image.src);
  assert.match(image.tag, /target="_blank"/);
  assert.match(image.tag, /onerror=/);
  const file = path.join(repo, 'docs', image.src);
  assert.equal(fs.existsSync(file), true, image.src);
  assert.deepEqual(fs.readFileSync(file).subarray(0, 8), PNG);
}

test('turn and rematch figures use the how-to-play storyboard', () => {
  const turnGroup = board.groups.find((group) => group.id === 'turn');
  const rematchGroup = board.groups.find((group) => group.id === 'rematch');
  const turnImages = linkedImages(turn).filter((image) => image.src.startsWith('images/guide/turn/'));
  const rematchImages = linkedImages(rematch);
  assert.deepEqual(turnImages.map((image) => image.src), expectedSources(turnGroup));
  assert.deepEqual(rematchImages.map((image) => image.src), expectedSources(rematchGroup));
  for (const image of [...turnImages, ...rematchImages]) assertLinkedPng(image);
  assert.equal(linkedImages(guide).length, 26);
  assert.match(turn, new RegExp(turnGroup.caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(rematch, new RegExp(rematchGroup.caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(turn, /Push|push/);
  assert.doesNotMatch(turn, /centre cell|before the edit|X takes centre/);
  assert.match(turn, /bottom-right/);
  assert.match(turn, /Auto Save/);
  assert.match(turn, /Sync Changes 1↑/);
  assert.match(turn, /X takes bottom-right/);
  assert.match(rematch, /create a branch named <code>match-02<\/code>/);
  assert.match(rematch, /next unused name, such as <code>match-03<\/code>/);
  assert.match(rematch, /04-on-match-02\.png/);
  assert.match(rematch, /status bar shows <code>match-03<\/code>/);
  assert.doesNotMatch(setup, /images\/guide\//);
  assert.equal(linkedImages(setup).length, 28);
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

test('invite figures show the owner collaborator flow', () => {
  const invite = ownerInvite(guide);
  const images = linkedImages(invite);
  assert.deepEqual(images.map((image) => image.src), INVITE_SHOTS.map((name) => `images/guide/invite/${name}`));
  for (const image of images) assertLinkedPng(image);
  const figures = [...invite.matchAll(/<figure class="step-shot">([\s\S]*?)<\/figure>/g)].map((match) => match[1]);
  assert.equal(figures.length, 7);
  for (const figure of figures) assert.ok(figure.indexOf('shot-instruction') < figure.indexOf('<img'));
  assert.match(figures[1], /02-collaborators\.png/);
  assert.match(figures[2], /Scroll down until <strong>Add people<\/strong> is fully visible/);
  assert.match(figures[2], /03-add-people\.png/);
  assert.ok(figures[2].indexOf('Scroll down') < figures[2].indexOf('03-add-people.png'));
  assert.match(invite, /you have not invited any collaborators/);
  assert.match(invite, /Add &lt;username&gt;/);
  assert.match(invite, /Add viyuetuki/);
  assert.doesNotMatch(guide, /images\/guide\/invite\/08/);
  const partner = guide.slice(guide.indexOf('O (partner)'), guide.indexOf('Step 2: Start together'));
  assert.equal(linkedImages(partner).length, 0);
  assert.match(partner, /Accept invitation/);
});

const CONFLICT_SHOTS = [
  '01-merge-changes.png',
  '02-merge-editor.png',
  '03-complete-merge.png',
  '04-commit-sync.png',
];
const COPILOT_SHOTS = [
  '01-ask-mode.png',
  '02-ask-reply.png',
  '03-agent-mode.png',
  '04-agent-diff.png',
  '05-plan-mode.png',
];

test('conflict and copilot figures follow the how-to-play shot pattern', () => {
  const conflict = section(guide, 'conflict', 'copilot');
  const copilot = section(guide, 'copilot', 'terminal');
  const conflictImages = linkedImages(conflict);
  const copilotImages = linkedImages(copilot);
  assert.deepEqual(conflictImages.map((image) => image.src), CONFLICT_SHOTS.map((name) => `images/guide/conflict/${name}`));
  assert.deepEqual(copilotImages.map((image) => image.src), COPILOT_SHOTS.map((name) => `images/guide/copilot/${name}`));
  for (const image of [...conflictImages, ...copilotImages]) assertLinkedPng(image);
  assert.ok(conflict.indexOf('</details>') < conflict.indexOf('images/guide/conflict/01-merge-changes.png'));
  assert.ok(conflict.indexOf('04-commit-sync.png') < conflict.indexOf('time-machine.html'));
  const ask = copilot.slice(copilot.indexOf('<h3>Ask mode</h3>'), copilot.indexOf('<h3>Agent mode</h3>'));
  const agent = copilot.slice(copilot.indexOf('<h3>Agent mode</h3>'), copilot.indexOf('<h3>Plan mode</h3>'));
  const plan = copilot.slice(copilot.indexOf('<h3>Plan mode</h3>'));
  assert.deepEqual(linkedImages(ask).map((image) => image.src), COPILOT_SHOTS.slice(0, 2).map((name) => `images/guide/copilot/${name}`));
  assert.deepEqual(linkedImages(agent).map((image) => image.src), COPILOT_SHOTS.slice(2, 4).map((name) => `images/guide/copilot/${name}`));
  assert.deepEqual(linkedImages(plan).map((image) => image.src), [`images/guide/copilot/${COPILOT_SHOTS[4]}`]);
  assert.ok(ask.indexOf('copy-src-1') < ask.indexOf('01-ask-mode.png'));
  assert.ok(agent.indexOf('copy-src-2') < agent.indexOf('03-agent-mode.png'));
  assert.ok(agent.indexOf('04-agent-diff.png') < agent.indexOf('copy-src-3'));
  assert.ok(plan.indexOf('copy-src-4') < plan.indexOf('05-plan-mode.png'));
  assert.match(ask, /Interactive/);
  assert.match(ask, /Ask-style explain-only mode/);
  assert.match(agent, /Keep/);
  assert.match(plan, /<strong>Plan<\/strong>/);
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
  const renderedTurn = section(result.stdout, 'turn', 'rematch');
  const renderedRematch = section(result.stdout, 'rematch', 'conflict');
  for (const [html, group] of [[renderedTurn, 'turn'], [renderedRematch, 'rematch']]) {
    const shots = board.groups.find((item) => item.id === group).screenshots;
    assert.equal(shots.length, group === 'turn' ? 6 : 4);
    for (const name of shots) {
      const src = `images/guide/${group}/${name}`;
      assert.ok(html.includes(`href="${src}"`), src);
      assert.ok(html.includes(`src="${src}"`), src);
    }
  }
  const renderedOwner = ownerInvite(renderedTurn);
  for (const name of INVITE_SHOTS) {
    const src = `images/guide/invite/${name}`;
    assert.ok(renderedOwner.includes(`href="${src}"`), src);
    assert.ok(renderedOwner.includes(`src="${src}"`), src);
  }
  const landing = renderedOwner.indexOf('02-collaborators.png');
  const addPeople = renderedOwner.indexOf('03-add-people.png');
  const scrollBeat = renderedOwner.indexOf('Scroll down until', landing);
  assert.ok(landing >= 0 && scrollBeat > landing && scrollBeat < addPeople);
  assert.match(renderedTurn, /Your partner \(O\) now does the same steps/);
  assert.match(renderedRematch, /Now play exactly the same way as before/);
  const renderedConflict = section(result.stdout, 'conflict', 'copilot');
  const renderedCopilot = section(result.stdout, 'copilot', 'terminal');
  for (const name of CONFLICT_SHOTS) {
    const src = `images/guide/conflict/${name}`;
    assert.ok(renderedConflict.includes(`href="${src}"`), src);
    assert.ok(renderedConflict.includes(`src="${src}"`), src);
  }
  for (const name of COPILOT_SHOTS) {
    const src = `images/guide/copilot/${name}`;
    assert.ok(renderedCopilot.includes(`href="${src}"`), src);
    assert.ok(renderedCopilot.includes(`src="${src}"`), src);
  }
  assert.ok(renderedConflict.indexOf('</details>') < renderedConflict.indexOf('01-merge-changes.png'));
});
