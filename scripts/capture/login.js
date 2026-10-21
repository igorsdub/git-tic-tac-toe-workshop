'use strict';
const { launch } = require('./lib');

async function run() {
  const context = await launch({ headless: false });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://github.com/login');
  console.log('Log in, then close the window');
  await new Promise((resolve) => context.on('close', resolve));
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { run };
