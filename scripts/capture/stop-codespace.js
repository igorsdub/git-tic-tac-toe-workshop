'use strict';
const { launch, createStep } = require('./lib');

const SLUG = 'stop-codespace';
const REPO = process.env.CAPTURE_REPO || 'tic-tac-toe-demo';

const SELECTORS = {
  moreMenu: (p) => p.getByRole('button', { name: /Open menu|More options|Codespace actions/ }).first(),
  stop: (p) => p.getByRole('menuitem', { name: 'Stop codespace' }),
  stoppedLabel: (p) => p.getByText(/Stopped|Inactive/).first(),
};

async function run() {
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  await page.goto('https://github.com/codespaces');
  await page.getByText(REPO).first().waitFor();
  await step.shot(null, '01-codespaces-list.png');
  await step.click(SELECTORS.moreMenu(page), '02-more-menu.png');
  await SELECTORS.stop(page).click();
  await SELECTORS.stoppedLabel(page).waitFor({ timeout: 60000 }).catch(() => {});
  await step.shot(null, '03-stopped.png');
  return step.finish();
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
