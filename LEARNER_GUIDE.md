# Git Tic-Tac-Toe: Learner Guide

> **Workshop readiness:** This guide describes the approved match workflow. The uppercase `BOARD.txt` starter contract and branch-aware Game Wall are implemented in local feature branches, but have not been published. The live starter still uses lowercase `board.txt`, and the public Game Wall does not yet reflect the local changes. Your facilitator will confirm the live setup before play begins.

In this workshop, you and a partner collaborate in one shared public GitHub repository. You will play one match by hand, then use Copilot to make a board edit you already know how to make. You remain responsible for reviewing and publishing every change.

Each person works in their own GitHub Codespace, opened in the browser-based VS Code editor. You will use the VS Code **Source Control** view for Git. You do not need to use the terminal.

## Before play

Your facilitator will guide your pair through creating one shared repository from the starter template and inviting both partners. Each of you then opens that pair repository in your own Codespace. Match setup uses numbered branches from `main`: the first match is `match-01`. Keep match branches separate; do not merge them back into `main`.

The local registration and Game Wall code supports separate match branches. The public issue form and deployed Game Wall do not yet include those changes. Follow the facilitator's directions for registration and do not assume live matches will appear separately until publication is confirmed.

## Manual match: make and share a move

Both partners use the same match branch in their own Codespace. Take turns. Before editing, confirm the branch name in the VS Code status bar and use **Source Control → Pull** to get your partner's latest move.

1. Open `BOARD.txt` in the editor. Change one empty square to your mark, then save.
2. In **Source Control**, open the changed file and review the diff. Check that it contains only the legal move you intended.
3. Stage the board file with the **+** control.
4. Enter a clear commit message and select **Commit**.
5. Select **Push** in Source Control. Tell your partner the move is ready.
6. Your partner selects **Pull**, checks the board and commit, and takes the next turn.

Saving a file, staging it, committing it, and pushing it are separate actions. The facilitator will show where each action appears in Source Control before the match starts.

## Agent-assisted rematch

At the scheduled transition, every pair begins a fresh rematch, even if its manual match is unfinished. Leave the unfinished match on its branch. Start the next numbered match from `main` and use the same VS Code web workflow.

You choose a legal move and ask Copilot to make that board edit. For example: “Update `BOARD.txt` to place X in the top-left square. Make only this move.” Then:

1. Inspect the diff yourself and confirm Copilot made only the intended legal move.
2. Check the branch and Git state in Source Control.
3. Stage the board, write the commit message, and commit it yourself.
4. Push the commit. Your partner pulls it and checks the resulting board and history.

Copilot makes the board edit; you make the decisions and complete the Git workflow. Later, you may ask Copilot to choose an individual legal move, but that is optional.

If Copilot is unavailable to you, complete the rematch manually and follow the instructor's Copilot demonstration.

## If something goes wrong

- **The repository or branch is missing, or the board cannot be opened:** Pause and ask the facilitator to check the repository and branch. Do not create a replacement branch or change `main` on your own.
- **A push is rejected:** Stop and ask your partner and facilitator to check the current branch and incoming changes. Use **Pull** only after you have saved and reviewed your own work; then inspect the updated board before continuing.
- **A merge conflict appears naturally:** Keep the current work. Open the conflicted board in VS Code, review the conflict with your partner, and agree on a legal board state. Remove conflict markers, review the complete diff, then stage, commit, and push the resolution. Ask the facilitator to help if you are unsure. Never discard changes, reset the branch, or force-push to get past a conflict.

There is no staged conflict exercise. Conflicts are handled only if they arise during normal collaboration.

## Closing demonstration

The instructor will review repository history and connect the workflow to research files. The local Game Wall implementation groups public matches by result and replays valid committed board states, but the published site does not include it yet. If the update is not deployed, the instructor can use GitHub commit history. Exploring an alternative history from an earlier branch point is an optional instructor extension, not a learner task.
