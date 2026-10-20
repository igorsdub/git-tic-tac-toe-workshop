const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadBoardEvaluator() {
  const sourcePath = require.resolve('../docs/app.js');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const instrumented = source.replace(
    "  if (document.readyState === 'loading') {",
    '  window.__evaluateBoardContent = evaluateBoardContent;\n  if (document.readyState === \'loading\') {'
  );
  const window = { MatchData: {} };
  const document = {
    readyState: 'loading',
    getElementById: () => null,
    addEventListener: () => {},
  };
  vm.runInNewContext(instrumented, { window, document, console });
  return window.__evaluateBoardContent;
}

test('browser board evaluator accepts compact rows and returns the normalized grid', () => {
  const evaluate = loadBoardEvaluator();
  const result = evaluate('. . .\n. X .\n. . O\n');

  assert.equal(result.isValid, true);
  assert.equal(result.state, 'Waiting for X');
  assert.deepEqual(JSON.parse(JSON.stringify(result.grid)), [
    [' ', ' ', ' '],
    [' ', 'X', ' '],
    [' ', ' ', 'O'],
  ]);
});

test('browser board evaluator rejects malformed compact spacing and cell marks', () => {
  const evaluate = loadBoardEvaluator();
  for (const board of [
    '.  . .\n. . .\n. . .',
    '. .\n. . .\n. . .',
    '. . ?\n. . .\n. . .',
    '. . .\n. . .\n. . .\nX X',
    '. . .\n. . .\n. . .\nX X X X X',
    '. . .\n. . .\nXX',
    ' . . .\n. . .\n. . .',
    '. . . \n. . .\n. . .',
  ]) {
    const result = evaluate(board);
    assert.equal(result.isValid, false, board);
    assert.equal(result.state, 'Invalid board', board);
  }
});

test('browser board evaluator keeps historical pipe and bracket rows valid', () => {
  const evaluate = loadBoardEvaluator();
  const result = evaluate(' [ ] | [ ] | [ ]\n-----+-----+-----\n [ ] | [X] | [ ]\n-----+-----+-----\n [ ] | [ ] | [ ]');

  assert.equal(result.isValid, true);
  assert.equal(result.state, 'Waiting for O');
  assert.equal(JSON.parse(JSON.stringify(result.grid))[1][1], 'X');
});

test('browser board evaluator prioritizes legacy rows with unpadded separators', () => {
  const evaluate = loadBoardEvaluator();
  const result = evaluate('X | O|X\nO|X|O\nX|O |X');

  assert.equal(result.isValid, true);
  assert.equal(result.state, 'X won');
  assert.deepEqual(JSON.parse(JSON.stringify(result.grid))[0], ['X', 'O', 'X']);
});
