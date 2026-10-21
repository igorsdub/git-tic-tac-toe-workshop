'use strict';
const { launch, createStep } = require('./lib');

const SLUG = 'look-around';
const QUESTION = 'What does this repository do?';

const SELECTORS = {
  boardFile: (p) => p.getByRole('treeitem', { name: 'BOARD.txt' }),
  sourceControl: (p) => p.getByRole('tab', { name: /Source Control/ }),
  copilotChat: (p) => p.getByRole('button', { name: /Copilot|Toggle Chat/ }).first(),
  modeAsk: (p) => p.getByText('Ask', { exact: true }).first(),
  chatInput: (p) => p.getByRole('textbox', { name: /Ask Copilot|Chat/ }).first(),
  answer: (p) => p.locator('.interactive-response').last(),
  workbench: (p) => p.locator('.monaco-workbench'),
};

async function run() {
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  // Codespace URL is taken from the codespaces list (most recent one).
  await page.goto('https://github.com/codespaces');
  await page.getByRole('link', { name: /tic-tac-toe/i }).first().click();
  await SELECTORS.workbench(page).waitFor({ timeout: 180000 });
  await step.click(SELECTORS.boardFile(page), '01-explorer-board.png');
  await step.click(SELECTORS.sourceControl(page), '02-source-control.png');
  await step.click(SELECTORS.copilotChat(page), '03-copilot-chat-ask.png');
  await SELECTORS.modeAsk(page).click();
  await SELECTORS.chatInput(page).fill(QUESTION);
  await page.keyboard.press('Enter');
  await SELECTORS.answer(page).waitFor({ timeout: 120000 });
  await page.waitForTimeout(8000);
  await step.shot(null, '04-copilot-answer.png');
  return step.finish();
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
