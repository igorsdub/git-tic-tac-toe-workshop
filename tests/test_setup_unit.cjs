const test = require('node:test');
const assert = require('node:assert/strict');
const { setupView } = require('../docs/setup.js');

test('setupView picks archived, codespaces or pending', () => {
  assert.equal(setupView({ status: 'archived', setupTrack: 'codespaces' }), 'archived');
  assert.equal(setupView({ status: 'active', setupTrack: 'codespaces' }), 'codespaces');
  assert.equal(setupView({ status: 'active' }), 'pending');
  assert.equal(setupView({ status: 'active', setupTrack: 'local' }), 'pending');
});
