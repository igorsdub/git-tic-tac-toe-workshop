# Learner Template Specification

This folder documents the design, file structure, and canonical board format of the official learner template repository for the Git Tic-Tac-Toe Workshop:

**Template Repository**: [https://github.com/igorsdub/git-tic-tac-toe-template](https://github.com/igorsdub/git-tic-tac-toe-template)

---

## Purpose & Role in the Workshop

In the paired activity, learners collaborate on one public pair repository and use VS Code Source Control to share tic-tac-toe moves. To start each match from the same initialized board:

1. **Player X** creates a new repository using the GitHub **"Use this template"** feature from `igorsdub/git-tic-tac-toe-template`.
2. **Player X** invites **Player O** as a repository collaborator via **Settings > Collaborators**.
3. Both learners open that same repository in their own Codespace.
4. Each match uses a fresh numbered branch (`match-01`, `match-02`, …) created from the clean `main` branch. Each branch therefore begins with the initialized no-moves board.

Using a template repository ensures that learners do not need to construct markdown boards or repository settings from scratch, avoiding syntax inconsistencies and enabling automated validation by the workshop Game Wall.

---

## Contents of the Template Repository

The starter template repository consists of two files:

| File | Purpose |
|---|---|
| [`BOARD.txt`](https://github.com/igorsdub/git-tic-tac-toe-template/blob/main/BOARD.txt) | The initialized, no-moves 3×3 grid. It is the board content committed at the root of `main` and inherited by every fresh match branch. |
| [`README.md`](https://github.com/igorsdub/git-tic-tac-toe-template/blob/main/README.md) | Learner-facing onboarding for individual Codespaces, numbered branches from `main`, Source Control, and the direct-template rehearsal. |

---

## Board Specification & Validation

- **[Canonical Board Specification](BOARD.txt)**: Detailed specification of file format requirements, optional player header syntax (decoupled from the Game Wall registration), status line transitions, grid layout, move parity rules, and sample states.
- **[Validation Script](../scripts/validate_board.py)**: Python utility to parse board files, extract player handles, verify layout, and evaluate the game state.
- **[Sample Board Test Suite](../tests/test_validate_board.py)**: Test cases validating new games, active moves, wins, draws, and edge cases.
