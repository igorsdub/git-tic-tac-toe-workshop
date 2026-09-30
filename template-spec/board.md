# Canonical Board Format Specification

This document defines the official file format and parsing rules for `board.md` used across the Git Tic-Tac-Toe Workshop. The board serves as the single source of truth for pair games played in the workshop and monitored on the public Game Wall.

---

## 1. Specification Overview

A valid `board.md` file consists of the following sections:
1. **Title Header**: Top-level heading `# Git Tic-Tac-Toe` (or `# Tic-Tac-Toe`).
2. **Player Metadata (Optional)**: Optional declarations of Player X and Player O GitHub usernames. (The Game Wall sources handles directly from the GitHub issue registration form.)
3. **Game State**: Current status indicator line (`State:` or `Status:`).
4. **Board Grid**: Fenced monospace block representing the 3x3 tic-tac-toe grid.
5. **Instructions**: Learner reference for the 5-step turn cycle.

---

## 2. Format Requirements

### 2.1 Player Metadata (Optional)
The file may optionally contain two lines identifying each player:
```markdown
Player X: @username_x
Player O: @username_o
```
- Must start with `Player X:` and `Player O:` if present (bold formatting `**Player X**:` is also accepted).
- Usernames may be prefixed with `@` or written as plain GitHub handles.
- Before players set their handles, placeholders such as `[GitHub Username]` or `[Player X Username]` are valid initial states.
- **Decoupled Registration**: Player handles in `board.md` are optional metadata. The Game Wall sources player handles directly from the GitHub issue registration form (`register-game.yml`). If player headers are omitted or remain as placeholders, the board remains valid and handles are populated from registration.

### 2.2 Status Line
The file must contain a `State:` (or `Status:`) line:
```markdown
State: <state_value>
```
Valid evaluated state values:
- `Ready for X`: Initial state before Move 1 (0 moves on board).
- `Waiting for O`: Player X has played; Player O's turn to move.
- `Waiting for X`: Player O has played; Player X's turn to move.
- `X won`: Player X has completed 3-in-a-row (horizontal, vertical, or diagonal).
- `O won`: Player O has completed 3-in-a-row (horizontal, vertical, or diagonal).
- `Draw`: All 9 squares are filled and neither player has 3-in-a-row.
- `Invalid board`: Malformed grid, illegal characters, or impossible game state.

### 2.3 Board Grid
The board must represent a 3x3 grid enclosed in a fenced code block (```` ```text ```` or ```` ``` ````):

```text
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```

Rules for grid rendering:
- Each row contains exactly 3 cells separated by pipe characters `|`.
- Horizontal divider rows (e.g. `-----+-----+-----` or `---+---+---`) separate rows 1-2 and 2-3.
- Cell contents:
  - Empty cell: `[ ]` (bracket with a space, length 3)
  - Player X mark: `[X]` (or `[x]`)
  - Player O mark: `[O]` (or `[o]`)
- Fixed width: Each cell occupies 3 characters (`[ ]`, `[X]`, `[O]`), ensuring that vertical dividers `|` stay aligned across terminal output, text editors, GitHub web view, and GitHub Desktop diffs.

---

## 3. Game State & Parity Rules

Let $N_X$ be the count of X marks and $N_O$ be the count of O marks on the board:

1. **Move Order**: Player X always moves first.
2. **Move Parity**: At any legal point in the game:
   - $N_X = N_O$ (even number of total moves, Player X's turn)
   - $N_X = N_O + 1$ (odd number of total moves, Player O's turn)
   - Any state where $N_O > N_X$ or $N_X > N_O + 1$ is an **Invalid board**.
3. **Single Winner Rule**: Both players cannot simultaneously have a winning line. If both have 3-in-a-row, it is an **Invalid board**.
4. **Terminal Move Parity**:
   - If Player X wins, the winning move was made by X, so $N_X = N_O + 1$. If $N_X = N_O$, it is an **Invalid board**.
   - If Player O wins, the winning move was made by O, so $N_X = N_O$. If $N_X \ne N_O$, it is an **Invalid board**.
5. **Draw Condition**: $N_X + N_O = 9$ with no winning lines ($N_X = 5$, $N_O = 4$).

---

## 4. Sample Board States

*(Note: In all samples below, the `Player X:` and `Player O:` headers are optional metadata. Boards omitting them or using placeholder values validate identically, and player handles are sourced directly from the registration issue).*

### 4.1 Sample: New Game (`Ready for X`)
```markdown
# Git Tic-Tac-Toe

Player X: @alice
Player O: @bob

State: Ready for X

```text
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
```

### 4.2 Sample: In-Progress (`Waiting for O`)
Move 1: Player X marks center square (row 2, col 2). $N_X = 1, N_O = 0$.
```markdown
# Git Tic-Tac-Toe

Player X: @alice
Player O: @bob

State: Waiting for O

```text
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [X] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
```

### 4.3 Sample: In-Progress (`Waiting for X`)
Move 2: Player O marks top-left corner (row 1, col 1). $N_X = 1, N_O = 1$.
```markdown
# Git Tic-Tac-Toe

Player X: @alice
Player O: @bob

State: Waiting for X

```text
 [O] | [ ] | [ ]
-----+-----+-----
 [ ] | [X] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
```

### 4.4 Sample: X Win (`X won`)
Move 5: Player X completes diagonal (top-left to bottom-right). $N_X = 3, N_O = 2$.
```markdown
# Git Tic-Tac-Toe

Player X: @alice
Player O: @bob

State: X won

```text
 [X] | [O] | [ ]
-----+-----+-----
 [O] | [X] | [ ]
-----+-----+-----
 [ ] | [ ] | [X]
```
```

### 4.5 Sample: O Win (`O won`)
Move 6: Player O completes column 1. $N_X = 3, N_O = 3$.
```markdown
# Git Tic-Tac-Toe

Player X: @alice
Player O: @bob

State: O won

```text
 [O] | [X] | [X]
-----+-----+-----
 [O] | [X] | [ ]
-----+-----+-----
 [O] | [ ] | [ ]
```
```

### 4.6 Sample: Draw (`Draw`)
Move 9: All 9 cells filled, no winning line. $N_X = 5, N_O = 4$.
```markdown
# Git Tic-Tac-Toe

Player X: @alice
Player O: @bob

State: Draw

```text
 [X] | [O] | [X]
-----+-----+-----
 [X] | [O] | [O]
-----+-----+-----
 [O] | [X] | [X]
```
```

### 4.7 Malformed Board Examples

#### Example A: Impossible Move Count ($N_O > N_X$)
Player O has made 2 moves, but Player X has only made 1 move. State evaluates to `Invalid board`.
```markdown
# Git Tic-Tac-Toe

Player X: @alice
Player O: @bob

State: Waiting for X

```text
 [O] | [O] | [ ]
-----+-----+-----
 [ ] | [X] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
```

#### Example B: Double Winner (Both X and O have 3-in-a-row)
Row 1 has `[X] | [X] | [X]` and row 2 has `[O] | [O] | [O]`. Impossible in standard play. State evaluates to `Invalid board`.

#### Example C: Corrupted Grid Dimensions (4 columns or missing row)
A row containing `[X] | [O] | [ ] | [X]` or only 2 rows present. State evaluates to `Invalid board`.

#### Example D: Invalid Cell Marks
A cell containing unexpected characters such as `[?]`, `[#]`, or arbitrary text. State evaluates to `Invalid board`.
