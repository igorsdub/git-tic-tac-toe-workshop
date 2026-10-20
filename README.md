# Git Tic-Tac-Toe Workshop

This two-hour workshop teaches collaborative Git through a paired tic-tac-toe game. Learners make and review commits together, then repeat the board-edit workflow with Copilot making the edit they previously made by hand.

## Workshop documents

- [Current design handoff](WORKSHOP_DESIGN_HANDOFF.md)
- [Learner guide](LEARNER_GUIDE.md) and [web guide](docs/guide.html)
- [Facilitator guide](FACILITATOR_GUIDE.md)
- [Pre-session setup and rehearsal](PRE_SESSION_CHECK.md) and [web setup guide](docs/setup.html)
- [Facilitator rehearsal guide](REHEARSAL_GUIDE.md)
- [Advance survey draft](SURVEY.md)
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

## Delivery dependencies

These documents describe the approved workflow; the related runtime features are still pending. The live external starter repository's `main` branch currently contains lowercase `board.txt` with only a raw 3×3 grid. The designed match workflow expects uppercase `BOARD.txt` with the initialized no-moves state. The template needs a separate update before learners can follow the board instructions as written.

The existing registration form records a repository and both players, but has no branch field. The registration pipeline deduplicates by repository, and the current [Game Wall](docs/index.html) reads root `board.txt` from `main` or `master`. It cannot display separately registered match branches or replay their histories. Branch-aware registration and the dashboard/history redesign are separately scoped. Until those updates are delivered, facilitators must not tell pairs that match branches will appear as separate dashboard entries. The planned final-segment dashboard demonstration depends on that separate work.
