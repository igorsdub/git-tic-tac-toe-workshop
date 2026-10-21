'use strict';
const { chromium } = require('playwright');
const { AUTH_FILE, VIEWPORT } = require('./lib');

const POLL_MS = 2000;
const TIMEOUT_MS = 10 * 60 * 1000;

async function run() {
  const browser = await chromium.launch({ headless: false });
  try {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    await page.goto('https://github.com/login');
    console.log('Log in to GitHub in the browser window (waiting up to 10 minutes)');
    const deadline = Date.now() + TIMEOUT_MS;
    while (Date.now() < deadline) {
      const login = await page
        .evaluate(() => document.querySelector('meta[name="user-login"]')?.content || '')
        .catch(() => '');
      if (login) {
        console.log(`Signed in as ${login}`);
        await context.storageState({ path: AUTH_FILE });
        console.log('Saved login to .playwright-auth.json');
        return;
      }
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    console.error('Timed out after 10 minutes without a GitHub sign-in. Rerun npm run capture:login.');
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run };
