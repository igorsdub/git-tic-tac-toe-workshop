'use strict';
const { loadManifest } = require('./lib');

const ORDER = ['create-repo', 'open-codespace', 'look-around', 'delete-codespace'];

function knownSlugs() {
  const manifest = loadManifest();
  return [
    ...manifest.steps.map((step) => step.slug),
    ...(manifest.storyboards || []).map((storyboard) => storyboard.slug),
  ];
}

async function main(argv) {
  const known = knownSlugs();
  const wanted = argv.length ? argv : ORDER;
  for (const slug of wanted) {
    if (!known.includes(slug)) throw new Error(`Unknown step "${slug}". Known: ${known.join(', ')}`);
  }
  const queue = argv.length
    ? [...ORDER.filter((slug) => wanted.includes(slug)), ...wanted.filter((slug) => !ORDER.includes(slug))]
    : ORDER;
  for (const slug of queue) {
    console.log(`== ${slug}`);
    await require(`./${slug}.js`).run();
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { main };
