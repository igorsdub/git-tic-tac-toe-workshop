# Board-grammar fixtures

Each `*.json` file is one board case. `tests/test_board_grammar.cjs` runs it through the
browser evaluator (`evaluateBoardContent` in `docs/app.js`) and `tests/test_validate_board.py`
runs it through `scripts/validate_board.py`. Both must agree with `expected`.

```json
{
  "description": "X completes the top row (compact layout)",
  "content": "X X X\nO O .\n. . .\n",
  "expected": {
    "valid": true,
    "state": "X won",
    "reason": null,
    "placeholderHandles": ["O", "X"],
    "grid": [["X", "X", "X"], ["O", "O", " "], [" ", " ", " "]]
  }
}
```

- `description`: one line saying what the case covers.
- `content`: the full `BOARD.txt` text.
- `expected.valid`: whether the board passes validation.
- `expected.state`: canonical state (`Ready for X`, `Waiting for O`, `Waiting for X`, `X won`,
  `O won`, `Draw`, `Invalid board`).
- `expected.reason`: `null` for valid boards (the error list must be empty). Otherwise a
  substring that must appear in at least one error message from both validators.
- `expected.placeholderHandles`: sorted list of players (`"O"`, `"X"`) whose `Player X:` /
  `Player O:` header is missing or a placeholder, checked against the `Missing or placeholder
  'Player X:' header` warnings. Required on every fixture.
- `expected.grid` (optional): 3x3 list with `" "` for empty cells. Only valid boards carry a
  grid; both tests fail if a fixture with `"valid": false` has a `grid` key.
