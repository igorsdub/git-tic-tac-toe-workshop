# 3. Pure grid board format without in-file metadata or turn instructions

## Context
Originally, `board.md` included top-level title headings, `Player X / O:` metadata headers, a `State:` line (e.g. `State: Waiting for O`), and inline move instructions. Learners frequently encountered friction updating the `State:` line on every turn, causing syntax errors, merge conflict overhead, and confusion between gameplay moves and status reporting. Furthermore, the Game Wall and validator already compute turn parity, active player turn, and win conditions directly from the grid marks.

## Decision
We simplify `board.md` to a pure 5-line raw text grid:
- Instructions live exclusively in the repository `README.md`.
- Player identities are sourced from registration issues (ADR 0001).
- Game state is evaluated dynamically from the grid.
- A `State:` line is completely optional: existing boards with `State:` remain backward-compatible, but new template boards omit it entirely.

## Consequences
- Learners only interact with the grid itself (changing one `[ ]` to `[X]` or `[O]` per turn).
- Merge conflicts are minimized because learners only edit grid rows.
- Starter template files are minimal and self-explanatory.
- The validator and Game Wall support pure raw boards without markdown fences or headers.
