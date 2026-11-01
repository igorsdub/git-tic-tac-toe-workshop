'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { launch, createStep } = require('./lib');

const SLUG = 'create-repo';
const TEMPLATE_URL = 'https://github.com/igorsdub/git-tic-tac-toe-template';
const REPO = process.env.CAPTURE_REPO;
const DESCRIPTION = 'SOKENDAI Git and GitHub collaboration workshop';

const SELECTORS = {
  useTemplate: (p) => p.getByRole('button', { name: 'Use this template' }),
  createNewRepo: (p) => p.getByRole('menuitem', { name: 'Create a new repository' }),
  owner: (p) => p.getByRole('button', { name: /Owner|Choose an owner/ }),
  ownerOption: (p, login) => p.getByRole('menuitemradio', { name: login, exact: true }),
  name: (p) => p.locator('#repository-name-input'),
  includeBranches: (p) => p.getByLabel('Include all branches', { exact: true }),
  description: (p) => p.getByLabel('Description', { exact: true }),
  visibility: (p) => p.getByRole('button', { name: /Choose visibility|Public/ }),
  publicOption: (p) => p.getByRole('menuitemradio', { name: /Public/ }),
  create: (p) => p.getByRole('button', { name: 'Create repository' }),
  // UI delete fallback
  settingsTab: (p) => p.getByRole('link', { name: 'Settings' }),
  deleteRepo: (p) => p.getByRole('button', { name: 'Delete this repository' }),
  confirmInput: (p) => p.locator('#verification_field'),
  confirmDelete: (p) => p.getByRole('dialog').getByRole('button', { name: 'Delete this repository' }),
};

function requireCaptureRepo() {
  if (!REPO || !/^[A-Za-z0-9._-]+$/.test(REPO)) {
    throw new Error('Set CAPTURE_REPO to the exact disposable repository name; this script can delete and recreate that repository.');
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ghAvailable() {
  return spawnSync('gh', ['--version'], { stdio: 'ignore' }).status === 0;
}

async function deleteExisting(page) {
  if (ghAvailable()) {
    const who = spawnSync('gh', ['api', 'user', '--jq', '.login'], { encoding: 'utf8' });
    const owner = who.stdout.trim();
    if (owner) {
      const r = spawnSync('gh', ['repo', 'delete', `${owner}/${REPO}`, '--yes'], { encoding: 'utf8' });
      if (r.status === 0 || /404|Not Found|Could not resolve/i.test(r.stderr)) return;
      console.warn(`gh repo delete failed, using the web UI: ${r.stderr.trim()}`);
    }
  }
  const login = await page.locator('meta[name="user-login"]').getAttribute('content');
  const resp = await page.goto(`https://github.com/${login}/${REPO}/settings`);
  if (!resp || resp.status() === 404) return;
  await SELECTORS.deleteRepo(page).click();
  await page.getByRole('button', { name: /I want to delete this repository/ }).click().catch(() => {});
  await page.getByRole('button', { name: /I have read and understand these effects/ }).click().catch(() => {});
  await SELECTORS.confirmInput(page).fill(`${login}/${REPO}`);
  await SELECTORS.confirmDelete(page).click();
  await page.waitForURL((u) => !u.pathname.endsWith('/settings'), { timeout: 60000 });
}

async function run() {
  requireCaptureRepo();
  if (process.env.CAPTURE_SKIP_DELETE !== '1' && process.env.CAPTURE_RECREATE !== '1') {
    throw new Error('Set CAPTURE_RECREATE=1 to allow deletion of an existing repository named by CAPTURE_REPO, or CAPTURE_SKIP_DELETE=1 for a confirmed-new repository.');
  }
  const outDir = path.join(__dirname, 'out', SLUG);
  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(path.join(outDir, 'capture-complete.json'), { force: true });
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  await page.goto('https://github.com');
  if (process.env.CAPTURE_SKIP_DELETE !== '1') await deleteExisting(page);
  await page.goto(TEMPLATE_URL);
  await step.click(SELECTORS.useTemplate(page), '01-template-page.png');
  await step.click(SELECTORS.createNewRepo(page), '02-use-this-template.png');
  await step.shot(null, '03-create-new-repository.png');
  const includeBranches = SELECTORS.includeBranches(page);
  if (await includeBranches.isChecked()) throw new Error('Expected Include all branches to start Off so the capture can show the required toggle action.');
  await step.click(includeBranches, '04-include-all-branches-off.png');
  if (!(await includeBranches.isChecked())) throw new Error('Include all branches did not switch On.');
  await step.shot(includeBranches, '05-include-all-branches-on.png');
  await SELECTORS.owner(page).click();
  const login = await page.locator('meta[name="user-login"]').getAttribute('content');
  if (!login) throw new Error('Could not identify the signed-in GitHub account.');
  await SELECTORS.ownerOption(page, login).click();
  await SELECTORS.name(page).fill(REPO);
  await page.getByText(new RegExp(`${escapeRegExp(REPO)} is available`, 'i')).waitFor({ timeout: 30000 });
  await step.shot(SELECTORS.name(page), '06-owner-and-name.png');
  await SELECTORS.description(page).fill(DESCRIPTION);
  await step.shot(SELECTORS.description(page), '07-description.png');
  await SELECTORS.visibility(page).click();
  await step.click(SELECTORS.publicOption(page), '08-public.png', { captureScreenshot: true });
  if (!/Public/i.test(await SELECTORS.visibility(page).innerText())) {
    throw new Error('Repository visibility is not Public; refusing to create the capture repository.');
  }
  await step.click(SELECTORS.create(page), '09-create-repository.png');
  const repoUrl = `https://github.com/${login}/${REPO}`;
  await page.waitForURL((url) => url.pathname.replace(/\/$/, '').endsWith(`/${REPO}`), { timeout: 90000 }).catch(() => {});
  if (!page.url().replace(/\/$/, '').endsWith(`/${REPO}`)) await page.goto(repoUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.getByRole('heading', { name: REPO, exact: true }).waitFor({ timeout: 90000 });
  const raw = await step.finish();
  fs.writeFileSync(path.join(outDir, 'capture-complete.json'), JSON.stringify({ status: 'complete', repositoryVisible: true }, null, 2));
  return raw;
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
