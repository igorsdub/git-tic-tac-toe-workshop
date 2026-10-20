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

## Working 120-minute agenda

| Minutes | Activity |
|---|---|
| 0–10 | Arrival and setup troubleshooting |
| 10–25 | Git/GitHub mental model and facilitator demonstration |
| 25–40 | Form pairs, create one shared repository, and open each learner's Codespace |
| 40–70 | Manual match |
| 70–80 | Copilot demonstration |
| 80–105 | Agent-assisted rematch |
| 105–120 | Instructor dashboard/history demonstration, research applications, and wrap-up |

At minute 80, every pair starts a fresh agent-assisted rematch, even if the manual match is unfinished. Keep the unfinished match on its branch. A pair that finishes early may play one optional additional manual match before the scheduled transition.

## Environment and Git workflow

Each learner uses their own Codespace in the browser-based VS Code editor. Each pair works in one shared public GitHub repository. Learners use VS Code's Source Control view to review diffs, stage, commit, pull, and push; the terminal is not the teaching path.

The manual match teaches the whole workflow. In the rematch, learners choose a legal move and ask Copilot to edit the board; they inspect the diff, confirm the move is legal, and personally stage, commit, pull, and push. No deliberate merge-conflict exercise is included. The facilitator provides recovery help if a conflict occurs naturally.

Before the workshop, each learner rehearses in a temporary Codespace opened directly from the existing starter template. They ask Copilot Chat, “What does this repository do?”, confirm its response, leave the editor, and delete the Codespace. They do not publish, commit, or push during this rehearsal. Codespaces access and Copilot access are separate, so the facilitator should verify Copilot access and Agent mode independently. See the [setup guide](PRE_SESSION_CHECK.md).

## Delivery status

The starter contract, branch-aware registration, and Game Wall are implemented in this local feature branch. They have not been pushed or deployed. The live starter's `main` still has lowercase `board.txt` and no uppercase `BOARD.txt`; the published issue template and Game Wall likewise do not include this branch's registration and display changes. Check the [delivery status](docs/delivery-status-2026-10-20.md) before using the participant flow or promising a live dashboard. Until publication and a real facilitator rehearsal, the instructor should use GitHub commit history as the dashboard fallback.
