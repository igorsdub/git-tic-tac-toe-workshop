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
  assert.equal(linkedImages(guide).length, 17);
  assert.equal(linkedImages(section(guide, 'conflict', 'copilot')).length, 0);
  assert.match(turn, new RegExp(turnGroup.caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(rematch, new RegExp(rematchGroup.caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(turn, /Push|push/);
  assert.doesNotMatch(setup, /images\/guide\//);
  assert.equal(linkedImages(setup).length, 28);
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
});
