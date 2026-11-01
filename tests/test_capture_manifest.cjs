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
