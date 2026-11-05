'use strict';
const { spawnSync } = require('child_process');
const { launch, createStep, storyboardEntry, REPO_ROOT, OUT_DIR } = require('./lib');
const { requireCaptureIdentity, requireCaptureRow } = require('./delete-codespace');
const path = require('path');

const SLUG = 'how-to-play';
const EMPTY_BOARD = '. . .\n. . .\n. . .\n';
const COMMIT_MESSAGE = 'X takes centre';
const BLOCKED_REPOS = new Set(['git-tic-tac-toe-workshop', 'git-tic-tac-toe-template']);

function assertCaptureRepo(repo) {
  if (!repo || !/^[A-Za-z0-9._-]+$/.test(repo)) {
    throw new Error('Set CAPTURE_REPO to the demo repository name. This capture does not create or delete a repository.');
  }
  if (BLOCKED_REPOS.has(repo)) {
    throw new Error(`Refusing to modify ${repo}. Point CAPTURE_REPO at the disposable demo repository.`);
  }
  return repo;
}

function boardNeedsReset(text) {
  return String(text).replace(/\r\n/g, '\n').replace(/\s+$/, '') !== '. . .\n. . .\n. . .';
}

function remoteBranchRef(owner, repo, branch) {
  assertCaptureRepo(repo);
  if (!/^[A-Za-z0-9-]+$/.test(owner)) throw new Error('Set CAPTURE_OWNER to the demo repository owner.');
  if (branch !== 'match-02') throw new Error('This capture deletes only the match-02 branch.');
  return `repos/${owner}/${repo}/git/refs/heads/${branch}`;
}

function ghApi(args, { input } = {}) {
  return spawnSync('gh', ['api', ...args], { encoding: 'utf8', input });
}

function captureOwner() {
  if (process.env.CAPTURE_OWNER && /^[A-Za-z0-9-]+$/.test(process.env.CAPTURE_OWNER)) return process.env.CAPTURE_OWNER;
  const result = spawnSync('gh', ['api', 'user', '--jq', '.login'], { encoding: 'utf8' });
  const login = (result.stdout || '').trim();
  if (!login) throw new Error('Set CAPTURE_OWNER to the owner of CAPTURE_REPO. gh could not read the authenticated user.');
  return login;
}

function resetDemoBranches() {
  const repo = assertCaptureRepo(process.env.CAPTURE_REPO);
  const owner = captureOwner();
  const boardPath = `repos/${owner}/${repo}/contents/BOARD.txt`;
  const current = ghApi([`${boardPath}?ref=match-01`]);
  if (current.status !== 0) {
    throw new Error(`match-01 is not available on ${owner}/${repo}. This capture resets that branch and does not create or delete the repository.\n${(current.stderr || current.stdout || '').trim()}`);
  }
  const file = JSON.parse(current.stdout);
  const text = Buffer.from(String(file.content || '').replace(/\n/g, ''), file.encoding || 'base64').toString('utf8');
  if (boardNeedsReset(text)) {
    const body = JSON.stringify({
      message: 'Reset BOARD.txt to an empty board',
      content: Buffer.from(EMPTY_BOARD).toString('base64'),
      sha: file.sha,
      branch: 'match-01',
    });
    const updated = ghApi(['--method', 'PUT', boardPath, '--input', '-'], { input: body });
    if (updated.status !== 0) {
      throw new Error(`Could not reset BOARD.txt on match-01.\n${(updated.stderr || updated.stdout || '').trim()}`);
    }
  }
  deleteRemoteMatch02(owner, repo);
}

function deleteRemoteMatch02(owner, repo) {
  const ref = remoteBranchRef(owner, repo, 'match-02');
  const existing = ghApi([ref]);
  if (existing.status !== 0) {
    if (/404|Not Found/i.test(`${existing.stderr}\n${existing.stdout}`)) return;
    throw new Error(`Could not check match-02 on ${owner}/${repo}.\n${(existing.stderr || existing.stdout || '').trim()}`);
  }
  const removed = ghApi(['--method', 'DELETE', ref]);
  if (removed.status !== 0 && !/404|Not Found/i.test(`${removed.stderr}\n${removed.stdout}`)) {
    throw new Error(`Could not delete match-02 on ${owner}/${repo}.\n${(removed.stderr || removed.stdout || '').trim()}`);
  }
}

function quickInput(page) {
  return page.locator('.quick-input-widget input').first();
}

function branchButton(page) {
  return page.locator('.statusbar-item').filter({ has: page.locator('.codicon-git-branch') }).first();
}

function shotName(group, name) {
  return `${group}/${name}`;
}

async function openCommand(page, label) {
  await page.keyboard.press('Control+Shift+P');
  const input = quickInput(page);
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill(`>${label}`);
  const command = page.getByRole('option', { name: label, exact: true });
  if (await command.count() === 1) {
    await command.click();
    return;
  }
  await page.keyboard.press('Enter');
}

