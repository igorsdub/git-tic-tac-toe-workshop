'use strict';
const { spawnSync } = require('child_process');
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
  await page.waitForURL(new RegExp(`/${REPO}(\\?|$|/)`), { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded');
  return step.finish();
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
