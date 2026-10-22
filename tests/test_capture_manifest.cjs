'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = path.join(__dirname, '..', 'scripts', 'capture');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'captures.json'), 'utf8'));

test('manifest slugs are the four setup steps', () => {
  assert.deepStrictEqual(manifest.steps.map((s) => s.slug),
    ['create-repo', 'open-codespace', 'look-around', 'stop-codespace']);
});

test('screenshot names are numbered pngs', () => {
  for (const s of manifest.steps) {
    assert.ok(s.screenshots.length > 0);
    for (const n of s.screenshots) assert.match(n, /^\d{2}-[a-z0-9-]+\.png$/);
  }
});

test('each step script exists', () => {
  for (const s of manifest.steps) assert.ok(fs.existsSync(path.join(dir, `${s.slug}.js`)), s.slug);
});

test('buildZoomFilter handles clicks and none', () => {
  const { buildZoomFilter } = require(path.join(dir, 'zoom.js'));
  const opts = { width: 1440, height: 900, fps: 30 };
  const f = buildZoomFilter([{ t: 1000, x: 100, y: 200 }, { t: 4000, x: 900, y: 500 }], opts);
  assert.ok(typeof f === 'string' && f.length > 0);
  assert.ok(f.includes('crop='));
  const none = buildZoomFilter([], opts);
  assert.ok(typeof none === 'string' && none.length > 0);
});

test('Look around timing keeps the intro, action hold, zoom-out, and whole-screen gap', () => {
  const { buildZoomFilter } = require(path.join(dir, 'zoom.js'));
  const timing = { intro: 3, action: 0.5, hold: 2.5, gap: 1 };
  const f = buildZoomFilter([{ t: 5000, x: 100, y: 200 }, { t: 11400, x: 900, y: 500 }], {}, timing);
  assert.ok(f.includes('clip((t-(3.3))/1.2'), 'first zoom starts after a 3-second intro');
  assert.throws(() => buildZoomFilter([
    { t: 5000, x: 100, y: 200 }, { t: 11399, x: 900, y: 500 },
  ], {}, timing), /targets are too close/);
});

test('Look around wait segments are compressed to four times their recorded speed', () => {
  const { buildWaitCompressionFilter } = require(path.join(dir, 'zoom.js'));
  const filter = buildWaitCompressionFilter([{ start: 10000, end: 30000, speed: 4 }], 5);
  assert.ok(filter.includes('setpts='));
  assert.ok(filter.includes('15.000000'), 'a 20-second wait saves 15 seconds at 4x');
  assert.ok(filter.includes('0.750000'));
  assert.equal(buildWaitCompressionFilter([], 0), null);
});

test('4x wait retiming produces the expected rendered video duration', (t) => {
  const { buildWaitCompressionFilter } = require(path.join(dir, 'zoom.js'));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'look-around-retime-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const output = path.join(temp, 'retimed.mp4');
  const videoFilter = buildWaitCompressionFilter([{ start: 2000, end: 6000, speed: 4 }]);
  const rendered = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=64x64:r=10:d=8',
    '-vf', videoFilter, '-an', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', output,
  ], { encoding: 'utf8' });
  assert.equal(rendered.status, 0, rendered.stderr);
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', output,
  ], { encoding: 'utf8' });
  assert.equal(probe.status, 0, probe.stderr);
  assert.ok(Math.abs(Number(probe.stdout.trim()) - 5) < 0.3, '8 seconds with a 4-second wait at 4x should render as 5 seconds');
});

test('the Look around renderer rejects a failed or incomplete Ask capture', (t) => {
  const { isCaptureComplete } = require(path.join(dir, 'zoom.js'));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'look-around-completion-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  assert.equal(isCaptureComplete('look-around', temp), false);
  fs.writeFileSync(path.join(temp, 'capture-complete.json'), JSON.stringify({ status: 'complete', mode: 'Agent', answerVisible: true }));
  assert.equal(isCaptureComplete('look-around', temp), false);
  fs.writeFileSync(path.join(temp, 'capture-complete.json'), JSON.stringify({ status: 'complete', mode: 'Ask', answerVisible: true }));
  assert.equal(isCaptureComplete('look-around', temp), true);
  assert.equal(isCaptureComplete('open-codespace', temp), true);
});
