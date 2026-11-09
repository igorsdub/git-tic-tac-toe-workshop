const test = require('node:test');
const assert = require('node:assert/strict');
const { STAGES, render } = require('../docs/stage-strip.js');

test('stages are ordered setup, slot 1, slot 2, wall with labels and hrefs', () => {
  assert.deepEqual(STAGES.map((s) => s.id), ['setup', 'play-1', 'play-2', 'wall']);
  assert.deepEqual(STAGES.map((s) => s.name), ['Setup', 'Slot 1', 'Slot 2', 'Game Wall']);
  assert.deepEqual(STAGES.map((s) => s.href), ['setup.html', 'guide.html', 'play-2.html', 'wall.html']);
  assert.equal(typeof render, 'function');
});
