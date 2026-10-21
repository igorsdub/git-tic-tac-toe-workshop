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
  name: (p) => p.getByRole('textbox', { name: 'Repository name' }),
  publicRadio: (p) => p.getByRole('radio', { name: /Public/ }),
  create: (p) => p.getByRole('button', { name: 'Create repository' }),
  // UI delete fallback
  settingsTab: (p) => p.getByRole('link', { name: 'Settings' }),
  deleteRepo: (p) => p.getByRole('button', { name: 'Delete this repository' }),
  confirmInput: (p) => p.getByRole('textbox', { name: /To confirm, type/ }),
  confirmDelete: (p) => p.getByRole('button', { name: /I understand the consequences, delete this repository/ }),
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
      if (r.status !== 0) console.warn(`gh repo delete: ${r.stderr.trim()}`);
      return;
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
  await SELECTORS.name(page).fill(REPO);
  await step.click(SELECTORS.publicRadio(page), '05-visibility-public.png');
  await step.click(SELECTORS.create(page), '06-create-repository.png');
  await page.waitForLoadState('networkidle');
  return step.finish();
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
