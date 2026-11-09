# Git Tic-Tac-Toe: Learner Guide

> **Workshop registration:** Your pair registers its shared repository once for this workshop and enters both player GitHub handles. Select **Register repository** in the header stage strip. A successful registration comment confirms the repository/workshop link. A successful refresh lists every branch whose name contains `match` in any case (`match`, `Match`, `rematch`, `match-1`). `main` never appears. Archived workshops stay viewable and accept updates to existing repositories, including handles, but they do not accept new repositories.

The web pages are [Setup](docs/setup.html), [Slot 1](docs/guide.html), and [Slot 2](docs/play-2.html). **main is sacred. Don't touch it.**

## Before the session

Follow the [Setup page](docs/setup.html) or the [Pre-session checklist](PRE_SESSION_CHECK.md):

1. Create a public repository from the template. **Include all branches** may stay on. The template now has only `main`, so the copy is just `main`.
2. Open a Codespace and ask Copilot, in Ask mode: what does this repository do?
3. The check passes when the answer mentions tic-tac-toe and `BOARD.txt`. Do not edit the board.

## Slot 1

**(1)** The owner adds the collaborator. **(2)** The owner creates branch `match` on github.com with the branch dropdown. **(3)** Only then do both of you open Codespaces.

### Step 1: Invite your partner

X (owner): Settings, Collaborators, **Add people**, then **Add ... to this repository**.

O (partner): while signed in, open `github.com/<owner>/<repo>` or search `owner/repo` and accept the invitation banner. Or open the invitation email on that same signed-in device and select **Accept invitation**. If the banner is missing, use the email on that device, or open `https://github.com/OWNER/REPO/invitations`. Invitations expire after 7 days.

### Branch match, then Codespaces

The owner creates `match` from `main` on github.com. Do not commit on `main`. If a Codespace cannot see `match`, it was opened too early: close it and open a new one. Do not create another branch.

Pictures of the Codespace branch picker may show `match-01`. That is the branch in the picture. Yours is `match`.

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

## Slot 2

With your partner, name at least two ways an update of the board can go wrong before anyone mentions checks. Then use the hint: X/O count difference (X moves first, so X−O is 0 or 1); lowercase `x`/`o` vs uppercase; the digit `0` typed instead of the letter `O` (this actually happened before); plus others the pairs find themselves.

A skill is a `SKILL.md` file (Agent Skills). Matt Pocock's grill-me skill interviews you first. A pstack-style collection is a folder of those files. Grill Me prompt: "Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one." Talk: https://ai.engineer/talks/v4F1gFy-hqg-software-fundamentals-for-ai-coding. Optional longer source: https://talksintel.ai/ai-ml/conferences/aie-eu-2026/full-walkthrough-workflow-for-ai-coding-matt-pocock/ ("implementation and review should never share a context", which is why the review happens in a fresh chat).

The planner matters most. Order: planner, PRD, implementer, reviewer in a fresh chat, docs writer for `README.md` and `AGENTS.md`.

Planner prompt:

```
You are the planner. When we update BOARD.txt, these things can go wrong:
- case 1
- case 2
- case 3 (optional)
Before writing anything, ask me one question at a time until we agree exactly which boards are valid. Then list the agreed rules as checks a test could make. Don't write code yet.
```

Implementer prompt:

```
Write pytest tests for these rules and a pyproject.toml so `uv run pytest` works.
```

Copilot writes `test_board.py` and `pyproject.toml`. Run `uv run pytest`. Break the board on purpose, see the check fail, and restore the board.

Create branch `rematch` from `main` on github.com. Run `uv run pytest` before every commit. A pre-commit hook can run that command. GitHub Actions can run the same tests on every push.

Reproducibility: the manifest is `pyproject.toml`, the lock is `uv.lock`, the runner is `uv`, and the test module is `pytest`. Julia uses `Project.toml` and `Manifest.toml`. R uses `renv`.

At the end, compare your work with the reference repository: https://github.com/igorsdub/git-tic-tac-toe-reference

After the workshop, the [Time machine](TIME_MACHINE.md) ([web version](docs/time-machine.html)) is optional.
