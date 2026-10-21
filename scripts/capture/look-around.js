'use strict';
const path = require('path');
const { launch, createStep, OUT_DIR } = require('./lib');

const SLUG = 'look-around';
const REPO = process.env.CAPTURE_REPO || 'tic-tac-toe-demo';
const QUESTION = 'What does this repository do?';

const SELECTORS = {
  boardFile: (p) => p.getByRole('treeitem', { name: 'BOARD.txt' }),
  sourceControl: (p) => p.getByRole('tab', { name: /Source Control/ }),
  // The chat panel is open by default in the web editor; its input is the click target.
  modePicker: (p) => p.getByRole('button', { name: /^Agent/ }).first(),
  modeAsk: (p) => p.getByRole('menuitemcheckbox', { name: /^Ask/ }).or(p.getByRole('option', { name: /^Ask/ })).or(p.getByRole('menuitem', { name: /^Ask/ })).first(),
  chatInput: (p) => p.getByRole('textbox', { name: /Chat Input/ }),
  trust: (p) => p.getByRole('button', { name: 'Trust Folder & Continue' }),
  answer: (p) => p.locator('.chat-response-completed-at').last(),
  workbench: (p) => p.locator('.monaco-workbench'),
};

async function run() {
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  // Codespace URL is taken from the codespaces list (most recent one).
  await page.goto('https://github.com/codespaces');
  // Only the codespace of the demo repo: find its row via the repository link, never the first tic-tac-toe match.
  const href = await page.evaluate((repo) => {
    const a = [...document.querySelectorAll('a')].find((e) => /^\/[^/]+\/(.+)$/.test(e.getAttribute('href') || '') && e.getAttribute('href').endsWith(`/${repo}`));
    for (let n = a; n; n = n.parentElement) {
      const l = [...n.querySelectorAll('a')].find((x) => /\/codespaces\/[^/?#]+$/.test(x.href));
      if (l) return l.href;
    }
    return null;
  }, REPO);
  if (!href) throw new Error(`No codespace found for ${REPO}`);
  await page.goto(href);
  await SELECTORS.workbench(page).waitFor({ timeout: 180000 });
  await SELECTORS.trust(page).click({ timeout: 60000 }).catch(() => {});
  await page.locator('.monaco-dialog-modal-block').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await step.click(SELECTORS.boardFile(page), '01-explorer-board.png');
  await step.click(SELECTORS.sourceControl(page), '02-source-control.png');
  await step.click(SELECTORS.modePicker(page), '03-copilot-chat-ask.png');
  // The current web editor offers only Agent mode (no Ask); use Ask when present, otherwise close the menu.
  if (await SELECTORS.modeAsk(page).isVisible({ timeout: 3000 }).catch(() => false)) {
    await SELECTORS.modeAsk(page).click();
  } else {
    await page.keyboard.press('Escape');
  }
  await SELECTORS.chatInput(page).focus();
  await page.keyboard.insertText(QUESTION);
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await SELECTORS.answer(page).waitFor({ state: 'attached', timeout: 120000 }).catch(async (e) => {
    await page.screenshot({ path: path.join(OUT_DIR, 'look-around', 'debug-answer.png') });
    throw e;
  });
  await page.waitForTimeout(8000);
  await page.mouse.move(700, 300);
  await step.shot(null, '04-copilot-answer.png');
  return step.finish();
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
