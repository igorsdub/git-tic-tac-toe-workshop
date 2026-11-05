'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = path.join(__dirname, '..', 'scripts', 'capture');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'captures.json'), 'utf8'));

test('manifest slugs are the four setup steps', () => {
  assert.deepStrictEqual(manifest.steps.map((s) => s.slug),
    ['create-repo', 'open-codespace', 'look-around', 'delete-codespace']);
});

test('screenshot names are numbered pngs', () => {
  for (const s of manifest.steps) {
    assert.ok(s.screenshots.length > 0);
    for (const n of s.screenshots) assert.match(n, /^\d{2}-[a-z0-9-]+\.png$/);
  }
});

test('capture contract preserves each required learner action state', () => {
  const bySlug = Object.fromEntries(manifest.steps.map((s) => [s.slug, s.screenshots]));
  assert.deepStrictEqual(bySlug['create-repo'], [
    '01-template-page.png', '02-use-this-template.png', '03-create-new-repository.png',
    '04-include-all-branches-off.png', '05-include-all-branches-on.png', '06-owner-and-name.png',
    '07-description.png', '08-public.png', '09-create-repository.png',
  ]);
  assert.deepStrictEqual(bySlug['look-around'], [
    '01-chat.png', '02-sign-in.png', '03-connect-copilot.png', '04-wait-for-ask.png',
    '05-mode-selector.png', '06-ask-mode.png', '07-question-typed.png',
    '08-send-target.png', '09-answer-complete.png',
  ]);
  assert.deepStrictEqual(bySlug['delete-codespace'], [
    '01-github-home.png', '02-left-nav-open.png', '03-codespaces-list.png',
    '04-more-menu.png', '05-delete-option.png', '06-confirm-delete.png', '07-deleted.png',
  ]);
});

test('each step script exists', () => {
  for (const s of manifest.steps) assert.ok(fs.existsSync(path.join(dir, `${s.slug}.js`)), s.slug);
});

test('how-to-play storyboard stays outside the setup steps', () => {
  assert.deepStrictEqual(manifest.steps.map((step) => step.slug),
    ['create-repo', 'open-codespace', 'look-around', 'delete-codespace']);
  assert.equal(manifest.storyboards.length, 1);
  const board = manifest.storyboards[0];
  assert.equal(board.slug, 'how-to-play');
  assert.equal(board.imageRoot, 'images/guide');
  assert.deepStrictEqual(board.viewport, { width: 1100, height: 700 });
  assert.equal(board.deviceScaleFactor, 2);
  assert.equal(board.pageZoom, 2);
  assert.equal(board.colorTheme, 'Default Dark Modern');
  assert.equal(board.outlineColor, '#0969da');
  assert.deepStrictEqual(board.groups.map((group) => group.id), ['turn', 'rematch']);
  assert.deepStrictEqual(board.groups[0].screenshots, [
    '01-pull.png', '02-edit-cell.png', '03-saved.png', '04-stage.png', '05-commit.png', '06-sync.png',
  ]);
  assert.deepStrictEqual(board.groups[1].screenshots, [
    '01-switch-main.png', '02-create-branch.png', '03-name-branch.png', '04-on-match-02.png',
  ]);
  for (const group of board.groups) {
    for (const name of group.screenshots) assert.match(name, /^\d{2}-[a-z0-9-]+\.png$/);
  }
  assert.ok(fs.existsSync(path.join(dir, 'how-to-play.js')));
  const runner = fs.readFileSync(path.join(dir, 'run-all.js'), 'utf8');
  assert.match(runner, /storyboards/);
  assert.match(runner, /ORDER/);
});

test('outline colour defaults to red and accepts the how-to-play blue', () => {
  const { outlineStyle, DEFAULT_OUTLINE_COLOR } = require(path.join(dir, 'lib.js'));
  assert.equal(DEFAULT_OUTLINE_COLOR, '#e5484d');
  assert.equal(outlineStyle(), '3px solid #e5484d');
  assert.equal(outlineStyle('#0969da'), '3px solid #0969da');
  assert.throws(() => outlineStyle('red'), /Unsupported outline colour/);
  const source = fs.readFileSync(path.join(dir, 'lib.js'), 'utf8');
  assert.match(source, /outlineColor = DEFAULT_OUTLINE_COLOR/);
  assert.match(source, /applyPageZoom/);
  assert.match(source, /deviceScaleFactor/);
});

