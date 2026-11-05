# Git Tic-Tac-Toe: Learner Guide

> **Workshop registration:** Your pair registers its shared repository once for this workshop and enters both player GitHub handles. Select **Register repository** in the header stage strip to open your workshop's registration form. A successful registration comment confirms the repository/workshop link. The Game Wall shows a card after a successful refresh finds a branch whose name starts with lowercase `match`.

In this workshop, you and a partner collaborate in one shared public GitHub repository. You will play one match by hand, then use Copilot to make a board edit you already know how to make. You remain responsible for reviewing and publishing every change.

Each person works in their own GitHub Codespace, opened in the browser-based VS Code editor. You will use the VS Code **Source Control** view for Git. You do not need to use the terminal. The [How to play](docs/guide.html) page covers the same turn cycle on the web.

## Before play

Before the session, follow the [Setup page](docs/setup.html) or the [Pre-session checklist](PRE_SESSION_CHECK.md):

1. Create a public repository from the starter template under your own account, fill in **Description**, and tick **Include all branches** to get `match-01`.
2. Open it in a Codespace.
3. Run the readiness check: open Copilot Chat, type exactly "What does this repository do?", and press Enter. It passes when the answer mentions tic-tac-toe and `BOARD.txt`.
4. Delete the Codespace at [github.com/codespaces](https://github.com/codespaces) and keep the repository. A running Codespace uses your limited free monthly allowance; a deleted one costs nothing.

### Step 1: Invite your partner

Do this once, at the start. X owns the repository; O is the partner. Both of you need a GitHub account.

X (owner):

1. Open your repository on GitHub and select **Settings**.
2. In the sidebar, select **Collaborators** (some pages call it **Manage access**).
3. Select **Add people** and type your partner's GitHub username.
4. Pick the right person, then select **Add ... to this repository**. This sends the invitation.

O (partner):

1. Open the invitation email from GitHub, or look at [github.com/notifications](https://github.com/notifications), or open the repository link X shares.
2. Select **Accept invitation**. The invitation banner disappears and you now have write access, which means you can share changes to the repository.

<details>
<summary>No invitation?</summary>

- Check your spam folder, and that you can sign in to the email account linked to your GitHub account.
- X: check the spelling of the username you invited.
- X: paste `https://github.com/OWNER/REPO/invitations` (with the real owner and repository names) into the chat. O opens it and selects **Accept invitation**.
- Invitations expire after 7 days. If it expired, X removes the old invitation under **Collaborators** and invites again.

</details>

You will know it worked when your first **Sync Changes** succeeds.

### Step 2: Start together

Choose one prepared repository. Its owner plays X and moves first; the partner plays O and has accepted the invitation. Both open fresh separate Codespaces, switch to the existing `match-01` in Source Control, and pull. When the site is in full mode, use the header stage strip for Setup, How to play, the Game Wall and **Register repository**. Any branch beginning with the exact lowercase text `match` qualifies. Keep match branches separate; do not merge them back into `main`.

Register the repository once for this workshop, after the partner has accepted; do not submit a separate registration for each branch. Each qualifying branch becomes its own Game Wall card, with the full branch name shown as its label. The Game Wall reads `BOARD.txt` from that exact branch. A repository belongs to one workshop only; use a fresh copy of the template when participating in another workshop. If you need to correct player handles, submit the form again for the same repository and workshop. Archived workshops remain viewable and accept updates to already registered repositories, including handles, but they do not accept new repositories.

## Manual match: make and share a move

`BOARD.txt` has three rows of three cells with one space between cells. A dot (`.`) means empty. Replace one dot with your mark (`X` or `O`) to make a move. Both partners use the same match branch in their own Codespace. Take turns. Confirm the branch name in the VS Code status bar before you start.

Each turn has five steps:

1. In **Source Control**, select **Pull** to get your partner's latest move.
2. Open `BOARD.txt`, change one empty square to your mark, and save.
3. Open the changed file in **Source Control** and check the diff. It should contain only the legal move you intended. Stage the board file with **+**.
4. Enter a clear commit message and select **Commit**.
5. Select **Sync Changes**. Tell your partner the move is ready.

Your partner starts their turn with **Pull**, checks the board and commit, and takes the next turn.

Saving a file, staging it, committing it, and syncing it are separate actions. The facilitator will show where each action appears in Source Control before the match starts.

## Taking turns and fixing a conflict

Only one partner changes `BOARD.txt` at a time. **Pull** at the start of every turn, make your one move, **Sync Changes**, and tell your partner. Wait for them to pull before they move.

<details>
<summary>If Sync Changes is rejected or you see a conflict</summary>

A *conflict* means you and your partner changed the same line of `BOARD.txt` and Git cannot combine the two versions alone. Nothing is lost. Do not discard your partner's move, and ask your facilitator if unsure.

1. Stop editing. In **Source Control**, select **Pull**.
2. Under **Merge Changes**, select `BOARD.txt` to open the *merge editor*, the VS Code view that shows both versions with the combined result below.
3. Talk with your partner and agree the board. Keep every move already published, then keep only one legal next move. Decide together who plays it now.
4. Edit the result so `BOARD.txt` is three rows of three cells with no conflict markers, then select **Complete Merge**.
5. Stage `BOARD.txt` with **+**, enter a clear message, and select **Commit**.
6. Select **Sync Changes**. Tell your partner to **Pull** and check the board before the next turn.

If you cannot agree on a legal board, stop and ask the facilitator.

</details>

After the workshop, explore your match history on your own with the [Time machine](TIME_MACHINE.md) ([web version](docs/time-machine.html)).

## Agent-assisted rematch

At the scheduled transition, every pair begins a fresh rematch, even if its manual match is unfinished. Leave the unfinished match on its branch. Create and publish `match-02` from clean `main`; your partner switches to it. Use the same VS Code web workflow.

You choose a legal move and ask Copilot to place your mark. Follow the Ask, Agent, Plan progression in [Using Copilot](#using-copilot). For the demonstration's first move, say exactly: "Place X in the center of the board." If you play O or make a later move, name the square you chose. Then:

1. Inspect the diff yourself and understand the board change.
2. Check the branch and Git state in Source Control.
3. Only after that review, tell Copilot to commit and push, or stage with **+**, write the message and **Commit** yourself.
4. If you committed by hand, sync the change with **Sync Changes**. Sync the change before your partner moves. Your partner pulls it and checks the resulting board and history.

Copilot makes the board edit; you decide each move, review every diff, and approve before anything is committed or pushed. Later, you may ask Copilot to choose an individual legal move, but that is optional.

If Copilot is unavailable to you, complete the rematch manually and follow the instructor's Copilot demonstration.

## If you need help

Ask your partner or facilitator to look at the board and Source Control with you.

## Closing demonstration

The instructor will review repository history and connect the workflow to research files. The Game Wall shows one entry per discovered match branch and replays valid committed board states. If a registration has no matching branch yet, its successful registration comment confirms acceptance; its card appears after a later successful refresh discovers a matching branch.

## Using Copilot

> **Warning: free Copilot plans are limited.** Free plans have a limited monthly allowance of AI credits (GitHub no longer publishes a fixed request count), so keep chats short and do not use Copilot before the session. Some learners may lack Agent or Plan mode on a free plan. Verified teachers get free Copilot Pro through GitHub Education; verified students get the free Copilot Student plan. If Copilot is unavailable, play manually and watch the instructor’s demonstration.

Use Copilot only in the rematch, and only for one cell in `BOARD.txt` per move. Copilot commits or pushes only when you explicitly ask. It never merges, overwrites shared history or switches branches unasked. You still check every diff and commit. If the mode names differ in your VS Code, pick the chat option that explains only (Ask), edits and runs steps (Agent) or shows a plan first (Plan).

### Ask mode

Get Copilot to explain the board while you place your mark and do every Git step by hand.

```
Explain the current board in BOARD.txt and whose turn it is.
```

### Agent mode

Let Copilot place one mark, then review the diff and tell it to commit and push.

```
Place O in the top-right cell of BOARD.txt. Change only that cell.
```

```
Commit this move with message 'O plays top-right' and push it.
```

### Plan mode

Give Copilot a short goal (pull, plan, place), approve its plan, review the diff, then send the commit prompt above as a separate request.

```
Pull, plan my next legal move as O, and place it. Then stop so I can review the diff.
```

## Terminal equivalent (optional)

The Source Control view is the teaching path. These commands do the same things.

<details>
<summary>Show terminal commands</summary>

```
# gameplay loop
git pull --no-rebase
# edit and save BOARD.txt, then check the change
git diff
git add BOARD.txt
git commit -m "X plays center"
git push

# conflict recovery
# if git push was rejected, pull first; if git status already says "Unmerged paths", skip the pull
git pull --no-rebase      # reports a conflict in BOARD.txt
# edit BOARD.txt: agree the board with your partner, remove the <<<<<<< ======= >>>>>>> marker lines
git add BOARD.txt
git commit -m "Resolve board conflict"
git push

# switch to a match branch
git fetch
git switch match-01

# create and publish the rematch branch from clean main
git switch main
git switch -c match-02
git push -u origin match-02
```

</details>