async function ensureDarkModern(page, colorTheme) {
  const label = colorTheme.replace(/^Default\s+/, '');
  await openCommand(page, 'Preferences: Color Theme');
  const input = quickInput(page);
  await input.fill(label);
  const option = page.getByRole('option', { name: new RegExp(`^${label}$`) });
  if (await option.count() !== 1) throw new Error(`Expected one ${label} theme option.`);
  await option.click();
  await page.keyboard.press('Escape');
}

async function ensureBranch(page, name) {
  const button = branchButton(page);
  await button.waitFor({ state: 'visible', timeout: 30000 });
  if ((await button.innerText()).trim() === name) return;
  await button.click();
  const option = page.getByRole('option', { name: new RegExp(`^${name}$`) });
  if (await option.count() !== 1) throw new Error(`Expected one ${name} branch option.`);
  await option.click();
  await page.waitForFunction((branch) => {
    const item = document.querySelector('.codicon-git-branch')?.closest('.statusbar-item');
    return item && item.innerText.trim() === branch;
  }, name, { timeout: 20000 });
}

async function deleteLocalMatch02(page) {
  if ((await branchButton(page).innerText()).trim() === 'match-02') await ensureBranch(page, 'match-01');
  await openCommand(page, 'Git: Delete Branch...');
  const option = page.getByRole('option', { name: /^match-02$/ });
  if (await option.count() !== 1) {
    await page.keyboard.press('Escape');
    return;
  }
  await option.click();
}

async function openBoard(page) {
  await page.keyboard.press('Control+P');
  const input = quickInput(page);
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill('BOARD.txt');
  await page.keyboard.press('Enter');
  await page.locator('.editor .view-lines .view-line').nth(1).waitFor({ state: 'visible', timeout: 15000 });
}

async function focusCentreCell(page) {
  await page.keyboard.press('Control+G');
  const input = quickInput(page);
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill('2:3');
  await page.keyboard.press('Enter');
}

async function cellTarget(page, line, cellIndex) {
  await page.evaluate(({ lineNumber, index }) => {
    const row = document.querySelectorAll('.view-lines .view-line')[lineNumber - 1];
    if (!row) throw new Error('BOARD.txt line is not visible.');
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    let seen = -1;
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i] === '\u00a0' ? ' ' : text[i];
        if (ch !== '.' && ch !== 'X' && ch !== 'O') continue;
        seen += 1;
        if (seen !== index) continue;
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();
        let mark = document.getElementById('capture-cell-target');
        if (!mark) {
          mark = document.createElement('div');
          mark.id = 'capture-cell-target';
          mark.setAttribute('aria-hidden', 'true');
          mark.style.position = 'fixed';
          mark.style.pointerEvents = 'none';
          document.body.append(mark);
        }
        mark.style.left = `${rect.x}px`;
        mark.style.top = `${rect.y}px`;
        mark.style.width = `${Math.max(rect.width, 8)}px`;
        mark.style.height = `${Math.max(rect.height, 8)}px`;
        return;
      }
      node = walker.nextNode();
    }
    throw new Error('Could not find the target board cell.');
  }, { lineNumber: line, index: cellIndex });
  const target = page.locator('#capture-cell-target');
  if (await target.count() !== 1) throw new Error('Could not mark the target board cell.');
  return target;
}

async function clearCellTarget(page) {
  await page.evaluate(() => document.getElementById('capture-cell-target')?.remove());
}

async function openSourceControl(page) {
  const entry = page.getByRole('tab', { name: /^Source Control/ }).or(page.getByRole('button', { name: /^Source Control/ }));
  if (await entry.count() < 1) throw new Error('Source Control control is not visible.');
  await entry.first().click();
  await page.locator('.scm-viewlet, .scm-view').first().waitFor({ state: 'visible', timeout: 15000 });
}

async function requireOne(locator, description) {
  const count = await locator.count();
  if (count !== 1) throw new Error(`Expected exactly one ${description}; found ${count}.`);
  return locator;
}

