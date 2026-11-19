# Facilitator Guide: RIKEN, 10 November 2026

Public pages have no timings. This page is the only place the agenda is written down.

**Main branch is sacred: don't modify it.** Order on Git Collaboration: (1) the owner adds the collaborator, (2) the owner creates branch `match` on github.com with the branch dropdown, (3) only then do both people open Codespaces.

Turns on `match` are Pull, edit one cell, Commit and Sync. Copilot is Ask or Agent. Do not teach Plan mode. There is no "play it manually instead of Copilot" path on the learner pages. A wrong `BOARD.txt` diff is discarded and requested again. `rematch` is a second Copilot game on the Git Collaboration page. A learner asks Copilot in Agent mode to create that branch from `main`. Agentic Coding does not use `rematch`. The game repository stays as it is. The collaborator builds a scoreboard in a new public repository on their own account.

## Agenda

| Time (JST) | Activity |
|---|---|
| 10:00–10:20 | Arrival. Setup page only: account, public template copy, Copilot answers "what does this repository do?" |
| 10:20–11:10 | Git Collaboration through the first turns on `match` |
| 11:10–12:00 | Agent-mode loop on `match`, stop-the-prompts box, register the repository, then Copilot creates `rematch` for a second game |
| 12:00–13:00 | Lunch |
| 13:00–13:10 | Agentic Coding intro. Copilot should ask until the plan matches the one in their head. |
| 13:10–13:45 | Grill Copilot until it writes `PLAN.md`. The collaborator creates a new public repository. The owner sits beside them and pushes back on vague answers. |
| 13:45–14:30 | Copilot builds the scoreboard and publishes it on GitHub Pages. |
| 14:30–14:45 | Play a match in the game repository and watch the score update. The update can lag a few minutes. |
| 14:45–15:00 | Reflection. Each person names a task from their own work they could grill an agent on. |

The first game stays on `match`. `rematch` is the second game in Git Collaboration, created by Copilot from `main`. Leave both branches as they are. Do not merge them into `main`. Do not edit `main`. The scoreboard is a separate repository. It reads branches whose names contain `match`.

## Expected answers while they grill

Do not read this list to the room. The learner page does not say how a win works, how X and O map to the two people, or what to do about a cheat. Pairs should get there by answering Copilot. If they are stuck, point them at the collapsed box on the page. It links to https://github.com/igorsdub/tic-tac-toe-scoreboard-reference, which has a finished scoreboard, its `PLAN.md`, and the reference prompts.

**What counts as a win.** Three of the same mark in a row, in a column, or on a diagonal. X moves first. The game stops at the move that makes three in a row. A full board with no three in a row is a draw. An X win has exactly one more X than O. An O win has the same number of each mark. A board where both marks have a line is not a finished game.

**How X and O map to the two players.** The two GitHub users are the two players. Which user is which comes from commit authors. The owner moves first and plays X. The partner who was added as a collaborator plays O. The author of a commit is the person who placed the mark added in that commit. Do not hand the pair this mapping. Let them reach it by questions.

**Cheating and move order.** A fair match is one new mark per commit, and the two players take turns, X first. Filling the whole board in one commit is not a match. A move by O before X, or two moves by the same player in a row, is out of order. A page that only reads the latest `BOARD.txt` will still show a score for those. The history of commits is what makes the cheat visible. If a pair's site counts a one-commit board, ask what Copilot asked them about move order. Do not answer for them unless the room is out of time. Then open the stuck box.

## GitHub API rate limit

If a pair's Copilot fetches the GitHub API on every page load, the room shares one IP address and hits the unauthenticated limit of 60 requests an hour. After that, scoreboards in the room fail together. Steer them to the Game Wall pattern. A scheduled GitHub Action, about every 5 minutes, uses the built-in `GITHUB_TOKEN` to read the game branches and write a static JSON file. The page reads only that file, so visitors do not call the API. See `.github/workflows/sync-registrations.yml`. The reference scoreboard uses the same pattern. The play block is 15 minutes, which covers a lag of about 5 minutes.

## Free-tier Copilot rehearsal

Not yet run. This is a placeholder for one end-to-end run on a free Copilot plan. Start from the broad prompt on the Agentic Coding page, as a non-expert, and fill in this table.

| Item | Result |
|---|---|
| Premium requests | Not yet run |
| Chat messages | Not yet run |
| Time | Not yet run |
| Where it got stuck | Not yet run |

## Untested risks and fallbacks

These steps were not rehearsed across two Codespaces. Use the fallback and keep the room on the written order.

1. **Cross-codespace branch visibility.** `match` is created on github.com before anyone opens a Codespace. If the partner's Codespace cannot see `match`, it was opened too early. Close it and open a new Codespace. Do not create a second branch with a similar name. Fetch in Source Control only after the branch exists on github.com.
2. **Invite banner.** The partner accepts by opening `github.com/<owner>/<repo>` or by searching `owner/repo` and accepting the banner, or from the invitation email on the same signed-in device. If the banner is missing, use the email on that device, or the owner pastes `https://github.com/OWNER/REPO/invitations`. Check the username before sending a second invitation.
3. **Copilot editing BOARD.txt wrongly.** The learner names the square, reads the diff, and discards it when the cell is wrong, then asks again. Do not Commit and Sync a wrong board. Do not switch the room to a hand-edited rematch.
4. **Copilot creates `rematch`.** Copilot creates the branch inside one Codespace. This was not rehearsed with a second account. The creator syncs or publishes the branch. The partner runs Pull or Fetch and picks `rematch` from the branch picker. If it is still missing, reload the Codespace.

## Before learners arrive

Send the [Pre-session checklist](PRE_SESSION_CHECK.md) and the [Setup page](docs/setup.html). The template copy is `main` only, even when **Include all branches** is on. The game repository must be public. The scoreboard reads its branches. The readiness check is Copilot answering "what does this repository do?" with tic-tac-toe and `BOARD.txt`. There is no delete-Codespace section on the setup page.

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

At the close, each person thinks of a task from their own work they could grill an agent on. Their research files, analysis code, and shared manuscripts are all in scope. They name the task. They do not build it.
