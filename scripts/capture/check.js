'use strict';
const { launch } = require('./lib');

async function run() {
  const context = await launch({ headless: true });
  try {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto('https://github.com/');
    const login = await page.evaluate(
      () => document.querySelector('meta[name="user-login"]')?.content || '',
    );
    if (login) {
      console.log(`Signed in as ${login}`);
      return true;
    }
    console.log('signed out');
    return false;
  } finally {
    await context.close();
  }
}

if (require.main === module) {
  run().then((ok) => process.exit(ok ? 0 : 1)).catch((e) => { console.error(e.message); process.exit(1); });
}
module.exports = { run };
