'use strict';
const { launch, createStep } = require('./lib');

const SLUG = 'stop-codespace';
const REPO = process.env.CAPTURE_REPO || 'tic-tac-toe-demo';

const SELECTORS = {
  // The row of the demo repo only (exact repo link), never the -2026... lookalikes or other repos.
  row: (p) => p.locator('li, [role=listitem], div')
    .filter({ has: p.locator(`a[href$="/${REPO}"]`) })
    .filter({ has: p.getByRole('button') })
    .last(),
  moreMenu: (p) => SELECTORS.row(p).getByRole('button').first(),
  stop: (p) => p.getByRole('menuitemradio', { name: 'Stop codespace' }),
  stoppedLabel: (p) => SELECTORS.row(p).getByText(/Last used|Shutting down|Stopped/).first(),
};

async function run() {
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  await page.goto('https://github.com/codespaces');
  await page.locator(`a[href$="/${REPO}"]`).first().waitFor();
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
