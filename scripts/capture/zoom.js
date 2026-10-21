'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ZOOM = 2;
const LEAD = 0.3;
const HOLD = 1.5;
const EASE = 0.4;

// Smooth 1 -> ZOOM -> 1 envelope for one click, as an ffmpeg expression in t.
function envelope(c) {
  const t0 = c.t / 1000 - LEAD;
  const t1 = t0 + EASE;
  const t2 = c.t / 1000 + HOLD;
  const t3 = t2 + EASE;
  const k = ZOOM - 1;
  return `if(between(t,${t0},${t1}),${k}*(t-${t0})/${EASE},` +
    `if(between(t,${t1},${t2}),${k},` +
    `if(between(t,${t2},${t3}),${k}*(${t3}-t)/${EASE},0)))`;
}

// Returns an ffmpeg -vf filter string that zooms 2x centred on each click.
function buildZoomFilter(clicks, { width = 1440, height = 900, fps = 30 } = {}) {
  const tail = `fps=${fps},scale=${width}:${height},format=yuv420p`;
  if (!clicks || clicks.length === 0) return tail;
  // z(t) = 1 + sum of envelopes; centre follows the click nearest in time.
  const z = `(1+${clicks.map(envelope).join('+')})`;
  let cx = String(clicks[clicks.length - 1].x);
  let cy = String(clicks[clicks.length - 1].y);
  for (let i = clicks.length - 2; i >= 0; i--) {
    const mid = (clicks[i].t + clicks[i + 1].t) / 2000;
    cx = `if(lt(t,${mid}),${clicks[i].x},${cx})`;
    cy = `if(lt(t,${mid}),${clicks[i].y},${cy})`;
  }
  const w = `${width}/(${z})`;
  const h = `${height}/(${z})`;
  const x = `clip((${cx})-(${w})/2,0,${width}-(${w}))`;
  const y = `clip((${cy})-(${h})/2,0,${height}-(${h}))`;
  const crop = `crop=w='${w}':h='${h}':x='${x}':y='${y}':exact=1`;
  return `${fps ? `fps=${fps},` : ''}${crop},scale=${width}:${height},format=yuv420p`;
}

function main(argv) {
  const { OUT_DIR, REPO_ROOT, VIEWPORT, loadManifest } = require('./lib');
  if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) {
    console.error('ffmpeg not found on PATH. Install it (e.g. `brew install ffmpeg`) and retry.');
    process.exit(1);
  }
  const slugs = argv.length ? argv : loadManifest().steps.map((s) => s.slug);
  for (const slug of slugs) {
    const dir = path.join(OUT_DIR, slug);
    const raw = path.join(dir, 'raw.webm');
    const clicksFile = path.join(dir, 'clicks.json');
    if (!fs.existsSync(raw) || !fs.existsSync(clicksFile)) {
      console.error(`Missing ${raw} or clicks.json; run \`npm run capture -- ${slug}\` first.`);
      process.exit(1);
    }
    const clicks = JSON.parse(fs.readFileSync(clicksFile, 'utf8'));
    const out = path.join(REPO_ROOT, 'docs', 'images', 'setup', slug, `${slug}.mp4`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const vf = buildZoomFilter(clicks, { width: VIEWPORT.width, height: VIEWPORT.height, fps: 30 });
    const r = spawnSync('ffmpeg', ['-y', '-i', raw, '-vf', vf, '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', '-an', out], { stdio: 'inherit' });
    if (r.status !== 0) { console.error(`ffmpeg failed for ${slug}`); process.exit(1); }
    console.log(`wrote ${out}`);
  }
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { buildZoomFilter };
