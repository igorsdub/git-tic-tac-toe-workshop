# Facilitator Guide: Git Tic-Tac-Toe Workshop

> **Delivery status (2026-10-20):** The starter, registration pipeline, and Game Wall changes exist in local feature branches but are not published. The live starter still lacks uppercase `BOARD.txt`, and the published Game Wall has not deployed branch-aware display. The two-account rehearsal is blocked; see [the delivery record](docs/delivery-status-2026-10-20.md) and [rehearsal evidence](docs/rehearsal-evidence-2026-10-20.md).

## Purpose and outcomes

Participants learn collaborative Git through a pair game. The core outcome is completing the manual workflow: inspect a shared repository, edit a board, review a diff, stage and commit, pull a partner’s commit, and push. The Copilot-assisted rematch builds on that experience: the learner chooses the move, asks Copilot to edit the board, personally reviews the edit, and completes the same Git workflow.

Use Codespaces with the VS Code web interface throughout. Teach GitHub’s Source Control view for branches, changes, staging, commits, pull, and push. Do not make terminal Git the primary path. See the [VS Code Source Control overview](https://code.visualstudio.com/docs/sourcecontrol/overview), [staging and commits](https://code.visualstudio.com/docs/sourcecontrol/staging-commits), and [remote operations](https://code.visualstudio.com/docs/sourcecontrol/repos-remotes).

## Working agenda (120 minutes)

| Minutes | Activity |
|---|---|
| 0–10 | Arrival and small setup/troubleshooting buffer |
| 10–25 | Git/GitHub mental model and instructor demonstration |
| 25–40 | Form pairs, create shared public repositories, open individual Codespaces |
| 40–70 | Manual match: make numbered moves using VS Code Source Control |
| 70–80 | Copilot demonstration: delegate one board edit and inspect the diff |
| 80–105 | Agent-assisted rematch: learner chooses move; Copilot edits; learner reviews and completes Git workflow |
| 105–120 | Instructor demonstrates public match outcomes/history as a “time machine”; connect to research and wrap up |

At minute 80, transition the room together even if a manual match is unfinished. Preserve its branch and begin a fresh rematch branch so every learner gets the Copilot practice slot. The alternative-history branch exercise is an optional instructor extension only if time allows; it is not required learner work.

## Before participants arrive

Use the [rehearsal guide](REHEARSAL_GUIDE.md) to verify the live starter, Codespaces, Copilot access, pair collaboration, Source Control pull/push, and deployed dashboard. Send the [pre-session checklist](PRE_SESSION_CHECK.md) with setup instructions. The survey form is currently an unpublished instructor draft and is not accepting responses; distribute it only after it is published and approved. It is for instructor preparation; do not add identity, tutorial-completion, or setup-readiness questions.

Participants rehearse directly in a Codespace opened from the existing starter template. They ask Copilot Chat “What does this repository do?”, confirm a response, then delete the Codespace. They should not commit or push in advance. The pair repository is created together during the session.

## Facilitation

### Git and GitHub mental model (10–25)

Use the shared-board analogy: each learner’s Codespace is their own working copy; the pair’s GitHub repository is the shared copy. A commit records a change in history; push publishes it; pull brings a partner’s published change into the learner’s Codespace. Show the Source Control view and point out the changed file and diff before staging. Explain that the review-and-commit workflow applies whether a human or Copilot made the edit.

### Pair setup and manual match (25–70)

Each pair creates one public repository from the workshop starter and adds the partner as a collaborator. Each learner opens that same repository in their own Codespace. Assign X and O, then play numbered moves in order. On every turn: pull the latest partner change in Source Control, edit one square, inspect the diff, stage the board, commit with a clear numbered message, and push. The next player pulls before editing. Keep the first full manual workflow as the shared foundation for Copilot practice.

### Copilot demonstration and rematch (70–105)

Show a short edit: the learner decides a legal move and asks Copilot Chat to update only the board file. The learner inspects the diff, checks that the chosen move is the only intended change, then stages, commits, and pushes through Source Control. Copilot choosing a legal move is an optional later extension, not the core activity.

Create a fresh rematch branch from the agreed baseline. Repeat the same Source Control workflow; only the board edit is delegated. If a participant cannot use Copilot, they can complete the rematch manually and follow the instructor’s agent demonstration. Keep the protected Copilot practice time by moving everyone together at the scheduled transition.

### History demonstration and wrap-up (105–120)

The local Game Wall implementation groups public matches by outcome and replays committed board states as a time machine. This is an instructor demonstration, not a participant exercise. The currently published dashboard still reads root `board.txt` from `main`/`master`; the branch-aware registration and dashboard changes have not been deployed. Do not imply that each pair branch will appear separately on the live site. Until a live deployment and public match check are confirmed, use GitHub commit history to illustrate the idea.

Connect the workflow to research files, analysis code, and shared manuscripts. Ask what becomes easier when changes have clear authorship, messages, and reviewable history.

## Recovery and support

Pause an invalid, inaccessible, or unexpectedly changed match. Ask the pair to stop editing, read the Source Control state together, and call a facilitator. Preserve all branches and commits; do not use destructive resets or discard changes as a first response.

If a push is rejected, pull the partner’s published change in Source Control, inspect the result, then push again. If VS Code reports a merge conflict, keep the conflict state intact and work with the partner and facilitator: compare both intended edits, resolve the board together, inspect the resulting diff, and complete the merge action offered by Source Control. GitHub’s [merge-conflict guide for VS Code](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts) explains the editor controls. No conflict is deliberately created as a workshop exercise.

If Copilot is unavailable, continue with the manual rematch and let the learner observe the instructor demonstration. Codespaces access does not itself guarantee Copilot access; check both during rehearsal and help learners with account or organization settings without delaying the pair’s Git work.