async function run() {
  requireCaptureIdentity();
  resetDemoBranches();
  const board = storyboardEntry(SLUG);
  const context = await launch({
    headless: true,
    slug: SLUG,
    viewport: board.viewport,
    deviceScaleFactor: board.deviceScaleFactor,
  });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG, {
    imageDir: path.join(REPO_ROOT, 'docs', board.imageRoot),
    screenshots: board.groups.flatMap((group) => group.screenshots.map((name) => shotName(group.id, name))),
  });
  const outlined = { outlineColor: board.outlineColor };
  try {
    await page.goto('https://github.com/codespaces');
    const { row } = await requireCaptureRow(page);
    const codespaceLink = await requireOne(row.locator('a[href*="/codespaces/"]'), 'Codespace link in the named row');
    await page.goto(new URL(await codespaceLink.getAttribute('href'), 'https://github.com').href);
    await page.locator('.monaco-workbench').waitFor({ timeout: 180000 });
    const trust = page.getByRole('button', { name: /Trust Folder & Continue|Yes, I trust the authors/i });
    if (await trust.count()) await trust.first().click();
    await page.locator('.editor, .statusbar-item .codicon-git-branch').first().waitFor({ timeout: 180000 });
    await ensureDarkModern(page, board.colorTheme);
    await step.applyPageZoom(board.pageZoom);
    await ensureBranch(page, 'match-01');
    await deleteLocalMatch02(page);
    await ensureBranch(page, 'match-01');
    await openSourceControl(page);

    const more = await requireOne(
      page.locator('.scm-viewlet, .scm-view').first().getByRole('button', { name: /More Actions|Views and More Actions/i }),
      'Source Control more-actions button',
    );
    await more.click();
    const pull = await requireOne(page.getByRole('menuitem', { name: /^Pull$/ }), 'Pull menu item');
    await step.perform(pull, async () => {}, { ...outlined, name: shotName('turn', '01-pull.png') });
    await page.keyboard.press('Escape');

    await openBoard(page);
    await focusCentreCell(page);
    const emptyCell = await cellTarget(page, 2, 1);
    await step.perform(emptyCell, async () => {}, { ...outlined, name: shotName('turn', '02-edit-cell.png') });
    await clearCellTarget(page);
    await page.keyboard.press('Delete');
    await page.keyboard.type('X');
    await page.keyboard.press('Control+S');
    await page.waitForTimeout(300);
    const savedCell = await cellTarget(page, 2, 1);
    await step.perform(savedCell, async () => {}, { ...outlined, name: shotName('turn', '03-saved.png') });
    await clearCellTarget(page);

    await openSourceControl(page);
    const boardRow = await requireOne(page.locator('.scm-view .resource, .monaco-list-row').filter({ hasText: /^BOARD\.txt$/ }), 'BOARD.txt change');
    const stage = await requireOne(boardRow.getByRole('button', { name: /^Stage/ }), 'stage button for BOARD.txt');
    await step.perform(stage, () => stage.click(), { ...outlined, name: shotName('turn', '04-stage.png'), afterActionMs: 500 });

    const message = page.getByRole('textbox', { name: /commit message|message/i }).first();
    await message.click();
    await message.fill(COMMIT_MESSAGE);
    const commit = await requireOne(page.getByRole('button', { name: /^Commit$/ }), 'Commit button');
    await step.perform(commit, () => commit.click(), { ...outlined, name: shotName('turn', '05-commit.png'), afterActionMs: 1000 });
    const sync = await requireOne(page.getByRole('button', { name: /^Sync Changes/ }), 'Sync Changes button');
    await step.perform(sync, async () => {}, { ...outlined, name: shotName('turn', '06-sync.png') });

    await step.applyPageZoom(board.pageZoom);
    const status = branchButton(page);
    await status.click();
    const main = await requireOne(page.getByRole('option', { name: /^main$/ }), 'main branch option');
    await step.perform(main, () => main.click(), { ...outlined, name: shotName('rematch', '01-switch-main.png'), afterActionMs: 500 });
    await branchButton(page).click();
    const create = await requireOne(page.getByRole('option', { name: /Create new branch/i }), 'Create new branch option');
    await step.perform(create, () => create.click(), { ...outlined, name: shotName('rematch', '02-create-branch.png'), afterActionMs: 300 });
    const nameBox = quickInput(page);
    await nameBox.fill('match-02');
    await step.perform(nameBox, () => page.keyboard.press('Enter'), { ...outlined, name: shotName('rematch', '03-name-branch.png'), afterActionMs: 500 });
    const fromMain = page.getByRole('option', { name: /^main$/ });
    if (await fromMain.count() === 1 && await fromMain.isVisible()) await fromMain.click();
    await page.waitForFunction(() => {
      const item = document.querySelector('.codicon-git-branch')?.closest('.statusbar-item');
      return item && item.innerText.trim() === 'match-02';
    }, null, { timeout: 20000 });
    await step.perform(branchButton(page), async () => {}, { ...outlined, name: shotName('rematch', '04-on-match-02.png') });
    return step.finish();
  } catch (error) {
    await page.screenshot({ path: path.join(OUT_DIR, SLUG, 'debug-how-to-play.png') }).catch(() => {});
    await step.finish().catch(() => context.close());
    throw error;
  }
}

if (require.main === module) {
  run().catch((error) => { console.error(error); process.exit(1); });
}

module.exports = {
  run, assertCaptureRepo, boardNeedsReset, remoteBranchRef, EMPTY_BOARD, COMMIT_MESSAGE, shotName,
};
