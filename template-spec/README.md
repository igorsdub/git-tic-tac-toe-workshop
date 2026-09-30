# Learner Template Specification

This folder documents the design, file structure, and canonical board format of the official learner template repository for the Git Tic-Tac-Toe Workshop:

**Template Repository**: [https://github.com/igorsdub/tic-tac-toe-template](https://github.com/igorsdub/tic-tac-toe-template)

---

## Purpose & Role in the Workshop

In the paired activity, learners collaborate on a single repository to play tic-tac-toe by committing and pushing moves. To ensure an instant, friction-free start:

1. **Player X** creates a new repository using the GitHub **"Use this template"** feature from `igorsdub/tic-tac-toe-template`.
2. **Player X** invites **Player O** as a repository collaborator via **Settings > Collaborators**.
3. Both learners clone the repository locally.
4. Learners begin their turn cycle (optionally recording their GitHub usernames in `board.md`; player handles are sourced directly from the GitHub issue registration form by the Game Wall).

Using a template repository ensures that learners do not need to construct markdown boards or repository settings from scratch, avoiding syntax inconsistencies and enabling automated validation by the workshop Game Wall.

---

## Contents of the Template Repository

The starter template repository consists of two files:

| File | Purpose |
|---|---|
| [`board.md`](https://github.com/igorsdub/tic-tac-toe-template/blob/main/board.md) | The single source of truth for the game. Contains optional player metadata headers, game state line, a 3x3 monospace grid (`[ ] \| [ ] \| [ ]`), and concise turn cycle instructions. |
| [`README.md`](https://github.com/igorsdub/tic-tac-toe-template/blob/main/README.md) | Learner-facing onboarding guide explaining template creation, collaborator invitation, the 5-step turn workflow, push rejection recovery, and the branch rematch extension. |

---

## Board Specification & Validation

- **[Canonical Board Specification](board.md)**: Detailed specification of file format requirements, optional player header syntax (decoupled from the Game Wall registration), status line transitions, grid layout, move parity rules, and sample states.
- **[Validation Script](../scripts/validate_board.py)**: Python utility to parse board files, extract player handles, verify layout, and evaluate the game state.
- **[Sample Board Test Suite](../tests/test_validate_board.py)**: Test cases validating new games, active moves, wins, draws, and edge cases.
