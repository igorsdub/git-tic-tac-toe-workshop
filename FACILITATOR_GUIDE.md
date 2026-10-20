# Facilitator Guide: Git Tic-Tac-Toe Workshop

> **Delivery status (2026-10-20):** The starter and branch-aware Game Wall are published. Five legacy SCDA repositories map to workshop `2026-10-01-scda`; the `Default Event` record remains preserved and excluded from workshop dashboards pending review. The two-account rehearsal remains incomplete; see [the delivery record](docs/delivery-status-2026-10-20.md) and [rehearsal evidence](docs/rehearsal-evidence-2026-10-20.md).

## Purpose and outcomes

Participants learn collaborative Git through a pair game. The core outcome is completing the manual workflow: inspect a shared repository, edit a board, review a diff, stage and commit, pull a partner’s commit, and push. The Copilot-assisted rematch builds on that experience: the learner chooses the move, asks Copilot to edit the board, personally reviews the edit, and completes the same Git workflow.

Use Codespaces with the VS Code web interface throughout. Teach GitHub’s Source Control view for branches, changes, staging, commits, pull, and push. Do not make terminal Git the primary path. See the [VS Code Source Control overview](https://code.visualstudio.com/docs/sourcecontrol/overview), [staging and commits](https://code.visualstudio.com/docs/sourcecontrol/staging-commits), and [remote operations](https://code.visualstudio.com/docs/sourcecontrol/repos-remotes).

## Working agenda (120 minutes)

| Minutes | Activity |
|---|---|
| 0–10 | Arrival and small setup/troubleshooting buffer |
| 10–25 | Git/GitHub mental model and instructor demonstration |
| 25–40 | Form pairs, choose prepared public repositories, invite partners, open separate Codespaces |
| 40–70 | Manual match: make numbered moves using VS Code Source Control |
| 70–80 | Copilot demonstration: delegate one board edit and inspect the diff |
| 80–105 | Agent-assisted rematch: learner chooses move; Copilot edits; learner reviews and completes Git workflow |
| 105–120 | Instructor demonstrates public match outcomes/history as a “time machine”; connect to research and wrap up |

At minute 80, transition the room together even if a manual match is unfinished. Preserve its branch and begin a fresh rematch branch so every learner gets the Copilot practice slot. The alternative-history branch exercise is an optional instructor extension only if time allows; it is not required learner work.

## Before participants arrive

Use the [rehearsal guide](REHEARSAL_GUIDE.md) to verify the live starter, Codespaces, Copilot access, pair collaboration, Source Control pull/push, and deployed dashboard. Send the [pre-session checklist](PRE_SESSION_CHECK.md) with setup instructions. The survey form is currently an unpublished instructor draft and is not accepting responses; distribute it only after it is published and approved. It is for instructor preparation; do not add identity, tutorial-completion, or setup-readiness questions.

Before the session, each participant creates a public repository from the template, opens that repository in their own Codespace, selects Ask, and asks exactly “What does this repository do?” Readiness passes when the response correctly describes the shared tic-tac-toe purpose and how `BOARD.txt` records moves. Participants retain their repositories and Codespaces. During pair setup, each pair chooses one prepared repository, invites the partner, and opens that repository in separate Codespaces. Each pair registers its shared repository once for this workshop with both player GitHub handles using the [SCDA Training Week registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-10-01-scda). No board edit is required during preparation.

## Facilitation

### Git and GitHub mental model (10–25)

Use the shared-board analogy: each learner’s Codespace is their own working copy; the pair’s GitHub repository is the shared copy. A commit records a change in history; push publishes it; pull brings a partner’s published change into the learner’s Codespace. Show the Source Control view and point out the changed file and diff before staging. Explain that the review-and-commit workflow applies whether a human or Copilot made the edit.

### Pair setup and manual match (25–70)

Each pair chooses one prepared public repository and adds the partner as a collaborator. Each learner opens that same repository in their own Codespace. Assign X and O, then play numbered moves in order. The canonical `BOARD.txt` has three rows of three single-space-separated cells (`.`, `X`, or `O`); a move replaces one `.`. On every turn: pull the latest partner change in Source Control, edit one square, inspect the diff, stage the board, commit with a clear numbered message, and sync the change. The next player pulls before editing. Keep the first full manual workflow as the shared foundation for Copilot practice. Match branches start from `main`; any branch name beginning with literal lowercase `match` qualifies, with `match-01` a clear teaching example.

### Copilot demonstration and rematch (70–105)

Demonstrate the accepted first-move example with the exact learner request: “Place X in the center of the board.” For an O move or a later turn, learners name the square they chose. They inspect the diff, then stage, commit, and sync the change through Source Control. Copilot choosing a legal move is an optional later extension, not the core activity.

Create a fresh rematch branch from the agreed baseline. Repeat the same Source Control workflow; only the board edit is delegated. If a participant cannot use Copilot, they can complete the rematch manually and follow the instructor’s agent demonstration. Keep the protected Copilot practice time by moving everyone together at the scheduled transition.

### History demonstration and wrap-up (105–120)

The published Game Wall shows one card for each discovered `match…` branch and reads `BOARD.txt` from that exact branch. This is an instructor demonstration, not a participant exercise. A successful registration comment confirms the repository/workshop link; the card appears only after a successful refresh finds a matching branch. A repository belongs to one workshop, so use a fresh template copy for another workshop. If handles need correction, submit registration again for the same repository and workshop. Archived workshops remain available and receive updates to existing repositories, including handles, but reject new repository registrations. Verify registration acceptance and that at least one branch has appeared before the session. The five legacy SCDA repositories map to `2026-10-01-scda`; the preserved `Default Event` record remains unclassified and excluded pending review.

Connect the workflow to research files, analysis code, and shared manuscripts. Ask what becomes easier when changes have clear authorship, messages, and reviewable history.

## Optional facilitator appendix: recovery

Keep this reference for support when a participant asks for help. First inspect the exact changed files and commits with the participant, and preserve changes belonging to other people.

An unwanted local change that has not been shared can be undone after confirming which edit belongs to the participant. A pushed change is part of shared history; correct it with a new commit that restores the intended board state. Preserve other participants’ changes in either case. If a push is rejected or a conflict appears naturally, inspect incoming work with the pair, resolve the board together, review the diff, and complete the offered Source Control action. GitHub’s [merge-conflict guide for VS Code](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts) explains the editor controls.

If Copilot is unavailable, continue with the manual rematch and let the learner observe the instructor demonstration. Codespaces access does not itself guarantee Copilot access; check both during rehearsal and help learners with account or organization settings without delaying the pair’s Git work.
