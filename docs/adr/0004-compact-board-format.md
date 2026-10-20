# 4. Use compact three-line rows for the canonical board

## Context

The previous template format used bracketed cells, pipe separators, and divider rows. Although readable, each move changed a visually wide line and required learners and coding agents to preserve punctuation that carries no game state. The board is the only file changed for a move, so a compact representation makes the one-cell change easy to spot in a diff.

## Decision

The canonical root `BOARD.txt` is exactly three rows of three cells, separated by single spaces. `.` means empty; uppercase `X` and `O` are marks. A move changes exactly one `.` to the current player's mark. The board file contains no dividers, brackets, fences, metadata, or instructions.

Validators accept this compact grammar and keep the normalized 3×3 grid interface. They also retain compatibility with historical pipe-separated and bracketed boards so existing public match history remains readable.

This decision supersedes the grid-layout portion of [ADR 0003](0003-pure-grid-board-format.md); its decisions about keeping identity, state, and instructions outside the board remain in effect.

## Consequences

- A legal move appears as one token replacement in the diff.
- The starter needs only three short lines to express an empty board.
- Historical board files remain readable without changing normalized consumers.
- New malformed compact rows are rejected for incorrect spacing, cell count, or symbols.
