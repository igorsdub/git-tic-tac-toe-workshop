'use strict';
const fs = require('fs');
const path = require('path');
const { launch, createStep, OUT_DIR } = require('./lib');

const SLUG = 'look-around';
const REPO = process.env.CAPTURE_REPO || 'tic-tac-toe-demo';
const QUESTION = 'What does this repository do?';
const FOCUS_TIMING = { outlineMs: 500, afterClickMs: 6400, captureScreenshot: false };

const SELECTORS = {
  boardFile: (p) => p.getByRole('treeitem', { name: 'BOARD.txt' }),
  sourceControl: (p) => p.getByRole('tab', { name: /Source Control/ }),
  // The chat panel is open by default in the web editor; its input is the click target.
  modePicker: (p) => p.getByRole('button', { name: /^Agent/ }).first(),
  modeAsk: (p) => p.getByRole('menuitemcheckbox', { name: /^Ask/ }).or(p.getByRole('menuitemradio', { name: /^Ask/ })).or(p.getByRole('option', { name: /^Ask/ })).or(p.getByRole('menuitem', { name: /^Ask/ })).first(),
  modeAskSelected: (p) => p.getByRole('button', { name: /^Ask/ }).first(),
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
  await page.waitForTimeout(10000);
  await step.click(SELECTORS.boardFile(page), '01-explorer-board.png', FOCUS_TIMING);
  await step.click(SELECTORS.sourceControl(page), '02-source-control.png', FOCUS_TIMING);
  await step.click(SELECTORS.modePicker(page), '03-copilot-chat.png', FOCUS_TIMING);
  // Do not send the prompt unless Ask mode is actually available and selected.
  if (!(await SELECTORS.modeAsk(page).waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false))) {
    await page.screenshot({ path: path.join(OUT_DIR, 'look-around', 'debug-ask-unavailable.png') });
    const options = await page.locator('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"]').evaluateAll((els) =>
      els.filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
        .map((el) => el.innerText.trim()).filter(Boolean));
    fs.writeFileSync(path.join(OUT_DIR, 'look-around', 'debug-ask-options.json'), JSON.stringify(options, null, 2));
    await step.finish();
    throw new Error('Ask mode is unavailable after waiting for the menu to load (visible options: ' + (options.join(' | ') || 'none') + '); refusing to submit the prompt in Agent mode.');
  }
  await step.perform(SELECTORS.modeAsk(page), () => SELECTORS.modeAsk(page).click(), {
    outlineMs: 500,
    afterActionMs: 6400,
  });
  await SELECTORS.modeAskSelected(page).waitFor({ state: 'visible', timeout: 10000 });
  const selectedMode = await SELECTORS.modeAskSelected(page).innerText();
  if (!/^Ask\b/.test(selectedMode.trim())) throw new Error('Expected Ask mode after selection, found "' + selectedMode.trim() + '".');
  const chatInput = SELECTORS.chatInput(page);
  await step.perform(chatInput, async () => {
    await chatInput.click();
    await page.keyboard.insertText(QUESTION);
    await page.keyboard.press('Enter');
  }, { outlineMs: 500 });
  const waitStarted = Date.now();
  await showWaitingLabel(page);
  const answered = await SELECTORS.answer(page).waitFor({ state: 'attached', timeout: 120000 }).then(() => true).catch(() => false);
  // Keep the instructional post-action hold, zoom-out, and wide interval at normal speed.
  step.recordWait(waitStarted + 4700, Date.now());
  if (!answered) {
    await page.screenshot({ path: path.join(OUT_DIR, 'look-around', 'debug-answer.png') });
    await step.finish();
    throw new Error('Copilot did not return a completed answer within 120 seconds.');
  }
  await removeWaitingLabel(page);
  await page.waitForTimeout(2500);
  await page.mouse.move(700, 300);
  return step.finish();
}

async function showWaitingLabel(page) {
  await page.evaluate(() => {
    let label = document.getElementById('capture-copilot-waiting');
    if (!label) {
      label = document.createElement('div');
      label.id = 'capture-copilot-waiting';
      label.setAttribute('role', 'status');
      Object.assign(label.style, {
        position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
        zIndex: '2147483647', padding: '8px 14px', borderRadius: '6px',
        background: '#252526', color: '#ffffff', border: '1px solid #777',
        font: '600 14px system-ui, sans-serif', boxShadow: '0 2px 8px #0008',
      });
      document.body.append(label);
    }
    label.textContent = 'Waiting for Copilot…';
  });
}

async function removeWaitingLabel(page) {
  await page.evaluate(() => document.getElementById('capture-copilot-waiting')?.remove());
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run, SELECTORS };
