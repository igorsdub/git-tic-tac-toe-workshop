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
