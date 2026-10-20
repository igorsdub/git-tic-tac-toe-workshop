# Workshop Rehearsal Guide

> The agenda and workflow are agreed. This checklist separates what can be rehearsed now from the starter and dashboard changes that remain dependencies.

## Rehearse the participant path

- [ ] Open the existing [starter template](https://github.com/igorsdub/git-tic-tac-toe-template) directly in a Codespace using **Use this template → Open in a codespace**. The advance participant rehearsal uses this template directly; do not make a personal template copy or pair repository.
- [ ] In the VS Code web editor, ask Copilot Chat **“What does this repository do?”** and confirm a response. Separately verify that Copilot agent editing is available for the rematch. Codespaces and Copilot access are separate.
- [ ] Leave the editor and delete the rehearsal Codespace from the GitHub Codespaces dashboard. Do not commit or push.
- [ ] During a facilitator-only test, create one public pair repository from the starter, add a second account as collaborator, and open that same repository in two Codespaces.
- [ ] In both Codespaces, verify the entire manual turn through VS Code Source Control: pull, edit the board, inspect the diff, stage, commit, push, and pull the partner’s move.
- [ ] Create a rematch branch and repeat with one learner-selected move edited by Copilot. Verify that the learner can inspect the diff and complete stage, commit, pull, and push.
- [ ] Verify participants can continue manually if Copilot is unavailable. The scheduled transition to the rematch happens on time even if the first game is unfinished; leave that game on its branch.

Official product guidance: [create a Codespace from a template](https://docs.github.com/en/codespaces/developing-in-a-codespace/creating-a-codespace-from-a-template), [VS Code Source Control](https://code.visualstudio.com/docs/sourcecontrol/overview), and [Copilot chat in an IDE](https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/chat-with-copilot/chat-in-ide).

## Verify dependencies before promising the full flow

The live starter template’s `main` branch currently contains lowercase `board.txt` with only a raw 3×3 grid. The agreed match workflow uses uppercase `BOARD.txt` with initialized game state. A separate template update is required before participants can follow that board format as written. Verify the live template contents after that work is completed.

The current registration form has repository and player fields but no branch field. The registry deduplicates by repository, and the dashboard fetches the root lowercase `board.txt` from `main` or `master`. It cannot display multiple match branches or replay their committed states. Do not register each match as though branch-aware display is supported. The planned outcome grouping and history time machine require separate dashboard and registration work.

Before using the planned dashboard demo, confirm that the separate implementation supports the intended public repositories, outcomes, and commit history. If it is not ready, use a public repository’s GitHub commit history for the instructor demonstration and describe dashboard support as pending. The dashboard demonstration remains instructor-led; participants do not do a replay exercise.

## Room and facilitation readiness

- [ ] Check venue Wi-Fi and projector, then open the workshop pages in a browser.
- [ ] Prepare two facilitator accounts and a clean public test repository.
- [ ] Send setup instructions and the short [bilingual instructor-preparation survey](SURVEY.md). It covers everyday tools, file-versioning habits, collaboration, AI coding-assistant use, and an optional open-ended question; it has no tutorial-completion or setup-readiness questions.
- [ ] Brief helpers on the 120-minute schedule, the protected 25-minute Copilot rematch, and the recovery steps below.
- [ ] Keep the [facilitator guide](FACILITATOR_GUIDE.md), [learner guide](LEARNER_GUIDE.md), and [pre-session checklist](PRE_SESSION_CHECK.md) available.

## Support and recovery

For an inaccessible or invalid match, pause both players, preserve the repository and branches, and have a facilitator inspect the state with them. Do not discard changes or reset history as a first response.

For a push rejection, pull through Source Control and inspect the incoming changes before pushing. For a naturally occurring conflict, partners and a facilitator should compare the intended board edits, resolve them in VS Code’s merge editor, inspect the final diff, and complete the Source Control merge. Do not create a deliberate conflict for practice.
