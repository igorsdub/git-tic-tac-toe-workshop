# Git Tic-Tac-Toe Workshop Design Handoff

**Date:** 2026-10-20
**Status:** Current design for discussion and transfer. Runtime implementation is pending and is not authorized by this document.
**Scope:** Standalone, two-hour workshop. This is separate from the GECS Project Gutenberg course.

For the earlier source research and its citations, see the [GECS browser-agent workshop research report](https://github.com/igorsdub/gecs/blob/codex/browser-agent-workshop-research/research/browser-agent-workshop.md). That report is exploratory background. Its snack dashboard, one shared physical Codespace, and optional Live Share recommendations are superseded here; the source findings remain historical research, not a specification for the tic-tac-toe exercise.

## Workshop shape

The workshop serves a broad audience with mixed coding experience and no coding prerequisites. GitHub Codespaces is the primary environment; using each participant's own laptop environment is optional. Each participant works in their own environment. Each pair shares one GitHub repository. Do not use Live Share.

The activity moves from manual Git play to a timed agent-assisted rematch:

1. Start `match-01` from `main`, register it, then play manually in the shared pair repository.
2. Pairs that finish early may play an optional extra manual match before the timed transition. Use the next numbered match branch from `main` and register it.
3. At the announced transition, start the agent-assisted rematch on the next numbered branch from `main` and register it. If the optional match was skipped, this is `match-02`; otherwise it is the next number.
4. Keep completed match branches for review. Do not merge them back into `main`.

No minute-by-minute schedule is agreed here. Final timing, setup/preflight, and recovery time remain to be designed.

## Repository, board, and registration model

`main` is the clean starting point. It contains an uppercase, case-sensitive `BOARD.txt` with the initial board and no moves. The file is initialized board content, not a zero-byte file. The extension is `.txt`, not `.md`. Match branches are named `match-01`, `match-02`, and so on, and each starts from `main`.

Register each match in its own issue with the pair repository, branch, and both players. Identify a match by `(repository, branch)` so multiple matches in one pair repository remain distinct. The game wall reads `BOARD.txt` from the registered branch and retains completed matches in its display. Recommended safeguard: show a clear error if the requested branch cannot be read instead of silently falling back to `main` or another branch.

A registration issue identifies a match. Any instructional or progress issue is a separate design question. Do not assume the match registration issue is also the lesson workflow.

## Agent use and active participation

For the initial agent-assisted moves, participants choose a legal move and tell the agent what to change. Later, they may optionally ask the agent to choose an individual move. This optional mode is limited to an individual move; the workshop does not ask participants to build a game from scratch or create a continuously playing unattended bot.

Before publishing an agent-assisted change, participants inspect the diff, check that the move is legal, and review the Git state. Both participants must actively edit and complete Git steps themselves: commit, push, pull the partner's change, and check the resulting board and history. The exercise should give each person a turn as the active editor and make the navigator's review work explicit.

## Tentative conflict-practice activity

A separate conflict-practice branch between manual play and the agent-assisted rematch is under consideration. A proposed direction is a deterministic setup that produces conflict markers, lets participants understand the intended result, and then uses agent assistance. Whether to include the activity and its exact setup and resolution steps remain open. The current facilitator guide says not to stage synthetic errors; reconcile that guidance only if this activity is approved.

## Current repository behavior and implementation gap

The existing repository and guides describe the current implementation. This design handoff records future requirements; none of the following changes is implemented by this document.

- The learner template and [`template-spec/board.txt`](template-spec/board.txt) use lowercase `board.txt`, not the proposed `BOARD.txt`.
- [`.github/ISSUE_TEMPLATE/register-game.yml`](.github/ISSUE_TEMPLATE/register-game.yml) collects a repository URL, player handles, and workshop name. It has no match-branch field.
- [`scripts/sync_board_registry.py`](scripts/sync_board_registry.py) builds [`docs/board.json`](docs/board.json) and deduplicates registrations by repository owner and name. It does not key registrations by branch.
- [`scripts/game_wall_parser.py`](scripts/game_wall_parser.py) parses existing registration issues. [`docs/app.js`](docs/app.js) fetches root `board.txt` from `main`, then `master`; it does not read a registered match branch or the proposed uppercase file.
- [`LEARNER_GUIDE.md`](LEARNER_GUIDE.md) and [`FACILITATOR_GUIDE.md`](FACILITATOR_GUIDE.md) describe the existing lowercase board and generic rematch behavior. These remain descriptions of current materials, not instructions for the future match model.

A later, separately authorized implementation plan should cover the template and guides, registration form, issue parser and registry, wall branch fetching and display, and rehearsal. It should define how a new match branch from `main` receives the initial no-moves board. No code, forms, scripts, or runtime behavior are changed as part of this design handoff.

## Open design decisions

- Exact two-hour agenda, transition time, participant instructions, setup/preflight, and recovery buffer.
- Board validation rules and facilitator recovery for an invalid or inaccessible registered branch.
- Whether conflict practice is included and its exact deterministic sequence.
- How instructional steps and automated checks are delivered, separately from match registration.
- How to support the optional agent-chosen individual move while retaining participant review and active Git practice.
