const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'board-grammar');

function loadBoardGrammar() {
  const source = fs.readFileSync(require.resolve('../docs/app.js'), 'utf8');
  const module = { exports: {} };
  const document = {
    readyState: 'loading',
    getElementById: () => null,
    addEventListener: () => {},
  };
  vm.runInNewContext(source, { window: { MatchData: {} }, document, console, module });
  return module.exports;
}

const grammar = loadBoardGrammar();

test('docs/app.js exports the board grammar for Node', () => {
  assert.equal(typeof grammar.evaluateBoardContent, 'function', 'evaluateBoardContent export missing');
  assert.equal(typeof grammar.renderBoardRows, 'function', 'renderBoardRows export missing');
});

const fixtureFiles = fs.existsSync(FIXTURE_DIR)
  ? fs.readdirSync(FIXTURE_DIR).filter((name) => name.endsWith('.json')).sort()
  : [];

test('board-grammar fixtures exist', () => {
  assert.ok(fixtureFiles.length > 0, `no fixtures found in ${FIXTURE_DIR}`);
});

for (const file of fixtureFiles) {
  test(`board-grammar fixture ${file}`, () => {
    const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, file), 'utf8'));
    const { content, expected } = fixture;
    const result = grammar.evaluateBoardContent(content);

    assert.equal(result.isValid, expected.valid, `${file}: validity; errors=${JSON.stringify(result.errors)}`);
    assert.equal(result.state, expected.state, `${file}: state`);

    if (expected.reason === null) {
      assert.equal(result.errors.length, 0, `${file}: expected no errors; got ${JSON.stringify(result.errors)}`);
    } else {
      assert.ok(
        result.errors.some((error) => error.includes(expected.reason)),
        `${file}: no error contains ${JSON.stringify(expected.reason)}; errors=${JSON.stringify(result.errors)}`
      );
    }

    const placeholderHandles = ['X', 'O']
      .filter((player) => result.warnings.some((w) => w.startsWith(`Missing or placeholder 'Player ${player}:' header`)))
      .sort();
    assert.deepEqual(placeholderHandles, [...expected.placeholderHandles].sort(), `${file}: placeholder handles`);

    if (expected.grid) {
      assert.deepEqual(JSON.parse(JSON.stringify(result.grid)), expected.grid, `${file}: grid`);
    }
  });
}

test('board rows wrap each row of grid cells in a role="row" element', () => {
  const { renderBoardRows } = grammar;
  const html = renderBoardRows([['X', ' ', 'O'], [' ', 'X', ' '], [' ', ' ', 'O']], [[0, 0]]);

  assert.equal((html.match(/role="row"/g) || []).length, 3);
  assert.equal((html.match(/role="gridcell"/g) || []).length, 9);
  const rows = html.split('<div class="board-row" role="row">').slice(1);
  assert.equal(rows.length, 3);
  for (const row of rows) assert.equal((row.match(/role="gridcell"/g) || []).length, 3);
  assert.match(rows[0], /cell-x cell-winning" role="gridcell" aria-label="Row 1, column 1: X"/);
  assert.match(renderBoardRows(null, null), /aria-label="Row 3, column 3: empty"/);
});
