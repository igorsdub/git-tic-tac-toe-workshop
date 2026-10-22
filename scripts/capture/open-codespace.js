'use strict';
const { spawnSync } = require('child_process');
const { launch, createStep } = require('./lib');

const SLUG = 'open-codespace';
const REPO = process.env.CAPTURE_REPO || 'tic-tac-toe-demo';

const SELECTORS = {
  codeButton: (p) => p.getByRole('button', { name: 'Code', exact: true }),
  codespacesTab: (p) => p.getByRole('button', { name: 'Codespaces', exact: true }),
  createCodespace: (p) => p.getByRole('button', { name: 'Create codespace on main' }),
  editorReady: (p) => p.getByRole('tab', { name: /BOARD\.txt|README/ }).first(),
  workbench: (p) => p.locator('.monaco-workbench'),
  trust: (p) => p.getByRole('button', { name: 'Trust Folder & Continue' }),
};

function owner() {
  const r = spawnSync('gh', ['api', 'user', '--jq', '.login'], { encoding: 'utf8' });
  return (r.stdout || '').trim() || process.env.CAPTURE_OWNER;
}

async function run() {
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  await page.goto(`https://github.com/${owner()}/${REPO}`);
  await step.click(SELECTORS.codeButton(page), '01-code-button.png');
  await step.click(SELECTORS.codespacesTab(page), '02-codespaces-tab.png');
  // GitHub opens the new codespace in a new tab; keep working in the recorded page.
  const popupP = context.waitForEvent('page', { timeout: 90000 }).catch(() => null);
  await step.click(SELECTORS.createCodespace(page), '03-create-codespace.png');
  const popup = await popupP;
  if (popup) {
    await popup.waitForURL(/github\.com\/codespaces\/|github\.dev/, { timeout: 90000 });
    const target = popup.url();
    await popup.close();
    await page.goto(target);
  }
  await SELECTORS.workbench(page).waitFor({ timeout: 180000 });
  await SELECTORS.editorReady(page).waitFor({ timeout: 180000 }).catch(() => {});
  await SELECTORS.trust(page).click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await step.shot(null, '04-editor-ready.png');
  return step.finish();
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
