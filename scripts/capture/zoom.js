'use strict';
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
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
const LOOK_AROUND = { intro: 3, action: 0.5, hold: 2.5, gap: 1 };

// A storyboard is expressed in raw-recording time. Live segments preserve the
// source, while freeze segments hold one source frame as the camera moves.
// This lets the narrative clock move independently from the browser clock.
function validateStoryboard(storyboard) {
  if (!storyboard || storyboard.version !== 1 || !Array.isArray(storyboard.segments) || !storyboard.segments.length) {
    throw new Error('Storyboard must have version 1 and a non-empty segments array.');
  }
  for (const [index, segment] of storyboard.segments.entries()) {
    if (segment.kind === 'live') {
      if (!(Number.isFinite(segment.start) && Number.isFinite(segment.end) && segment.start >= 0 && segment.end > segment.start)) {
        throw new Error(`Storyboard live segment ${index} needs start >= 0 and end > start.`);
      }
      if (segment.speed !== undefined && ![1, 4].includes(segment.speed)) throw new Error(`Storyboard live segment ${index} speed must be 1 or 4.`);
      if (segment.camera && (!(Number.isFinite(segment.camera.scale) && segment.camera.scale >= 1) ||
        !segment.camera.focus || !Number.isFinite(segment.camera.focus.x) || !Number.isFinite(segment.camera.focus.y))) {
        throw new Error(`Storyboard live segment ${index} camera needs scale >= 1 and a focus point.`);
      }
    } else if (segment.kind === 'freeze') {
      if (!(Number.isFinite(segment.at) && segment.at >= 0 && Number.isFinite(segment.duration) && segment.duration > 0)) {
        throw new Error(`Storyboard freeze segment ${index} needs at >= 0 and duration > 0.`);
      }
      const { focus, zoom } = segment;
      if (!focus || !Number.isFinite(focus.x) || !Number.isFinite(focus.y) || !zoom ||
        !Number.isFinite(zoom.from) || !Number.isFinite(zoom.to) || !Number.isFinite(zoom.ease) || zoom.ease <= 0) {
        throw new Error(`Storyboard freeze segment ${index} needs focus and a valid zoom ramp.`);
      }
    } else {
      throw new Error(`Storyboard segment ${index} has unsupported kind: ${segment.kind}`);
    }
    if (segment.label !== undefined && (typeof segment.label !== 'string' || !segment.label.trim())) {
      throw new Error(`Storyboard segment ${index} label must be a non-empty string.`);
    }
  }
  return storyboard;
}

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function buildStoryboardGraph(storyboard, { width = 1440, height = 900, fps = 30 } = {}) {
  validateStoryboard(storyboard);
  const chains = [];
  const labels = [];
  let labelInput = storyboard.segments.length;
  storyboard.segments.forEach((segment, i) => {
    const input = `[${i}:v]`;
    const chain = [];
    if (segment.kind === 'live') {
      const speed = segment.speed || 1;
      const scale = segment.camera?.scale || 1;
      chain.push(`trim=start=${segment.start.toFixed(6)}:end=${segment.end.toFixed(6)}`);
      chain.push(`setpts=(PTS-STARTPTS)/${speed}`);
      chain.push(`fps=${fps}`);
      if (scale > 1) {
        const { focus } = segment.camera;
        chain.push(`scale=w='${width}*${scale}':h='${height}*${scale}':flags=lanczos`);
        chain.push(`crop=w=${width}:h=${height}:x='clip(${focus.x}*${scale}-${width}/2,0,iw-${width})':y='clip(${focus.y}*${scale}-${height}/2,0,ih-${height})'`);
      } else {
        chain.push(`scale=${width}:${height}:flags=lanczos`);
      }
    } else {
      const { focus, zoom } = segment;
      const z = `(${zoom.from}+(${zoom.to}-${zoom.from})*pow(clip(t/${zoom.ease},0,1),2)*(3-2*clip(t/${zoom.ease},0,1)))`;
      const x = `clip(${focus.x}*${z}-${width}/2,0,iw-${width})`;
      const y = `clip(${focus.y}*${z}-${height}/2,0,ih-${height})`;
      chain.push(`trim=start=${segment.at.toFixed(6)}:end=${(segment.at + 0.05).toFixed(6)}`);
      chain.push('setpts=PTS-STARTPTS');
      chain.push('loop=loop=-1:size=1:start=0');
      chain.push(`setpts=N/(${fps}*TB),trim=duration=${segment.duration.toFixed(6)}`);
      chain.push(`scale=w='${width}*${z}':h='${height}*${z}':eval=frame:flags=lanczos`);
      chain.push(`crop=w=${width}:h=${height}:x='${x}':y='${y}'`);
      chain.push(`fps=${fps}`);
    }
    if (segment.label) {
      const out = `v${i}label`;
      chains.push(`${input}${chain.join(',')}[v${i}]`);
      chains.push(`[v${i}][${labelInput++}:v]overlay=x=(W-w)/2:y=28:shortest=1[${out}]`);
      labels.push(`[${out}]`);
      return;
    }
    chain.push('format=yuv420p');
    const out = `v${i}`;
    chains.push(`${input}${chain.join(',')}[${out}]`);
    labels.push(`[${out}]`);
  });
  chains.push(`${labels.join('')}concat=n=${labels.length}:v=1:a=0[outv]`);
  return chains.join(';');
}

