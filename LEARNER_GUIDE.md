# Git Tic-Tac-Toe: Learner Guide

> **Workshop registration:** Your pair registers its shared repository once for this workshop and enters both player GitHub handles. Select **Register repository** in the header stage strip. A successful registration comment confirms the repository/workshop link. A successful refresh lists every branch whose name contains `match` in any case (`match`, `Match`, `rematch`, `match-1`). `main` never appears. Archived workshops stay viewable and accept updates to existing repositories, including handles, but they do not accept new repositories.

The web pages are [Setup](docs/setup.html), [Git Collaboration](docs/guide.html), and [Agentic Coding](docs/play-2.html). **Main branch is sacred: don't modify it.**

## Before the session

Follow the [Setup page](docs/setup.html) or the [Pre-session checklist](PRE_SESSION_CHECK.md):

1. Create a public repository from the template. It must be public. The scoreboard reads its branches. **Include all branches** may stay on. The template now has only `main`, so the copy is just `main`.
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

Let Copilot ask questions until the plan matches the one in your head. Then it writes that plan in `PLAN.md` and builds it. This file is usually called a PRD (product requirements document), `PRD.md`.

The partner who was added to the game repository creates a new public repository on their own account and opens it in a Codespace, or on a laptop where Copilot is already signed in. The owner sits beside them. Leave `main` in the game repository as it is. The game repository has to be public. The scoreboard reads its branches.

Paste this prompt. Replace the link with the web address of your game repository. Answer one question at a time. Do not let Copilot build the site until `PLAN.md` says what you meant.

```
I need a scoreboard for a tic-tac-toe repository where games are stored on different branches: <link to our game repo>. A website should show the scores between the two players. I want to host it on GitHub Pages. I'm not an expert: guide me through the options one question at a time before building anything.
```

A skill is a set of prompts saved as `SKILL.md`. The grill-me skill tells the agent to interview you until you share one plan: "Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one."

Then tell Copilot to build the scoreboard and publish it on GitHub Pages. The site reads the branches of the public game repository and shows the score between the two players. If you are stuck, open https://github.com/igorsdub/tic-tac-toe-scoreboard-reference

Play a match in the game repository and watch the scoreboard. The new score can take a few minutes to appear.

Then each person thinks of a task from their own work they could grill an agent on.

After the workshop, the [Time machine](TIME_MACHINE.md) ([web version](docs/time-machine.html)) is optional.
