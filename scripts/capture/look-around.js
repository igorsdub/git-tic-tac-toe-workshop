'use strict';
const fs = require('fs');
const path = require('path');
const { launch, createStep, OUT_DIR } = require('./lib');
const { requireCaptureIdentity, requireCaptureRow } = require('./delete-codespace');

const SLUG = 'look-around';
const QUESTION = 'What does this repository do?';

const SELECTORS = {
  signIn: (p) => p.getByRole('button', { name: /^Sign In$/i }),
  copilotConnected: (p) => p.getByText(/Copilot status|Sessions/i).first(),
  modePicker: (p) => p.getByRole('button', { name: /^(Agent|Ask)(\s|$)/ }).first(),
  modeAsk: (p) => p.getByRole('menuitemcheckbox', { name: /^Ask$/i }).or(p.getByRole('menuitemradio', { name: /^Ask$/i })).or(p.getByRole('option', { name: /^Ask$/i })).or(p.getByRole('menuitem', { name: /^Ask$/i })).first(),
  modeAskSelected: (p) => p.getByRole('button', { name: /^Ask(\s|$)/i }).first(),
  chatInput: (p) => p.getByRole('textbox', { name: /Chat Input/ }),
  send: (p) => p.getByRole('button', { name: /^Send$/i }),
  completedAnswers: (p) => p.locator('.chat-response-completed-at'),
  answer: (p) => p.locator('.chat-response-completed-at').last(),
  workbench: (p) => p.locator('.monaco-workbench'),
};

async function run() {
  requireCaptureIdentity();
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);
  await page.goto('https://github.com/codespaces');
  const { row } = await requireCaptureRow(page);
  const codespaceLink = row.locator('a[href*="/codespaces/"]');
  if (await codespaceLink.count() !== 1) {
    throw new Error('Expected one Codespace link inside the exact configured name and repository row; refusing to open a different Codespace.');
  }
  const href = new URL(await codespaceLink.getAttribute('href'), 'https://github.com').href;
  await page.goto(href);
  await SELECTORS.workbench(page).waitFor({ timeout: 180000 });
  await SELECTORS.chatInput(page).waitFor({ state: 'visible', timeout: 60000 });
  await step.shot(null, '01-chat.png');

  const signIn = SELECTORS.signIn(page);
  if (await signIn.count() !== 1) {
    await page.screenshot({ path: path.join(OUT_DIR, 'look-around', 'debug-sign-in-unavailable.png') });
    await step.finish();
    throw new Error('The expected Copilot Sign In button is not visible in the new Codespace. Refusing to claim a completed sign-in capture.');
  }
  await step.click(signIn, '02-sign-in.png', { afterClickMs: 1000 });

  // GitHub authentication can open an authorization page or require user action.
  // This capture script never approves an OAuth request or enters credentials.
  const authPage = context.pages().find((candidate) => candidate !== page && /github\.com\/(login|login\/oauth|sessions\/two-factor)/i.test(candidate.url()));
  if (authPage) {
    await step.finish();
    throw new Error('Copilot opened a GitHub authorization page. Complete and review the connection manually, then recapture; this script will not authorize it.');
  }

  await SELECTORS.copilotConnected(page).waitFor({ state: 'visible', timeout: 60000 }).catch(async () => {
    await page.screenshot({ path: path.join(OUT_DIR, 'look-around', 'debug-copilot-connection.png') });
    await step.finish();
    throw new Error('Copilot did not show its connected status after Sign In. Complete any account connection manually and recapture.');
  });
  await step.shot(null, '03-connect-copilot.png');
  await SELECTORS.modeAsk(page).waitFor({ state: 'visible', timeout: 120000 }).catch(async () => {
    await page.screenshot({ path: path.join(OUT_DIR, 'look-around', 'debug-ask-unavailable.png') });
    await step.finish();
    throw new Error('Ask did not appear after Copilot connected. No prompt was sent.');
  });
  // The authentication state is external to the Codespace editor. Continue only
  // after Ask is visible; this wait never submits in Agent mode.
  await step.shot(SELECTORS.modeAsk(page), '04-wait-for-ask.png');

  await step.perform(SELECTORS.modePicker(page), () => SELECTORS.modePicker(page).click(), {
    name: 'open-mode-selector', captureScreenshot: false, outlineMs: 500, afterActionMs: 500,
  });
  await step.click(SELECTORS.modeAsk(page), '05-mode-selector.png', { afterClickMs: 500 });
  await SELECTORS.modeAskSelected(page).waitFor({ state: 'visible', timeout: 10000 });
  if (!/^Ask\b/.test((await SELECTORS.modeAskSelected(page).innerText()).trim())) {
    throw new Error('Ask was not selected; refusing to send the readiness question.');
  }
  await step.shot(SELECTORS.modeAskSelected(page), '06-ask-mode.png');

  const chatInput = SELECTORS.chatInput(page);
  await chatInput.click();
  await page.keyboard.insertText(QUESTION);
  await step.shot(chatInput, '07-question-typed.png');
  const priorAnswerCount = await SELECTORS.completedAnswers(page).count();
  const send = SELECTORS.send(page);
  await step.click(send, '08-send-target.png', { afterClickMs: 0 });
  await SELECTORS.modeAskSelected(page).waitFor({ state: 'visible', timeout: 10000 });
  const waitStarted = Date.now();
  await showWaitingLabel(page);
  const answerText = await waitForNewCompletedAnswer(page, priorAnswerCount).catch(() => '');
  // Keep the instructional post-action hold, zoom-out, and wide interval at normal speed.
  step.recordWait(waitStarted + 4700, Date.now());
  if (!answerText) {
    await page.screenshot({ path: path.join(OUT_DIR, 'look-around', 'debug-answer.png') });
    await step.finish();
    throw new Error('Copilot did not return a completed answer within 120 seconds.');
  }
  await removeWaitingLabel(page);
  await page.waitForTimeout(2500);
  await step.shot(null, '09-answer-complete.png');
  await page.mouse.move(700, 300);
  const rawPath = await step.finish();
  step.markComplete(rawPath, answerText);
  return rawPath;
}

async function waitForNewCompletedAnswer(page, priorCount) {
  const selector = '.chat-response-completed-at';
  await page.waitForFunction(({ css, before }) => {
    const markers = [...document.querySelectorAll(css)];
    if (markers.length <= before) return false;
    const marker = markers[markers.length - 1];
    if (!marker.getClientRects().length || getComputedStyle(marker).visibility === 'hidden') return false;
    const markerText = (marker.innerText || '').trim();
    for (let ancestor = marker.parentElement, depth = 0; ancestor && depth < 5; ancestor = ancestor.parentElement, depth++) {
      const content = (ancestor.innerText || '').trim().replace(markerText, '').trim();
      if (content) return true;
    }
    return false;
  }, { css: selector, before: priorCount }, { timeout: 120000 });
  return SELECTORS.answer(page).last().evaluate((marker) => {
    const markerText = (marker.innerText || '').trim();
    for (let ancestor = marker.parentElement, depth = 0; ancestor && depth < 5; ancestor = ancestor.parentElement, depth++) {
      const content = (ancestor.innerText || '').trim().replace(markerText, '').trim();
      if (content) return content;
    }
    return '';
  });
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
