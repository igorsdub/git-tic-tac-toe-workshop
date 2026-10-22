'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { launch, createStep } = require('./lib');

const SLUG = 'create-repo';
const TEMPLATE_URL = 'https://github.com/igorsdub/git-tic-tac-toe-template';
const REPO = process.env.CAPTURE_REPO || 'tic-tac-toe-demo';

const SELECTORS = {
  useTemplate: (p) => p.getByRole('button', { name: 'Use this template' }),
  createNewRepo: (p) => p.getByRole('menuitem', { name: 'Create a new repository' }),
  owner: (p) => p.getByRole('button', { name: /Owner|Choose an owner/ }),
  ownerOption: (p, login) => p.getByRole('menuitemradio', { name: login, exact: true }),
  name: (p) => p.locator('#repository-name-input'),
  visibility: (p) => p.getByRole('button', { name: /Choose visibility/ }),
  publicOption: (p) => p.getByRole('menuitemradio', { name: /Public/ }),
  create: (p) => p.getByRole('button', { name: 'Create repository' }),
  // UI delete fallback
  settingsTab: (p) => p.getByRole('link', { name: 'Settings' }),
  deleteRepo: (p) => p.getByRole('button', { name: 'Delete this repository' }),
  confirmInput: (p) => p.locator('#verification_field'),
  confirmDelete: (p) => p.getByRole('dialog').getByRole('button', { name: 'Delete this repository' }),
};

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
  const outDir = path.join(__dirname, 'out', SLUG);
  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(path.join(outDir, 'capture-complete.json'), { force: true });
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  await page.goto('https://github.com');
  await deleteExisting(page);
  await page.goto(TEMPLATE_URL);
  await step.shot(null, '01-template-page.png');
  await step.click(SELECTORS.useTemplate(page), '02-use-this-template.png');
  await step.click(SELECTORS.createNewRepo(page), '03-create-new-repository.png');
  await step.shot(SELECTORS.owner(page), '04-owner-and-name.png');
  await SELECTORS.owner(page).click();
  await SELECTORS.ownerOption(page, await page.locator('meta[name="user-login"]').getAttribute('content')).click();
  await SELECTORS.name(page).fill(REPO);
  await step.click(SELECTORS.visibility(page), '05-visibility-public.png');
  await SELECTORS.publicOption(page).click();
  await step.click(SELECTORS.create(page), '06-create-repository.png');
  // GitHub may leave the creation form in place after the repository exists.
  // Preserve the visible creation state briefly, then open the resulting repo.
  await page.waitForTimeout(3500);
  const login = await page.locator('meta[name="user-login"]').getAttribute('content');
  const repoUrl = `https://github.com/${login}/${REPO}`;
  let created = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    const status = spawnSync('gh', ['repo', 'view', `${login}/${REPO}`], { stdio: 'ignore' }).status;
    if (status === 0) { created = true; break; }
    await page.waitForTimeout(1000);
  }
  if (!created) throw new Error(`GitHub did not finish creating ${login}/${REPO} within 60 seconds.`);
  if (!page.url().replace(/\/$/, '').endsWith(`/${REPO}`)) {
    await page.goto(repoUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  }
  await page.getByRole('heading', { name: REPO, exact: true }).waitFor({ timeout: 90000 });
  await page.getByRole('link', { name: 'BOARD.txt', exact: true }).waitFor({ timeout: 90000 });
  // Leave a clean, full-screen loaded-repository establishing view at the tail
  // of the recording so the storyboard can show navigation completing.
  await page.waitForTimeout(3000);
  const raw = await step.finish();
  fs.writeFileSync(path.join(outDir, 'capture-complete.json'), JSON.stringify({ status: 'complete', repositoryVisible: true }, null, 2));
  return raw;
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