test('how-to-play reset touches only the demo match-02 branch', () => {
  const capture = require(path.join(dir, 'how-to-play.js'));
  assert.equal(capture.assertCaptureRepo('tic-tac-toe-demo'), 'tic-tac-toe-demo');
  assert.throws(() => capture.assertCaptureRepo('git-tic-tac-toe-workshop'), /Refusing to modify/);
  assert.throws(() => capture.assertCaptureRepo('git-tic-tac-toe-template'), /Refusing to modify/);
  assert.throws(() => capture.assertCaptureRepo(''), /CAPTURE_REPO/);
  assert.equal(capture.boardNeedsReset(capture.EMPTY_BOARD), false);
  assert.equal(capture.boardNeedsReset('. . .\n. . .\n. . .'), false);
  assert.equal(capture.boardNeedsReset('. . .\n. X .\n. . .\n'), true);
  assert.equal(capture.COMMIT_MESSAGE, 'X takes centre');
  assert.equal(
    capture.remoteBranchRef('igorsdub', 'tic-tac-toe-demo', 'match-02'),
    'repos/igorsdub/tic-tac-toe-demo/git/refs/heads/match-02',
  );
  assert.throws(() => capture.remoteBranchRef('igorsdub', 'tic-tac-toe-demo', 'match-01'), /only the match-02/);
  assert.throws(() => capture.remoteBranchRef('igorsdub', 'tic-tac-toe-demo', 'main'), /only the match-02/);
  assert.throws(() => capture.remoteBranchRef('igorsdub', 'git-tic-tac-toe-template', 'match-02'), /Refusing to modify/);
  const source = fs.readFileSync(path.join(dir, 'how-to-play.js'), 'utf8');
  assert.match(source, /#0969da|outlineColor/);
  assert.match(source, /applyPageZoom\(board\.pageZoom\)/);
  assert.match(source, /Default Dark Modern|colorTheme/);
  assert.doesNotMatch(source, /repo delete|delete this repository|CAPTURE_RECREATE/);
  assert.doesNotMatch(source, /refs\/heads\/match-01|refs\/heads\/main/);
  assert.match(source, /refs\/heads\/\$\{branch\}/);
});

test('delete capture requires the exact Codespace identity and verifies removal', () => {
  const source = fs.readFileSync(path.join(dir, 'delete-codespace.js'), 'utf8');
  assert.match(source, /CAPTURE_CODESPACE_NAME/);
  assert.match(source, /getByText\(CODESPACE_NAME, \{ exact: true \}\)/);
  assert.match(source, /return \{ name: exactName, row \}/);
  assert.match(source, /repository link for/);
  assert.match(source, /does not identify the exact configured capture Codespace name/);
  assert.match(source, /dialogText\.includes\(CODESPACE_NAME\)/);
  assert.doesNotMatch(source, /dialogText\.includes\(REPO\)/);
  assert.match(source, /state: 'detached'/);
  assert.match(source, /Refusing to continue/);
});

test('repository capture orders required fields and guards its destructive target', () => {
  const source = fs.readFileSync(path.join(dir, 'create-repo.js'), 'utf8');
  const actions = [
    "step.click(includeBranches, '04-include-all-branches-off.png')",
    "step.shot(includeBranches, '05-include-all-branches-on.png')",
    "SELECTORS.name(page).fill(REPO)",
    "SELECTORS.description(page).fill(DESCRIPTION)",
    "step.click(SELECTORS.publicOption(page), '08-public.png'",
    "step.click(SELECTORS.create(page), '09-create-repository.png')",
  ];
  const positions = actions.map((action) => source.indexOf(action));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepStrictEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(source, /CAPTURE_RECREATE !== '1'/);
  assert.match(source, /CAPTURE_SKIP_DELETE !== '1'/);
  assert.match(source, /SOKENDAI Git and GitHub collaboration workshop/);
  assert.doesNotMatch(source, /BOARD\.txt|Source Control/);
});