function renderStoryboard(raw, storyboardPath, outputPath, options = {}) {
  const storyboard = validateStoryboard(JSON.parse(fs.readFileSync(storyboardPath, 'utf8')));
  if (storyboard.rawSha256) {
    const actual = crypto.createHash('sha256').update(fs.readFileSync(raw)).digest('hex');
    if (actual !== storyboard.rawSha256) throw new Error(`Storyboard source mismatch for ${raw}; recapture or update the reviewed source timeline.`);
  }
  const { width = 1440, height = 900, fps = 30 } = options;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-storyboard-labels-'));
  const args = ['-y', '-hide_banner', '-loglevel', 'error'];
  for (let i = 0; i < storyboard.segments.length; i++) args.push('-i', raw);
  try {
    for (const [i, segment] of storyboard.segments.entries()) {
      if (!segment.label) continue;
      const svgPath = path.join(tempDir, `label-${i}.svg`);
      const pngPath = path.join(tempDir, `label-${i}.png`);
      const label = escapeXml(segment.label);
      fs.writeFileSync(svgPath, `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="64"><rect x="0" y="0" width="800" height="64" rx="10" fill="#111" fill-opacity=".82"/><text x="400" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="white">${label}</text></svg>`);
      const converted = spawnSync('rsvg-convert', ['-o', pngPath, svgPath], { encoding: 'utf8' });
      if (converted.status !== 0) throw new Error(`Storyboard labels require rsvg-convert: ${converted.stderr || converted.error}`);
      args.push('-loop', '1', '-i', pngPath);
    }
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
  const graph = buildStoryboardGraph(storyboard, { width, height, fps });
  const tempOutput = `${outputPath}.tmp.mp4`;
  args.push('-filter_complex', graph, '-map', '[outv]', '-an', '-c:v', 'libx264', '-crf', '24', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', tempOutput);
  const rendered = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (rendered.status !== 0) {
    fs.rmSync(tempOutput, { force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw new Error(`ffmpeg storyboard render failed: ${rendered.stderr || rendered.error}`);
  }
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-show_entries', 'format=duration', '-of', 'json', tempOutput], { encoding: 'utf8' });
  if (probe.status !== 0) {
    fs.rmSync(tempOutput, { force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw new Error(`ffprobe rejected rendered storyboard: ${probe.stderr}`);
  }
  const details = JSON.parse(probe.stdout);
  if (Number(details.streams?.[0]?.width) !== width || Number(details.streams?.[0]?.height) !== height || !(Number(details.format?.duration) > 0)) {
    fs.rmSync(tempOutput, { force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw new Error('Rendered storyboard failed output verification.');
  }
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.renameSync(tempOutput, outputPath);
  return Number(details.format.duration);
}

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
function buildZoomFilter(clicks, { width = 1440, height = 900, fps = 30 } = {}, timing = null) {
  const tail = `fps=${fps},scale=${width}:${height},format=yuv420p`;
  if (!clicks || clicks.length === 0) return tail;
  const T = clicks.map((c) => c.t / 1000);
  // Schedule one zoom per click: [easeInStart, holdEnd]. Zooms never overlap:
  // a close next click shortens the hold (min MIN_HOLD); if that still does not
  // fit, ease-out and the next ease-in run back to back.
  const k = ZOOM - 1;
  const sched = [];
  let a = T[0] - EASE - (timing?.action || 0);
  for (let i = 0; i < T.length; i++) {
    const f = a + EASE; // ease-in finished
    let hold = timing?.hold ?? HOLD;
    if (!timing && i + 1 < T.length) hold = Math.min(HOLD, Math.max(MIN_HOLD, T[i + 1] - EASE - f - EASE));
    const zoomOutStart = timing ? T[i] + hold : f + hold;
    sched.push([a, zoomOutStart]);
    if (i + 1 < T.length) {
      const nextStart = T[i + 1] - EASE - (timing?.action || 0);
      const requiredStart = zoomOutStart + EASE + (timing?.gap || 0);
      if (timing && nextStart < requiredStart) {
        throw new Error(`Look around targets are too close: need ${(requiredStart - nextStart).toFixed(2)}s more between actions`);
      }
      a = timing ? nextStart : Math.max(T[i + 1] - EASE, zoomOutStart + EASE);
    }
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

function buildWaitCompressionFilter(waits, trimStartSeconds = 0) {
  const segments = (waits || []).map((w) => ({
    start: Math.max(0, w.start / 1000 - trimStartSeconds),
    end: w.end / 1000 - trimStartSeconds,
    speed: w.speed || 4,
  })).filter((w) => w.end > w.start && w.speed > 1);
  if (!segments.length) return null;
  const saved = segments.map(({ start, end, speed }) => {
    const amount = 1 - 1 / speed;
    return `if(gte(T,${end.toFixed(6)}),${((end - start) * amount).toFixed(6)},if(gte(T,${start.toFixed(6)}),(T-${start.toFixed(6)})*${amount.toFixed(6)},0))`;
  }).join('+');
  return `setpts='PTS-(${saved})/TB'`;
}

function isCaptureComplete(slug, dir) {
  if (slug !== 'look-around') return true;
  try {
    const status = JSON.parse(fs.readFileSync(path.join(dir, 'capture-complete.json'), 'utf8'));
    return status.status === 'complete' && status.mode === 'Ask' && status.answerVisible === true;
  } catch {
    return false;
  }
}

function isCreateCaptureComplete(dir) {
  try {
    const status = JSON.parse(fs.readFileSync(path.join(dir, 'capture-complete.json'), 'utf8'));
    return status.status === 'complete' && status.repositoryVisible === true;
  } catch {
    return false;
  }
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
    const storyboardFile = path.join(__dirname, 'storyboards', `${slug}.json`);
    if (fs.existsSync(storyboardFile)) {
      if (slug === 'look-around' && !isCaptureComplete(slug, dir)) {
        console.error('Look around capture is incomplete; refusing to render it as a finished video.');
        process.exit(1);
      }
      if (slug === 'create-repo' && !isCreateCaptureComplete(dir)) {
        console.error('Create repository capture is incomplete; refusing to render it as a finished video.');
        process.exit(1);
      }
      if (!fs.existsSync(raw)) {
        console.error(`Missing ${raw}; run \`npm run capture -- ${slug}\` first.`);
        process.exit(1);
      }
      const out = path.join(REPO_ROOT, 'docs', 'images', 'setup', slug, `${slug}.mp4`);
      try {
        const duration = renderStoryboard(raw, storyboardFile, out, { width: VIEWPORT.width, height: VIEWPORT.height, fps: 30 });
        console.log(`wrote ${out} (${duration.toFixed(2)}s)`);
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
      continue;
    }
    const clicksFile = path.join(dir, 'clicks.json');
    if (!isCaptureComplete(slug, dir)) {
      console.error('Look around capture is incomplete; refusing to render it as a finished video.');
      process.exit(1);
    }
    if (!fs.existsSync(raw) || !fs.existsSync(clicksFile)) {
      console.error(`Missing ${raw} or clicks.json; run \`npm run capture -- ${slug}\` first.`);
      process.exit(1);
    }
    const allClicks = JSON.parse(fs.readFileSync(clicksFile, 'utf8'));
    const waitsFile = path.join(dir, 'waits.json');
    const waits = slug === 'look-around' && fs.existsSync(waitsFile)
      ? JSON.parse(fs.readFileSync(waitsFile, 'utf8')) : [];
    // Drop the setup before the first click: start PRE seconds ahead of it.
    const timing = slug === 'look-around' ? LOOK_AROUND : null;
    const leadIn = timing ? timing.intro + timing.action + EASE : PRE;
    const start = allClicks.length ? Math.max(0, allClicks[0].t / 1000 - leadIn) : 0;
    const clicks = allClicks.map((c) => ({ ...c, t: c.t - start * 1000 }));
    const out = path.join(REPO_ROOT, 'docs', 'images', 'setup', slug, `${slug}.mp4`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const filters = [buildZoomFilter(clicks, { width: VIEWPORT.width, height: VIEWPORT.height, fps: 30 }, timing)];
    const waitFilter = timing ? buildWaitCompressionFilter(waits, start) : null;
    if (waitFilter) filters.push(waitFilter);
    const vf = filters.join(',');
    const r = spawnSync('ffmpeg', ['-y', '-ss', String(start), '-i', raw, '-vf', vf, '-c:v', 'libx264', '-crf', '28', '-preset', 'medium', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', '-an', out], { stdio: 'inherit' });
    if (r.status !== 0) { console.error(`ffmpeg failed for ${slug}`); process.exit(1); }
    console.log(`wrote ${out}`);
  }
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { buildZoomFilter, buildStoryboardGraph, buildWaitCompressionFilter, isCaptureComplete, isCreateCaptureComplete, renderStoryboard, validateStoryboard, zoomEnd };
