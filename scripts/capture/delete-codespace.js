'use strict';
const path = require('path');
const { launch, createStep, OUT_DIR } = require('./lib');

const SLUG = 'delete-codespace';
const HOME_URL = 'https://github.com/';
const REPO = process.env.CAPTURE_REPO;
const CODESPACE_NAME = process.env.CAPTURE_CODESPACE_NAME;
const OUT_DIR_FOR_STEP = path.join(OUT_DIR, SLUG);

function requireCaptureIdentity() {
  if (!REPO || !/^[A-Za-z0-9._-]+$/.test(REPO)) {
    throw new Error('Set CAPTURE_REPO to the exact repository for the capture Codespace.');
  }
  if (!CODESPACE_NAME || !CODESPACE_NAME.trim()) {
    throw new Error('Set CAPTURE_CODESPACE_NAME to the exact capture Codespace name; deletion will not target a repository match alone.');
  }
}

function exactRow(page) {
  const exactName = page.getByText(CODESPACE_NAME, { exact: true });
  return exactName.locator('xpath=ancestor::*[self::li or @role="listitem"][1]');
}

async function requireOne(locator, description) {
  const count = await locator.count();
  if (count !== 1) throw new Error(`Expected exactly one ${description}; found ${count}. Refusing to continue.`);
  return locator;
}

async function requireCaptureRow(page) {
  const exactName = page.getByText(CODESPACE_NAME, { exact: true });
  await exactName.waitFor({ state: 'visible', timeout: 60000 });
  await requireOne(exactName, `exact Codespace name "${CODESPACE_NAME}"`);
  const row = await requireOne(exactRow(page), `row for Codespace "${CODESPACE_NAME}"`);
  const repoLink = row.locator(`a[href$="/${REPO}"]`);
  await requireOne(repoLink, `repository link for "${REPO}" in the named Codespace row`);
  return { name: exactName, row };
}

async function uniqueDeleteAction(page, role) {
  const names = /^Delete(?: codespace)?$/i;
  const matches = [
    page.getByRole(role, { name: names }),
    ...(role === 'menuitem' ? [page.getByRole('menuitemradio', { name: names })] : []),
  ];
  const visible = [];
  for (const match of matches) {
    for (let index = 0, count = await match.count(); index < count; index++) {
      const candidate = match.nth(index);
      if (await candidate.isVisible()) visible.push(candidate);
    }
  }
  if (visible.length !== 1) throw new Error(`Expected one visible ${role} named Delete; found ${visible.length}. Refusing to continue.`);
  return visible[0];
}

async function run() {
  requireCaptureIdentity();
  const context = await launch({ headless: true, recordVideo: true, slug: SLUG });
  const page = context.pages()[0] || (await context.newPage());
  const step = createStep(page, SLUG);

  await page.goto(HOME_URL);
  await page.waitForLoadState('domcontentloaded');
  await step.shot(null, '01-github-home.png');

  const navigation = page.getByRole('navigation');
  const navToggle = page.getByRole('button', { name: /^(open|show) (global )?navigation( menu)?$/i });
  if (await navToggle.count() === 1) {
    await step.perform(navToggle, () => navToggle.click(), {
      name: 'open-left-navigation', captureScreenshot: false, outlineMs: 500, afterActionMs: 500,
    });
    await step.shot(null, '02-left-nav-open.png');
  } else {
    const visibleCodespacesLink = navigation.getByRole('link', { name: 'Codespaces', exact: true });
    await requireOne(visibleCodespacesLink, 'Codespaces link in the open left navigation');
    await step.shot(null, '02-left-nav-open.png');
  }

  const codespacesLink = navigation.getByRole('link', { name: 'Codespaces', exact: true });
  await requireOne(codespacesLink, 'Codespaces link in the left navigation');
  await step.perform(codespacesLink, () => codespacesLink.click(), {
    name: 'open-codespaces', captureScreenshot: false, outlineMs: 500, afterActionMs: 1000,
  });
  await page.waitForLoadState('domcontentloaded');
  const { row } = await requireCaptureRow(page);
  await step.shot(null, '03-codespaces-list.png');

  const moreMenu = await requireOne(
    row.getByRole('button', { name: /^(more options|more actions|options)$/i }),
    `options menu for Codespace "${CODESPACE_NAME}"`,
  );
  await step.click(moreMenu, '04-more-menu.png', { afterClickMs: 500 });

  const deleteOption = await uniqueDeleteAction(page, 'menuitem');
  await step.click(deleteOption, '05-delete-option.png', { afterClickMs: 500 });

  const dialog = await requireOne(page.getByRole('dialog'), 'Codespace deletion confirmation dialog');
  const dialogText = await dialog.innerText();
  if (!dialogText.includes(CODESPACE_NAME)) {
    throw new Error('The deletion dialog does not identify the exact configured capture Codespace name. Refusing to delete.');
  }
  const confirmDelete = await uniqueDeleteAction(dialog, 'button');
  await step.click(confirmDelete, '06-confirm-delete.png', { afterClickMs: 1000 });

  await page.getByText(CODESPACE_NAME, { exact: true }).waitFor({ state: 'detached', timeout: 60000 });
  await step.shot(null, '07-deleted.png');
  const raw = await step.finish();
  return raw;
}

if (require.main === module) {
  run().catch((error) => { console.error(error); process.exit(1); });
}

module.exports = { run, exactRow, requireCaptureIdentity, requireCaptureRow, uniqueDeleteAction };
