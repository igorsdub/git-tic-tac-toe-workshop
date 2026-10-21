# Workshop Rehearsal Guide

> **Current status (2026-10-20):** The uppercase-board starter and branch-aware Game Wall are published. All six records currently in the Game Wall lack numbered match branches and show migration errors until re-registered. The complete two-account rehearsal remains incomplete; see the [original rehearsal evidence](docs/rehearsal-evidence-2026-10-20.md) and [compact-board addendum](docs/rehearsal-evidence-compact-board-2026-10-20.md) before treating this checklist as passed.

## Rehearse the participant path

- [ ] For each participant account, create a public repository from the [starter template](https://github.com/igorsdub/git-tic-tac-toe-template) using **Use this template → Create a new repository**.
- [ ] Open each new repository in that participant's own Codespace. Open Copilot Chat, type exactly **“What does this repository do?”** in the box that says “Describe what to build”, and press Enter. Readiness passes when the answer mentions tic-tac-toe and `BOARD.txt`. No board edit is required.
- [ ] Retain every prepared public repository and Codespace. Verify that the pair can choose one repository, invite the partner, and open it in two separate Codespaces.
- [ ] Separately verify that Copilot agent editing is available for the rematch. Codespaces and Copilot access are separate.
- [ ] In both Codespaces, verify the entire manual turn through VS Code Source Control: pull, edit the board, inspect the diff, stage, commit, push, and pull the partner’s move.
- [ ] Create a rematch branch and repeat with one learner-selected move edited by Copilot. Verify that the learner can inspect the diff and complete stage, commit, pull, and push.
- [ ] Verify participants can continue manually if Copilot is unavailable. The scheduled transition to the rematch happens on time even if the first game is unfinished; leave that game on its branch.

Official product guidance: [create a Codespace from a template](https://docs.github.com/en/codespaces/developing-in-a-codespace/creating-a-codespace-from-a-template), [VS Code Source Control](https://code.visualstudio.com/docs/sourcecontrol/overview), and [Copilot chat in an IDE](https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/chat-with-copilot/chat-in-ide).

## Verify dependencies before promising the full flow

The learner template's default branch contains initialized uppercase `BOARD.txt` and documents numbered branches from clean `main`. Verify the live starter before each workshop, including a fresh pair repository created from the template.

The published registration form, registry, and dashboard use repository-plus-branch identities, exact uppercase `BOARD.txt` retrieval, outcome groups, and history replay. Existing branchless records show migration errors; verify a newly registered match branch before promising the live match display.

Before using the dashboard demo, verify the deployed site against a public match branch and its committed history. The Pages deployment for `ec91e03` succeeded; however, the current six registry records are branchless and cannot be replayed there. Until a valid match is re-registered and checked, use that repository’s GitHub commit history for the instructor demonstration. The dashboard demonstration remains instructor-led; participants do not do a replay exercise.

## Room and facilitation readiness

- [ ] Check venue Wi-Fi and projector, then open the workshop pages in a browser.
- [ ] Prepare two facilitator accounts and a clean public test repository.
- [ ] Send setup instructions. The [bilingual instructor-preparation survey draft](SURVEY.md) covers everyday tools, file-versioning habits, collaboration, AI coding-assistant use, and an optional open-ended question; it has no tutorial-completion or setup-readiness questions. Its Google Form is unpublished and not accepting responses; distribute it only after publication and approval.
- [ ] Brief helpers on the 120-minute schedule, the protected 25-minute Copilot rematch, and the recovery steps below.
- [ ] Keep the [facilitator guide](FACILITATOR_GUIDE.md), [learner guide](LEARNER_GUIDE.md), and [pre-session checklist](PRE_SESSION_CHECK.md) available.

Do not mark this rehearsal complete based on account settings or local tests. The current evidence and unresolved access requirements are in [the rehearsal record](docs/rehearsal-evidence-2026-10-20.md).

## Support and recovery

For an inaccessible or invalid match, pause both players, preserve the repository and branches, and have a facilitator inspect the state with them. Do not discard changes or reset history as a first response.

For a push rejection, pull through Source Control and inspect the incoming changes before pushing. For a naturally occurring conflict, partners and a facilitator should compare the intended board edits, resolve them in VS Code’s merge editor, inspect the final diff, and complete the Source Control merge. No conflict exercise is part of rehearsal.
