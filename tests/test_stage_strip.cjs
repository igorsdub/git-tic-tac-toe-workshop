const test = require('node:test');
const assert = require('node:assert/strict');
const { STAGES, render } = require('../docs/stage-strip.js');

test('stages are ordered setup, Git Collaboration, Agentic Coding, wall with labels and hrefs', () => {
  assert.deepEqual(STAGES.map((s) => s.id), ['setup', 'play-1', 'play-2', 'wall']);
  assert.deepEqual(STAGES.map((s) => s.name), ['Setup', 'Git Collaboration', 'Agentic Coding', 'Game Wall']);
  assert.deepEqual(STAGES.map((s) => s.href), ['setup.html', 'guide.html', 'play-2.html', 'wall.html']);
  assert.equal(typeof render, 'function');
});
