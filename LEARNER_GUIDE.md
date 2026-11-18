# Git Tic-Tac-Toe: Learner Guide

> **Workshop registration:** Your pair registers its shared repository once for this workshop and enters both player GitHub handles. Select **Register repository** in the header stage strip. A successful registration comment confirms the repository/workshop link. A successful refresh lists every branch whose name contains `match` in any case (`match`, `Match`, `rematch`, `match-1`). `main` never appears. Archived workshops stay viewable and accept updates to existing repositories, including handles, but they do not accept new repositories.

The web pages are [Setup](docs/setup.html), [Git Collaboration](docs/guide.html), and [Agentic Coding](docs/play-2.html). **Main branch is sacred: don't modify it.**

## Before the session

Follow the [Setup page](docs/setup.html) or the [Pre-session checklist](PRE_SESSION_CHECK.md):

1. Create a public repository from the template. **Include all branches** may stay on. The template now has only `main`, so the copy is just `main`.
2. Open a Codespace and ask Copilot, in Ask mode: what does this repository do?
3. The check passes when the answer mentions tic-tac-toe and `BOARD.txt`. Do not edit the board.

## Git Collaboration

**(1)** The owner adds the collaborator. **(2)** The owner creates branch `match` on github.com with the branch dropdown. **(3)** Only then do both of you open Codespaces.

### Step 1: Invite your partner

X (owner): Settings, Collaborators, **Add people**, then **Add ... to this repository**.

O (partner): while signed in, open `github.com/<owner>/<repo>` or search `owner/repo` and accept the invitation banner. Or open the invitation email on that same signed-in device and select **Accept invitation**. If the banner is missing, use the email on that device, or open `https://github.com/OWNER/REPO/invitations`. Invitations expire after 7 days.

### Branch match, then Codespaces

The owner creates `match` from `main` on github.com. Do not commit on `main`. If a Codespace cannot see `match`, it was opened too early: close it and open a new one. Do not create another branch.

### A turn on match

In Source Control: Pull, edit one cell, Commit and Sync. `BOARD.txt` is three rows of three single-space-separated cells. A move replaces one `.`.

### Copilot

Ask mode explains. Agent mode edits. This workshop does not use Plan mode.

Name the square. Check the diff. If Copilot edits `BOARD.txt` wrongly, discard the diff and ask again. Do not Commit and Sync a wrong board. You can ask Copilot to Pull in the chat.

```
Place O in the top-right cell of BOARD.txt. Change only that cell.
```

```
Explain the current board in BOARD.txt and whose turn it is.
```

Stop the prompts, one sentence each:

- Turn on Copilot auto-approve.
- Answer trust-folder, pull, fetch, push, and sync prompts with "don't ask again".

### Rematch

`rematch` is a second game. Ask Copilot in Agent mode to create the branch from `main`, switch to it, and publish it. Do not change files. If your partner cannot see it, they run Pull or Fetch and pick `rematch` in the branch picker. If it is still missing, reload the Codespace.

## Agentic Coding

In this section we will think about how to get what you expect from the model, so its output matches the plan in your head.

Grilling is the main part. Let Copilot interview you, one question at a time, until you agree with your partner and with Copilot. Then the agreed plan goes into `PLAN.md`. This file is usually called a PRD (product requirements document), `PRD.md`, and `PLAN.md` is just the plain name we use here.

A `SKILL.md` file is a reusable set of prompts. The grill-me skill is one of those files. It tells the agent to interview you about the plan until you agree, and to wait until then before it builds anything.

The task uses a separate new repository. Link the game repository you played in. Grill Copilot starting from the message below, write `PLAN.md`, then let Copilot build an automatic scoreboard website. The site reads the games stored as branches in the game repository and shows the score between the two players. Host it on GitHub Pages. `BOARD.txt` and the game repository stay unchanged. No programming knowledge is needed. You are done when the scoreboard is live on GitHub Pages.

```
I need a scoreboard for a tic-tac-toe repository where games are stored on different branches: <link to our game repo>. A website should show the scores between the two players. I want to host it on GitHub Pages. I'm not an expert: guide me through the options one question at a time before building anything.
```

Each person then thinks of a task from their own work that they could grill an agent on.

After the workshop, the [Time machine](TIME_MACHINE.md) ([web version](docs/time-machine.html)) is optional.
