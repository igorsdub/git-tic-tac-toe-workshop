# Git Tic-Tac-Toe: Learner Guide

> **Workshop registration:** Your pair registers its shared repository once for this workshop and enters both player GitHub handles in your workshop's registration form, shown on the Game Wall (for example the [SCDA Training Week registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-10-01-scda)). A successful registration comment confirms the repository/workshop link. The Game Wall shows a card after a successful refresh finds a branch whose name starts with lowercase `match`.

In this workshop, you and a partner collaborate in one shared public GitHub repository. You will play one match by hand, then use Copilot to make a board edit you already know how to make. You remain responsible for reviewing and publishing every change.

Each person works in their own GitHub Codespace, opened in the browser-based VS Code editor. You will use the VS Code **Source Control** view for Git. You do not need to use the terminal.

## Before play

Before the session, each of you creates a public repository from the starter template, opens it in your own Codespace, and completes the Ask readiness check. Keep both prepared repositories and Codespaces. At the session, choose one repository for your pair, invite your partner, and each open that repository in a separate Codespace. Start each match branch from `main`; `match-01` is a clear example. Any branch beginning with the exact lowercase text `match` qualifies, including `match01`, `match-01`, `match02`, and `match-test`. Keep match branches separate; do not merge them back into `main`.

Register the repository once for this workshop; do not submit a separate registration for each branch. Each qualifying branch becomes its own Game Wall card, with the full branch name shown as its label. The dashboard reads `BOARD.txt` from that exact branch. A repository belongs to one workshop only; use a fresh copy of the template when participating in another workshop. If you need to correct player handles, submit the form again for the same repository and workshop. Archived workshops remain viewable and accept updates to already registered repositories, including handles, but they do not accept new repositories.

## Manual match: make and share a move

`BOARD.txt` has three rows of three cells with one space between cells. A dot (`.`) means empty. Replace one dot with your mark (`X` or `O`) to make a move. Both partners use the same match branch in their own Codespace. Take turns. Before editing, confirm the branch name in the VS Code status bar and use **Source Control → Pull** to get your partner's latest move.

1. Open `BOARD.txt` in the editor. Change one empty square to your mark, then save.
2. In **Source Control**, open the changed file and review the diff. Check that it contains only the legal move you intended.
3. Stage the board file with the **+** control.
4. Enter a clear commit message and select **Commit**.
5. Select **Push** in Source Control. Tell your partner the move is ready.
6. Your partner selects **Pull**, checks the board and commit, and takes the next turn.

Saving a file, staging it, committing it, and pushing it are separate actions. The facilitator will show where each action appears in Source Control before the match starts.

## Agent-assisted rematch

At the scheduled transition, every pair begins a fresh rematch, even if its manual match is unfinished. Leave the unfinished match on its branch. Start the next numbered match from `main` and use the same VS Code web workflow.

You choose a legal move and ask Copilot to place your mark. For the demonstration's first move, say exactly: “Place X in the center of the board.” If you play O or make a later move, name the square you chose. Then:

1. Inspect the diff yourself and understand the board change.
2. Check the branch and Git state in Source Control.
3. Stage the board, write the commit message, and commit it yourself.
4. Sync the change through Source Control. Your partner pulls it and checks the resulting board and history.

Copilot makes the board edit; you make the decisions and complete the Git workflow. Later, you may ask Copilot to choose an individual legal move, but that is optional.

If Copilot is unavailable to you, complete the rematch manually and follow the instructor's Copilot demonstration.

## If you need help

Ask your partner or facilitator to look at the board and Source Control with you.

## Closing demonstration

The instructor will review repository history and connect the workflow to research files. The published Game Wall shows one entry per discovered match branch and replays valid committed board states. If a registration has no matching branch yet, its successful registration comment confirms acceptance; its card appears after a later successful refresh discovers a matching branch. Exploring an alternative history from an earlier branch point is an optional instructor extension, not a learner task.
