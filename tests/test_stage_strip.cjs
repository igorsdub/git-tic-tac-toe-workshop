const test = require('node:test');
const assert = require('node:assert/strict');
const { STAGES, render } = require('../docs/stage-strip.js');

test('stages are ordered setup, guide, wall with labels and hrefs', () => {
  assert.deepEqual(STAGES.map((s) => s.id), ['setup', 'guide', 'wall']);
  assert.deepEqual(STAGES.map((s) => s.name), ['Setup', 'How to play', 'Game Wall']);
  assert.deepEqual(STAGES.map((s) => s.href), ['setup.html', 'guide.html', 'index.html']);
  assert.deepEqual(STAGES.map((s) => s.when), ['before the session', 'in the session', 'watch the matches']);
  assert.equal(typeof render, 'function');
});
