# Facilitator Guide: RIKEN, 10 November 2026

Public pages have no timings. This page is the only place the agenda is written down.

**main is sacred. Don't touch it.** Order on Slot 1: (1) the owner adds the collaborator, (2) the owner creates branch `match` on github.com with the branch dropdown, (3) only then do both people open Codespaces.

Turns on `match` are Pull, edit one cell, Commit and Sync. Copilot is Ask or Agent. Do not teach Plan mode. There is no "play it manually instead of Copilot" path on the learner pages. A wrong `BOARD.txt` diff is discarded and requested again.

## Agenda

| Time (JST) | Activity |
|---|---|
| 10:00–10:20 | Arrival. Setup page only: account, public template copy, Copilot answers "what does this repository do?" |
| 10:20–11:10 | Slot 1 through the first turns on `match` |
| 11:10–12:00 | Agent-mode loop, stop-the-prompts box, register the repository |
| 12:00–13:00 | Lunch |
| 13:00–13:30 | Slot 2 discussion: what can go wrong when you update the board? At least two cases before the hint |
| 13:30–14:20 | Planner (weighted most), PRD, implementer, reviewer in a fresh chat, docs writer |
| 14:20–14:45 | `uv run pytest`, break the board, restore it, create `rematch` from `main` on github.com |
| 14:45–15:00 | Reproducibility, reference repository, Game Wall |

Pair play stays on `match` until the room moves to `rematch` together. Leave `match` as it is. Do not merge it into `main`.

## Untested risks and fallbacks

These three steps were not rehearsed across two Codespaces. Use the fallback and keep the room on the written order.

1. **Cross-codespace branch visibility.** `match` is created on github.com before anyone opens a Codespace. If the partner's Codespace cannot see `match`, it was opened too early. Close it and open a new Codespace. Do not create a second branch with a similar name. Fetch in Source Control only after the branch exists on github.com.
2. **Invite banner.** The partner accepts by opening `github.com/<owner>/<repo>` or by searching `owner/repo` and accepting the banner, or from the invitation email on the same signed-in device. If the banner is missing, use the email on that device, or the owner pastes `https://github.com/OWNER/REPO/invitations`. Check the username before sending a second invitation.
3. **Copilot editing BOARD.txt wrongly.** The learner names the square, reads the diff, and discards it when the cell is wrong, then asks again. Do not Commit and Sync a wrong board. Do not switch the room to a hand-edited rematch.

## Before learners arrive

Send the [Pre-session checklist](PRE_SESSION_CHECK.md) and the [Setup page](docs/setup.html). The template copy is `main` only, even when **Include all branches** is on. The readiness check is Copilot answering "what does this repository do?" with tic-tac-toe and `BOARD.txt`. There is no delete-Codespace section on the setup page.

Each pair registers its shared repository once for the workshop, with both player GitHub handles, using **Register repository** after the partner has accepted. `docs/workshops.json` lists each workshop. RIKEN (`2026-11-10-riken`) is the default and points at Setup, Slot 1 (`docs/guide.html`), Slot 2 (`docs/play-2.html`), and the Game Wall. SOKENDAI is archived and stays selectable under Archived so its history stays viewable. SCDA Training Week (`2026-10-01-scda`) stays archived.

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

The reference repository, shown only at the end of Slot 2, is https://github.com/igorsdub/git-tic-tac-toe-reference
