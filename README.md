# Git Tic-Tac-Toe Workshop

This two-hour workshop teaches collaborative Git through a paired tic-tac-toe game. Learners make and review commits together, then repeat the board-edit workflow with Copilot making the edit they previously made by hand.

## Workshop documents

- [Current design handoff](WORKSHOP_DESIGN_HANDOFF.md)
- [Local delivery status and blockers](docs/delivery-status-2026-10-20.md)
- [Learner guide](LEARNER_GUIDE.md) and [web guide](docs/guide.html)
- [Facilitator guide](FACILITATOR_GUIDE.md)
- [Pre-session setup and rehearsal](PRE_SESSION_CHECK.md) and [web setup guide](docs/setup.html)
- [Facilitator rehearsal guide](REHEARSAL_GUIDE.md)
- [Advance survey draft](SURVEY.md)
- [Unpublished instructor survey preview](https://docs.google.com/forms/d/1N2-9HYEtIvWLp11hEa2d9NeS1vXBWiUy7xRycXJNW6c/preview) (not accepting responses; not distributed)
- [Game Wall](docs/index.html) and [setup page](docs/setup.html)
- [Glossary](CONTEXT.md)

## Repository map

- [`template/`](template/README.md) is the local reference for the learner starter repository: its current `BOARD.txt`, editing conventions, and canonical empty-board example. Publish changes to the separate template repository explicitly.
- [`scripts/`](scripts/) contains board validation, registration parsing, and registry synchronization.
- [`tests/`](tests/) covers the workshop guides, parser, dashboard, and slides. `tests/fixtures/legacy-board/` preserves older board formats as compatibility fixtures.
- [`docs/`](docs/) contains the Pages site and instructor Game Wall. The separate [`docs/slides/`](docs/slides/) directory contains the workshop presentation.

## Working 120-minute agenda

| Minutes | Activity |
|---|---|
| 0–10 | Arrival and setup troubleshooting |
| 10–25 | Git/GitHub mental model and facilitator demonstration |
| 25–40 | Form pairs, choose one prepared public repository, invite the partner, and open separate Codespaces |
| 40–70 | Manual match |
| 70–80 | Copilot demonstration |
| 80–105 | Agent-assisted rematch |
| 105–120 | Instructor dashboard/history demonstration, research applications, and wrap-up |

At minute 80, every pair starts a fresh agent-assisted rematch, even if the manual match is unfinished. Keep the unfinished match on its branch. A pair that finishes early may play one optional additional manual match before the scheduled transition.

## Environment and Git workflow

Each learner uses their own Codespace in the browser-based VS Code editor. Each pair works in one shared public GitHub repository. Learners use VS Code's Source Control view to review diffs, stage, commit, pull, and push; the terminal is not the teaching path.

The canonical board is three rows of three cells, such as `. . .`; a move replaces one `.` with `X` or `O`. The manual match teaches the whole workflow. In the rematch demonstration, learners ask Copilot “Place X in the center of the board” for X's first move, inspect the diff, then stage, commit, and sync the change themselves. O players and later turns name their chosen square.

Before the workshop, each learner creates a public repository from the starter template, opens it in their own Codespace, selects Ask, and asks exactly “What does this repository do?” The facilitator checks that the response correctly describes the game and how `BOARD.txt` records moves. Learners retain their repositories and Codespaces; at the session each pair chooses one prepared repository and opens it in separate Codespaces. See the [setup guide](PRE_SESSION_CHECK.md).

## Delivery status

The starter contract, branch-aware registration, and Game Wall are implemented in this local feature branch. They have not been pushed or deployed. The live starter's `main` still has lowercase `board.txt` and no uppercase `BOARD.txt`; the published issue template and Game Wall likewise do not include this branch's registration and display changes. Check the [delivery status](docs/delivery-status-2026-10-20.md) before using the participant flow or promising a live dashboard. Until publication and a real facilitator rehearsal, the instructor should use GitHub commit history as the dashboard fallback.
