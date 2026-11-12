# Facilitator Guide: RIKEN, 10 November 2026

Public pages have no timings. This page is the only place the agenda is written down.

**Main branch is sacred: don't modify it.** Order on Git Collaboration: (1) the owner adds the collaborator, (2) the owner creates branch `match` on github.com with the branch dropdown, (3) only then do both people open Codespaces.

Turns on `match` are Pull, edit one cell, Commit and Sync. Copilot is Ask or Agent. Do not teach Plan mode. There is no "play it manually instead of Copilot" path on the learner pages. A wrong `BOARD.txt` diff is discarded and requested again. `rematch` is a second Copilot game on the Git Collaboration page. A learner asks Copilot in Agent mode to create that branch from `main`. Agentic Coding does not use `rematch`. Tests are written on `feature/testing`.

## Agenda

| Time (JST) | Activity |
|---|---|
| 10:00–10:20 | Arrival. Setup page only: account, public template copy, Copilot answers "what does this repository do?" |
| 10:20–11:10 | Git Collaboration through the first turns on `match` |
| 11:10–12:00 | Agent-mode loop on `match`, stop-the-prompts box, register the repository, then Copilot creates `rematch` for a second game |
| 12:00–13:00 | Lunch |
| 13:00–13:30 | Agentic Coding discussion: what can go wrong when you update the board? At least two cases before the hint |
| 13:30–14:20 | Grilling (planner), PRD, implementer, reviewer in a fresh chat, docs writer |
| 14:20–14:45 | Reproducibility, then `uv run pytest` on `feature/testing`, break the board, restore it |
| 14:45–15:00 | Game Wall |

The first game stays on `match`. `rematch` is the second game in Git Collaboration, created by Copilot from `main`. Leave both branches as they are. Do not merge them into `main`. Agentic Coding writes tests on `feature/testing`, which stays off the Game Wall.

## Untested risks and fallbacks

These steps were not rehearsed across two Codespaces. Use the fallback and keep the room on the written order.

1. **Cross-codespace branch visibility.** `match` is created on github.com before anyone opens a Codespace. If the partner's Codespace cannot see `match`, it was opened too early. Close it and open a new Codespace. Do not create a second branch with a similar name. Fetch in Source Control only after the branch exists on github.com.
2. **Invite banner.** The partner accepts by opening `github.com/<owner>/<repo>` or by searching `owner/repo` and accepting the banner, or from the invitation email on the same signed-in device. If the banner is missing, use the email on that device, or the owner pastes `https://github.com/OWNER/REPO/invitations`. Check the username before sending a second invitation.
3. **Copilot editing BOARD.txt wrongly.** The learner names the square, reads the diff, and discards it when the cell is wrong, then asks again. Do not Commit and Sync a wrong board. Do not switch the room to a hand-edited rematch.
4. **Copilot creates `rematch`.** Copilot creates the branch inside one Codespace. This was not rehearsed with a second account. The creator syncs or publishes the branch. The partner runs Pull or Fetch and picks `rematch` from the branch picker. If it is still missing, reload the Codespace.

## Before learners arrive

Send the [Pre-session checklist](PRE_SESSION_CHECK.md) and the [Setup page](docs/setup.html). The template copy is `main` only, even when **Include all branches** is on. The readiness check is Copilot answering "what does this repository do?" with tic-tac-toe and `BOARD.txt`. There is no delete-Codespace section on the setup page.

Each pair registers its shared repository once for the workshop, with both player GitHub handles, using **Register repository** after the partner has accepted. `docs/workshops.json` lists each workshop. RIKEN (`2026-11-10-riken`) is the default and points at Setup, Git Collaboration (`docs/guide.html`), Agentic Coding (`docs/play-2.html`), and the Game Wall. SOKENDAI is archived and omitted from the workshop selector. Its history stays viewable at `?workshop=2026-11-06-sokedai`. SCDA Training Week (`2026-10-01-scda`) stays archived.

## Registration facts

- A successful registration comment confirms the repository/workshop link. A card appears after a successful refresh finds a branch whose name contains `match` in any case.
- `main` never appears on the Game Wall.
- A repository belongs to one workshop. Use a fresh template copy for another workshop.
- Repeating registration updates handles for the same repository and workshop.
- Archived workshops remain viewable and accept updates to existing repositories, including handles, but reject new repository registrations.
- Existing registrations map to `2026-10-01-scda`. The preserved `Default Event` record remains unclassified and excluded pending review.

## History and wrap-up

The Game Wall reads `BOARD.txt` from each discovered branch. If replay cannot load, use the GitHub commit history for that branch. At wrap-up, mention the take-home [Time machine](TIME_MACHINE.md) page ([web version](docs/time-machine.html)), which is not used in the session.

Connect the workflow to research files, analysis code, and shared manuscripts: a manifest, a lock, a runner, and a check are what make a later rerun possible. Python uses `pyproject.toml`, `uv.lock`, `uv`, and `pytest`. Julia uses `Project.toml` and `Manifest.toml`. R uses `renv`.
