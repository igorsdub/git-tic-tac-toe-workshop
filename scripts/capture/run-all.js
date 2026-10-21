'use strict';
const { loadManifest } = require('./lib');

const ORDER = ['create-repo', 'open-codespace', 'look-around', 'stop-codespace'];

async function main(argv) {
  const known = loadManifest().steps.map((s) => s.slug);
  const wanted = argv.length ? argv : ORDER;
  for (const slug of wanted) {
    if (!known.includes(slug)) throw new Error(`Unknown step "${slug}". Known: ${known.join(', ')}`);
  }
  for (const slug of ORDER.filter((s) => wanted.includes(s))) {
    console.log(`== ${slug}`);
    await require(`./${slug}.js`).run();
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { main };
