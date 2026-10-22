'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Timing (seconds). One zoom = EASE in (finishing at the click), HOLD after the
// click, then EASE out. Zoom level and pan both follow smoothstep, 3x^2-2x^3.
const ZOOM = 2;
const EASE = 1.2; // zoom-in and zoom-out duration
const HOLD = 3.0; // time held at full zoom after the click
const PRE = 2; // lead-in kept before the first click
// Clicks closer than this stay zoomed and the crop centre glides between them.
const MERGE_GAP = HOLD + 2 * EASE;

const ss = (a, d) => {
  const x = `clip((t-(${a}))/${Math.max(d, 0.001)},0,1)`;
  return `(${x}*${x}*(3-2*${x}))`;
};

// Seconds from the start of the output to the end of the last zoom-out.
// Videos are not cut here: the full recording after the last click is kept.
function zoomEnd(clicks) {
  return clicks.length ? clicks[clicks.length - 1].t / 1000 + HOLD + EASE : 0;
}

// Returns an ffmpeg -vf filter string that zooms 2x centred on each click.
// Click times (ms) are relative to the start of the trimmed output.
function buildZoomFilter(clicks, { width = 1440, height = 900, fps = 30 } = {}) {
  const tail = `fps=${fps},scale=${width}:${height},format=yuv420p`;
  if (!clicks || clicks.length === 0) return tail;
  const T = clicks.map((c) => c.t / 1000);
  // Group clicks into clusters that share one zoom-in/zoom-out.
  const clusters = [[0]];
  for (let i = 1; i < T.length; i++) {
    if (T[i] - T[i - 1] < MERGE_GAP) clusters[clusters.length - 1].push(i);
    else clusters.push([i]);
  }
  const k = ZOOM - 1;
  const terms = clusters.map((cl) => {
    const first = T[cl[0]];
    const last = T[cl[cl.length - 1]];
    return `(${ss(first - EASE, EASE)}-${ss(last + HOLD, EASE)})`;
  });
  const z = `(1+${k}*(${terms.join('+')}))`;
  // Centre glides between clicks: during the zoom for close clicks, and while
  // fully zoomed out between clusters.
  const glides = [];
  clusters.forEach((cl, ci) => {
    for (let j = 0; j + 1 < cl.length; j++) glides.push([cl[j], cl[j + 1], T[cl[j]], T[cl[j + 1]]]);
    if (ci + 1 < clusters.length) {
      const i = cl[cl.length - 1];
      const n = clusters[ci + 1][0];
      glides.push([i, n, T[i] + HOLD + EASE, T[n] - EASE]);
    }
  });
  const centre = (axis) => {
    let e = String(clicks[0][axis]);
    for (const [i, n, a, b] of glides) e += `+(${clicks[n][axis] - clicks[i][axis]})*${ss(a, b - a)}`;
    return e;
  };
  const cx = centre('x');
  const cy = centre('y');
  // crop() cannot vary its size per frame, so scale up per frame (eval=frame)
  // and crop a fixed window whose offset follows the centre, clamped to the frame.
  const sw = `${width}*(${z})`;
  const sh = `${height}*(${z})`;
  const x = `clip((${cx})*(${z})-${width}/2,0,${width}*((${z})-1))`;
  const y = `clip((${cy})*(${z})-${height}/2,0,${height}*((${z})-1))`;
  return `fps=${fps},scale=${width}:${height},` +
    `scale=w='${sw}':h='${sh}':eval=frame:flags=bilinear,` +
    `crop=w=${width}:h=${height}:x='${x}':y='${y}':exact=1,format=yuv420p`;
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
    const allClicks = JSON.parse(fs.readFileSync(clicksFile, 'utf8'));
    // Drop the setup before the first click: start PRE seconds ahead of it.
    const start = allClicks.length ? Math.max(0, allClicks[0].t / 1000 - PRE) : 0;
    const clicks = allClicks.map((c) => ({ ...c, t: c.t - start * 1000 }));
    const out = path.join(REPO_ROOT, 'docs', 'images', 'setup', slug, `${slug}.mp4`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const vf = buildZoomFilter(clicks, { width: VIEWPORT.width, height: VIEWPORT.height, fps: 30 });
    const r = spawnSync('ffmpeg', ['-y', '-ss', String(start), '-i', raw, '-vf', vf, '-c:v', 'libx264', '-crf', '28', '-preset', 'medium', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', '-an', out], { stdio: 'inherit' });
    if (r.status !== 0) { console.error(`ffmpeg failed for ${slug}`); process.exit(1); }
    console.log(`wrote ${out}`);
  }
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { buildZoomFilter, zoomEnd };
