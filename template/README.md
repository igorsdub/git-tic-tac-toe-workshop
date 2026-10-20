# Learner template reference

This directory holds the board files and conventions used by the separate [learner template repository](https://github.com/igorsdub/git-tic-tac-toe-template). It is the workshop repository's local reference; changes here do not publish to that repository.

## Starter files

| File | Purpose |
|---|---|
| [`BOARD.txt`](BOARD.txt) | The initialized, no-moves board inherited by each numbered match branch. |
| [`AGENTS.md`](AGENTS.md) | Editing conventions for people and coding agents. |
| [`samples/empty.md`](samples/empty.md) | The canonical empty-board example. |

The canonical board has exactly three rows of three cells separated by one space. A dot (`.`) is empty; uppercase `X` and `O` are marks. A legal move replaces one `.` with the current player's mark. Keep instructions and metadata out of `BOARD.txt`.

Each match uses a fresh branch (`match-01`, `match-02`, …) created from the clean `main` branch so it starts with the initialized board. See the [starter repository README](https://github.com/igorsdub/git-tic-tac-toe-template/blob/main/README.md) for the learner workflow.

## Validation and compatibility fixtures

The [validator](../scripts/validate_board.py) and [Game Wall parser](../scripts/game_wall_parser.py) accept the compact format and continue to read historical pipe-separated and bracketed boards. Those older examples are stored under [`tests/fixtures/legacy-board/`](../tests/fixtures/legacy-board/) and are parser compatibility fixtures, not current learner examples. The [validator tests](../tests/test_validate_board.py) record their expected outcomes.
