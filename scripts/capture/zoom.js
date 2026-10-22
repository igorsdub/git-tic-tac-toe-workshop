'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Timing (seconds). One zoom per click = EASE in (finishing at the click), HOLD
// after the click, then EASE out to the centred 1x view. Zoom and pan both
// follow smoothstep, 3x^2-2x^3. Zooms never overlap or glide into each other.
const ZOOM = 2;
const EASE = 1.2; // zoom-in and zoom-out duration
const HOLD = 3.0; // time held at full zoom after the click
const PRE = 2; // lead-in kept before the first click
const MIN_HOLD = 1.0; // shortest hold when the next click comes soon

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
  // Schedule one zoom per click: [easeInStart, holdEnd]. Zooms never overlap:
  // a close next click shortens the hold (min MIN_HOLD); if that still does not
  // fit, ease-out and the next ease-in run back to back.
  const k = ZOOM - 1;
  const sched = [];
  let a = T[0] - EASE;
  for (let i = 0; i < T.length; i++) {
    const f = a + EASE; // ease-in finished
    let hold = HOLD;
    if (i + 1 < T.length) hold = Math.min(HOLD, Math.max(MIN_HOLD, T[i + 1] - EASE - f - EASE));
    sched.push([a, f + hold]);
    if (i + 1 < T.length) a = Math.max(T[i + 1] - EASE, f + hold + EASE);
  }
  const terms = sched.map(([ai, he]) => `(${ss(ai, EASE)}-${ss(he, EASE)})`);
  const z = `(1+${k}*(${terms.join('+')}))`;
  // Crop centre eases from the frame centre to each click and back, in step
  // with that click's zoom.
  const centre = (axis, mid) => {
    let e = String(mid);
    sched.forEach(([ai, he], i) => {
      e += `+(${clicks[i][axis] - mid})*(${ss(ai, EASE)}-${ss(he, EASE)})`;
    });
    return e;
  };
  const cx = centre('x', width / 2);
  const cy = centre('y', height / 2);
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
