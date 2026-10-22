# Git Tic-Tac-Toe Workshop

This two-hour workshop teaches collaborative Git through a paired tic-tac-toe game. Learners make and review commits together, then repeat the board-edit workflow with Copilot making the edit they previously made by hand.

## Workshop documents

- [Current design handoff](WORKSHOP_DESIGN_HANDOFF.md)
- [Local delivery status and blockers](docs/delivery-status-2026-10-20.md)
- [Learner guide](LEARNER_GUIDE.md) and [web guide](docs/guide.html)
- [Facilitator guide](FACILITATOR_GUIDE.md)
- [Pre-session setup and rehearsal](PRE_SESSION_CHECK.md) and [web setup guide](docs/setup.html)
- [Facilitator rehearsal guide](REHEARSAL_GUIDE.md)
- [Advance survey draft](SURVEY.md)
- [Unpublished instructor survey preview](https://docs.google.com/forms/d/1N2-9HYEtIvWLp11hEa2d9NeS1vXBWiUy7xRycXJNW6c/preview) (not accepting responses; not distributed)
- [Game Wall](docs/index.html) and [setup page](docs/setup.html)
- [Capture pipeline](scripts/capture/README.md)
- [Glossary](CONTEXT.md)

## Workshop links

The main Game Wall opens the organizer-designated default workshop, Sokedai (2026-11-06). SCDA Training Week is archived. Use a workshop-specific link to open its dashboard or prefilled registration form directly.

The shared event context on the Game Wall, learner guide, and setup page reads event names, ISO dates, status, registration links, and optional `note` text from [`docs/workshops.json`](docs/workshops.json). Each workshop may also set `setupTrack` (`"codespaces"` or `"local"`) and `surveyUrl`. Change the catalog's `defaultWorkshopId` to designate a different plain-URL default; stable workshop links continue using their own `?workshop=<id>` value.

| Workshop | Dashboard | Register a pair repository |
|---|---|---|
| SCDA Training Week (2026-10-01) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/?workshop=2026-10-01-scda) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-10-01-scda) |
| Sokedai (2026-11-06) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/?workshop=2026-11-06-sokedai) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-11-06-sokedai) |
| Riken (2026-11-10) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/?workshop=2026-11-10-riken) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-11-10-riken) |

## Staged learner path

Learners move through three pages, linked by a shared stage strip and Next links: Setup (`docs/setup.html`), How to play (`docs/guide.html`), then the Game Wall (`docs/index.html`). The Game Wall is the plain-URL landing page.

The setup page adapts to the selected workshop (`?workshop=<id>`):

- **Archived** (for example SCDA Training Week): setup steps are replaced by a notice that the workshop is archived, and no Next link is shown.
- **No `setupTrack`** (for example Riken): the general setup content is shown without the Codespaces walkthrough.
- **`setupTrack: "codespaces"`** (for example Sokedai): the step-by-step Codespaces track with screenshots and videos, per-step checkboxes remembered in the browser, and the workshop's `surveyUrl` when set.

The setup page has no Register button; registration links live on the Game Wall and in the guides.

## How to run tests

```
npm test
```

Without npm:

```
node --test tests/*.cjs tests/*.js
python3 -m unittest discover -s tests -p 'test_*.py'
```

The DOM tests (`tests/test_dashboard_dom.cjs`, `tests/test_setup_dom.cjs`) need Chrome or Chromium and are skipped if none is found. Set `CHROMIUM_BIN` to point at a specific binary.

## Repository map

- [`template/`](template/README.md) is the local reference for the learner starter repository: its current `BOARD.txt`, editing conventions, and canonical empty-board example. Publish changes to the separate template repository explicitly.
- [`scripts/`](scripts/) contains board validation, registration parsing, and registry synchronization.
- [`scripts/capture/`](scripts/capture/README.md) is the Playwright pipeline that regenerates the setup page's screenshots and videos; `captures.json` there lists every step slug and screenshot name.
- [`tests/`](tests/) covers the workshop guides, parser, dashboard, and slides. `tests/fixtures/legacy-board/` preserves older board formats as compatibility fixtures.
- [`docs/`](docs/) contains the Pages site and instructor Game Wall. The separate [`docs/slides/`](docs/slides/) directory contains the workshop presentation.

## Working 120-minute agenda

| Minutes | Activity |
|---|---|
| 0–10 | Arrival and setup troubleshooting |
| 10–25 | Git/GitHub mental model and facilitator demonstration |
| 25–40 | Form pairs, choose one prepared public repository, invite the partner, and open separate Codespaces |
| 40–70 | Manual match |
| 70–80 | Copilot demonstration |
| 80–105 | Agent-assisted rematch |
| 105–120 | Instructor dashboard/history demonstration, research applications, and wrap-up |

At minute 80, every pair starts a fresh agent-assisted rematch, even if the manual match is unfinished. Keep the unfinished match on its branch. A pair that finishes early may play one optional additional manual match before the scheduled transition.

## Environment and Git workflow

Each learner uses their own Codespace in the browser-based VS Code editor. Each pair works in one shared public GitHub repository. Learners use VS Code's Source Control view to review diffs, stage, commit, pull, and push; the terminal is not the teaching path.

The canonical board is three rows of three cells, such as `. . .`; a move replaces one `.` with `X` or `O`. The manual match teaches the whole workflow. In the rematch demonstration, learners ask Copilot “Place X in the center of the board” for X's first move, inspect the diff, then stage, commit, and sync the change themselves. O players and later turns name their chosen square.

Before the workshop, each learner creates a public repository from the starter template, opens it in their own Codespace, selects Ask, and asks exactly “What does this repository do?” The facilitator checks that the response correctly describes the game and how `BOARD.txt` records moves. Learners retain their repositories and Codespaces; at the session each pair chooses one prepared repository and opens it in separate Codespaces. See the [setup guide](PRE_SESSION_CHECK.md).

## Delivery status

Each pair registers its shared repository once for the workshop and supplies both player GitHub handles. The registry discovers every lowercase `match…` branch on each successful refresh; each matching branch becomes its own Game Wall card, and the board is read from that branch. A successful registration comment confirms the repository/workshop link. A card appears after a successful refresh finds a matching branch. A repository can belong to only one workshop; use a fresh template copy for another workshop. Archived workshops remain visible and accept updates to existing repositories, including corrected handles, while rejecting new repository registrations.

The five legacy SCDA repositories map to workshop `2026-10-01-scda`. The legacy `Default Event` record remains preserved outside workshop dashboards pending review. The two-account rehearsal remains incomplete, and the survey is an unpublished instructor draft. See the [delivery status](docs/delivery-status-2026-10-20.md) before the workshop.
