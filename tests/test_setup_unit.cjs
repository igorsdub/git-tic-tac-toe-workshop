const test = require('node:test');
const assert = require('node:assert/strict');
const { setupView } = require('../docs/setup.js');
const catalog = require('../docs/workshops.json');

test('setupView picks archived, codespaces or pending', () => {
  assert.equal(setupView({ status: 'archived', setupTrack: 'codespaces' }), 'archived');
  assert.equal(setupView({ status: 'active', setupTrack: 'codespaces' }), 'codespaces');
  assert.equal(setupView({ status: 'active' }), 'pending');
  assert.equal(setupView({ status: 'active', setupTrack: 'local' }), 'pending');
});

test('every active catalog workshop has a setup track; the archived one shows the finished view', () => {
  const views = Object.fromEntries(catalog.workshops.map((workshop) => [workshop.id, setupView(workshop)]));
  assert.deepEqual(views, {
    '2026-10-01-scda': 'archived',
    '2026-11-06-sokedai': 'codespaces',
    '2026-11-10-riken': 'codespaces',
  });
});
