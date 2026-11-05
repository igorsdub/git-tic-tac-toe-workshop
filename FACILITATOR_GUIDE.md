# Facilitator Guide: Git Tic-Tac-Toe Workshop

The two-account rehearsal remains incomplete; see the [historical delivery record](planning/delivery-status-2026-10-20.md) and [rehearsal evidence](planning/rehearsal-evidence-2026-10-20.md).

## Purpose and outcomes

Learners practise collaborative Git through a pair game. The core outcome is completing the manual workflow: inspect a shared repository, edit a board, review a diff, stage and commit, pull a partner's commit, and sync their own. The agent-assisted rematch builds on that experience: the learner chooses the move, asks Copilot to edit the board, reviews the edit, and completes the same Git workflow.

Use Codespaces with the VS Code web interface throughout. Teach the Source Control view for branches, changes, staging, commits, Pull, and Sync Changes. Do not make terminal Git the primary path. See the [VS Code Source Control overview](https://code.visualstudio.com/docs/sourcecontrol/overview), [staging and commits](https://code.visualstudio.com/docs/sourcecontrol/staging-commits), and [remote operations](https://code.visualstudio.com/docs/sourcecontrol/repos-remotes).

## Agenda (120 minutes)

| Minutes | Length | Activity |
|---|---|---|
| 0–10 | 10 | Arrival and small setup/troubleshooting buffer |
| 10–25 | 15 | Git/GitHub mental model and instructor demonstration |
| 25–40 | 15 | Form pairs, choose prepared public repositories, invite partners, open separate Codespaces |
| 40–70 | 30 | Manual match: make numbered moves using VS Code Source Control |
| 70–80 | 10 | Copilot demonstration: delegate one board edit and inspect the diff |
| 80–105 | 25 | Agent-assisted rematch: learner chooses move; Copilot edits; learner reviews and completes the Git workflow |
| 105–120 | 15 | Instructor demonstrates public match outcomes and history on the Game Wall; connect to research and wrap up |

Pair play is 55 minutes: the 30-minute manual match plus the 25-minute rematch. At minute 80, transition the room together even if a manual match is unfinished. Preserve its branch and begin a fresh rematch branch so every learner gets the Copilot practice slot. Early finishers may play one optional extra manual match before minute 80. The alternative-history branch exercise is a post-workshop take-home only (see [Time machine](TIME_MACHINE.md)); it is not used in the session.

This is the only place the agenda is written down. Other documents link here.

## Before learners arrive

Use the [Rehearsal guide](REHEARSAL_GUIDE.md) to verify the live starter, Codespaces, Copilot access, pair collaboration, Source Control Pull and Sync Changes, and the deployed Game Wall. Send the [Pre-session checklist](PRE_SESSION_CHECK.md) and the [Setup page](docs/setup.html). The SOKENDAI survey is live; its link comes from `docs/workshops.json` and appears on the Setup page. It is for instructor preparation; do not add identity, tutorial-completion, or setup-readiness questions. See [SURVEY.md](SURVEY.md).

Before the session, each learner:

1. Creates a public repository from the template under their own account, fills in **Description**, and ticks **Include all branches** to get `match-01`.
2. Opens it in a Codespace.
3. Runs the readiness check: open Copilot Chat, type exactly "What does this repository do?", and press Enter. It passes when the answer mentions tic-tac-toe and `BOARD.txt`.
4. Deletes the Codespace at [github.com/codespaces](https://github.com/codespaces) and keeps the repository. A running Codespace uses the limited free monthly allowance; a deleted one costs nothing.

No board edit is required during preparation. During pair setup, each pair chooses one prepared repository; its owner invites the partner, plays X and moves first, and both open fresh separate Codespaces.

Each pair registers its shared repository once for the workshop, with both player GitHub handles, using **Register repository** in the header stage strip. Use the strip to navigate Setup, How to play and the Game Wall. `docs/workshops.json` lists each workshop's form. SCDA Training Week is archived and no longer accepts new repositories.

## Facilitation

### Git and GitHub mental model (10–25)

Use the shared-board analogy: each learner's Codespace is their own working copy; the pair's GitHub repository is the shared copy. A commit records a change in history; Sync Changes publishes it; Pull brings a partner's published change into the learner's Codespace. Show the Source Control view and point out the changed file and diff before staging. Explain that the review-and-commit workflow applies whether a human or Copilot made the edit.

### Pair setup and manual match (25–70)

The invitation happens inside the 25–40 pair-setup slot; the agenda timing is unchanged. Walk the room asking "Has O accepted?" Learners follow Step 1 on the How to play page. Register on the Game Wall only after the partner has accepted, with both handles. The partner's check is that the invitation banner is gone; the real proof is the first Sync Changes succeeding. Repositories owned by an organisation need organisation permission and are out of scope: use public repositories on personal accounts only.

Each pair chooses one prepared public repository and the owner invites the partner as a collaborator. The partner accepts, and each learner opens that repository in their own Codespace. The owner plays X and moves first; the partner plays O. Both switch to the existing `match-01` in Source Control and pull, then play numbered moves in order. `BOARD.txt` has three rows of three single-space-separated cells (`.`, `X`, or `O`); a move replaces one `.`.

Every turn has five steps, named after the Source Control buttons:

1. **Pull** the latest partner change.
2. Edit one cell and save.
3. Check the diff, then stage `BOARD.txt` with **+**.
4. **Commit** with a clear message.
5. **Sync Changes**.

The next player pulls before editing. Keep the first full manual workflow as the shared foundation for Copilot practice. The template supplies `match-01`; the rematch branch `match-02` starts from clean `main`. Any branch whose name begins with literal lowercase `match` qualifies. Match branches are never merged back.

### Copilot demonstration and rematch (70–105)

For the Copilot demonstration, show the accepted first-move example with the exact learner request: "Place X in the center of the board." Select agent mode in Copilot Chat. For an O move or a later turn, learners name the square they chose. They inspect the diff, then stage, commit, and sync the change through Source Control. Copilot choosing a legal move is an optional later extension, not the core activity.

Create and publish `match-02` from clean `main`; the partner switches to it. Repeat the same Source Control workflow; only the board edit is delegated. If a learner cannot use Copilot, they can complete the rematch manually and follow the instructor's Copilot demonstration. Keep the protected rematch time by moving everyone together at the scheduled transition.

### History demonstration and wrap-up (105–120)

The Game Wall shows one card for each discovered `match…` branch and reads `BOARD.txt` from that exact branch. This is an instructor demonstration, not a learner exercise. If replay cannot load, use the GitHub commit history for that match branch to inspect earlier boards.

Registration facts to have ready:

- A successful registration comment confirms the repository/workshop link. The card appears only after a successful refresh finds a matching branch.
- A repository belongs to one workshop, so use a fresh template copy for another workshop.
- If handles need correction, submit registration again for the same repository and workshop.
- Archived workshops remain available and receive updates to existing repositories, including handles, but reject new repository registrations.
- Verify registration acceptance, and that at least one branch has appeared, before the session.
- Existing registrations map to `2026-10-01-scda`; the preserved `Default Event` record remains unclassified and excluded pending review.

At wrap-up, mention the take-home [Time machine](TIME_MACHINE.md) page ([web version](docs/time-machine.html)), which is not used in the session.

Connect the workflow to research files, analysis code, and shared manuscripts. Ask what becomes easier when changes have clear authorship, messages, and reviewable history.

## Optional facilitator appendix: recovery

Keep this reference for support when a learner asks for help. First inspect the exact changed files and commits with the learner, and preserve changes belonging to other people.

An unwanted local change that has not been shared can be undone after confirming which edit belongs to the learner. A synced change is part of shared history; correct it with a new commit that restores the intended board state. Preserve other learners' changes in either case. If Sync Changes is rejected or a conflict appears naturally, point learners to the conflict box in the [Learner guide](LEARNER_GUIDE.md#taking-turns-and-fixing-a-conflict) and inspect incoming work with the pair, resolve the board together, review the diff, and complete the offered Source Control action. The [merge-conflict guide for VS Code](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts) explains the editor controls.

Copilot quotas: free plans have a limited monthly allowance of AI credits (no fixed published request count), and the docs list agents as limited on Free, so some learners may lack Agent or Plan mode. Ask learners not to chat at length beforehand. Verified teachers get free Copilot Pro through GitHub Education; verified students get the free Copilot Student plan. Progression in the rematch: Ask (explain, learner does Git), Agent (one cell; learner reviews the diff, then asks it to commit and push), Plan (short goal: pull, plan, place; learner approves the plan, reviews the diff, then sends a separate commit-and-push request). The agent commits or pushes only on explicit request and never merges, force-pushes or switches branches unasked. Spot-check diffs and commits. Fallback: play manually and watch the instructor demonstration.

If Copilot is unavailable, continue with the manual rematch and let the learner observe the instructor's Copilot demonstration. Codespaces access does not itself guarantee Copilot access; check both during rehearsal and help learners with account or organization settings without delaying the pair's Git work.
