# Learner Template Specification

This folder documents the design, file structure, and canonical board format of the official learner template repository for the Git Tic-Tac-Toe Workshop:

**Template Repository**: [https://github.com/igorsdub/git-tic-tac-toe-template](https://github.com/igorsdub/git-tic-tac-toe-template)

---

## Purpose & Role in the Workshop

In the paired activity, learners collaborate on one public pair repository and use VS Code Source Control to share tic-tac-toe moves. To start each match from the same initialized board:

1. Before the workshop, each learner creates their own public repository using **Use this template** from `igorsdub/git-tic-tac-toe-template`, then opens that new repository in their own Codespace and completes the Copilot Ask readiness check.
2. At the workshop, the pair chooses one prepared public repository and its owner invites the partner as a collaborator via **Settings > Collaborators**.
3. Both learners open the chosen repository in separate Codespaces.
4. Each match uses a fresh numbered branch (`match-01`, `match-02`, …) created from the clean `main` branch. Each branch therefore begins with the initialized no-moves board.

Using a template repository ensures that learners do not need to construct board files or repository settings from scratch, avoiding syntax inconsistencies and enabling automated validation by the workshop Game Wall. Keep both prepared repositories and Codespaces; the pair uses only the chosen repository during play.

---

## Contents of the Template Repository

The starter template repository consists of two files:

| File | Purpose |
|---|---|
| [`BOARD.txt`](https://github.com/igorsdub/git-tic-tac-toe-template/blob/main/BOARD.txt) | The initialized, no-moves 3×3 grid. It is the board content committed at the root of `main` and inherited by every fresh match branch. |
| [`README.md`](https://github.com/igorsdub/git-tic-tac-toe-template/blob/main/README.md) | Learner-facing onboarding for creating prepared repositories, numbered branches from `main`, and Source Control. |

---

## Board Specification & Validation

- **[Canonical Board Specification](BOARD.txt)**: Compact three-line format, one-cell move rule, and backward compatibility for historical boards.
- **[Validation Script](../scripts/validate_board.py)**: Python utility to parse board files, extract player handles, verify layout, and evaluate the game state.
- **[Sample Board Test Suite](../tests/test_validate_board.py)**: Test cases validating new games, active moves, wins, draws, and edge cases.
